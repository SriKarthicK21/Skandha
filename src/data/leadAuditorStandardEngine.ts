/**
 * SKANDA Lead Auditor Documentation Standards & Generators
 * Compliant with ISO/IEC 27001:2022, ISO/IEC 27002:2022, IAF MD, UKAS, EGAC, BSI, TÜV & PECB standards.
 * 
 * Provides:
 * 1. Scope Document Generator (Clause 4.1 PESTLE, 4.2 Legal Obligations, 4.3 Technical Perimeters, Exclusions)
 * 2. 6-Column Statement of Applicability (SoA) Lead Auditor Register (Clause 6.1.3 d)
 * 3. Executive ISMS Manual (Clauses 4-10 PDCA, Risk Matrix, MRM Charter, Internal Audit Program, CAPA)
 * 4. SOP Workflows (Incident Response, Access Lifecycle, Change Management, Vulnerability Remediation)
 */

import { ControlItem, TenantCompany } from '../types';
import { ISO27001_2022_93_MASTER } from './iso27001_2022_masterControls';
import { ISO27001_2022_TUV_MATRIX } from './iso27001_2022_tuv_matrix';

export interface LeadAuditorScopeDossier {
  companyName: string;
  registrationNumber: string;
  accreditationStandard: string;
  auditCycle: string;
  leadAuditorOrg: string;
  scopeStatement: string;
  
  // Clause 4.1 Internal & External Issues (PESTLE)
  pestleAnalysis: Array<{
    category: 'Political' | 'Economic' | 'Social' | 'Technological' | 'Legal' | 'Environmental';
    contextIssue: string;
    internalOrExternal: 'Internal' | 'External';
    riskImpact: string;
    governingISMSControl: string;
  }>;

  // Clause 4.2 Interested Parties & Legal/Regulatory Obligations
  stakeholderObligations: Array<{
    stakeholderGroup: string;
    interestedParty: string;
    obligationType: 'Statutory' | 'Regulatory' | 'Contractual' | 'Customer Requirement';
    mandateReference: string;
    mandatoryRequirement: string;
    ismsFulfillmentControl: string;
    penaltiesOrConsequence: string;
  }>;

  // Clause 4.3 Technical & Physical Demarcations
  technicalPerimeter: {
    cloudEnvironments: Array<{
      provider: string;
      accountIdOrSubscription: string;
      primaryRegions: string[];
      vpcNetworkCIDRs: string[];
      dataClassificationStored: string;
    }>;
    physicalFacilities: Array<{
      locationType: 'Headquarters' | 'Regional Hub' | 'Co-Location Data Center' | 'Remote Workforce';
      addressOrModel: string;
      perimeterControls: string;
      physicalScopeStatus: 'IN_SCOPE' | 'SHARED_RESPONSIBILITY_CSP';
    }>;
    thirdPartyInterfaces: Array<{
      serviceName: string;
      category: 'Identity Provider' | 'Payment Gateway' | 'CDN / Edge Protection' | 'Code Hosting / CI/CD';
      boundaryInterface: string;
      securityAgreementInPlace: boolean;
    }>;
  };

  // Permissible Exclusions Justification under Clause 4.3 & 6.1.3 d
  permissibleExclusions: Array<{
    annexAControl: string;
    controlTitle: string;
    theme: string;
    technicalJustification: string;
    compensatingControl: string;
    auditorAcceptanceRationale: string;
  }>;
}

export interface LeadAuditorSoARow {
  controlCode: string;
  title: string;
  theme: 'Organizational' | 'People' | 'Physical' | 'Technological';
  isNewIn2022: boolean;
  applicable: boolean;
  justification: string;
  linkedRiskIds: string[];
  legalOrContractualMandate: string;
  implementationStatus: 'Implemented' | 'Partially Implemented' | 'Planned' | 'Excluded';
  responsibleDepartment?: string;
  governingPolicyOrSOP: string;
  auditableEvidenceArtifact: string;
  compensatingAssurance?: string;
  verificationMethod: 'DOCUMENT_INSPECTION' | 'TECHNICAL_TESTING' | 'INTERVIEW_SAMPLING';
}

export interface LeadAuditorSOPDefinition {
  sopCode: string;
  title: string;
  clauseOrAnnexA: string;
  processOwner: string;
  toolingStack: string[];
  triggerCondition: string;
  maxSlaDuration: string;
  steps: Array<{
    stepNumber: number;
    actionName: string;
    performerRole: string;
    detailedAction: string;
    toolingCommandsOrPortal: string;
    dualControlApprovalRequired: boolean;
    requiredOutputArtifact: string;
  }>;
  recordRetentionYears: number;
  auditSamplingProcedure: string;
}

/**
 * Builds the Gold-Standard Lead Auditor ISMS Scope Dossier
 */
export function generateLeadAuditorScopeDossier(
  tenant: TenantCompany | null,
  companyName = 'Apex Global FinTech Solutions Ltd'
): LeadAuditorScopeDossier {
  return {
    companyName: tenant?.name || companyName,
    registrationNumber: (tenant as any)?.registrationNumber || 'UK-CRN-11948201 / SG-UEN-202039182K',
    accreditationStandard: 'ISO/IEC 27001:2022 (UKAS / IAF MLA & EGAC Alignment)',
    auditCycle: '3-Year Re-certification Cycle (Stage 1 Readiness / Stage 2 Verification)',
    leadAuditorOrg: 'BSI Group UK / TÜV Rheinland Lead Audit Directorate',
    scopeStatement: tenant?.businessScope?.statement || 
      `The Information Security Management System (ISMS) encompasses the governance, architecture, software engineering, DevSecOps deployment, cloud infrastructure operations, customer transactional data processing, and ongoing enterprise support for the Apex Open-Banking Core API and SaaS platform. Operational boundaries include AWS and Azure production VPCs (eu-west-1, us-east-1, ap-southeast-1), managed via corporate headquarters and authorized remote endpoint telemetry under MDM zero-trust guardrails.`,

    pestleAnalysis: [
      {
        category: 'Political',
        contextIssue: 'Geopolitical instability and cross-border digital sovereignty mandates requiring localized cryptographic control.',
        internalOrExternal: 'External',
        riskImpact: 'Mandatory data residency restrictions and cross-border audit compliance liabilities.',
        governingISMSControl: 'A.5.31 Legal, statutory, regulatory and contractual requirements & A.5.23 Cloud security'
      },
      {
        category: 'Economic',
        contextIssue: 'Macro-economic pressure to optimize cloud compute expenditure while maintaining 99.95% continuous availability SLAs.',
        internalOrExternal: 'Internal',
        riskImpact: 'Risk of infrastructure under-provisioning or deferred cybersecurity tooling renewals.',
        governingISMSControl: 'A.5.30 ICT readiness for business continuity & A.8.6 Capacity management'
      },
      {
        category: 'Social',
        contextIssue: 'Shift to permanent hybrid and remote-first workforce across international engineering hubs.',
        internalOrExternal: 'Internal',
        riskImpact: 'Increased risk of endpoint compromise, shoulder-surfing, and insecure home network routing.',
        governingISMSControl: 'A.6.7 Remote working & A.8.1 User endpoint devices with enforced EDR/MDM'
      },
      {
        category: 'Technological',
        contextIssue: 'Rapid proliferation of Generative AI, automated vulnerability exploitation, and nation-state phishing kits.',
        internalOrExternal: 'External',
        riskImpact: 'Novel attack vectors against API endpoints and third-party open source software supply chains.',
        governingISMSControl: 'A.5.7 Threat intelligence, A.8.28 Secure coding & A.8.30 Outsourced development'
      },
      {
        category: 'Legal',
        contextIssue: 'Enforcement of UK GDPR, EU NIS 2 Directive, Singapore MAS TRM 2021, and India DPDP Act 2023.',
        internalOrExternal: 'External',
        riskImpact: 'Severe regulatory fines (up to 4% global turnover) and statutory director liability.',
        governingISMSControl: 'A.5.31 Legal mandates & A.5.34 Privacy and protection of PII'
      },
      {
        category: 'Environmental',
        contextIssue: 'Severe climate events causing potential regional power failure at commercial cloud availability zones.',
        internalOrExternal: 'External',
        riskImpact: 'Multi-AZ disaster recovery invocation and failover synchronization latency.',
        governingISMSControl: 'A.8.14 Redundancy of information processing facilities'
      }
    ],

    stakeholderObligations: [
      {
        stakeholderGroup: 'Financial & Banking Regulators',
        interestedParty: 'Monetary Authority of Singapore (MAS) & UK Financial Conduct Authority (FCA)',
        obligationType: 'Statutory',
        mandateReference: 'MAS TRM Guidelines 2021 (Notice 655) & FCA SYSC 13.9',
        mandatoryRequirement: 'Mandatory 1-hour critical incident notification, 4h RTO, multi-factor authentication for administrative access, and annual penetration testing.',
        ismsFulfillmentControl: 'Clause 6.2 Objectives, POL-SEC-004 Access Control & SOP-INC-001 Incident Response',
        penaltiesOrConsequence: 'Formal regulatory sanction, public censure, or suspension of banking operating license.'
      },
      {
        stakeholderGroup: 'Data Protection Authorities',
        interestedParty: 'Information Commissioner\'s Office (ICO UK) & European Data Protection Board (EDPB)',
        obligationType: 'Statutory',
        mandateReference: 'UK GDPR / EU GDPR Article 32 & Article 33',
        mandatoryRequirement: 'Encryption of personal data at rest and in transit, 72-hour breach reporting to supervisory authority, and Data Protection Impact Assessments (DPIA).',
        ismsFulfillmentControl: 'A.5.34 Privacy of PII, A.8.11 Data masking & A.8.24 Use of cryptography',
        penaltiesOrConsequence: 'Statutory fines up to €20M or 4% of annual global turnover, whichever is higher.'
      },
      {
        stakeholderGroup: 'Enterprise Tier-1 Customers',
        interestedParty: 'Commercial Banks, FinTech Partners, and Enterprise API Consumers',
        obligationType: 'Contractual',
        mandateReference: 'Master Service Agreements (MSAs) & Data Processing Addenda (DPAs)',
        mandatoryRequirement: '99.95% API availability SLA, annual SOC 2 Type II and ISO/IEC 27001 accredited certificate maintenance, 24-hour customer breach notification.',
        ismsFulfillmentControl: 'Clause 4.3 Scope Document, SoA Control Register & Clause 9.2 Internal Audit',
        penaltiesOrConsequence: 'Liquidated damages, customer contract termination, and enterprise brand loss.'
      },
      {
        stakeholderGroup: 'Corporate Board & Shareholders',
        interestedParty: 'Executive Board of Directors & Audit Committee',
        obligationType: 'Regulatory',
        mandateReference: 'Corporate Governance Code & ISO 27001 Clause 5.1 / 9.3',
        mandatoryRequirement: 'Quarterly Management Review Meetings (MRM), formal Risk Appetite formulation, and zero unmitigated High/Critical residual risks.',
        ismsFulfillmentControl: 'Clause 5.1 Leadership, Clause 6.1.2 Risk Assessment & Clause 9.3 MRM Charter',
        penaltiesOrConsequence: 'Governance failure, director liability, and downgrade of investor credit rating.'
      }
    ],

    technicalPerimeter: {
      cloudEnvironments: [
        {
          provider: 'Amazon Web Services (AWS)',
          accountIdOrSubscription: 'AWS Account ID: 582910482910 (Production Root & Transit Gateway)',
          primaryRegions: ['eu-west-1 (Ireland)', 'us-east-1 (N. Virginia)', 'ap-southeast-1 (Singapore)'],
          vpcNetworkCIDRs: ['10.100.0.0/16 (Prod VPC)', '10.101.0.0/16 (Data VPC)', '10.200.0.0/16 (Transit Hub)'],
          dataClassificationStored: 'Restricted Customer PII, Cardholder Tokens & Production Database Backups'
        },
        {
          provider: 'Microsoft Azure Cloud',
          accountIdOrSubscription: 'Azure Subscription ID: d849204a-810f-4bc2-bf28-198f2490d182 (AI & Analytics)',
          primaryRegions: ['westeurope (Netherlands)', 'southeastasia (Singapore)'],
          vpcNetworkCIDRs: ['172.16.0.0/16 (Azure AI VNet)', '172.17.0.0/16 (Drift Ingestion VNet)'],
          dataClassificationStored: 'Internal Machine Learning Training Embeddings & Anonymized Risk Analytics'
        }
      ],
      physicalFacilities: [
        {
          locationType: 'Headquarters',
          addressOrModel: 'Apex House, 25 Finsbury Circus, London EC2M 7EE, United Kingdom',
          perimeterControls: '24/7 Monitored Access Control, Biometric Turnstiles, CCTV with 90-Day Retention, Visitor Escort Policy',
          physicalScopeStatus: 'IN_SCOPE'
        },
        {
          locationType: 'Co-Location Data Center',
          addressOrModel: 'Equinix LD4 Slough Data Center, Buckinghamshire, United Kingdom',
          perimeterControls: 'Third-party Tier IV facility certified under ISO 27001, SOC 2 Type II, and PCI DSS. Guarded by Equinix IBX staff.',
          physicalScopeStatus: 'SHARED_RESPONSIBILITY_CSP'
        },
        {
          locationType: 'Remote Workforce',
          addressOrModel: '100% Zero-Trust Remote Telework Model (United Kingdom, Singapore, India, EU)',
          perimeterControls: 'Hardened corporate laptops (Jamf Pro / Intune), BitLocker/FileVault 256-bit encryption, Always-On WireGuard/Tailscale VPN, FIDO2 hardware MFA.',
          physicalScopeStatus: 'IN_SCOPE'
        }
      ],
      thirdPartyInterfaces: [
        {
          serviceName: 'Okta Enterprise Workforce Identity',
          category: 'Identity Provider',
          boundaryInterface: 'SAML 2.0 / OIDC Federation with WebAuthn Hardware Tokens (No SMS/Email OTP allowed)',
          securityAgreementInPlace: true
        },
        {
          serviceName: 'Cloudflare Enterprise Edge (CDN / WAF)',
          category: 'CDN / Edge Protection',
          boundaryInterface: 'Public Ingress Reverse Proxy, DDoS L3-L7 Mitigation & TLS 1.3 Strict Termination',
          securityAgreementInPlace: true
        },
        {
          serviceName: 'Stripe Payments API Integration',
          category: 'Payment Gateway',
          boundaryInterface: 'PCI DSS Level 1 Tokenized API Gateway (No raw PAN stored within Apex environment)',
          securityAgreementInPlace: true
        },
        {
          serviceName: 'GitHub Enterprise SaaS & Actions',
          category: 'Code Hosting / CI/CD',
          boundaryInterface: 'SSH/HTTPS with Mandatory Signed Commits, Branch Protection Gates, and Dependabot/Snyk SAST',
          securityAgreementInPlace: true
        }
      ]
    },

    permissibleExclusions: [
      {
        annexAControl: 'A.7.11',
        controlTitle: 'Supporting utilities (Standalone Generator / Substation Maintenance)',
        theme: 'Physical Controls',
        technicalJustification: 'Apex operates 100% serverless and cloud-native infrastructure hosted inside AWS and Azure Tier III/IV hyper-scale facilities. Apex maintains no independent electrical substations or physical power generators. Physical utility continuity is managed and audited via AWS and Equinix under ISO 27001:2022 and SOC 2 Type II third-party assurance attestations.',
        compensatingControl: 'Annual review of AWS / Equinix SOC 2 Type II Section III & IV Bridge Letters by CISO.',
        auditorAcceptanceRationale: 'Conforms to IAF MD guidance for cloud-native SaaS tenants utilizing accredited IaaS/PaaS providers.'
      },
      {
        annexAControl: 'A.7.14',
        controlTitle: 'Secure disposal or re-use of equipment (Physical Degaussing / Incineration)',
        theme: 'Physical Controls',
        technicalJustification: 'Apex does not operate on-premise physical disk arrays or magnetic tape drives. All physical cloud server hardware is decommissioned and destroyed by AWS using NIST SP 800-88 Rev 1 cryptographic erasure and mechanical shredding protocols. For corporate endpoints, decommissioning is handled via certified e-waste vendors providing ISO 14001 and Blancco certified sanitization certificates.',
        compensatingControl: 'A.8.10 Information Deletion policy with automated cryptographic key zeroization.',
        auditorAcceptanceRationale: 'Complies with ISO 27001:2022 standard requirements when substantiated by vendor disposal logs.'
      }
    ]
  };
}

/**
 * Builds the Rigorous 6-Column Statement of Applicability (SoA) Table
 */
export function generateLeadAuditorSoAMatrix(
  tenantControls: ControlItem[],
  tenantCompany: TenantCompany | null
): LeadAuditorSoARow[] {
  const masterControls = ISO27001_2022_93_MASTER;
  const companyName = tenantCompany?.name || 'Enterprise Client';
  const cleanCompany = companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();

  return masterControls.map(master => {
    const existing = tenantControls.find(c => c.controlCode === master.controlCode);
    const tuvEntry = ISO27001_2022_TUV_MATRIX.find(t => t.controlCode === master.controlCode);
    
    const applicable = existing !== undefined ? existing.applicable : (tuvEntry ? tuvEntry.defaultApplicable : true);
    
    // Determine 2-tier justification & risk linkage
    let justification = existing?.justification || '';
    if (!justification || justification.length < 15) {
      if (applicable) {
        justification = tuvEntry?.riskId
          ? `Selected to mitigate ${tuvEntry.riskId} in accordance with ${tuvEntry.legalRequirements}. Essential control for maintaining ISMS confidentiality, integrity, and availability.`
          : `Mandatory baseline safeguard for ${master.title}. Selected to mitigate inherent risk in corporate operations, preserve confidentiality of customer data, and fulfill ISO/IEC 27001:2022 Clause 6.1.3 d) mandate.`;
      } else {
        justification = tuvEntry?.exclusionJustification ||
          `Control excluded as ${companyName} operates 100% cloud-hosted workloads; physical and infrastructure safeguards are certified under AWS/Equinix ISO 27001 & SOC 2 Type II audit attestations.`;
      }
    }

    // Determine implementation status
    let status: 'Implemented' | 'Partially Implemented' | 'Planned' | 'Excluded' = 'Implemented';
    if (!applicable) {
      status = 'Excluded';
    } else if (existing?.implementationStatus === 'In Progress' || existing?.implementationStatus === 'Partially Implemented') {
      status = 'Partially Implemented';
    } else if (existing?.implementationStatus === 'Not Started' || existing?.implementationStatus === 'Planned') {
      status = 'Planned';
    } else if (existing?.implementationStatus) {
      status = 'Implemented';
    } else if (tuvEntry?.defaultStatus) {
      status = tuvEntry.defaultStatus;
    }

    // Assign governing Policy / SOP
    const policyRef = tuvEntry?.governingSop || 'POL-ISMS-01 Information Security Policy & SOP-GOV-01';

    // Assign auditable evidence artifact
    const cleanCode = master.controlCode.replace('.', '_');
    const auditableEvidenceArtifact = tuvEntry?.artifactEvidence ||
      `${cleanCompany}_${cleanCode}_EVIDENCE_DOSSIER_2026.pdf`;

    // Map linked Risk IDs
    const riskIdTag = tuvEntry?.riskId ? tuvEntry.riskId.split(':')[0].trim() : `RSK-${master.controlCode.replace('.', '-')}-01`;
    const linkedRiskIds = existing?.mappedRiskCodes && existing.mappedRiskCodes.length > 0
      ? existing.mappedRiskCodes
      : [riskIdTag];

    // Legal / Regulatory mandate
    const legalMandate = applicable
      ? (tuvEntry?.legalRequirements || 'ISO/IEC 27001:2022 Clause 6.1.3 d), GDPR Article 32 & MAS TRM Notice 655')
      : 'Statutory Exclusion Rationale Filed under ISO 27001:2022 Clause 4.3 & Clause 6.1.3 d)';

    return {
      controlCode: master.controlCode,
      title: master.title,
      theme: master.theme,
      isNewIn2022: master.isNewIn2022 || false,
      applicable,
      justification,
      linkedRiskIds,
      legalOrContractualMandate: legalMandate,
      implementationStatus: status,
      responsibleDepartment: existing?.responsibleDepartment || (master.theme === 'Organizational' ? 'ISMS Governance & Legal' : master.theme === 'People' ? 'People Operations / HR' : master.theme === 'Physical' ? 'Facilities & SecOps' : 'Cloud Architecture & SecOps'),
      governingPolicyOrSOP: policyRef,
      auditableEvidenceArtifact,
      compensatingAssurance: !applicable ? (tuvEntry?.exclusionJustification ? 'Cloud Service Provider (AWS/GCP/Equinix) ISO 27001 & SOC 2 Type II Bridge Attestation' : 'Compensating Controls Architecture Document') : undefined,
      verificationMethod: tuvEntry?.auditorVerificationMethod || (master.theme === 'Technological' ? 'TECHNICAL_TESTING' : 'DOCUMENT_INSPECTION')
    };
  });
}

/**
 * 4 Enterprise-Grade Standard Operating Procedures (SOPs) with Actionable Workflow Sequences
 */
export const AUDITOR_GRADE_SOPS: LeadAuditorSOPDefinition[] = [
  {
    sopCode: 'SOP-INC-001',
    title: 'Security Incident Detection, Containment & Regulatory Triage Runbook',
    clauseOrAnnexA: 'ISO 27001:2022 Controls A.5.24, A.5.25, A.5.26, A.5.27, A.5.28 & MAS TRM Section 6',
    processOwner: 'Lead Incident Commander (CISO / SecOps Manager)',
    toolingStack: ['CrowdStrike Falcon EDR', 'Datadog SIEM', 'PagerDuty', 'Jira Service Management', 'AWS GuardDuty'],
    triggerCondition: 'Detection of P1/P2 alert (e.g., unauthorized privileged access, ransomware execution, S3 bucket public leak, anomalous exfiltration).',
    maxSlaDuration: 'Triage within 15 mins; Containment within 60 mins; Regulatory filing within 60 mins (MAS) / 72h (GDPR).',
    steps: [
      {
        stepNumber: 1,
        actionName: 'Ingestion & Rapid Severity Classification',
        performerRole: 'Tier-2 SOC Analyst',
        detailedAction: 'Ingest SIEM alert, verify false positive indicators, assign severity rating (P1-Critical to P4-Low), and spin up dedicated Incident War Room with automated screen recording.',
        toolingCommandsOrPortal: 'Datadog Alert Console > Create Case > PagerDuty Incident Escalation (P1_CISO_CALL_OUT)',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'INCIDENT_TRIAGE_CASE_TICKET_<ID>.json'
      },
      {
        stepNumber: 2,
        actionName: 'Cryptographic & Network Host Isolation',
        performerRole: 'SecOps Incident Commander',
        detailedAction: 'Execute immediate automated endpoint isolation or AWS security group lockdown to sever outbound C2 network traffic without clearing volatile memory (RAM).',
        toolingCommandsOrPortal: 'crowdstrike-cli host isolate --device-id <ID> || aws ec2 modify-instance-attribute --security-groups sg-quarantine-isolate',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'HOST_CONTAINMENT_EVIDENCE_LOG_<ID>.txt'
      },
      {
        stepNumber: 3,
        actionName: 'Volatile Memory & Disk Forensics Capture',
        performerRole: 'Digital Forensics & Incident Response (DFIR) Specialist',
        detailedAction: 'Perform cryptographic RAM snapshot and EBS snapshot volume generation for chain-of-custody preservation prior to remediation.',
        toolingCommandsOrPortal: 'aws ec2 create-snapshot --volume-id <VOL> --tag-specifications "ResourceType=snapshot,Tags=[{Key=Evidence,Value=True}]"',
        dualControlApprovalRequired: true,
        requiredOutputArtifact: 'SHA256_EVIDENCE_CHAIN_OF_CUSTODY_RECORD.pdf'
      },
      {
        stepNumber: 4,
        actionName: 'Dual-Authorized Regulatory Breach Notification Filing',
        performerRole: 'CISO & Legal General Counsel',
        detailedAction: 'If customer PII or critical financial banking transactions are impacted, execute statutory filing to supervisory authority (MAS within 1h, ICO/GDPR within 72h) under dual executive sign-off.',
        toolingCommandsOrPortal: 'SKANDA Governance Portal > Regulatory Reporting > Dispatch Statutory Notice',
        dualControlApprovalRequired: true,
        requiredOutputArtifact: 'REGULATORY_STATUTORY_DISPATCH_CONFIRMATION_<TIMESTAMP>.pdf'
      },
      {
        stepNumber: 5,
        actionName: 'Post-Incident Review (PIR) & 5-Whys Root Cause Analysis',
        performerRole: 'ISMS Lead Auditor & SecOps Lead',
        detailedAction: 'Within 5 business days, convene all stakeholders, conduct 5-Whys root cause analysis, document preventative corrective actions, and log CAPA ticket in the ISMS engine.',
        toolingCommandsOrPortal: 'Jira CAPA Module > Ticket Type: Security Nonconformity (Clause 10.1)',
        dualControlApprovalRequired: true,
        requiredOutputArtifact: 'FORMAL_PIR_AND_CAPA_AUDIT_CLOSURE_REPORT.pdf'
      }
    ],
    recordRetentionYears: 7,
    auditSamplingProcedure: 'Auditor will inspect SIEM incident logs for the past 12 months, cross-checking 100% of P1 incidents against timestamped containment and regulatory notice outputs.'
  },
  {
    sopCode: 'SOP-IAM-002',
    title: 'User Access Lifecycle, Deprovisioning & Privileged Access Management (PAM)',
    clauseOrAnnexA: 'ISO 27001:2022 Controls A.5.15, A.5.16, A.5.17, A.5.18, A.8.2, A.8.5',
    processOwner: 'Head of IT Infrastructure & Identity Operations',
    toolingStack: ['Okta Enterprise IdP', 'Google Workspace', 'AWS IAM Identity Center', 'BambooHR / Workday API'],
    triggerCondition: 'New employee onboarding, departmental transfer, role elevation, or HR termination event.',
    maxSlaDuration: 'Standard onboarding: 24 hours; Emergency/Voluntary Offboarding: Deprovisioning within 1 hour.',
    steps: [
      {
        stepNumber: 1,
        actionName: 'Automated HR-Triggered Provisioning & Principle of Least Privilege (PoLP)',
        performerRole: 'HR Lead & IT Admin',
        detailedAction: 'User account created via SCIM sync from HRIS. Role-Based Access Control (RBAC) groups assigned strictly based on job title matriculation; no default global admin rights.',
        toolingCommandsOrPortal: 'Okta SCIM Integration > Profile Master: Workday > Enforce Group Rules (dept_eng_read)',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'USER_PROVISIONING_RBAC_ASSIGNMENT_RECORD.json'
      },
      {
        stepNumber: 2,
        actionName: 'Hardware FIDO2 Token Enrollment & Passwordless Setup',
        performerRole: 'User & IT Security Engineer',
        detailedAction: 'Mandatory registration of hardware WebAuthn token (YubiKey 5 Series). Phone SMS and voice-call OTP methods are programmatically blacklisted.',
        toolingCommandsOrPortal: 'Okta Admin Console > Security > Authenticators > Enforce FIDO2 WebAuthn Hardware Token Only',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'FIDO2_HARDWARE_TOKEN_REGISTRATION_AUDIT_LOG.csv'
      },
      {
        stepNumber: 3,
        actionName: 'Just-In-Time (JIT) Privileged Access Escalation',
        performerRole: 'Senior SRE & Security Approver',
        detailedAction: 'Production cloud SSH or console access is restricted. When needed, user requests temporary 4-hour role elevation via ChatOps ticket; requires four-eyes approval.',
        toolingCommandsOrPortal: 'aws-sso-cli request --role ProductionSuperAdmin --duration 4h --reason "HOTFIX-492"',
        dualControlApprovalRequired: true,
        requiredOutputArtifact: 'JIT_PRIVILEGED_ELEVATION_APPROVAL_TICKET.pdf'
      },
      {
        stepNumber: 4,
        actionName: 'Immediate Termination & Session Token Revocation',
        performerRole: 'IT Helpdesk & automated webhook',
        detailedAction: 'Upon receipt of termination webhook, account is suspended, all active OAuth tokens revoked, SSO session killed, and device remote-wiped within 60 minutes.',
        toolingCommandsOrPortal: 'okta-cli user suspend <ID> && jamf-cli lock-device --wipe-work-data <DEVICE_ID>',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'OFFBOARDING_INSTANT_REVOCATION_RECEIPT.pdf'
      },
      {
        stepNumber: 5,
        actionName: 'Quarterly User Access Review (UAR) Recertification',
        performerRole: 'Department Heads & ISMS Auditor',
        detailedAction: 'Every 90 days, automated access lists are distributed to department leads. Any unconfirmed account is marked for revocation within 7 calendar days.',
        toolingCommandsOrPortal: 'SKANDA IAM Recertification Hub > Export Stale Accounts > Collect Sign-Offs',
        dualControlApprovalRequired: true,
        requiredOutputArtifact: 'SIGNED_QUARTERLY_UAR_AUDIT_PACKAGE_Q[1-4].xlsx'
      }
    ],
    recordRetentionYears: 5,
    auditSamplingProcedure: 'Auditor will sample 10 recent joiners and 10 recent leavers, comparing HR termination date/time against Okta deprovisioning timestamp to verify <= 1 hour compliance.'
  },
  {
    sopCode: 'SOP-CHG-003',
    title: 'Enterprise Change Control, Peer Review & CI/CD Production Deployment',
    clauseOrAnnexA: 'ISO 27001:2022 Controls A.8.9, A.8.25, A.8.28, A.8.29, A.8.31, A.8.32',
    processOwner: 'VP of Engineering & Change Advisory Board (CAB)',
    toolingStack: ['GitHub Enterprise', 'Terraform Cloud', 'Snyk / Trivy', 'SonarQube', 'ArgoCD'],
    triggerCondition: 'Any code commit, infrastructure configuration change, or database migration destined for Staging or Production environments.',
    maxSlaDuration: 'Standard Change: 4 hours automated pipeline; Emergency Hotfix: 30 minutes with retrospective CAB review within 24 hours.',
    steps: [
      {
        stepNumber: 1,
        actionName: 'Branch Protection & Mandatory Two-Person Peer Review',
        performerRole: 'Software Engineer & Peer Reviewer',
        detailedAction: 'Code committed to feature branches. Pull Requests to main/production branch require minimum two passing peer approvals; direct commits to main are cryptographically blocked.',
        toolingCommandsOrPortal: 'GitHub Repo Settings > Branch Protection: require_approvals=2, dismiss_stale_reviews=true',
        dualControlApprovalRequired: true,
        requiredOutputArtifact: 'PULL_REQUEST_PEER_APPROVAL_SIGN_OFF.json'
      },
      {
        stepNumber: 2,
        actionName: 'Automated CI/CD SAST, DAST, SCA & Secret Scanning Gates',
        performerRole: 'GitHub Actions CI Runner',
        detailedAction: 'Pipeline automatically executes Snyk vulnerability scan, SonarQube quality gate (A rating), and GitGuardian secret scan. Build automatically terminates if any Critical/High CVE is discovered.',
        toolingCommandsOrPortal: 'snyk test --severity-threshold=high && gitguardian scan --exit-zero=false',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'AUTOMATED_CI_SECURITY_SCAN_VERDICT_PASS.pdf'
      },
      {
        stepNumber: 3,
        actionName: 'Infrastructure-as-Code (IaC) Spec Validation & Dry-Run',
        performerRole: 'DevOps / Cloud Architect',
        detailedAction: 'Terraform plan is generated and verified against Checkov / tfsec compliance policies before any cloud resource modification.',
        toolingCommandsOrPortal: 'terraform plan -out=tfplan && checkov -f tfplan --framework terraform',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'TERRAFORM_PLAN_AUDIT_LOG_SPEC.txt'
      },
      {
        stepNumber: 4,
        actionName: 'Zero-Downtime Canary / Blue-Green Deployment',
        performerRole: 'ArgoCD GitOps Controller',
        detailedAction: 'Production deployment executed using Kubernetes Canary strategy. Automated health checks monitor HTTP 5xx error rates for 15 minutes prior to 100% traffic shift.',
        toolingCommandsOrPortal: 'argocd app sync production-core-api --strategy canary',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'DEPLOYMENT_CANARY_HEALTH_VALIDATION_TELEMETRY.json'
      },
      {
        stepNumber: 5,
        actionName: 'Automated Rollback & Post-Implementation Verification',
        performerRole: 'Release Engineer',
        detailedAction: 'If latency exceeds 250ms or 5xx error rate > 0.1%, automated instant rollback triggers to previous known good release artifact.',
        toolingCommandsOrPortal: 'kubectl rollout undo deployment/core-api-production',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'POST_DEPLOY_SMOKE_TEST_PASS_REPORT.pdf'
      }
    ],
    recordRetentionYears: 3,
    auditSamplingProcedure: 'Auditor will review git commit history for 5 randomly chosen production releases to verify that no code bypass was executed and all peer approvals exist.'
  },
  {
    sopCode: 'SOP-VUL-004',
    title: 'Continuous Vulnerability Management, CVSS Remediation & Patching SLAs',
    clauseOrAnnexA: 'ISO 27001:2022 Controls A.8.7, A.8.8, A.8.19 & MAS TRM Section 7.2',
    processOwner: 'Head of Cyber Defense & Cloud Security',
    toolingStack: ['Wiz Cloud Security', 'AWS Inspector', 'Tenable / Qualys', 'Jira Service Management'],
    triggerCondition: 'Daily automated cloud infrastructure scan, container registry scan, or Zero-Day CVE public disclosure.',
    maxSlaDuration: 'Critical (CVSS 9.0-10.0): 7 Days; High (CVSS 7.0-8.9): 15 Days; Medium (CVSS 4.0-6.9): 30 Days.',
    steps: [
      {
        stepNumber: 1,
        actionName: 'Automated Daily Asset Scanning & Risk Scoring',
        performerRole: 'Cloud Security Scanner (Wiz / AWS Inspector)',
        detailedAction: 'Continuous scanning of all EC2 instances, EKS container images, and Lambda functions. Automated correlation with threat intelligence to detect actively exploited in-the-wild CVEs.',
        toolingCommandsOrPortal: 'wiz-cli scan --policy "Apex Mandatory CIS Benchmark v2.0"',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'DAILY_VULNERABILITY_ASSESSMENT_TELEMETRY.json'
      },
      {
        stepNumber: 2,
        actionName: 'Automated Jira Ticket Dispatch & SLA Countdown',
        performerRole: 'SecOps Automation Bot',
        detailedAction: 'Tickets dispatched directly to engineering backlog with strict SLA timer tags based on CVSS v3.1 score. Escalation alert generated if 50% SLA duration elapses.',
        toolingCommandsOrPortal: 'Jira API > Create Vulnerability Ticket > Assign SLA: Critical (7 Days)',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'VULN_TICKET_TRACKING_DISPATCH_<CVE>.json'
      },
      {
        stepNumber: 3,
        actionName: 'Patch Testing in Isolated Staging Environment',
        performerRole: 'Assigned Engineering Owner',
        detailedAction: 'Security patch or container base image update applied in Staging environment; automated integration tests executed to verify zero application regression.',
        toolingCommandsOrPortal: 'npm audit fix || docker build -t core-api:patched-cve . && npm test',
        dualControlApprovalRequired: false,
        requiredOutputArtifact: 'STAGING_REGRESSION_TEST_PASS_REPORT.pdf'
      },
      {
        stepNumber: 4,
        actionName: 'Production Patch Deployment & Rescan Verification',
        performerRole: 'SecOps Engineer',
        detailedAction: 'Patch deployed to production via SOP-CHG-003. SecOps scanner immediately executes targeted rescan to verify that the CVE is remediated and closed.',
        toolingCommandsOrPortal: 'wiz-cli rescan --target-id <INSTANCE_ID> --cve <CVE_ID>',
        dualControlApprovalRequired: true,
        requiredOutputArtifact: 'RESCAN_REMEDIATION_CONFIRMATION_ZERO_FINDINGS.pdf'
      },
      {
        stepNumber: 5,
        actionName: 'Formal Vulnerability Exception & Compensating Control Waiver',
        performerRole: 'CISO & Systems Architect',
        detailedAction: 'If a vendor patch is unavailable, a formal 90-day Risk Waiver is required. Must implement compensating WAF rule or network micro-segmentation, signed by CISO.',
        toolingCommandsOrPortal: 'SKANDA Waiver Hub > Request Exception > Mandatory Compensating Control Form',
        dualControlApprovalRequired: true,
        requiredOutputArtifact: 'SIGNED_CISO_VULNERABILITY_EXCEPTION_RECORD.pdf'
      }
    ],
    recordRetentionYears: 3,
    auditSamplingProcedure: 'Auditor will review closed vulnerability tickets across the last 6 months to verify that 100% of Critical CVEs met the 7-day remediation SLA.'
  }
];

/**
 * Builds the High-End ISMS Manual Summary (Clauses 4-10 PDCA, Risk Appetite, MRM, Audit Program)
 */
export function generateLeadAuditorISMSManual(tenantCompany: TenantCompany | null) {
  const company = tenantCompany?.name || 'Apex Global FinTech Solutions Ltd';
  
  return {
    documentCode: 'MAN-ISMS-001',
    title: `Information Security Management System (ISMS) Manual`,
    version: 'v3.2 (2026 Lead Auditor Edition)',
    classification: 'Confidential - Internal Management Governance',
    approvedBy: 'Chief Executive Officer & ISMS Executive Steering Committee',
    leadAccreditation: 'ISO/IEC 27001:2022 / UKAS / EGAC Accreditation Reference Standards',
    
    sections: [
      {
        number: '1',
        title: 'Organizational Context, Strategic Alignment & Scope (Clause 4)',
        content: `This ISMS Manual governs the organizational, technical, physical, and legal safeguards implemented across ${company}. The organization has established a systematic PESTLE risk landscape analysis (Clause 4.1) and a statutory Stakeholder Obligations Register (Clause 4.2) covering MAS TRM, UK GDPR, and SOC 2 Type II commitments. The ISMS Scope (Clause 4.3) covers 100% of production cloud infrastructure, corporate endpoints, and transactional data pipelines without permissible clause 4-10 exclusions.`
      },
      {
        number: '2',
        title: 'Executive Leadership, Board Commitment & Security Policy (Clause 5)',
        content: `Top Management demonstrates active leadership by establishing the Information Security Policy (Clause 5.2), providing required capital expenditure budgets, appointing the CISO, and enforcing the RACI Governance Model (Clause 5.3). Security responsibilities are formally incorporated into executive performance scorecards.`
      },
      {
        number: '3',
        title: 'Information Security Risk Assessment & Treatment Methodology (Clause 6)',
        content: `Risk management adheres to a 5x5 Likelihood and Impact Matrix combining financial ($ loss), operational (downtime SLA), reputational, and regulatory criteria. Enterprise Risk Appetite Threshold is set at Score 12. Any inherent risk scored >= 15 is categorized as Critical/High and requires a formal Risk Treatment Plan (Clause 6.1.3) with assigned mitigation owners and maximum 90-day completion milestones. The Statement of Applicability (SoA) documents all 93 controls with two-tier justifications.`
      },
      {
        number: '4',
        title: 'Competence, Awareness, Communication & Documented Information (Clause 7)',
        content: `All personnel undergo mandatory security awareness training within 14 calendar days of onboarding and quarterly anti-phishing simulations. Documented information (Clause 7.5) follows strict lifecycle control: unique IDs, mandatory classification markings, annual reviews, and cryptographic SHA-256 seal verification to prevent unauthorized modifications.`
      },
      {
        number: '5',
        title: 'Operational Planning, Control & Annex A Execution (Clause 8)',
        content: `Operational execution is governed by standardized runbooks (SOP-INC-001 for Incident Response, SOP-IAM-002 for Access Control, SOP-CHG-003 for Change Management, and SOP-VUL-004 for Vulnerability Remediation). Operational deviations require formal, time-bound Security Exception Waivers authorized by the CISO.`
      },
      {
        number: '6',
        title: 'Performance Evaluation, Internal Audit & Management Review (Clause 9)',
        content: `Performance monitoring (Clause 9.1) evaluates quantifiable metrics including MFA enforcement ratio (100%), Critical CVE patch SLA compliance (>= 98%), and average Phishing failure rate (< 3%). The Internal Audit Program (Clause 9.2) audits all clauses (4-10) and all 93 Annex A controls within each 3-year certification cycle by certified, independent lead auditors. Management Review Meetings (Clause 9.3) are convened bi-annually covering all 11 mandatory inputs under ISO 27001:2022.`
      },
      {
        number: '7',
        title: 'Continual Improvement, Nonconformity & CAPA Engine (Clause 10)',
        content: `Any incident, audit finding, or control deficiency triggers the formal Corrective and Preventive Action (CAPA) workflow. Root Cause Analysis is performed using the 5-Whys methodology. Nonconformities are only certified as 'Closed' after secondary audit testing validates that the systemic vulnerability was permanently eliminated.`
      }
    ]
  };
}
