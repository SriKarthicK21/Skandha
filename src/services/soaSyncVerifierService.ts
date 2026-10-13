import { ControlItem, RiskRecord, OutdatedJustificationIssue, SoAVerifierReport } from '../types';
import { extractControlCodesFromRisk } from './soaRiskSyncService';

/**
 * Domain rules mapping Annex A controls to threat keywords for semantic contradiction checks
 */
interface ControlDomainRule {
  controlCodePrefix: string;
  keywords: string[];
  justificationIndicators: string[];
  contradictionDescription: string;
}

const CONTROL_DOMAIN_RULES: ControlDomainRule[] = [
  {
    controlCodePrefix: 'A.8.12',
    keywords: ['leak', 'dlp', 'exfiltrat', 'pii', 'customer data', 'data loss', 'bulk export', 'credit card', 'unencrypted pii'],
    justificationIndicators: ['no sensitive', 'not applicable', 'zero pii', 'no data leakage', 'internal only', 'prohibits local storage', 'private vpc', 'closed erp'],
    contradictionDescription: 'Justification premises that no sensitive PII or exfiltration risk exists, but newly identified risk documents active data leakage or exfiltration threats.'
  },
  {
    controlCodePrefix: 'A.7.10',
    keywords: ['usb', 'removable media', 'storage media', 'hard drive', 'flash drive', 'ssd', 'backup drive', 'decommissioned media'],
    justificationIndicators: ['zero removable', 'paperless', 'cloud-native', 'no physical servers', 'soldered nvme', 'cloud-only'],
    contradictionDescription: 'Justification asserts zero removable media usage or paperless operations, but risk identifies lost or unencrypted physical media / drives.'
  },
  {
    controlCodePrefix: 'A.8.7',
    keywords: ['malware', 'ransomware', 'virus', 'trojan', 'spyware', 'phishing payload', 'endpoint compromise'],
    justificationIndicators: ['serverless only', 'linux containers', 'no malware vector', 'immune', 'low threat'],
    contradictionDescription: 'Justification assumes immunity or absence of malware attack surfaces, but risk register identifies ransomware or malware infection vectors.'
  },
  {
    controlCodePrefix: 'A.7.4',
    keywords: ['physical', 'office', 'break-in', 'tailgating', 'server room', 'badge', 'premises', 'facility', 'co-working'],
    justificationIndicators: ['remote-first', 'no corporate headquarters', 'fully distributed', 'no physical office', 'home office'],
    contradictionDescription: 'Justification claims fully remote operations without physical premises, but risk register documents physical facility security vulnerabilities.'
  },
  {
    controlCodePrefix: 'A.7.1',
    keywords: ['physical perimeter', 'facility perimeter', 'office access', 'visitor access', 'physical intrusion'],
    justificationIndicators: ['remote-first', 'no physical', 'cloud-only', 'no facility'],
    contradictionDescription: 'Justification excludes physical security perimeters due to remote work, but risk identifies physical office/facility exposure.'
  },
  {
    controlCodePrefix: 'A.8.28',
    keywords: ['secure coding', 'sql injection', 'xss', 'owasp', 'code review', 'sast', 'code vulnerability', 'api vulnerability'],
    justificationIndicators: ['no custom software', 'cots only', 'no development', 'saas only', 'off-the-shelf'],
    contradictionDescription: 'Justification states organization does not build custom code, but risk identifies software vulnerabilities in proprietary code or custom APIs.'
  },
  {
    controlCodePrefix: 'A.5.19',
    keywords: ['vendor', 'supplier', 'third-party', 'supply chain', 'contractor', 'saas provider', 'external service'],
    justificationIndicators: ['no external vendors', 'in-house only', 'zero third-party', 'no suppliers'],
    contradictionDescription: 'Justification asserts no third-party supplier dependencies, but risk documents critical vendor or supply chain vulnerabilities.'
  },
  {
    controlCodePrefix: 'A.5.23',
    keywords: ['cloud', 'aws', 'azure', 'gcp', 's3 bucket', 'cloudtrail', 'iam role', 'cloud infrastructure'],
    justificationIndicators: ['on-premise only', 'no cloud', 'bare metal only'],
    contradictionDescription: 'Justification states organization does not utilize cloud services, but risk identifies cloud workload or infrastructure exposure.'
  }
];

/**
 * Verifies all excluded SoA controls against active risks in the Risk Register.
 * Detects outdated justifications, direct mitigation conflicts, and threat contradictions.
 */
export function verifySoAJustifications(
  risks: RiskRecord[],
  controls: ControlItem[]
): SoAVerifierReport {
  const excludedControls = controls.filter(c => !c.applicable);
  const issues: OutdatedJustificationIssue[] = [];

  excludedControls.forEach(ctrl => {
    // 1. Check for DIRECT_MITIGATION_MAPPING:
    // A risk explicitly points to this excluded control code as mitigation
    risks.forEach(risk => {
      const mappedCodes = extractControlCodesFromRisk(risk);
      const isDirectlyMapped = mappedCodes.includes(ctrl.controlCode) ||
        (risk.mitigationControl && risk.mitigationControl.includes(ctrl.controlCode));

      if (isDirectlyMapped) {
        issues.push({
          id: `soa_issue_${ctrl.controlCode}_${risk.id}`,
          controlId: ctrl.id,
          controlCode: ctrl.controlCode,
          controlTitle: ctrl.title,
          category: ctrl.category,
          currentJustification: ctrl.justification || 'No formal justification recorded.',
          conflictType: 'DIRECT_MITIGATION_MAPPING',
          severity: risk.inherentScore >= 15 ? 'Critical' : 'High',
          triggeringRisk: {
            id: risk.id,
            riskCode: risk.riskCode,
            title: risk.title,
            inherentScore: risk.inherentScore,
            department: risk.department,
            threatDescription: risk.threatDescription,
            mitigationControl: risk.mitigationControl
          },
          invalidationReason: `Control ${ctrl.controlCode} is marked EXCLUDED in SoA, but Risk ${risk.riskCode} ("${risk.title}") explicitly specifies it as a required mitigation under ISO 27001 Clause 6.1.3(b).`,
          suggestedAction: `Re-include ${ctrl.controlCode} (${ctrl.title}) in SoA as APPLICABLE and initiate implementation.`,
          suggestedRevisedJustification: `Control ${ctrl.controlCode} is re-included as APPLICABLE to treat Risk ${risk.riskCode} ("${risk.title}"). Inherent risk score (${risk.inherentScore}/25) mandates active Annex A safeguards.`,
          detectedAt: new Date().toISOString(),
          status: 'Pending Review'
        });
      }
    });

    // 2. Check for THREAT_CONTRADICTION:
    // Excluded control justification contradicts threats described in new or existing risks
    const matchingRule = CONTROL_DOMAIN_RULES.find(r => ctrl.controlCode.startsWith(r.controlCodePrefix));
    if (matchingRule) {
      risks.forEach(risk => {
        // Skip if already flagged as direct mitigation issue for this risk
        const alreadyFlagged = issues.some(
          iss => iss.controlCode === ctrl.controlCode && iss.triggeringRisk.id === risk.id
        );
        if (alreadyFlagged) return;

        const riskCorpus = `${risk.title} ${risk.threatDescription} ${risk.vulnerabilityDescription} ${risk.linkedItem}`.toLowerCase();
        const hasKeywordMatch = matchingRule.keywords.some(kw => riskCorpus.includes(kw.toLowerCase()));

        if (hasKeywordMatch) {
          const justificationLower = (ctrl.justification || '').toLowerCase();
          const hasJustificationPremise = matchingRule.justificationIndicators.some(ind =>
            justificationLower.includes(ind.toLowerCase())
          ) || justificationLower.length < 25;

          if (hasJustificationPremise) {
            issues.push({
              id: `soa_contradiction_${ctrl.controlCode}_${risk.id}`,
              controlId: ctrl.id,
              controlCode: ctrl.controlCode,
              controlTitle: ctrl.title,
              category: ctrl.category,
              currentJustification: ctrl.justification || 'No formal justification recorded.',
              conflictType: 'THREAT_CONTRADICTION',
              severity: risk.inherentScore >= 12 ? 'High' : 'Medium',
              triggeringRisk: {
                id: risk.id,
                riskCode: risk.riskCode,
                title: risk.title,
                inherentScore: risk.inherentScore,
                department: risk.department,
                threatDescription: risk.threatDescription,
                mitigationControl: risk.mitigationControl
              },
              invalidationReason: `${matchingRule.contradictionDescription} Risk ${risk.riskCode} ("${risk.title}") invalidates current exclusion rationale.`,
              suggestedAction: `Re-evaluate exclusion under Clause 6.1.3(d). Either mark control Applicable or document formal compensating controls addressing Risk ${risk.riskCode}.`,
              suggestedRevisedJustification: `Control ${ctrl.controlCode} remains excluded under alternative compensating controls: Residual risk from ${risk.riskCode} is addressed via compensatory defense-in-depth safeguards.`,
              detectedAt: new Date().toISOString(),
              status: 'Pending Review'
            });
          }
        }
      });
    }

    // 3. Check for STALE_EXCLUSION:
    // Excluded control has very brief, non-defensible justification (< 15 characters or default placeholder)
    if (!ctrl.justification || ctrl.justification.trim().length < 20 || ctrl.justification.toLowerCase().includes('default baseline')) {
      const alreadyReported = issues.some(iss => iss.controlCode === ctrl.controlCode);
      if (!alreadyReported) {
        issues.push({
          id: `soa_stale_${ctrl.controlCode}`,
          controlId: ctrl.id,
          controlCode: ctrl.controlCode,
          controlTitle: ctrl.title,
          category: ctrl.category,
          currentJustification: ctrl.justification || '(Empty justification)',
          conflictType: 'STALE_EXCLUSION',
          severity: 'Medium',
          triggeringRisk: {
            id: 'generic_risk',
            riskCode: 'ISO-27001-CL-6.1.3d',
            title: 'Unsubstantiated Control Exclusion in Statement of Applicability',
            inherentScore: 10,
            department: ctrl.responsibleDepartment || 'Information Security',
            threatDescription: 'Auditor non-conformity during Stage 2 audit due to missing or inadequate justification for excluded Annex A control.'
          },
          invalidationReason: `Control ${ctrl.controlCode} is marked Excluded without a legally defensible justification complying with ISO/IEC 27001:2022 Clause 6.1.3(d).`,
          suggestedAction: 'Document rigorous technical, regulatory, or architectural rationale for exclusion.',
          suggestedRevisedJustification: `Control ${ctrl.controlCode} is excluded as the underlying assets and processing activities are not present within the defined ISMS boundary.`,
          detectedAt: new Date().toISOString(),
          status: 'Pending Review'
        });
      }
    }
  });

  const totalExcludedControls = excludedControls.length;
  const outdatedCount = issues.length;
  const validExclusionCount = Math.max(0, totalExcludedControls - outdatedCount);
  const criticalIssuesCount = issues.filter(i => i.severity === 'Critical').length;
  const highIssuesCount = issues.filter(i => i.severity === 'High').length;

  // Verification Health Score: 100% if no issues, deducted proportionally
  const deductions = (criticalIssuesCount * 30) + (highIssuesCount * 15) + ((outdatedCount - criticalIssuesCount - highIssuesCount) * 8);
  const verificationHealthScore = Math.max(0, Math.min(100, Math.round(100 - deductions)));

  return {
    timestamp: new Date().toISOString(),
    totalExcludedControls,
    outdatedCount,
    validExclusionCount,
    criticalIssuesCount,
    highIssuesCount,
    issues,
    verificationHealthScore
  };
}

/**
 * Generates sample risk records specifically designed to trigger and test the SoA Sync Verifier
 */
export const SAMPLE_VERIFICATION_TEST_RISKS = [
  {
    title: 'Customer PII Exfiltration via Developer Laptops & Cloud Storage',
    category: 'Information Security' as const,
    linkedItem: 'Developer Workstations & S3 Production Exports',
    department: 'Software Engineering & DevOps',
    threatDescription: 'Bulk extraction of confidential customer records and financial PII via unencrypted local developer workstation cache or unauthorized S3 egress.',
    vulnerabilityDescription: 'Lack of local Data Leakage Prevention (DLP) endpoint agents and unrestricted cloud egress monitoring.',
    likelihood: 4,
    impact: 4,
    treatmentOption: 'Mitigate' as const,
    mitigationControl: 'A.8.12 Data leakage prevention & A.8.1 Endpoint Protection',
    residualLikelihood: 1,
    residualImpact: 3,
    treatmentOwner: 'Elena Rostova (Compliance Lead)',
    targetDate: '2026-11-30'
  },
  {
    title: 'Lost Unencrypted Backup USB SSD Media in Transit',
    category: 'Asset' as const,
    linkedItem: 'Physical Backup Media Ledger',
    department: 'Information Technology (IT)',
    threatDescription: 'Physical theft or accidental misplacement of external portable SSD hard drive containing database archive backups during facility relocation.',
    vulnerabilityDescription: 'Contractor utilized unmanaged USB flash media without enforced hardware encryption or chain of custody sign-off.',
    likelihood: 3,
    impact: 5,
    treatmentOption: 'Mitigate' as const,
    mitigationControl: 'A.7.10 Storage media & A.8.24 Use of cryptography',
    residualLikelihood: 1,
    residualImpact: 2,
    treatmentOwner: 'Marcus Vance (Infrastructure Mgr)',
    targetDate: '2026-10-15'
  },
  {
    title: 'Ransomware Outbreak on Distributed Remote Workstations',
    category: 'Information Security' as const,
    linkedItem: 'Corporate Mac & Windows Fleet',
    department: 'Information Security & Compliance',
    threatDescription: 'Spear-phishing email payload executing malicious ransomware encrypting local user documents and attempting network propagation.',
    vulnerabilityDescription: 'Antivirus definitions out of sync and lack of continuous behavioral malware quarantine.',
    likelihood: 4,
    impact: 4,
    treatmentOption: 'Mitigate' as const,
    mitigationControl: 'A.8.7 Protection against malware',
    residualLikelihood: 1,
    residualImpact: 2,
    treatmentOwner: 'Priya Sharma (SecOps Lead)',
    targetDate: '2026-10-31'
  }
];
