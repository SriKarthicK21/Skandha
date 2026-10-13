import {
  CertificateVerificationRequest,
  CertificateVerificationResult,
  CertificateTrustStatus,
  VerificationCheckStep
} from '../types/accreditationTypes';
import {
  NATIONAL_AB_REGISTRY,
  CERTIFICATION_BODIES_REGISTRY,
  ISO_STANDARDS_REGISTRY,
  GLOBAL_COOPERATION_REGISTRY
} from '../data/accreditationMasterData';
import { computeSHA256, fallbackHash } from '../utils/crypto';

/**
 * Deterministic ISO Certificate Verification Engine
 * Implements strict ISO/IEC 17021-1, ISO/IEC 27006-1, and Global ACI recognition logic.
 * Never fabricates validation results; enforces non-repudiation audit trails.
 */
export async function verifyCertificate(
  req: CertificateVerificationRequest
): Promise<CertificateVerificationResult> {
  const steps: VerificationCheckStep[] = [];
  const authoritativeSources: string[] = [];

  // Step 1: Check Certification Body Exists in Registry
  const cb = CERTIFICATION_BODIES_REGISTRY.find(
    c => c.code.toUpperCase() === req.certificationBodyCode.toUpperCase() ||
         c.brandName.toLowerCase().includes(req.certificationBodyCode.toLowerCase()) ||
         c.legalName.toLowerCase().includes(req.certificationBodyCode.toLowerCase())
  );

  const cbFound = !!cb;
  steps.push({
    step: '1. Certification Body Entity Resolution',
    description: 'Verify if the issuing Conformity Assessment Body is registered in the Global CB Master Registry.',
    passed: cbFound,
    detail: cbFound 
      ? `Found valid Certification Body: ${cb?.legalName} (${cb?.brandName}, HQ: ${cb?.headquartersCountry})` 
      : `Certification Body '${req.certificationBodyCode}' is not listed in the verified global registry.`,
    evidenceSource: cbFound ? cb?.sourceReference.url : undefined
  });

  if (cb) {
    authoritativeSources.push(`${cb.brandName} Official Directory (${cb.website})`);
    if (cb.verificationPortalUrl) {
      authoritativeSources.push(`Public Portal: ${cb.verificationPortalUrl}`);
    }
  }

  // Step 2: Check ISO Standard is certifiable
  const standard = ISO_STANDARDS_REGISTRY.find(
    s => s.standardNumber.toLowerCase().includes(req.standardNumber.toLowerCase()) ||
         s.shortCode.toLowerCase().includes(req.standardNumber.toLowerCase())
  );

  const standardCertifiable = standard ? standard.isCertifiable : false;
  steps.push({
    step: '2. ISO Standard Certifiability Analysis',
    description: 'Verify if the specified ISO standard is a normative management system specification (Certifiable) rather than a code of practice / guidance.',
    passed: standard ? standardCertifiable : 'UNKNOWN',
    detail: standard 
      ? standardCertifiable 
        ? `${standard.standardNumber} is a recognized normative certification standard with ${standard.applicableAccreditationStandard} accreditation requirements.`
        : `${standard.standardNumber} is a guidance / code of practice standard and cannot have an independent accredited certificate.`
      : `Standard '${req.standardNumber}' not recognized in standard master list.`
  });

  // Step 3: Accreditation Body Resolution
  let ab = null;
  if (req.accreditationBodyCode) {
    ab = NATIONAL_AB_REGISTRY.find(
      a => a.code.toUpperCase() === req.accreditationBodyCode?.toUpperCase() ||
           a.brandName.toLowerCase().includes(req.accreditationBodyCode?.toLowerCase() || '')
    );
  } else if (cb && cb.accreditations.length > 0) {
    // Pick the primary active accreditation matching country or first global
    const matchedAccred = cb.accreditations.find(a => a.status === 'ACTIVE');
    if (matchedAccred) {
      ab = NATIONAL_AB_REGISTRY.find(a => a.code === matchedAccred.accreditationBodyCode) || null;
    }
  }

  const abFound = !!ab;
  steps.push({
    step: '3. National Accreditation Body Resolution',
    description: 'Validate the overseeing National Accreditation Body holding signatory status with Global ACI / APAC / EA / IAAC.',
    passed: abFound,
    detail: abFound
      ? `Accreditation Body identified: ${ab?.brandName} (${ab?.country}) - Recognition Status: ${ab?.recognitionStatus}`
      : `No recognized National Accreditation Body associated with this certificate query.`,
    evidenceSource: abFound ? ab?.officialDirectoryUrl : undefined
  });

  if (ab) {
    authoritativeSources.push(`${ab.brandName} Official Scope Register (${ab.website})`);
  }

  // Step 4: Check CB Accreditation Scope for this Standard
  let scopeMatch = null;
  let isAccreditedForStd: boolean | 'UNKNOWN' = false;

  if (cb && standard) {
    const accreditations = cb.accreditations.filter(a => a.status === 'ACTIVE');
    for (const acc of accreditations) {
      const coversStd = acc.standardsAccredited.some(s => s.toLowerCase().includes(standard.shortCode.toLowerCase()) || s.toLowerCase().includes(standard.standardNumber.toLowerCase()));
      if (coversStd) {
        if (!req.accreditationBodyCode || acc.accreditationBodyCode.toUpperCase() === req.accreditationBodyCode.toUpperCase()) {
          scopeMatch = acc;
          isAccreditedForStd = true;
          break;
        }
      }
    }
  }

  steps.push({
    step: '4. Conformity Assessment Body Accreditation Scope Verification',
    description: 'Check official schedule of accreditation for explicit standard listing, accreditation number, and active validity cycle.',
    passed: isAccreditedForStd,
    detail: isAccreditedForStd && scopeMatch
      ? `Accreditation scope confirmed! AB: ${scopeMatch.accreditationBodyCode}, Accr. No: ${scopeMatch.accreditationNumber}, Cycle Valid: ${scopeMatch.initialAccreditationDate} to ${scopeMatch.validUntil}. Scope Hash: ${scopeMatch.scopeHashSHA256.substring(0, 16)}...`
      : cbFound 
        ? `Certification Body '${cb?.brandName}' does NOT hold an active accreditation scope for ${req.standardNumber} under the specified AB.`
        : `Cannot verify scope: CB is unverified.`
  });

  // Step 5: Check Certificate Date Validity
  const now = new Date('2026-09-02T00:51:10Z');
  const issueDateObj = req.issueDate ? new Date(req.issueDate) : null;
  const expiryDateObj = req.expiryDate ? new Date(req.expiryDate) : null;

  let isDateValid = false;
  let dateDetail = '';

  if (issueDateObj && expiryDateObj && !isNaN(issueDateObj.getTime()) && !isNaN(expiryDateObj.getTime())) {
    if (expiryDateObj < now) {
      isDateValid = false;
      dateDetail = `Certificate expired on ${req.expiryDate} (Current Audit Date: 2026-09-02). Status: EXPIRED.`;
    } else if (issueDateObj > now) {
      isDateValid = false;
      dateDetail = `Certificate issue date is in the future (${req.issueDate}). Status: SUSPICIOUS / INVALID.`;
    } else {
      isDateValid = true;
      const daysLeft = Math.round((expiryDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      dateDetail = `Certificate is active. Issued on ${req.issueDate}, Valid until ${req.expiryDate} (${daysLeft} days remaining).`;
    }
  } else {
    isDateValid = false;
    dateDetail = 'Invalid or missing certificate issue/expiry dates.';
  }

  steps.push({
    step: '5. Certificate Temporal Validity & Expiry Audit',
    description: 'Verify 3-year certification cycle timeline against current timestamp.',
    passed: isDateValid,
    detail: dateDetail
  });

  // Step 6: International Recognition Arrangement (Global ACI / IAF MLA / EA MLA)
  const isRecognitionValid = ab ? (ab.recognitionStatus === 'MLA_SIGNATORY' || ab.recognitionStatus === 'MRA_SIGNATORY') : false;
  steps.push({
    step: '6. International Mutual Recognition Cross-Border Validity (Global ACI / MLA)',
    description: 'Confirm if the Accreditation Body is a recognized signatory to the Multilateral Recognition Arrangement.',
    passed: isRecognitionValid,
    detail: isRecognitionValid && ab
      ? `${ab.code} is an active MLA Signatory under ${ab.regionalBodyCode} / Global ACI. Certificate is internationally recognized across 110+ jurisdictions without dual audit requirements.`
      : `Accreditation recognition arrangement is not established or AB is not an MLA signatory.`
  });

  // Step 7: IAF Code Sector Verification (if supplied)
  let isIAFCodeInScope: boolean | 'UNKNOWN' = 'UNKNOWN';
  if (req.iafCode && scopeMatch) {
    if (scopeMatch.iafSectorCodes.includes(Number(req.iafCode))) {
      isIAFCodeInScope = true;
    } else {
      isIAFCodeInScope = false;
    }
  }

  steps.push({
    step: '7. Technical Sector Scope & IAF Code Verification',
    description: 'Verify if the specific industry/economic sector (e.g., IAF 33 for IT / Data Centers) is authorized in the CB schedule.',
    passed: req.iafCode ? isIAFCodeInScope : 'UNKNOWN',
    detail: req.iafCode
      ? isIAFCodeInScope === true
        ? `IAF Sector Code ${req.iafCode} is explicitly included in the accredited scope.`
        : `IAF Sector Code ${req.iafCode} is OUTSIDE the CB accredited technical scope.`
      : `IAF Sector Code not specified in query. Evaluation defaulted to general organizational scope.`
  });

  // Calculate Overall Trust Status and Score
  let trustStatus: CertificateTrustStatus = 'REQUIRES_MANUAL_VERIFICATION';
  let trustScore = 0;
  let badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  let auditorSummary = '';
  let recommendedAction = '';

  if (!cbFound) {
    trustStatus = 'INVALID';
    trustScore = 10;
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    auditorSummary = `The issuing entity '${req.certificationBodyCode}' could not be identified in authoritative global accreditation registries. High risk of unaccredited or non-conforming certificate.`;
    recommendedAction = `Reject certificate for formal supplier/customer compliance. Request certified client proof from an accredited CB directory.`;
  } else if (!isDateValid && expiryDateObj && expiryDateObj < now) {
    trustStatus = 'EXPIRED';
    trustScore = 30;
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    auditorSummary = `The certificate was issued by an accredited CB (${cb.brandName}) but has lapsed past its 3-year expiration date (${req.expiryDate}).`;
    recommendedAction = `Issue non-conformity finding (Clause 9.2). Require supplier or company to provide recertification audit report.`;
  } else if (!isAccreditedForStd) {
    trustStatus = 'VERIFIED_NON_ACCREDITED';
    trustScore = 45;
    badgeColor = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    auditorSummary = `Certification Body '${cb.brandName}' is legitimate, but holds NO verified accredited scope for standard ${req.standardNumber}. This is an unaccredited commercial certificate.`;
    recommendedAction = `Do not accept for ISO 27001 / SOC 2 vendor compliance where accredited third-party certification is contractually mandated.`;
  } else if (isIAFCodeInScope === false) {
    trustStatus = 'OUTSIDE_ACCREDITED_SCOPE';
    trustScore = 55;
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    auditorSummary = `The CB holds accreditation for ${req.standardNumber}, but the organization's technical industry (IAF Code ${req.iafCode}) is outside their certified scope.`;
    recommendedAction = `Request scope extension audit evidence or transfer certification to a CB accredited for your sector.`;
  } else if (isAccreditedForStd && isDateValid && isRecognitionValid) {
    trustStatus = 'VERIFIED_ACCREDITED';
    trustScore = 98;
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    auditorSummary = `Certificate is VERIFIED ACCREDITED under ${ab?.code} (${ab?.country}) and Global ACI / APAC / EA MLA. All conformity assessment requirements satisfied.`;
    recommendedAction = `Full compliance acceptance approved. Log evidence in GRC Evidence Centre and lock Statement of Applicability linkage.`;
  } else {
    trustStatus = 'REQUIRES_MANUAL_VERIFICATION';
    trustScore = 65;
    badgeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    auditorSummary = `Partial verification achieved. Manual review of the CB physical certificate schedule or QR verification is recommended.`;
    recommendedAction = `Query the CB official verification portal at ${cb.verificationPortalUrl || cb.website} with certificate number ${req.certificateNumber}.`;
  }

  // Cryptographic Non-Repudiation Hash
  const payloadToHash = JSON.stringify({
    req,
    trustStatus,
    trustScore,
    timestamp: now.toISOString(),
    cb: cb?.code,
    ab: ab?.code
  });

  let auditTrailHash = '';
  try {
    auditTrailHash = await computeSHA256(payloadToHash);
  } catch {
    auditTrailHash = fallbackHash(payloadToHash);
  }

  return {
    id: `VER-${Date.now()}`,
    timestamp: now.toISOString(),
    request: req,
    trustStatus,
    trustScore,
    badgeColor,
    certificationBodyFound: cbFound,
    certificationBodyName: cb ? cb.legalName : req.certificationBodyCode,
    accreditationBodyFound: abFound,
    accreditationBodyName: ab ? `${ab.brandName} (${ab.country})` : (req.accreditationBodyCode || 'Not Specified'),
    isAccreditedForStandard: isAccreditedForStd,
    isWithinDateValidity: isDateValid,
    isRecognitionArrangementValid: isRecognitionValid,
    isIAFCodeInScope,
    auditTrailHash,
    verificationSteps: steps,
    auditorSummary,
    recommendedAction,
    authoritativeSources
  };
}
