import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Search,
  Download,
  Share2,
  Sparkles,
  Zap,
  Info,
  ExternalLink,
  Filter,
  Check,
  Copy,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  CalendarDays,
  FileCheck,
  Eye,
  RefreshCw,
  Flame,
  Award,
  CreditCard,
  Tag,
  HelpCircle,
  Activity,
  FileText,
  X,
  Lock,
  Server,
  AlertTriangle,
  BadgeAlert,
  Clock,
  Briefcase
} from 'lucide-react';
import { ControlItem } from '../../types';
import { RegulatoryRequirement, CrossFrameworkMappingRule } from '../../types/regulatoryTypes';

export interface TriHarmonizedControl {
  id: string;
  domainCategory: 'GOVERNANCE' | 'ACCESS_IDENTITY' | 'CRYPTOGRAPHY_DATA' | 'INCIDENT_RESILIENCE' | 'SDLC_SECURITY' | 'VENDOR_CLOUD' | 'VULNERABILITY_AUDIT' | 'NETWORK_INFRA';
  domainLabel: string;
  
  // 1. Internal Control
  internalControlCode: string;
  internalControlTitle: string;
  internalCategory: 'Organizational' | 'People' | 'Physical' | 'Technological';
  internalDepartment: string;
  internalMaturity: number; // 1-5
  internalStatus: 'Implemented' | 'In Progress' | 'Planned' | 'Monitored';
  internalEvidenceCount: number;
  internalAcceptanceCriteria: string;
  
  // 2. ISO/IEC 27001:2022 Clause / Control
  isoClauseOrControlCode: string;
  isoTitle: string;
  isoTheme: 'Clause 5 (Leadership)' | 'Clause 6 (Risk Planning)' | 'Clause 9 (Evaluation)' | 'Clause 10 (Improvement)' | 'A.5 (Organizational)' | 'A.6 (People)' | 'A.7 (Physical)' | 'A.8 (Technological)';
  isoRequirementStatement: string;
  isoAuditExpectation: string;
  
  // 3. MAS TRM 2021 Requirement
  masRequirementCode: string;
  masTitle: string;
  masDomainNumber: string;
  masDomainName: string;
  masStatement: string;
  masIntentAndGuidance: string;
  masMandatoryForFIs: boolean;
  masCriticalSystemsMandate: boolean;
  masSlaRequirement?: string;
  masTestProcedure: string;
  
  // Harmonization Synergy
  mappingType: 'EXACT_EQUIVALENT' | 'SUPERSET' | 'SUBSET' | 'RELATED_OVERLAP';
  confidenceScore: number;
  evidenceReusability: 'DIRECT_REUSE' | 'REQUIRES_ADDITIONAL_METRIC' | 'PARTIAL_SUPPORT';
  synergyGuidance: string;
  sharedEvidenceArtefacts: string[];
}

export const TRI_HARMONIZED_DATASET: TriHarmonizedControl[] = [
  {
    id: 'TRI-001',
    domainCategory: 'GOVERNANCE',
    domainLabel: 'Executive Governance & Roles',
    internalControlCode: 'A.5.1 / A.5.2',
    internalControlTitle: 'Information Security Policies & Organizational Roles',
    internalCategory: 'Organizational',
    internalDepartment: 'Information Security & Compliance',
    internalMaturity: 4,
    internalStatus: 'Implemented',
    internalEvidenceCount: 4,
    internalAcceptanceCriteria: 'Board-approved ISMS Policy v2.1 with recorded employee acknowledgment > 95% and signed CISO Charter.',
    isoClauseOrControlCode: 'ISO 27001 Clause 5.1 / 5.2 / A.5.1 / A.5.2',
    isoTitle: 'Leadership commitment, Information security policy, Roles & responsibilities',
    isoTheme: 'Clause 5 (Leadership)',
    isoRequirementStatement: 'Top management shall demonstrate leadership and commitment, establish security policy, and ensure responsibilities and authorities are assigned.',
    isoAuditExpectation: 'Inspect board meeting minutes approving the ISMS policy, organogram with clear reporting lines to CEO/Board, and annual policy review records.',
    masRequirementCode: 'MAS-TRM-3.1',
    masTitle: 'Board & Senior Management Technology Risk Governance',
    masDomainNumber: '3.0',
    masDomainName: 'Board & Senior Management Oversight',
    masStatement: 'The Board of Directors and Senior Management are responsible for establishing a sound technology risk management strategy, risk appetite framework, and appointing dedicated CISO leadership.',
    masIntentAndGuidance: 'The Board shall maintain oversight of technology risk profiles, approve TRM framework annually, and ensure adequate budget and resource allocation for cyber defense.',
    masMandatoryForFIs: true,
    masCriticalSystemsMandate: false,
    masSlaRequirement: 'Annual Board Approval & Quarterly TRM Dashboard',
    masTestProcedure: 'Review Board Technology Committee minutes, CISO reporting line, and technology risk appetite statement approved within last 12 months.',
    mappingType: 'EXACT_EQUIVALENT',
    confidenceScore: 98,
    evidenceReusability: 'DIRECT_REUSE',
    synergyGuidance: 'Single Evidence Artifact: Board-signed ISMS & Technology Risk Governance Charter satisfies both ISO 27001 Clause 5.1/5.2 and MAS TRM Section 3.1 simultaneously.',
    sharedEvidenceArtefacts: [
      'Approved Enterprise Information Security & TRM Governance Policy v2.1',
      'Board Technology Risk Committee Quarterly Minutes',
      'CISO Charter & RACI Matrix'
    ]
  },
  {
    id: 'TRI-002',
    domainCategory: 'ACCESS_IDENTITY',
    domainLabel: 'Access Control & Authentication',
    internalControlCode: 'A.5.15 / A.8.2',
    internalControlTitle: 'Access Control & Privileged Access Rights Management',
    internalCategory: 'Technological',
    internalDepartment: 'Information Technology (IT)',
    internalMaturity: 4,
    internalStatus: 'Implemented',
    internalEvidenceCount: 5,
    internalAcceptanceCriteria: 'Mandatory phishing-resistant MFA on all administrative portals, automated quarterly access reviews, and zero standing admin accounts.',
    isoClauseOrControlCode: 'Annex A A.5.15 & A.8.2',
    isoTitle: 'Access control & Privileged access rights',
    isoTheme: 'A.8 (Technological)',
    isoRequirementStatement: 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and security requirements.',
    isoAuditExpectation: 'Verify access provisioning workflows, RBAC matrix, multi-factor authentication enforcement, and quarterly manager access recertification logs.',
    masRequirementCode: 'MAS-TRM-8.1',
    masTitle: 'User Access Management, MFA & Privileged Access Controls',
    masDomainNumber: '8.0',
    masDomainName: 'Access Control & Identity Governance',
    masStatement: 'The FI shall implement multi-factor authentication (MFA) for all administrative access and remote access to corporate networks, enforce principle of least privilege, and perform quarterly user access reviews.',
    masIntentAndGuidance: 'Privileged user accounts must have dedicated administrator IDs, session logging, and time-bound checkout via a Privileged Access Management (PAM) solution.',
    masMandatoryForFIs: true,
    masCriticalSystemsMandate: true,
    masSlaRequirement: 'MFA 100% Enforced; Quarterly Access Recertification',
    masTestProcedure: 'Sample 25 privileged access accounts across AWS/Azure and banking cores. Verify MFA is active and audit trail captures all privileged command executions.',
    mappingType: 'EXACT_EQUIVALENT',
    confidenceScore: 96,
    evidenceReusability: 'DIRECT_REUSE',
    synergyGuidance: 'Direct Reuse: Okta/Azure AD MFA enforcement policies, PAM session recordings, and quarterly access review sign-off sheets satisfy both frameworks.',
    sharedEvidenceArtefacts: [
      'Okta / Azure AD Multi-Factor Authentication (MFA) Global Enforcement Policy',
      'Quarterly Privileged User Access Recertification Sign-off Sheet',
      'CyberArk / Teleport Privileged Access Management (PAM) Audit Logs'
    ]
  },
  {
    id: 'TRI-003',
    domainCategory: 'CRYPTOGRAPHY_DATA',
    domainLabel: 'Cryptography & Data Protection',
    internalControlCode: 'A.8.24 / A.8.12',
    internalControlTitle: 'Use of Cryptography & Data Leakage Prevention (DLP)',
    internalCategory: 'Technological',
    internalDepartment: 'Software Engineering & DevOps',
    internalMaturity: 4,
    internalStatus: 'Implemented',
    internalEvidenceCount: 3,
    internalAcceptanceCriteria: 'AES-256 for data at rest, TLS 1.3 for data in transit, automated annual KMS key rotation, and database-level field encryption.',
    isoClauseOrControlCode: 'Annex A A.8.24 & A.8.12',
    isoTitle: 'Use of cryptography & Data leakage prevention',
    isoTheme: 'A.8 (Technological)',
    isoRequirementStatement: 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented. Data leakage prevention measures shall be applied.',
    isoAuditExpectation: 'Inspect cryptographic key lifecycle policy, key generation/storage mechanisms (HSM/KMS), TLS cipher suites, and DLP agent coverage on endpoints.',
    masRequirementCode: 'MAS-TRM-9.1',
    masTitle: 'Cryptographic Controls, Key Management & Algorithm Baselines',
    masDomainNumber: '9.0',
    masDomainName: 'Cryptography & Key Management',
    masStatement: 'The FI shall establish cryptographic policies specifying approved strong encryption algorithms (AES-256, RSA-3072+), protect cryptographic keys throughout their lifecycle using HSMs or secure key vaults, and maintain key rotation schedules.',
    masIntentAndGuidance: 'Customer sensitive data, PINs, and financial transactions must be encrypted end-to-end. Deprecated ciphers (SSLv3, TLS 1.0/1.1, 3DES, SHA-1) must be strictly disabled.',
    masMandatoryForFIs: true,
    masCriticalSystemsMandate: true,
    masSlaRequirement: 'Minimum AES-256 / RSA-3072; Annual KMS Rotation',
    masTestProcedure: 'Inspect cloud KMS configuration, TLS 1.3 SSL Labs ratings (A+), and verify HSM FIPS 140-2 Level 3 certification for payment keys.',
    mappingType: 'EXACT_EQUIVALENT',
    confidenceScore: 95,
    evidenceReusability: 'DIRECT_REUSE',
    synergyGuidance: 'Unified Cryptographic Policy & AWS KMS Key Rotation Logs satisfy both ISO A.8.24 and MAS TRM 9.1 in a single audit review.',
    sharedEvidenceArtefacts: [
      'Enterprise Cryptographic Standards & Key Management Lifecycle Policy v3.0',
      'AWS KMS / HashiCorp Vault Automated Key Rotation Configuration & Proofs',
      'Qualys SSL Labs TLS 1.3 Server Configuration & A+ Cipher Suite Certificates'
    ]
  },
  {
    id: 'TRI-004',
    domainCategory: 'INCIDENT_RESILIENCE',
    domainLabel: 'Incident Response & Regulatory Notification',
    internalControlCode: 'A.5.24 / A.5.25',
    internalControlTitle: 'Information Security Incident Management & Reporting',
    internalCategory: 'Organizational',
    internalDepartment: 'Information Security & Compliance',
    internalMaturity: 4,
    internalStatus: 'Implemented',
    internalEvidenceCount: 5,
    internalAcceptanceCriteria: 'Documented 1-hour MAS notification SLA for Critical Information Systems, 15-minute MTTA on P1 security events, and annual cyber tabletop drill.',
    isoClauseOrControlCode: 'Annex A A.5.24 & A.5.25',
    isoTitle: 'Incident management planning & Assessment of events',
    isoTheme: 'A.5 (Organizational)',
    isoRequirementStatement: 'The organisation shall plan and prepare for managing security incidents by defining processes, roles, escalation paths, and reporting mechanisms.',
    isoAuditExpectation: 'Review Incident Response Plan, incident categorization matrix, historical incident records, and evidence of annual tabletop simulations.',
    masRequirementCode: 'MAS-TRM-14.1',
    masTitle: 'Cyber Incident Management, Response & 1-Hour MAS Notification SLA',
    masDomainNumber: '14.0',
    masDomainName: 'Incident Management & MAS Notification',
    masStatement: 'The FI shall establish an incident management framework and notify MAS as soon as possible, but not later than 1 hour, upon discovering any critical system disruption or major cyber attack. Submit a written post-incident report within 14 days.',
    masIntentAndGuidance: 'Pre-approved regulatory notification templates and 24/7 on-call rosters must be maintained. Thresholds for regulatory escalation must be embedded in SOC runbooks.',
    masMandatoryForFIs: true,
    masCriticalSystemsMandate: true,
    masSlaRequirement: '1-Hour Discovery-to-Notification; 14-Day Post-Incident Root Cause Analysis',
    masTestProcedure: 'Review Cyber Incident Response Plan for explicit 1-Hour MAS notice SLA. Review simulation drill post-mortem demonstrating rapid regulatory escalation.',
    mappingType: 'SUPERSET',
    confidenceScore: 94,
    evidenceReusability: 'REQUIRES_ADDITIONAL_METRIC',
    synergyGuidance: 'High Synergy with Specific SLA: The core Incident Plan satisfies ISO 27001, but MAS requires testing the specific 1-hour regulator dispatch protocol and 14-day RCA deadline.',
    sharedEvidenceArtefacts: [
      'Cyber Incident Management & Regulatory Notification Plan v3.2',
      'Annual Cyber Tabletop Exercise Simulation Report & Timestamps',
      'Standardized MAS Incident Notification Template & Regulatory Liaison Directory'
    ]
  },
  {
    id: 'TRI-005',
    domainCategory: 'INCIDENT_RESILIENCE',
    domainLabel: 'Business Continuity & Disaster Recovery',
    internalControlCode: 'A.5.29 / A.5.30',
    internalControlTitle: 'ICT Readiness for Business Continuity & Redundancy',
    internalCategory: 'Organizational',
    internalDepartment: 'Operations & Business Continuity',
    internalMaturity: 4,
    internalStatus: 'Implemented',
    internalEvidenceCount: 4,
    internalAcceptanceCriteria: 'Demonstrated RTO <= 4 hours, RPO <= 1 hour in live simulated failover drill, multi-AZ database replication, and zero data loss on primary failure.',
    isoClauseOrControlCode: 'Annex A A.5.29 & A.5.30',
    isoTitle: 'Information security during disruption & ICT readiness for business continuity',
    isoTheme: 'A.5 (Organizational)',
    isoRequirementStatement: 'The organisation shall plan, implement, maintain and test ICT readiness based on business continuity objectives and ICT continuity requirements.',
    isoAuditExpectation: 'Examine Business Continuity Plan (BCP), Business Impact Analysis (BIA), disaster recovery test reports, and target RTO/RPO metrics.',
    masRequirementCode: 'MAS-TRM-15.1',
    masTitle: 'Critical System Availability Standards (RTO <= 4h, RPO <= 1h, Max Downtime <= 4h/yr)',
    masDomainNumber: '15.0',
    masDomainName: 'Business Continuity & Operational Resilience',
    masStatement: 'The FI shall design and operate critical financial systems to achieve a Recovery Time Objective (RTO) of not more than 4 hours, a Recovery Point Objective (RPO) of not more than 1 hour, and cumulative unscheduled downtime not exceeding 4 hours in any 12-month period.',
    masIntentAndGuidance: 'High-availability multi-zone or active-active cloud architectures must be deployed for core ledger, payments, and trade matching engines. Disaster recovery switchover tests must be executed at least annually.',
    masMandatoryForFIs: true,
    masCriticalSystemsMandate: true,
    masSlaRequirement: 'RTO <= 4 Hours, RPO <= 1 Hour, Cumulative Unscheduled Downtime <= 4 Hours/Year',
    masTestProcedure: 'Inspect annual DR failover execution report. Verify measured RTO and RPO metrics met MAS statutory thresholds (e.g. Measured RTO: 42 mins, RPO: 4 mins).',
    mappingType: 'SUPERSET',
    confidenceScore: 96,
    evidenceReusability: 'DIRECT_REUSE',
    synergyGuidance: 'Single DR Test Execution Report with measured RTO/RPO metrics completely satisfies both ISO A.5.29 and MAS TRM 15.1.',
    sharedEvidenceArtefacts: [
      'Disaster Recovery Architecture Blueprint & Multi-AZ Infrastructure Spec',
      'Annual DR Failover Execution Test Results (Measured RTO: 42 mins, RPO: 4 mins)',
      '12-Month Critical System High Availability Uptime & Downtime Ledger'
    ]
  },
  {
    id: 'TRI-006',
    domainCategory: 'SDLC_SECURITY',
    domainLabel: 'Software Development Life Cycle & DevSecOps',
    internalControlCode: 'A.8.25 / A.8.28',
    internalControlTitle: 'Secure Development Life Cycle, SAST/DAST & Secure Coding',
    internalCategory: 'Technological',
    internalDepartment: 'Software Engineering & DevOps',
    internalMaturity: 4,
    internalStatus: 'Implemented',
    internalEvidenceCount: 4,
    internalAcceptanceCriteria: 'Automated CI/CD security quality gates blocking High/Critical vulnerabilities, OWASP Top 10 compliance, and mandatory peer review before merge.',
    isoClauseOrControlCode: 'Annex A A.8.25 & A.8.28',
    isoTitle: 'Secure development life cycle & Coding standards',
    isoTheme: 'A.8 (Technological)',
    isoRequirementStatement: 'Rules for the secure development of software and systems shall be established and applied. Secure coding principles shall be applied to software development.',
    isoAuditExpectation: 'Inspect CI/CD pipeline configuration (GitHub Actions / GitLab CI), branch protection rules, automated SAST/SCA scan policies, and developer training logs.',
    masRequirementCode: 'MAS-TRM-6.1',
    masTitle: 'Secure SDLC, SAST/DAST Code Review & Threat Modeling',
    masDomainNumber: '6.0',
    masDomainName: 'IT Project Management & Software Security',
    masStatement: 'The FI shall establish secure SDLC processes incorporating security requirement specifications, architectural threat modeling, automated source code review (SAST), dynamic application security testing (DAST), and segregation of dev/prod environments.',
    masIntentAndGuidance: 'Source code reviews must be conducted prior to production release. Open-source libraries must be vetted against known CVE databases (Snyk/Dependabot).',
    masMandatoryForFIs: true,
    masCriticalSystemsMandate: true,
    masSlaRequirement: 'Zero Critical / High SAST Vulnerabilities in Production Releases',
    masTestProcedure: 'Review SonarQube / Snyk CI/CD pipeline blocking gates, sample 10 pull requests verifying peer review and automated scan pass certificates.',
    mappingType: 'EXACT_EQUIVALENT',
    confidenceScore: 95,
    evidenceReusability: 'DIRECT_REUSE',
    synergyGuidance: 'CI/CD pipeline security configuration and Snyk/SonarQube scan ledgers satisfy both ISO A.8.25 and MAS TRM 6.1.',
    sharedEvidenceArtefacts: [
      'Secure SDLC Policy & DevSecOps Pipeline Architecture v2.4',
      'SonarQube & Snyk Automated CI/CD Gate Enforcement Configurations',
      'Sample Threat Modeling Artifact & Pull Request Peer Review Sign-offs'
    ]
  },
  {
    id: 'TRI-007',
    domainCategory: 'VENDOR_CLOUD',
    domainLabel: 'Third-Party & Cloud Outsourcing Risk',
    internalControlCode: 'A.5.19 / A.5.23',
    internalControlTitle: 'Supplier Security & Information Security in Cloud Services',
    internalCategory: 'Organizational',
    internalDepartment: 'Procurement & Vendor Management',
    internalMaturity: 3,
    internalStatus: 'Implemented',
    internalEvidenceCount: 3,
    internalAcceptanceCriteria: 'Comprehensive vendor risk register, right-to-audit clauses in all cloud agreements, and annual review of SOC 2 Type II reports for Tier 1 vendors.',
    isoClauseOrControlCode: 'Annex A A.5.19 & A.5.23',
    isoTitle: 'Information security in supplier relationships & Cloud services security',
    isoTheme: 'A.5 (Organizational)',
    isoRequirementStatement: 'Processes shall be defined to manage security risks associated with suppliers and cloud service acquisition, usage, management, and exit strategies.',
    isoAuditExpectation: 'Inspect third-party risk assessment methodology, supplier inventory with tiering, standard security schedule in contracts, and cloud shared responsibility matrices.',
    masRequirementCode: 'MAS-TRM-7.1',
    masTitle: 'Third-Party Technology Vendor Risk, Cloud Governance & Right-to-Audit',
    masDomainNumber: '7.0',
    masDomainName: 'Service Provider & Third Party Management',
    masStatement: 'The FI shall perform rigorous due diligence on third-party technology providers and cloud services, include contractual terms for right-to-audit and prompt incident notification, and monitor vendor performance.',
    masIntentAndGuidance: 'Financial institutions must comply with MAS Guidelines on Outsourcing, maintain an updated Outsourcing Register, and assess cloud multi-tenancy and data sovereignty risks.',
    masMandatoryForFIs: true,
    masCriticalSystemsMandate: true,
    masSlaRequirement: 'Annual Vendor Assessment; Material Outsourcing Register',
    masTestProcedure: 'Inspect Material Outsourcing Register submitted to MAS, review sample vendor contracts for explicit MAS right-to-audit clauses.',
    mappingType: 'EXACT_EQUIVALENT',
    confidenceScore: 94,
    evidenceReusability: 'DIRECT_REUSE',
    synergyGuidance: 'Third-Party Risk Assessment Reports & Cloud SLA Contracts satisfy both ISO A.5.19 and MAS TRM 7.1.',
    sharedEvidenceArtefacts: [
      'Third-Party & Cloud Vendor Risk Management Policy v2.0',
      'MAS Material Outsourcing Register & Cloud Service Provider Inventory',
      'Tier 1 Vendor SOC 2 Type II Review Memo & Standard DPA Addenda'
    ]
  },
  {
    id: 'TRI-008',
    domainCategory: 'VULNERABILITY_AUDIT',
    domainLabel: 'Vulnerability Management & Independent Testing',
    internalControlCode: 'A.8.8 / A.9.2',
    internalControlTitle: 'Management of Technical Vulnerabilities & Internal Audit',
    internalCategory: 'Technological',
    internalDepartment: 'Information Security & Compliance',
    internalMaturity: 4,
    internalStatus: 'Implemented',
    internalEvidenceCount: 4,
    internalAcceptanceCriteria: 'CREST-accredited annual penetration test, weekly automated vulnerability scanning, and Critical vulnerability remediation SLA <= 48 hours.',
    isoClauseOrControlCode: 'Annex A A.8.8 & ISO 27001 Clause 9.2',
    isoTitle: 'Management of technical vulnerabilities & Internal audit',
    isoTheme: 'A.8 (Technological)',
    isoRequirementStatement: 'Information about technical vulnerabilities of information systems in use shall be obtained, exposure evaluated, and appropriate measures taken.',
    isoAuditExpectation: 'Inspect vulnerability scanning schedules, penetration test executive summaries, remediation tracking ledgers, and annual internal audit plan.',
    masRequirementCode: 'MAS-TRM-17.1',
    masTitle: 'Annual Independent Technology Audit & Penetration Testing (VA/PT)',
    masDomainNumber: '17.0',
    masDomainName: 'Technology Audit, Independent Review & Assurance',
    masStatement: 'The FI shall engage an independent, qualified external auditor to conduct an annual Technology Risk audit, and conduct annual penetration testing and vulnerability assessments (VA/PT) across all internal and external-facing critical systems.',
    masIntentAndGuidance: 'Penetration testing must cover network infrastructure, web applications, mobile apps, and APIs. Adversarial attack simulations (Red Teaming) should be conducted for complex financial institutions.',
    masMandatoryForFIs: true,
    masCriticalSystemsMandate: true,
    masSlaRequirement: 'Annual CREST VA/PT; 48-Hour Patching SLA for Critical CVEs',
    masTestProcedure: 'Review the latest Independent Technology Audit Report issued by certified auditor (CISA / CISSP) and CREST-certified VA/PT reports.',
    mappingType: 'EXACT_EQUIVALENT',
    confidenceScore: 97,
    evidenceReusability: 'DIRECT_REUSE',
    synergyGuidance: 'Annual CREST Penetration Testing Report and internal audit working papers satisfy both ISO A.8.8/Clause 9.2 and MAS TRM 17.1.',
    sharedEvidenceArtefacts: [
      'Annual CREST-Certified Penetration Testing & Vulnerability Assessment Report',
      'Vulnerability Management Policy with SLA Patching Targets',
      'Quarterly Internal Audit Working Papers & CAPA Remediation Ledger'
    ]
  },
  {
    id: 'TRI-009',
    domainCategory: 'NETWORK_INFRA',
    domainLabel: 'Network Security & Microsegmentation',
    internalControlCode: 'A.8.20 / A.8.21',
    internalControlTitle: 'Network Security, Segmentation & Security of Network Services',
    internalCategory: 'Technological',
    internalDepartment: 'Software Engineering & DevOps',
    internalMaturity: 4,
    internalStatus: 'Implemented',
    internalEvidenceCount: 3,
    internalAcceptanceCriteria: 'Strict VPC microsegmentation isolating database subnets, WAF in blocking mode, DDoS mitigation on all public gateways, and zero direct internet access to DB tiers.',
    isoClauseOrControlCode: 'Annex A A.8.20 & A.8.21',
    isoTitle: 'Network security & Security of network services',
    isoTheme: 'A.8 (Technological)',
    isoRequirementStatement: 'Networks and network devices shall be secured, managed and controlled to protect information in systems and applications. Network services shall be identified and monitored.',
    isoAuditExpectation: 'Examine network architecture diagrams, firewall rule change approval workflows, DMZ configurations, and AWS Security Group rules.',
    masRequirementCode: 'MAS-TRM-11.1',
    masTitle: 'Network Security, Perimeter Defense, Microsegmentation & Firewalls',
    masDomainNumber: '11.0',
    masDomainName: 'Network Security & Perimeter Defense',
    masStatement: 'The FI shall implement multi-layered network defenses including next-generation firewalls (NGFW), network segmentation, Web Application Firewalls (WAF), and intrusion detection/prevention systems (IDS/IPS) to isolate critical zones.',
    masIntentAndGuidance: 'Wireless networks and remote connections must be strongly authenticated. Database tiers containing financial records must reside in isolated private subnets.',
    masMandatoryForFIs: true,
    masCriticalSystemsMandate: true,
    masSlaRequirement: 'Strict Network Isolation of Critical Banking Data & Semi-Annual Rule Review',
    masTestProcedure: 'Review AWS Security Group and VPC route tables. Confirm database subnets have no internet gateway routes and all inbound traffic passes through WAF.',
    mappingType: 'EXACT_EQUIVALENT',
    confidenceScore: 96,
    evidenceReusability: 'DIRECT_REUSE',
    synergyGuidance: 'AWS VPC architecture blueprints and WAF configuration rules satisfy both ISO A.8.20 and MAS TRM 11.1.',
    sharedEvidenceArtefacts: [
      'Cloud VPC Network Architecture & Security Zoning Blueprint v3.1',
      'AWS WAF & Cloudflare DDoS Mitigation Rule Configurations',
      'Bi-Annual Firewall Rule Review & Ingress/Egress Audit Ledger'
    ]
  },
  {
    id: 'TRI-010',
    domainCategory: 'GOVERNANCE',
    domainLabel: 'Security Awareness & Human Resources',
    internalControlCode: 'A.6.1 / A.6.3',
    internalControlTitle: 'Screening & Information Security Awareness Training',
    internalCategory: 'People',
    internalDepartment: 'Human Resources & People Ops',
    internalMaturity: 4,
    internalStatus: 'Implemented',
    internalEvidenceCount: 4,
    internalAcceptanceCriteria: '100% pre-employment background screening, annual cybersecurity awareness LMS completion > 98%, and monthly phishing simulations with < 4% click rate.',
    isoClauseOrControlCode: 'Annex A A.6.1 & A.6.3',
    isoTitle: 'Screening & Information security awareness, education and training',
    isoTheme: 'A.6 (People)',
    isoRequirementStatement: 'Background verification checks on all personnel shall be carried out. Personnel shall receive appropriate information security awareness and regular updates.',
    isoAuditExpectation: 'Inspect HR screening policy, sample employee onboarding records, LMS training completion metrics, and phishing simulation test results.',
    masRequirementCode: 'MAS-TRM-5.1',
    masTitle: 'Cybersecurity Culture, Staff Awareness & Competency Training',
    masDomainNumber: '5.0',
    masDomainName: 'Cybersecurity Strategy & Culture',
    masStatement: 'The FI shall cultivate a strong cybersecurity awareness culture across all personnel, conduct mandatory annual security training tailored to roles, and execute periodic phishing simulations.',
    masIntentAndGuidance: 'Senior management, IT administrators, and software developers must receive specialized cybersecurity training corresponding to their responsibilities.',
    masMandatoryForFIs: true,
    masCriticalSystemsMandate: false,
    masSlaRequirement: 'Annual Mandatory Training (>95% Attendance); Quarterly Phishing Drills',
    masTestProcedure: 'Review employee LMS records, verify all new hires completed training within 30 days of joining, and examine remedial training for repeated phishing failures.',
    mappingType: 'EXACT_EQUIVALENT',
    confidenceScore: 95,
    evidenceReusability: 'DIRECT_REUSE',
    synergyGuidance: 'Employee LMS Completion Logs & Phishing Simulation Reports satisfy both ISO A.6.3 and MAS TRM 5.1.',
    sharedEvidenceArtefacts: [
      'Employee Cybersecurity Awareness Training Syllabus & LMS Roster',
      'Monthly Simulated Phishing Campaign Analytics & Remediation Log',
      'HR Background Screening Policy & Pre-Employment Verification Samples'
    ]
  }
];

export const TriHarmonizationSideBySideView: React.FC = () => {
  const { controls, masRequirements, crossFrameworkMappings, currentTenant } = useGRC();

  // Filter states
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedMappingType, setSelectedMappingType] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLayout, setActiveLayout] = useState<'cards' | 'table'>('cards');
  const [selectedItem, setSelectedItem] = useState<TriHarmonizedControl | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered dataset
  const filteredDataset = useMemo(() => {
    return TRI_HARMONIZED_DATASET.filter(item => {
      if (selectedDomain !== 'ALL' && item.domainCategory !== selectedDomain) return false;
      if (selectedMappingType !== 'ALL' && item.mappingType !== selectedMappingType) return false;
      if (selectedDepartment !== 'ALL' && item.internalDepartment !== selectedDepartment) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.internalControlCode.toLowerCase().includes(q) ||
          item.internalControlTitle.toLowerCase().includes(q) ||
          item.isoClauseOrControlCode.toLowerCase().includes(q) ||
          item.isoTitle.toLowerCase().includes(q) ||
          item.masRequirementCode.toLowerCase().includes(q) ||
          item.masTitle.toLowerCase().includes(q) ||
          item.domainLabel.toLowerCase().includes(q) ||
          item.synergyGuidance.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedDomain, selectedMappingType, selectedDepartment, searchQuery]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    TRI_HARMONIZED_DATASET.forEach(i => set.add(i.internalDepartment));
    return Array.from(set).sort();
  }, []);

  const handleCopySummary = (item: TriHarmonizedControl) => {
    const text = `[TRI-HARMONIZATION MAPPING]\nInternal Control: ${item.internalControlCode} - ${item.internalControlTitle}\nISO 27001:2022: ${item.isoClauseOrControlCode} - ${item.isoTitle}\nMAS TRM 2021: ${item.masRequirementCode} - ${item.masTitle}\nMapping: ${item.mappingType} (${item.confidenceScore}% Confidence)\nEvidence Reusability: ${item.evidenceReusability}\nAudit Synergy: ${item.synergyGuidance}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Mapping ID',
      'Domain Theme',
      'Internal Control Code',
      'Internal Control Title',
      'Department',
      'Internal Status',
      'ISO 27001 Clause/Control',
      'ISO Title',
      'MAS TRM Requirement Code',
      'MAS Title',
      'MAS Domain',
      'MAS SLA Mandate',
      'Mapping Relationship',
      'Confidence Score',
      'Evidence Reusability',
      'Audit Synergy Rationale'
    ];

    const rows = filteredDataset.map(item => [
      `"${item.id}"`,
      `"${item.domainLabel}"`,
      `"${item.internalControlCode}"`,
      `"${item.internalControlTitle}"`,
      `"${item.internalDepartment}"`,
      `"${item.internalStatus}"`,
      `"${item.isoClauseOrControlCode}"`,
      `"${item.isoTitle}"`,
      `"${item.masRequirementCode}"`,
      `"${item.masTitle}"`,
      `"${item.masDomainName}"`,
      `"${item.masSlaRequirement || 'Standard TRM Baseline'}"`,
      `"${item.mappingType}"`,
      `${item.confidenceScore}%`,
      `"${item.evidenceReusability}"`,
      `"${item.synergyGuidance.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Apex_TriHarmonization_ISO27001_MASTRM_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Tri-Harmonization Visual Metaphor */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
                Tri-Harmonization Side-by-Side Matrix
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Test Once, Satisfy Both
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ISO/IEC 27001:2022 ↔ Internal Controls ↔ MAS TRM 2021
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Side-by-Side Tri-Framework Control Harmonization Dashboard
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Synchronized 3-pillar visualization comparing internal enterprise baseline controls against mandatory ISO/IEC 27001:2022 clauses and Monetary Authority of Singapore (MAS) TRM requirements with shared evidence mappings.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
              title="Export complete 3-way mapping matrix"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Tri-Matrix CSV</span>
            </button>
          </div>
        </div>

        {/* 3-Pillar Visual Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          {/* Pillar 1 */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pillar 1: Internal Controls
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-mono text-[10px]">
                {controls?.length || 10} Active
              </span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-white">Enterprise Baseline</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Maturity Level 4 (Managed & Automated) across 10 in-scope departments
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-sky-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Pillar 2: ISO 27001:2022
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-400 font-mono text-[10px]">
                Clauses & Annex A
              </span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-white">Global ISMS Standard</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                100% Statement of Applicability (SoA) coverage with accredited registrar alignment
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-rose-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Pillar 3: MAS TRM 2021
              </span>
              <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-400 font-mono text-[10px]">
                Statutory Singapore
              </span>
            </div>
            <div className="mt-1">
              <div className="text-lg font-bold text-white">Financial Authority</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                1-Hour Incident SLA, RTO &lt;= 4h, and annual independent VA/PT mandates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* Domain Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Filter Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer"
            >
              <option value="ALL">All Control Domains ({TRI_HARMONIZED_DATASET.length})</option>
              <option value="GOVERNANCE">Executive Governance & Policy (2)</option>
              <option value="ACCESS_IDENTITY">Access Control & MFA (1)</option>
              <option value="CRYPTOGRAPHY_DATA">Cryptography & Data Protection (1)</option>
              <option value="INCIDENT_RESILIENCE">Incident & Business Continuity (2)</option>
              <option value="SDLC_SECURITY">Secure SDLC & DevSecOps (1)</option>
              <option value="VENDOR_CLOUD">Third-Party & Cloud Outsourcing (1)</option>
              <option value="VULNERABILITY_AUDIT">Vulnerabilities & Penetration Testing (1)</option>
              <option value="NETWORK_INFRA">Network Security & Microsegmentation (1)</option>
            </select>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Mapping Type Filter */}
            <select
              value={selectedMappingType}
              onChange={(e) => setSelectedMappingType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 text-xs cursor-pointer"
            >
              <option value="ALL">All Relationship Types</option>
              <option value="EXACT_EQUIVALENT">Exact Equivalent (Direct Match)</option>
              <option value="SUPERSET">Superset (Enhanced SLA / Specific)</option>
            </select>
          </div>

          {/* Search Box & Layout Switcher */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search controls, clauses, MAS codes..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setActiveLayout('cards')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeLayout === 'cards' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Card Layout"
              >
                3-Column Cards
              </button>
              <button
                onClick={() => setActiveLayout('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeLayout === 'table' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Table Layout"
              >
                Synced Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Content Presentation */}
      {filteredDataset.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-bold text-white">No Tri-Harmonized Controls Found</div>
          <p className="max-w-md mx-auto">
            Try adjusting your search query or reset the domain and department filters.
          </p>
          <button
            onClick={() => {
              setSelectedDomain('ALL');
              setSelectedDepartment('ALL');
              setSelectedMappingType('ALL');
              setSearchQuery('');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : activeLayout === 'cards' ? (
        /* 3-Column Side-by-Side Bento Cards */
        <div className="space-y-4">
          {filteredDataset.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all shadow-sm group"
            >
              {/* Header Bar with Mapping Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-slate-950 text-slate-300 font-mono text-[11px] font-bold rounded-md border border-slate-800">
                    {item.id}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-950/70 text-indigo-300 text-[11px] font-semibold rounded-md border border-indigo-800/60">
                    {item.domainLabel}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                    item.mappingType === 'EXACT_EQUIVALENT'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                      : 'bg-sky-950/80 text-sky-300 border-sky-800/60'
                  }`}>
                    {item.mappingType.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-950 text-emerald-400 font-mono text-[10px] font-bold rounded-md border border-slate-800">
                    {item.confidenceScore}% Confidence
                  </span>
                  <span className="px-2 py-0.5 bg-slate-950 text-sky-400 text-[10px] font-semibold rounded-md border border-slate-800 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-sky-400" />
                    {item.evidenceReusability.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySummary(item)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors"
                    title="Copy Harmonization Summary"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/90 hover:bg-sky-600 text-white text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Deep Inspect</span>
                  </button>
                </div>
              </div>

              {/* 3 Synchronized Columns (Internal Control | ISO 27001 | MAS TRM) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Column 1: Internal Control Baseline */}
                <div className="bg-slate-950/80 rounded-xl p-4 border border-emerald-900/30 hover:border-emerald-700/50 transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Internal Enterprise Control
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-[10px] border border-emerald-800/60">
                        {item.internalControlCode}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">
                      {item.internalControlTitle}
                    </h4>

                    <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                      <strong className="text-slate-200 block text-[10px] uppercase text-emerald-400 font-semibold mb-0.5">Acceptance Criteria:</strong>
                      {item.internalAcceptanceCriteria}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[150px]">{item.internalDepartment}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-[10px] text-emerald-400 border border-slate-800">
                      Maturity L{item.internalMaturity} • {item.internalStatus}
                    </span>
                  </div>
                </div>

                {/* Column 2: ISO/IEC 27001:2022 Requirement */}
                <div className="bg-slate-950/80 rounded-xl p-4 border border-sky-900/30 hover:border-sky-700/50 transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        ISO/IEC 27001:2022
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono font-bold text-[10px] border border-sky-800/60">
                        {item.isoClauseOrControlCode}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">
                      {item.isoTitle}
                    </h4>

                    <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                      <strong className="text-slate-200 block text-[10px] uppercase text-sky-400 font-semibold mb-0.5">ISMS Standard Clause / Expectation:</strong>
                      {item.isoRequirementStatement}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{item.isoTheme}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-[10px] text-sky-400 border border-slate-800">
                      In SoA Scope
                    </span>
                  </div>
                </div>

                {/* Column 3: MAS TRM 2021 Regulatory Requirement */}
                <div className="bg-slate-950/80 rounded-xl p-4 border border-rose-900/30 hover:border-rose-700/50 transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        MAS TRM 2021 Guidelines
                      </span>
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold text-[10px] border border-rose-800/60">
                        {item.masRequirementCode}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">
                      {item.masTitle}
                    </h4>

                    <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                      <strong className="text-slate-200 block text-[10px] uppercase text-rose-400 font-semibold mb-0.5">Statutory Requirement & Statement:</strong>
                      {item.masStatement}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-rose-400 font-semibold font-mono text-[10px]">
                      {item.masSlaRequirement || 'Domain ' + item.masDomainNumber}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] border border-rose-900">
                      Mandatory FI
                    </span>
                  </div>
                </div>
              </div>

              {/* Shared Evidence & Audit Synergy Strip */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Single-Test Audit Synergy Rationale:</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.synergyGuidance}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Shared Artifacts:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 border border-slate-700 font-mono text-[10px] font-bold">
                    {item.sharedEvidenceArtefacts.length} Evidence Documents
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Synchronized Comparison Table Layout */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4">Internal Control</th>
                  <th className="py-3 px-4">ISO 27001:2022 Clause/Control</th>
                  <th className="py-3 px-4">MAS TRM 2021 Requirement</th>
                  <th className="py-3 px-4">Relationship</th>
                  <th className="py-3 px-4">Evidence Reuse</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDataset.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-400 text-[11px]">
                      {item.id}
                    </td>
                    
                    {/* Internal Control */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] border border-emerald-800/60">
                          {item.internalControlCode}
                        </span>
                        <span className="truncate max-w-[200px]">{item.internalControlTitle}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.internalDepartment} • Maturity L{item.internalMaturity}
                      </div>
                    </td>

                    {/* ISO 27001 */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 font-mono text-[10px] border border-sky-800/60">
                          {item.isoClauseOrControlCode}
                        </span>
                        <span className="truncate max-w-[200px]">{item.isoTitle}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.isoTheme}
                      </div>
                    </td>

                    {/* MAS TRM */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 font-mono text-[10px] border border-rose-800/60">
                          {item.masRequirementCode}
                        </span>
                        <span className="truncate max-w-[200px]">{item.masTitle}</span>
                      </div>
                      <div className="text-[10px] text-rose-400 font-mono mt-0.5">
                        {item.masSlaRequirement || item.masDomainName}
                      </div>
                    </td>

                    {/* Mapping Type */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.mappingType === 'EXACT_EQUIVALENT'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                          : 'bg-sky-950 text-sky-300 border-sky-800/60'
                      }`}>
                        {item.mappingType}
                      </span>
                    </td>

                    {/* Evidence Reusability */}
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {item.evidenceReusability.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white font-semibold text-[11px] transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deep Inspection Modal / Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-slate-950 text-slate-300 font-mono text-xs font-bold rounded border border-slate-800">
                  {selectedItem.id}
                </span>
                <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 text-xs font-semibold rounded border border-indigo-800">
                  {selectedItem.domainLabel}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 text-xs font-bold rounded border border-emerald-800">
                  {selectedItem.mappingType} ({selectedItem.confidenceScore}% Confidence)
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Tri-Harmonization Deep Dive: {selectedItem.internalControlTitle}
              </h3>
            </div>

            {/* 3 Side-by-Side Detailed Breakdown Panes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Internal Control Details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Internal Baseline
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold rounded border border-emerald-800">
                    {selectedItem.internalControlCode}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-white">{selectedItem.internalControlTitle}</div>
                  <div className="text-slate-400">Department: <strong className="text-slate-200">{selectedItem.internalDepartment}</strong></div>
                  <div className="text-slate-400">Maturity Level: <strong className="text-emerald-400">L{selectedItem.internalMaturity} / 5</strong></div>
                  <div className="text-slate-400">Status: <strong className="text-sky-400">{selectedItem.internalStatus}</strong></div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase block">Acceptance Criteria:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedItem.internalAcceptanceCriteria}</p>
                </div>
              </div>

              {/* ISO 27001 Details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-sky-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    ISO 27001:2022
                  </span>
                  <span className="px-2 py-0.5 bg-sky-950 text-sky-300 font-mono text-[10px] font-bold rounded border border-sky-800">
                    {selectedItem.isoClauseOrControlCode}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-white">{selectedItem.isoTitle}</div>
                  <div className="text-slate-400">Theme: <strong className="text-slate-200">{selectedItem.isoTheme}</strong></div>
                  <div className="text-slate-400">Accreditation: <strong className="text-sky-400">UKAS / SAC Accredited</strong></div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-sky-400 uppercase block">Clause Requirement:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedItem.isoRequirementStatement}</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-sky-400 uppercase block">Lead Auditor Expectation:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedItem.isoAuditExpectation}</p>
                </div>
              </div>

              {/* MAS TRM Details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    MAS TRM 2021
                  </span>
                  <span className="px-2 py-0.5 bg-rose-950 text-rose-300 font-mono text-[10px] font-bold rounded border border-rose-800">
                    {selectedItem.masRequirementCode}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-white">{selectedItem.masTitle}</div>
                  <div className="text-slate-400">Domain: <strong className="text-slate-200">{selectedItem.masDomainName}</strong></div>
                  <div className="text-slate-400">Statutory Mandate: <strong className="text-rose-400">{selectedItem.masSlaRequirement || 'Statutory Baseline'}</strong></div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-rose-400 uppercase block">MAS Regulatory Statement:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedItem.masStatement}</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-rose-400 uppercase block">MAS Supervisory Test Procedure:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedItem.masTestProcedure}</p>
                </div>
              </div>
            </div>

            {/* Shared Evidence Checklist */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Shared Evidence Artifacts (Satisfies both ISO 27001 & MAS TRM)
                </h4>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded border border-emerald-800">
                  {selectedItem.evidenceReusability.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {selectedItem.sharedEvidenceArtefacts.map((art, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug text-[11px]">{art}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => handleCopySummary(selectedItem)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                {copiedId === selectedItem.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === selectedItem.id ? 'Copied Summary!' : 'Copy Working Paper Summary'}</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
