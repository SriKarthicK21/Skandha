import { GrcFramework, StandardFrameworkCode } from '../../types/grcCoreTypes';

/**
 * SKANDA Enterprise Framework Library
 * Versioned, hierarchical compliance and governance standards repository.
 */
export class FrameworkLibrary {
  private static frameworks: Map<string, GrcFramework> = new Map();

  static {
    this.initializeFrameworks();
  }

  private static initializeFrameworks() {
    const frameworksList: GrcFramework[] = [
      // 1. ISO/IEC 27001:2022
      {
        id: 'fw-iso-27001-2022',
        code: 'ISO_27001_2022',
        name: 'ISO/IEC 27001:2022 Information Security Management Systems',
        version: '2022-Rev3',
        authority: 'International Organization for Standardization (ISO) / IEC',
        category: 'CYBERSECURITY',
        description: 'International standard specifying the requirements for establishing, implementing, maintaining, and continually improving an ISMS.',
        totalRequirementsCount: 93,
        activeVersion: true,
        sections: [
          {
            id: 'sec-iso27001-a5',
            code: 'A.5',
            title: 'Organizational Controls (37 Controls)',
            description: 'Policies, information security roles, asset management, and supplier relationships.',
            requirements: [
              {
                id: 'req-iso27001-a5-1',
                frameworkId: 'fw-iso-27001-2022',
                frameworkCode: 'ISO_27001_2022',
                code: 'A.5.1',
                title: 'Policies for information security',
                statement: 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals or if significant changes occur.',
                auditGuidance: 'Verify formal board/executive approval, annual review records, and distribution records.',
                evidenceRequirements: ['Approved ISMS Master Policy', 'Annual Policy Review Minutes', 'Employee Acknowledgement Logs'],
                mandatory: true,
                mappedControlIds: ['CTRL-POL-01', 'CTRL-GOV-01']
              },
              {
                id: 'req-iso27001-a5-15',
                frameworkId: 'fw-iso-27001-2022',
                frameworkCode: 'ISO_27001_2022',
                code: 'A.5.15',
                title: 'Access control',
                statement: 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.',
                auditGuidance: 'Review RBAC matrix, quarterly privilege access reviews, and termination de-provisioning workflows.',
                evidenceRequirements: ['Access Control Policy', 'Quarterly IAM Access Review Evidence', 'IdP Role Mappings'],
                mandatory: true,
                mappedControlIds: ['CTRL-IAM-01', 'CTRL-IAM-02']
              },
              {
                id: 'req-iso27001-a5-23',
                frameworkId: 'fw-iso-27001-2022',
                frameworkCode: 'ISO_27001_2022',
                code: 'A.5.23',
                title: 'Information security for use of cloud services',
                statement: 'Processes for acquisition, use, management and exit from cloud services shall be established in accordance with the organization’s information security requirements.',
                auditGuidance: 'Inspect cloud shared responsibility matrix, vendor SOC 2 reports, and CSP security configurations.',
                evidenceRequirements: ['Cloud Shared Responsibility Matrix', 'Vendor SOC 2 Type II Reports', 'Terraform IAM Baseline'],
                mandatory: true,
                mappedControlIds: ['CTRL-CLD-01', 'CTRL-TPRM-01']
              }
            ]
          },
          {
            id: 'sec-iso27001-a8',
            code: 'A.8',
            title: 'Technological Controls (34 Controls)',
            description: 'Network security, secure engineering, cryptography, logging, and vulnerability management.',
            requirements: [
              {
                id: 'req-iso27001-a8-12',
                frameworkId: 'fw-iso-27001-2022',
                frameworkCode: 'ISO_27001_2022',
                code: 'A.8.12',
                title: 'Data leakage prevention (DLP)',
                statement: 'Data leakage prevention measures shall be applied to systems, networks and any other devices that process, store or transmit sensitive information.',
                auditGuidance: 'Verify DLP endpoint agent telemetry, egress filtering rules, and alert monitoring triage logs.',
                evidenceRequirements: ['DLP Configuration Policy', 'Weekly DLP Alert Triage Reports', 'Cloud Storage Egress Policies'],
                mandatory: true,
                mappedControlIds: ['CTRL-DLP-01', 'CTRL-CRY-01']
              },
              {
                id: 'req-iso27001-a8-24',
                frameworkId: 'fw-iso-27001-2022',
                frameworkCode: 'ISO_27001_2022',
                code: 'A.8.24',
                title: 'Use of cryptography',
                statement: 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.',
                auditGuidance: 'Inspect KMS key rotation policies (AES-256 / RSA-4096), TLS 1.3 cipher suites, and HSM configurations.',
                evidenceRequirements: ['KMS Key Management Policy', 'Automated 90-Day Key Rotation Logs', 'TLS 1.3 Cipher Suite Scan'],
                mandatory: true,
                mappedControlIds: ['CTRL-CRY-01', 'CTRL-CRY-02']
              }
            ]
          }
        ]
      },

      // 2. MAS TRM Guidelines (Singapore Monetary Authority)
      {
        id: 'fw-mas-trm-2021',
        code: 'MAS_TRM_2021',
        name: 'MAS Technology Risk Management Guidelines (2021)',
        version: 'January 2021',
        authority: 'Monetary Authority of Singapore (MAS)',
        category: 'REGULATORY_FINTECH',
        description: 'Mandatory risk management guidelines issued by the Monetary Authority of Singapore for all Financial Institutions (FIs).',
        totalRequirementsCount: 114,
        activeVersion: true,
        sections: [
          {
            id: 'sec-mas-8',
            code: 'Sec 8.0',
            title: 'Software Application Development & Management',
            requirements: [
              {
                id: 'req-mas-8-1',
                frameworkId: 'fw-mas-trm-2021',
                frameworkCode: 'MAS_TRM_2021',
                code: 'MAS-TRM-8.1',
                title: 'Secure Coding & CI/CD Pipeline Gates',
                statement: 'An FI should adopt secure coding practices and implement automated SAST/DAST scanning gates in software release pipelines.',
                auditGuidance: 'Check branch protection rules, mandatory code reviews, automated vulnerability blocking thresholds.',
                evidenceRequirements: ['CI/CD Pipeline Security Gate Config', 'SonarQube SAST Reports', 'Third-Party Penetration Test'],
                mandatory: true,
                mappedControlIds: ['CTRL-APP-01', 'CTRL-VULN-01']
              }
            ]
          },
          {
            id: 'sec-mas-13',
            code: 'Sec 13.0',
            title: 'Cyber Incident Management & Statutory Notification',
            requirements: [
              {
                id: 'req-mas-13-1',
                frameworkId: 'fw-mas-trm-2021',
                frameworkCode: 'MAS_TRM_2021',
                code: 'MAS-TRM-13.1',
                title: '1-Hour Statutory Incident Notification',
                statement: 'An FI must notify MAS within 1 hour of discovering a critical system disruption or major cyber attack.',
                auditGuidance: 'Verify 24/7 SOC escalation runbooks, automated call-tree rosters, and mock tabletop drill records.',
                evidenceRequirements: ['Incident Escalation Playbook', 'MAS Incident Notification Form Template', 'Annual Tabletop Exercise Report'],
                mandatory: true,
                mappedControlIds: ['CTRL-INC-01', 'CTRL-INC-02']
              }
            ]
          }
        ]
      },

      // 3. DPDP Act 2023 (Digital Personal Data Protection Act - India)
      {
        id: 'fw-dpdp-2023',
        code: 'DPDP_ACT_2023',
        name: 'Digital Personal Data Protection Act, 2023',
        version: 'August 2023',
        authority: 'Ministry of Electronics and Information Technology (MeitY / DPBI)',
        category: 'PRIVACY',
        description: 'Statutory personal data protection framework governing Data Fiduciaries, Data Principals, and Significant Data Fiduciaries.',
        totalRequirementsCount: 44,
        activeVersion: true,
        sections: [
          {
            id: 'sec-dpdp-consent',
            code: 'Sec 6 & 7',
            title: 'Consent Architecture & Notice Requirements',
            requirements: [
              {
                id: 'req-dpdp-sec6',
                frameworkId: 'fw-dpdp-2023',
                frameworkCode: 'DPDP_ACT_2023',
                code: 'DPDP-SEC-6',
                title: 'Notice & Itemized Granular Consent',
                statement: 'Data Fiduciary must provide notice in clear and plain language in English or any 22 Eighth Schedule Indian languages detailing processing purposes and grievance redressal.',
                auditGuidance: 'Review multilingual consent banner, Consent Manager API integration, and withdrawal mechanisms.',
                evidenceRequirements: ['Multilingual Privacy Notice', 'Consent Management Architecture Spec', 'Withdrawal Telemetry Logs'],
                mandatory: true,
                mappedControlIds: ['CTRL-PRV-01', 'CTRL-PRV-02']
              }
            ]
          },
          {
            id: 'sec-dpdp-sec8',
            code: 'Sec 8',
            title: 'General Obligations of Data Fiduciaries',
            requirements: [
              {
                id: 'req-dpdp-sec8-4',
                frameworkId: 'fw-dpdp-2023',
                frameworkCode: 'DPDP_ACT_2023',
                code: 'DPDP-SEC-8.4',
                title: 'Technical & Organizational Security Safeguards',
                statement: 'A Data Fiduciary shall implement appropriate technical and organizational measures to ensure effective adherence to the provisions of this Act and prevent personal data breaches.',
                auditGuidance: 'Inspect encryption at rest/transit, role-based PII masking, and data retention automated purge jobs.',
                evidenceRequirements: ['PII Encryption Architecture', 'Database Data Masking Policies', 'Automated Purge Cron Verification'],
                mandatory: true,
                mappedControlIds: ['CTRL-CRY-01', 'CTRL-DLP-01', 'CTRL-PRV-03']
              }
            ]
          }
        ]
      },

      // 4. ISO/IEC 42001:2023 (AI Management System)
      {
        id: 'fw-iso-42001-2023',
        code: 'ISO_42001_2023',
        name: 'ISO/IEC 42001:2023 Artificial Intelligence Management System (AIMS)',
        version: '2023',
        authority: 'ISO / IEC JTC 1/SC 42',
        category: 'AI_GOVERNANCE',
        description: 'Standard for establishing, implementing, maintaining, and continually improving an Artificial Intelligence Management System within organizations.',
        totalRequirementsCount: 38,
        activeVersion: true,
        sections: [
          {
            id: 'sec-iso42001-b',
            code: 'Annex B',
            title: 'AI Control Objectives & Controls',
            requirements: [
              {
                id: 'req-iso42001-b5',
                frameworkId: 'fw-iso-42001-2023',
                frameworkCode: 'ISO_42001_2023',
                code: 'ISO-42001-B.5.2',
                title: 'AI System Impact & Fairness Assessment',
                statement: 'The organization shall assess and document the potential societal, ethical, and individual impacts of the AI system, including algorithmic bias, toxicity, and hallucinations.',
                auditGuidance: 'Examine red-teaming reports, LLM prompt guardrails, and automated evaluation benchmark datasets.',
                evidenceRequirements: ['AI System Impact Assessment (AIA)', 'LLM Red Teaming Report', 'Model Bias & Fairness Evaluation'],
                mandatory: true,
                mappedControlIds: ['CTRL-AI-01', 'CTRL-AI-02']
              },
              {
                id: 'req-iso42001-b7',
                frameworkId: 'fw-iso-42001-2023',
                frameworkCode: 'ISO_42001_2023',
                code: 'ISO-42001-B.7.1',
                title: 'Data Quality for AI Model Training & Inference',
                statement: 'Organizations shall ensure training, validation, and testing datasets for AI systems are transparent, provenance-tracked, and sanitized of unauthorized PII.',
                auditGuidance: 'Inspect training data provenance catalogs, synthetic data generation pipelines, and copyright scrubbing logs.',
                evidenceRequirements: ['Training Dataset Provenance Register', 'PII Scrubbing Pipeline Audit', 'Model Card Documentation'],
                mandatory: true,
                mappedControlIds: ['CTRL-AI-02', 'CTRL-PRV-03']
              }
            ]
          }
        ]
      },

      // 5. SOC 2 Type II (Trust Services Criteria)
      {
        id: 'fw-soc2-type2',
        code: 'SOC_2_TYPE_2',
        name: 'AICPA SOC 2 Type II (Security, Availability, Confidentiality)',
        version: '2022-Trust-Criteria',
        authority: 'AICPA',
        category: 'CYBERSECURITY',
        description: 'Attestation standard covering Security, Availability, Processing Integrity, Confidentiality, and Privacy over a multi-month testing period.',
        totalRequirementsCount: 64,
        activeVersion: true,
        sections: [
          {
            id: 'sec-soc2-cc6',
            code: 'CC6',
            title: 'Logical and Physical Access Controls',
            requirements: [
              {
                id: 'req-soc2-cc6-1',
                frameworkId: 'fw-soc2-type2',
                frameworkCode: 'SOC_2_TYPE_2',
                code: 'SOC2-CC6.1',
                title: 'Logical Access Security Infrastructure',
                statement: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets.',
                auditGuidance: 'Sample 25 new hires and 25 departures for access grant/revocation within SLA.',
                evidenceRequirements: ['SSO & MFA Enforced Directory Screenshot', 'Quarterly Access Review Workpapers', 'Automated Offboarding Ticket Logs'],
                mandatory: true,
                mappedControlIds: ['CTRL-IAM-01', 'CTRL-IAM-02']
              }
            ]
          },
          {
            id: 'sec-soc2-cc7',
            code: 'CC7',
            title: 'System Operations & Vulnerability Detection',
            requirements: [
              {
                id: 'req-soc2-cc7-1',
                frameworkId: 'fw-soc2-type2',
                frameworkCode: 'SOC_2_TYPE_2',
                code: 'SOC2-CC7.1',
                title: 'Vulnerability Detection and Penetration Testing',
                statement: 'To meet its objectives, the entity uses detection and monitoring procedures to identify changes to configurations and unauthorized activities.',
                auditGuidance: 'Review annual external network/application penetration tests and automated container vulnerability scans.',
                evidenceRequirements: ['Annual Third-Party Penetration Test Report', 'Weekly Automated CVE Scan Reports', 'Patch Management SLA Report'],
                mandatory: true,
                mappedControlIds: ['CTRL-VULN-01', 'CTRL-INF-01']
              }
            ]
          }
        ]
      },

      // 6. NIST Cybersecurity Framework 2.0
      {
        id: 'fw-nist-csf-2-0',
        code: 'NIST_CSF_2_0',
        name: 'NIST Cybersecurity Framework 2.0 (CSF 2.0)',
        version: '2.0 (2024)',
        authority: 'National Institute of Standards and Technology (NIST)',
        category: 'CYBERSECURITY',
        description: 'Comprehensive risk-based guidance organized under 6 core functions: GOVERN (GV), IDENTIFY (ID), PROTECT (PR), DETECT (DE), RESPOND (RS), RECOVER (RC).',
        totalRequirementsCount: 106,
        activeVersion: true,
        sections: [
          {
            id: 'sec-nist-gv',
            code: 'GOVERN (GV)',
            title: 'Cybersecurity Governance & Supply Chain Risk',
            requirements: [
              {
                id: 'req-nist-gv-sc',
                frameworkId: 'fw-nist-csf-2-0',
                frameworkCode: 'NIST_CSF_2_0',
                code: 'NIST-GV.SC-01',
                title: 'Cybersecurity Supply Chain Risk Management Program',
                statement: 'A cybersecurity supply chain risk management program, strategy, objectives, policies, and roles are established and communicated throughout the organization.',
                auditGuidance: 'Evaluate vendor risk tiering criteria, security questionnaires, and continuous vendor risk monitoring telemetry.',
                evidenceRequirements: ['Third-Party Risk Management Policy', 'Tier 1 Vendor Due Diligence Dossiers', 'Vendor Contract Security Addenda'],
                mandatory: true,
                mappedControlIds: ['CTRL-TPRM-01', 'CTRL-GOV-01']
              }
            ]
          },
          {
            id: 'sec-nist-pr',
            code: 'PROTECT (PR)',
            title: 'Identity Management, Authentication & Access Control',
            requirements: [
              {
                id: 'req-nist-pr-aa',
                frameworkId: 'fw-nist-csf-2-0',
                frameworkCode: 'NIST_CSF_2_0',
                code: 'NIST-PR.AA-01',
                title: 'Identities and Credentials Management',
                statement: 'Identities and credentials for authorized users, services, and hardware are managed by the organization.',
                auditGuidance: 'Inspect IdP configurations, hardware security key enforcement for privileged users, and automated service account rotation.',
                evidenceRequirements: ['FIDO2/WebAuthn MFA Enforcement Config', 'Privileged Access Management (PAM) Vault Logs', 'Service Account Key Rotation Policy'],
                mandatory: true,
                mappedControlIds: ['CTRL-IAM-01', 'CTRL-IAM-02']
              }
            ]
          }
        ]
      },

      // 7. PCI DSS v4.0
      {
        id: 'fw-pci-dss-v4',
        code: 'PCI_DSS_V4_0',
        name: 'Payment Card Industry Data Security Standard (PCI DSS) v4.0',
        version: '4.0.1 (2024)',
        authority: 'PCI Security Standards Council',
        category: 'REGULATORY_FINTECH',
        description: 'Global standard for organizations that store, process, or transmit cardholder data (CHD) or sensitive authentication data (SAD).',
        totalRequirementsCount: 78,
        activeVersion: true,
        sections: [
          {
            id: 'sec-pci-req3',
            code: 'Requirement 3',
            title: 'Protect Stored Account Data',
            requirements: [
              {
                id: 'req-pci-3-5',
                frameworkId: 'fw-pci-dss-v4',
                frameworkCode: 'PCI_DSS_V4_0',
                code: 'PCI-DSS-3.5',
                title: 'Primary Account Number (PAN) Cryptographic Protection',
                statement: 'PAN is rendered unreadable anywhere it is stored using strong cryptography (AES-256 or tokenization).',
                auditGuidance: 'Inspect cryptographic key management architecture, tokenization vault architecture, and database field-level encryption.',
                evidenceRequirements: ['Cardholder Data Flow Diagram', 'Tokenization Engine Architecture Specification', 'HSM Cryptographic Key Custody Logs'],
                mandatory: true,
                mappedControlIds: ['CTRL-CRY-01', 'CTRL-DLP-01']
              }
            ]
          }
        ]
      },

      // 8. ISO 22301:2019 (Business Continuity Management)
      {
        id: 'fw-iso-22301-2019',
        code: 'ISO_22301_2019',
        name: 'ISO 22301:2019 Security and Resilience — Business Continuity Management',
        version: '2019',
        authority: 'ISO',
        category: 'RESILIENCE',
        description: 'Requirements to plan, establish, implement, operate, monitor, review, maintain and continually improve a documented management system to protect against disruptive incidents.',
        totalRequirementsCount: 32,
        activeVersion: true,
        sections: [
          {
            id: 'sec-iso22301-8',
            code: 'Clause 8.2',
            title: 'Business Impact Analysis (BIA) and Risk Assessment',
            requirements: [
              {
                id: 'req-iso22301-8-2-2',
                frameworkId: 'fw-iso-22301-2019',
                frameworkCode: 'ISO_22301_2019',
                code: 'ISO-22301-8.2.2',
                title: 'Business Impact Analysis (BIA)',
                statement: 'The organization shall establish and maintain a formal BIA process to identify prioritized activities and establish Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO).',
                auditGuidance: 'Review annual BIA reports, maximum tolerable period of disruption (MTPD) calculations, and multi-region failover drill results.',
                evidenceRequirements: ['Annual Enterprise BIA Report', 'RTO/RPO SLA Matrix', 'Annual Multi-Region Disaster Recovery Simulation Results'],
                mandatory: true,
                mappedControlIds: ['CTRL-BCP-01', 'CTRL-BCP-02']
              }
            ]
          }
        ]
      }
    ];

    frameworksList.forEach(fw => this.frameworks.set(fw.code, fw));
  }

  public static getAllFrameworks(): GrcFramework[] {
    return Array.from(this.frameworks.values());
  }

  public static getFrameworkByCode(code: string): GrcFramework | undefined {
    return this.frameworks.get(code);
  }

  public static getRequirementsForFramework(code: string) {
    const fw = this.frameworks.get(code);
    if (!fw) return [];
    return fw.sections.flatMap(sec => sec.requirements);
  }
}
