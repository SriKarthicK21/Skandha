/**
 * MAS Circular & Regulatory Horizon Scanner Service
 * 
 * Provides an enterprise-grade repository and live synchronization engine for
 * Monetary Authority of Singapore (MAS) Circulars, Notices, Guidelines, Consultation Papers,
 * and Cyber Threat Advisories, specifically calibrated for Technology Risk Management (TRM),
 * Operational Resilience, and Statutory Incident Notification workflows.
 */

export interface MASIncidentLinkagePayload {
  reportingTriggerCondition: string;
  slaWindow: string; // e.g. "Within 1 hour of discovery"
  applicableCriticalSystems: string[];
  rootCauseExpectations: string;
  defaultRootCauseCategory: 'CYBER_ATTACK' | 'THIRD_PARTY_OUTAGE' | 'SOFTWARE_DEFECT' | 'HARDWARE_FAILURE' | 'RANSOMWARE' | 'HUMAN_ERROR';
  recommendedIncidentTitle: string;
  recommendedPrePopulatedSummary: string;
  recommendedContainmentChecklist: string[];
}

export interface MASCircularRecord {
  id: string;
  referenceCode: string; // e.g. "MAS Circular No. TRS 02/2025" or "MAS Notice 655"
  title: string;
  type: 'CIRCULAR' | 'NOTICE' | 'ADVISORY' | 'CONSULTATION_PAPER' | 'GUIDELINE';
  issuanceDate: string; // e.g. "January 2025" or "2025-11-15"
  effectiveDate: string;
  authority: string; // e.g. "Monetary Authority of Singapore (Technology Risk Supervision Dept)"
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  trmDomainMapping: string; // e.g. "14.0 Incident Management & Statutory Notification"
  statutoryLegalBasis: string; // e.g. "Banking Act (Cap. 19) Section 58 & Payment Services Act 2019 Section 85"
  summary: string;
  keyDirectives: string[];
  incidentNotificationImplications: MASIncidentLinkagePayload;
  sourceUrl: string;
  tags: string[];
  isStatutoryMandate?: boolean;
}

export const MAS_CIRCULAR_MASTER_DATA: MASCircularRecord[] = [
  {
    id: 'NOT-MAS-655-644',
    referenceCode: 'MAS Notice 655 / Notice 644',
    title: 'Notice on Technology Risk Management (Mandatory 1-Hour Incident Notification & CIS Availability)',
    type: 'NOTICE',
    issuanceDate: 'January 2025 (Enforced)',
    effectiveDate: 'Immediate / Legally Binding',
    authority: 'Monetary Authority of Singapore (TRSD)',
    impactLevel: 'CRITICAL',
    trmDomainMapping: '14.0 Incident Management & Statutory Notification',
    statutoryLegalBasis: 'Banking Act (Cap. 19) Section 58 & Payment Services Act 2019 Section 85',
    summary: 'Legally enforceable statutory notice establishing non-negotiable requirements for designated Critical Information Systems (CIS). Mandates formal 1-hour notification to MAS upon discovering a relevant incident, caps annual unscheduled downtime to ≤ 4 hours, and requires a comprehensive 14-day Root Cause Analysis (PIR) report.',
    keyDirectives: [
      'Submit formal incident notification within 1 hour of discovery of a relevant incident affecting any Critical Information System (CIS).',
      'Maintain maximum unscheduled downtime for each CIS of no more than 4 hours in any 12-month rolling period.',
      'Submit formal 14-day Post-Incident Root Cause Analysis (PIR) investigation report to MAS Technology Risk Supervision Department.',
      'Enforce multi-factor authentication (MFA) and privileged access management (PAM) across all critical administrative interfaces.'
    ],
    incidentNotificationImplications: {
      reportingTriggerCondition: 'Severe service disruption affecting core payment/banking rails, unauthorized access, or loss of customer transaction capability.',
      slaWindow: 'Strict 1 hour from initial anomaly confirmation',
      applicableCriticalSystems: [
        'Apex Pay Core Interbank Settlement Rail',
        'Customer Online Banking Gateway',
        'Core Banking Ledger Cluster (AZ-1/AZ-2)',
        'FAST / PayNow Transaction Switch'
      ],
      rootCauseExpectations: 'Comprehensive 5-Whys fault tree analysis, architectural failure mode analysis, vendor SLA evaluation, and Board-endorsed CAPA plan.',
      defaultRootCauseCategory: 'SOFTWARE_DEFECT',
      recommendedIncidentTitle: 'Statutory Notification: Critical Information System Disruption under MAS Notice 644/655',
      recommendedPrePopulatedSummary: 'Pursuant to Section 8 of MAS Notice 655 / Notice 644, formal notification is hereby tendered regarding an unscheduled degradation affecting designated Critical Information Systems. Immediate containment has been enacted with failover to secondary hot-standby nodes.',
      recommendedContainmentChecklist: [
        'Activate Secondary Availability Zone Hot-Standby within RTO target (≤ 4 hours)',
        'Isolate corrupted thread connection pools and preserve volatile memory dumps',
        'Dispatch emergency regulatory notification to MAS TRS Supervision Department',
        'Trigger customer liaison communications and interbank settlement hold notices'
      ]
    },
    sourceUrl: 'https://www.mas.gov.sg/regulation/notices/notice-655',
    tags: ['1-Hour SLA', 'Notice 655', 'Notice 644', 'Statutory Mandate', 'Downtime Cap', 'Critical Systems'],
    isStatutoryMandate: true
  },
  {
    id: 'CIR-MAS-TRS-02-2025',
    referenceCode: 'MAS Circular No. TRS 02/2025',
    title: 'Supervisory Directives on Rapid Incident Escalation & Third-Party Cloud Service Provider Outages',
    type: 'CIRCULAR',
    issuanceDate: 'April 2025',
    effectiveDate: 'Immediate Supervisory Expectation',
    authority: 'MAS Technology Risk Supervision Department',
    impactLevel: 'CRITICAL',
    trmDomainMapping: '12.0 Cloud Security & 15.0 Operational Resilience',
    statutoryLegalBasis: 'MAS TRM Guidelines (2021) Clause 12.3 & Guidelines on Outsourcing (2024)',
    summary: 'Clarifies that downstream outages, latency spikes, or regional zone failures originating from outsourced Cloud Service Providers (CSPs) or software supply chain vendors do not relieve financial institutions from the statutory 1-hour MAS notification requirement. Mandates multi-zone warm redundancy and continuous cloud provider health telemetry.',
    keyDirectives: [
      'Explicitly integrate cloud vendor telemetry into the FI’s central Security Operations Center (SOC) and Incident Command.',
      'Do not delay 1-hour MAS notification while awaiting CSP root cause statements or status page updates.',
      'Conduct bi-annual simulated CSP regional outage failover exercises without service disruption to retail customers.',
      'Maintain contractual audit and data portability exit rights for all tier-1 cloud infrastructure providers.'
    ],
    incidentNotificationImplications: {
      reportingTriggerCondition: 'Outage or severe degradation resulting from external cloud provider infrastructure, data center connectivity loss, or managed PaaS/DB service saturation.',
      slaWindow: 'Within 1 hour of customer impact, irrespective of vendor status confirmation',
      applicableCriticalSystems: [
        'AWS ap-southeast-1 Multi-AZ Kubernetes Ingress',
        'Cloudflare Enterprise Edge Proxy & WAF',
        'Managed Cloud SQL / DocumentDB Clustered Storage'
      ],
      rootCauseExpectations: 'Must audit CSP SLA compliance, sub-processor dependencies, cross-region replication lag, and why automatic circuit breakers did not prevent cascade failure.',
      defaultRootCauseCategory: 'THIRD_PARTY_OUTAGE',
      recommendedIncidentTitle: 'Third-Party Cloud Provider Outage Impacting Regulated Financial Services (MAS Circular TRS 02/2025)',
      recommendedPrePopulatedSummary: 'In accordance with MAS Circular No. TRS 02/2025, an upstream cloud service provider availability degradation has impacted customer-facing transactional services. Traffic has been diverted to redundant cloud availability zones.',
      recommendedContainmentChecklist: [
        'Initiate cross-zone or multi-cloud traffic draining via global load balancers',
        'Engage CSP Tier-3 Mission-Critical Support Desk and log formal incident ticket',
        'Verify database replica synchronization before committing ledger writes',
        'Notify MAS of third-party vendor origin and expected restoration timeline'
      ]
    },
    sourceUrl: 'https://www.mas.gov.sg/regulation/circulars',
    tags: ['Third-Party Risk', 'Cloud Outage', 'CSP Concentration', 'Operational Resilience', 'Notice 655 SLA'],
    isStatutoryMandate: false
  },
  {
    id: 'CIR-MAS-FSD-2025-11',
    referenceCode: 'MAS Circular FSD-2025/11',
    title: 'Responsible AI Deployment: Governance & Incident Escalation for Generative AI & Autonomous Agents',
    type: 'CIRCULAR',
    issuanceDate: 'November 2025',
    effectiveDate: 'December 2025',
    authority: 'MAS Financial Systems & Technology Department',
    impactLevel: 'HIGH',
    trmDomainMapping: '6.0 Software Application Development & AI Risk',
    statutoryLegalBasis: 'MAS FEAT Principles (Fairness, Ethics, Accountability, Transparency) & Project MindForge',
    summary: 'Expands MAS regulatory expectations to agentic AI workflows, large language model (LLM) copilot integrations, and automated algorithmic decision-making. Mandates immediate incident escalation if an AI agent exhibits hallucination resulting in financial misstatement, unintended transaction execution, or prompt injection compromise.',
    keyDirectives: [
      'Maintain an enterprise inventory of all production AI models, autonomous execution tools, and LLM APIs.',
      'Enforce deterministic human-in-the-loop (HITL) approval thresholds for agent-initiated financial movements over SGD 20,000.',
      'Deploy automated guardrails detecting prompt injection, prompt leakage, and unauthorized training data exfiltration.',
      'Report any systemic AI hallucination or algorithmic drift causing unfair customer detriment to MAS within 24 hours.'
    ],
    incidentNotificationImplications: {
      reportingTriggerCondition: 'Autonomous AI agent execution fault, prompt injection jailbreak exposing internal corporate data, or ungrounded financial calculation anomaly.',
      slaWindow: 'Immediate 1-hour notification if CIS-linked, within 24 hours for algorithmic advisory anomalies',
      applicableCriticalSystems: [
        'Skanda AI Autonomous Compliance Copilot',
        'Automated Transaction Scoring & AML Engine',
        'Customer Financial Advisory LLM Gateway'
      ],
      rootCauseExpectations: 'Model prompt audit log inspection, validation dataset divergence, adversarial test harness report, and alignment verification with FEAT principles.',
      defaultRootCauseCategory: 'SOFTWARE_DEFECT',
      recommendedIncidentTitle: 'AI Governance & Algorithmic Anomaly Escalation under MAS Circular FSD-2025/11',
      recommendedPrePopulatedSummary: 'Pursuant to MAS Circular FSD-2025/11, an anomalous autonomous AI execution event was detected. Guardrails were immediately enforced, agent tool execution was suspended, and manual administrative oversight restored.',
      recommendedContainmentChecklist: [
        'Suspend autonomous tool invocation permissions for affected AI model endpoints',
        'Capture complete inference input/output token audit logs and system prompt context',
        'Verify no unauthorized customer data was cached or transmitted to third-party model providers',
        'Enforce human validation gates on all queued algorithmic recommendations'
      ]
    },
    sourceUrl: 'https://www.mas.gov.sg/regulation/guidelines/technology-risk-management-guidelines',
    tags: ['GenAI', 'Agentic AI', 'FEAT Governance', 'Prompt Injection', 'Algorithmic Risk'],
    isStatutoryMandate: false
  },
  {
    id: 'ADV-MAS-CERT-2026-02',
    referenceCode: 'MAS-CERT-ADV-2026/02',
    title: 'Advisory on Mitigating Adversary-in-the-Middle (AiTM) Phishing & Session Token Theft in Banking Portals',
    type: 'ADVISORY',
    issuanceDate: 'January 2026',
    effectiveDate: 'Immediate Precautionary Action',
    authority: 'MAS Cyber Security Advisory Group (CSAG) & SingCERT',
    impactLevel: 'CRITICAL',
    trmDomainMapping: '10.0 Access Control & 13.0 Cyber Incident Management',
    statutoryLegalBasis: 'MAS Notice 655 / 644 Paragraph 5 (Multi-Factor Authentication Mandate)',
    summary: 'Alerts financial institutions to active reverse-proxy adversary-in-the-middle (AiTM) phishing kits harvesting authenticated session cookies and bypassing traditional SMS/App push MFA. Demands implementation of FIDO2/WebAuthn phishing-resistant hardware credentials and cryptographically bound session tokens.',
    keyDirectives: [
      'Transition privileged administrators and financial payment authorizers to FIDO2 WebAuthn hardware security keys.',
      'Enforce strict TLS channel binding and client IP change invalidation for sensitive session cookies.',
      'Deploy continuous behavioral anomaly detection flagging simultaneous session use from disparate geographic CIDRs.',
      'Treat confirmed AiTM session hijacking against privileged accounts as a Severity 1 Cyber Breach under Notice 655.'
    ],
    incidentNotificationImplications: {
      reportingTriggerCondition: 'Detection of reverse-proxy session token interception, credential stuffing against public banking APIs, or unauthorized account takeover.',
      slaWindow: 'Within 1 hour of confirming administrative or payment authorizer compromise',
      applicableCriticalSystems: [
        'Staff Single Sign-On (SSO) & IdP Cluster',
        'Privileged Access Management (PAM) Vault',
        'Customer Internet Banking Authentication Portal'
      ],
      rootCauseExpectations: 'Forensic evaluation of session revocation mechanisms, phishing telemetry, compromised token blast radius, and credential compromise timeline.',
      defaultRootCauseCategory: 'CYBER_ATTACK',
      recommendedIncidentTitle: 'Cyber Security Breach: AiTM Session Hijacking & Phishing Infiltration (Notice 655 / MAS-CERT-ADV-2026/02)',
      recommendedPrePopulatedSummary: 'Formal notification is filed following detection of an Adversary-in-the-Middle (AiTM) session token compromise. All active session tokens for affected credentials have been revoked and FIDO2 hardware token enforcement has been applied.',
      recommendedContainmentChecklist: [
        'Globally invalidate all active session tokens and JWT refresh cookies',
        'Rotate privileged API service account keys and root administrative passwords',
        'Block malicious reverse-proxy domains and hosting provider IP ranges at WAF',
        'Initiate forensic memory imaging on affected endpoint workstations'
      ]
    },
    sourceUrl: 'https://www.mas.gov.sg',
    tags: ['AiTM Phishing', 'MFA Bypass', 'FIDO2 WebAuthn', 'Session Hijacking', 'Cyber Attack'],
    isStatutoryMandate: true
  },
  {
    id: 'CON-MAS-RES-P004-2026',
    referenceCode: 'MAS Consultation Paper P004-2026',
    title: 'Consultation on Enhancing Operational Resilience: Unscheduled Downtime Limits & Stressed Recovery',
    type: 'CONSULTATION_PAPER',
    issuanceDate: 'February 2026',
    effectiveDate: 'Consultation Closes April 2026 (Enforcement Target Q3 2026)',
    authority: 'Monetary Authority of Singapore (Policy & Supervision)',
    impactLevel: 'HIGH',
    trmDomainMapping: '15.0 System Availability & Business Continuity Management',
    statutoryLegalBasis: 'Proposed Amendments to MAS Notice 644 & Notice 655',
    summary: 'Proposes tightening the maximum allowable unscheduled downtime for designated critical payment and interbank settlement systems from 4 hours to 2 hours in any rolling 12-month period. Introduces mandatory dual-active multi-region cloud architectures for Tier-1 clearing institutions.',
    keyDirectives: [
      'Proposes lowering statutory unscheduled downtime threshold to ≤ 2 hours annually for tier-1 retail payment rails.',
      'Mandates automated chaos engineering and simulated cloud region severing tests at least once every 6 months.',
      'Requires Board of Directors to review and approve independent resilience audit attestations on an annual basis.',
      'Proposes mandatory customer compensation frameworks for unannounced payment outages exceeding 120 minutes.'
    ],
    incidentNotificationImplications: {
      reportingTriggerCondition: 'Any unscheduled system interruption that threatens cumulative annual downtime quotas or exceeds 60 continuous minutes.',
      slaWindow: 'Within 1 hour of interruption onset',
      applicableCriticalSystems: [
        'FAST / PayNow Interbank Gateway',
        'MEPS+ Real-Time Gross Settlement Bridge',
        'Merchant POS Terminal Processing Rail'
      ],
      rootCauseExpectations: 'Cumulative 12-month downtime ledger computation, resilience architecture gap analysis, and Board Risk Committee recovery attestation.',
      defaultRootCauseCategory: 'HARDWARE_FAILURE',
      recommendedIncidentTitle: 'Operational Resilience Interruption: Downtime Threshold Escalation (MAS Consultation P004-2026)',
      recommendedPrePopulatedSummary: 'Notification submitted tracking unscheduled downtime event against MAS cumulative 4-hour (and proposed 2-hour) annual regulatory ceiling. Failover orchestration initiated.',
      recommendedContainmentChecklist: [
        'Record exact outage duration in immutable CIS Downtime Ledger',
        'Initiate automated recovery workflow to ensure RTO restores under 2 hours',
        'Notify Board Risk Committee of cumulative downtime budget consumption',
        'Document timeline milestones for inclusion in 14-day Post-Incident Report'
      ]
    },
    sourceUrl: 'https://www.mas.gov.sg/regulation/consultations',
    tags: ['Operational Resilience', 'Downtime Cap', 'RTO ≤ 2h', 'Consultation Paper', 'BCP'],
    isStatutoryMandate: false
  },
  {
    id: 'CIR-MAS-TRS-01-2024',
    referenceCode: 'MAS Circular TRS 01/2024',
    title: 'Guidance on Cyber Crisis Tabletop Exercises & Validation of Offline Immutable Backups',
    type: 'CIRCULAR',
    issuanceDate: 'September 2024',
    effectiveDate: 'Enforced Supervisory Expectation',
    authority: 'MAS Technology Risk Supervision Department',
    impactLevel: 'HIGH',
    trmDomainMapping: '14.0 Incident Management & 13.0 Cyber Incident Management',
    statutoryLegalBasis: 'MAS TRM Guidelines Section 14.2 & Section 13.4',
    summary: 'Emphasizes preparedness against sophisticated ransomware campaigns targeting online backups. Requires financial institutions to maintain air-gapped, write-once-read-many (WORM) offline immutable backups and regularly perform bare-metal recovery drills involving executive management.',
    keyDirectives: [
      'Maintain cryptographically signed, immutable, and air-gapped backups of core database ledgers.',
      'Conduct annual simulated ransomware tabletop exercises involving Board members and legal counsel.',
      'Ensure disaster recovery sites can be restored independently without active directory domain controller dependency.',
      'Prohibit payment of cyber ransom demands without prior consultation with law enforcement and regulatory authorities.'
    ],
    incidentNotificationImplications: {
      reportingTriggerCondition: 'Ransomware discovery, encryption of system files, lateral movement by threat actors, or extortion communications.',
      slaWindow: 'Immediate 1-hour statutory notification upon confirmation of ransomware presence',
      applicableCriticalSystems: [
        'Core Transaction Database Ledger',
        'Active Directory Identity Fabric',
        'Cold Storage WORM Backup Vault'
      ],
      rootCauseExpectations: 'Ransomware strain identification, patient-zero entry vector analysis, active directory kerberoasting telemetry, and immutable backup restoration speed.',
      defaultRootCauseCategory: 'RANSOMWARE',
      recommendedIncidentTitle: 'Cyber Security Notification: Ransomware Incident & Immutable Backup Validation (MAS Circular TRS 01/2024)',
      recommendedPrePopulatedSummary: 'Pursuant to MAS Notice 655/644 and Circular TRS 01/2024, notification is filed concerning an isolated ransomware execution event. Infected network segments have been quarantined, and restoration from air-gapped immutable backup vaults is underway.',
      recommendedContainmentChecklist: [
        'Sever network connections to isolated VLANs to prevent lateral propagation',
        'Verify integrity of offline air-gapped WORM backups prior to initiation of restoration',
        'Preserve forensic disk images of affected hosts for SingCERT and law enforcement',
        'Engage external incident response retainers and specialized ransomware negotiation experts'
      ]
    },
    sourceUrl: 'https://www.mas.gov.sg/regulation/circulars',
    tags: ['Ransomware', 'Immutable Backups', 'Tabletop Exercise', 'Disaster Recovery', 'Cyber Crisis'],
    isStatutoryMandate: true
  },
  {
    id: 'NOT-MAS-PSN01',
    referenceCode: 'MAS Notice PSN01 / Notice PSN02',
    title: 'Statutory Notice on Prevention of Money Laundering & Technology Controls for Payment Services',
    type: 'NOTICE',
    issuanceDate: 'January 2024 (Updated)',
    effectiveDate: 'Legally Binding under Payment Services Act',
    authority: 'MAS Payment Department',
    impactLevel: 'CRITICAL',
    trmDomainMapping: '5.0 Payment Services & Merchant Settlement Controls',
    statutoryLegalBasis: 'Payment Services Act 2019 (Act 2 of 2019) Sections 85 & 88',
    summary: 'Imposes binding operational and technology risk mandates on Major Payment Institutions (MPI) and Standard Payment Institutions (SPI), requiring high-availability clearing pipelines, real-time fraud transaction surveillance, and 1-hour notification of payment rails disruptions.',
    keyDirectives: [
      'Maintain continuous processing capability for merchant settlement and retail payment wallets.',
      'Notify MAS within 1 hour of any payment outage that prevents users from executing interbank fund transfers.',
      'Enforce multi-factor authentication for high-value wallet debits exceeding SGD 1,000.',
      'Implement real-time transaction monitoring detecting automated account takeover and unauthorized bulk withdrawals.'
    ],
    incidentNotificationImplications: {
      reportingTriggerCondition: 'Interruption of payment clearing, merchant settlement failure, or wallet balance discrepancy affecting digital payment token (DPT) or fiat rails.',
      slaWindow: 'Within 1 hour under PSA Section 85',
      applicableCriticalSystems: [
        'PayNow Proxy Look-up & Transaction Engine',
        'Merchant Payment Processing Rail',
        'Customer Digital Wallet Ledger'
      ],
      rootCauseExpectations: 'Clearing settlement reconciliation logs, banking API endpoint latency graphs, merchant batch reprocessing reports.',
      defaultRootCauseCategory: 'SOFTWARE_DEFECT',
      recommendedIncidentTitle: 'Payment Rail Disruption: Statutory Notice PSN01 Incident Notification',
      recommendedPrePopulatedSummary: 'Notification filed pursuant to Section 85 of the Payment Services Act 2019 and Notice PSN01 regarding an unscheduled interruption of real-time merchant settlement services. Queue reprocessing in progress.',
      recommendedContainmentChecklist: [
        'Switch payment transaction routing to secondary interbank settlement gateway',
        'Queue in-flight transactions safely with duplicate-submission protection',
        'Issue merchant portal notification banners regarding expected batch clearing delays',
        'Verify reconciliation logs against central clearing house settlement reports'
      ]
    },
    sourceUrl: 'https://www.mas.gov.sg/regulation/notices/psn01',
    tags: ['Payment Services Act', 'PSN01', 'FAST/PayNow', 'MPI License', 'Merchant Rails'],
    isStatutoryMandate: true
  },
  {
    id: 'ADV-MAS-PQC-2025',
    referenceCode: 'CSA & MAS Joint Tech Advisory 2025-PQC',
    title: 'Advisory on Cryptographic Transition to Post-Quantum Cryptography (PQC) in Financial Services',
    type: 'ADVISORY',
    issuanceDate: 'September 2025',
    effectiveDate: 'Phased Migration 2025-2030',
    authority: 'MAS Technology Risk Supervision & Cyber Security Agency of Singapore (CSA)',
    impactLevel: 'MEDIUM',
    trmDomainMapping: '9.0 Cryptography & Key Management',
    statutoryLegalBasis: 'MAS TRM Guidelines Section 9.0 (Data Encryption & Key Management)',
    summary: 'Directs financial institutions to initiate enterprise Cryptographic Bill of Materials (CBOM) discovery to identify legacy RSA/ECC keys vulnerable to "Harvest Now, Decrypt Later" (HNDL) attacks and pilot NIST FIPS 203/204 algorithms for long-life interbank financial records.',
    keyDirectives: [
      'Compile an enterprise Cryptographic Bill of Materials (CBOM) mapping all payment switches, HSMs, and TLS termination endpoints.',
      'Pilot hybrid TLS 1.3 key exchange combining classical X25519 with post-quantum ML-KEM (Kyber768).',
      'Require HSM and cryptographic vendor roadmap commitments supporting NIST PQC algorithms (ML-KEM, ML-DSA).',
      'Report any cryptographic vulnerability or key exposure incident to MAS immediately under TRM guidelines.'
    ],
    incidentNotificationImplications: {
      reportingTriggerCondition: 'Compromise of cryptographic master keys, HSM firmware vulnerability, or unauthorized exposure of encrypted data stores subject to potential offline decryption.',
      slaWindow: 'Within 1 hour if HSM or interbank root key compromise is confirmed',
      applicableCriticalSystems: [
        'Hardware Security Module (HSM) Key Management Cluster',
        'Interbank SWIFT / MEPS+ Encrypted Messaging Switch',
        'Database Column-Level Transparent Data Encryption (TDE) Vault'
      ],
      rootCauseExpectations: 'Cryptographic key lifecycle audit, HSM access logs, key rotation cadence evaluation, and compromise blast radius.',
      defaultRootCauseCategory: 'CYBER_ATTACK',
      recommendedIncidentTitle: 'Cryptographic Security Alert: Key Lifecycle Anomaly (CSA/MAS Advisory 2025-PQC)',
      recommendedPrePopulatedSummary: 'Notification filed pursuant to MAS TRM Section 9.0 and CSA/MAS PQC Advisory following detection of an unexpected cryptographic key lifecycle event. Immediate master key rotation has been initiated.',
      recommendedContainmentChecklist: [
        'Trigger emergency cryptographic master key rotation in designated HSM clusters',
        'Revoke compromised TLS and mTLS certificates across internal and external gateways',
        'Validate database encryption keys and verify immutable access logs',
        'Inspect network egress records for unauthorized bulk transfers of ciphertext'
      ]
    },
    sourceUrl: 'https://www.mas.gov.sg/publications/monographs-or-information-paper',
    tags: ['Cryptography', 'PQC', 'Quantum-Safe', 'HSM', 'Key Management', 'NIST FIPS 203'],
    isStatutoryMandate: false
  }
];

export interface LiveRegulatoryFetchResponse {
  isLiveGrounded: boolean;
  model: string;
  timestamp: string;
  sourceCount: number;
  circulars: MASCircularRecord[];
  rawExecutiveSummary?: string;
}

/**
 * Fetches the latest MAS Circulars, combining authoritative static master data
 * with live AI/Google Search grounded intelligence from the SKANDA backend.
 */
export async function fetchLatestMASCirculars(query = '', topic = 'all'): Promise<LiveRegulatoryFetchResponse> {
  try {
    const res = await fetch('/api/ai/regulatory-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: topic === 'all' ? 'trm' : topic,
        customQuery: query,
        institutionType: 'Full Commercial Bank / Major Payment Institution'
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    const liveItems = data.data?.items || [];
    const executiveSummary = data.data?.executiveSummary || '';

    // Merge live items with master data, avoiding duplicate reference codes
    const existingCodes = new Set(MAS_CIRCULAR_MASTER_DATA.map(c => c.referenceCode.toLowerCase()));
    const augmentedLiveCirculars: MASCircularRecord[] = [];

    for (const item of liveItems) {
      if (!existingCodes.has(item.referenceCode.toLowerCase())) {
        augmentedLiveCirculars.push({
          id: item.id || `LIVE-${Math.random().toString(36).substring(2, 7)}`,
          referenceCode: item.referenceCode || 'MAS Regulatory Update',
          title: item.title || 'Official Regulatory Directive',
          type: (item.type as any) || 'CIRCULAR',
          issuanceDate: item.publishedDate || '2025/2026',
          effectiveDate: 'Immediate Supervisory Expectation',
          authority: 'Monetary Authority of Singapore',
          impactLevel: (item.impactLevel as any) || 'HIGH',
          trmDomainMapping: item.masDomain || '14.0 Incident Management',
          statutoryLegalBasis: 'MAS Notice 644/655 & TRM Guidelines',
          summary: item.summary || '',
          keyDirectives: item.keyActions || [
            'Audit current critical controls against regulatory update expectations.',
            'Incorporate supervisory expectations into enterprise incident response playbook.'
          ],
          incidentNotificationImplications: {
            reportingTriggerCondition: `Supervisory trigger under ${item.referenceCode}: incidents impacting designated critical functions or operational resilience.`,
            slaWindow: 'Within 1 hour of discovery for severe outages',
            applicableCriticalSystems: ['Core Information Systems (CIS)', 'Customer Banking Gateway'],
            rootCauseExpectations: 'Detailed technical RCA and 14-day corrective action plan.',
            defaultRootCauseCategory: 'CYBER_ATTACK',
            recommendedIncidentTitle: `Regulatory Escalation: Incident Aligned with ${item.referenceCode}`,
            recommendedPrePopulatedSummary: `Incident declared in reference to supervisory guidelines set forth in ${item.referenceCode}: "${item.title}". Immediate containment actions enacted.`,
            recommendedContainmentChecklist: [
              'Execute immediate containment and service isolation',
              'Preserve immutable diagnostic logs and memory dumps',
              'Notify MAS Technology Risk Supervision Department within 1-hour SLA',
              'Prepare 14-day Post-Incident Investigation Report'
            ]
          },
          sourceUrl: item.sourceUrl || 'https://www.mas.gov.sg',
          tags: ['Live Grounded', item.masDomain || 'TRM', 'MAS Circular'],
          isStatutoryMandate: item.referenceCode.includes('644') || item.referenceCode.includes('655') || item.referenceCode.includes('PSN01')
        });
      }
    }

    const combinedList = [...augmentedLiveCirculars, ...MAS_CIRCULAR_MASTER_DATA];

    return {
      isLiveGrounded: !!data.isLiveGrounded,
      model: data.model || 'Gemini Search Grounded',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceCount: (data.sources || []).length,
      circulars: combinedList,
      rawExecutiveSummary: executiveSummary
    };
  } catch (err) {
    console.warn('Live regulatory fetch fallback to curated master circulars:', err);
    return {
      isLiveGrounded: false,
      model: 'SKANDA Curated Regulatory Knowledgebase',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sourceCount: 0,
      circulars: MAS_CIRCULAR_MASTER_DATA,
      rawExecutiveSummary: 'Monetary Authority of Singapore (MAS) maintains stringent supervisory focus on 1-hour statutory incident notification, cloud provider operational resilience, and Generative AI risk governance.'
    };
  }
}

/**
 * Filter circulars by search query, topic, type, and impact level
 */
export function filterMASCirculars(
  circulars: MASCircularRecord[],
  options: {
    searchQuery?: string;
    topic?: string;
    type?: string;
    impactLevel?: string;
    statutoryOnly?: boolean;
  }
): MASCircularRecord[] {
  const { searchQuery = '', topic = 'ALL', type = 'ALL', impactLevel = 'ALL', statutoryOnly = false } = options;
  const q = searchQuery.toLowerCase().trim();

  return circulars.filter(circular => {
    if (statutoryOnly && !circular.isStatutoryMandate) {
      return false;
    }

    if (type !== 'ALL' && circular.type !== type) {
      return false;
    }

    if (impactLevel !== 'ALL' && circular.impactLevel !== impactLevel) {
      return false;
    }

    if (topic !== 'ALL') {
      const topicLower = topic.toLowerCase();
      const textCorpus = `${circular.title} ${circular.summary} ${circular.tags.join(' ')} ${circular.trmDomainMapping}`.toLowerCase();
      
      if (topic === 'INCIDENT_SLA' && !textCorpus.includes('incident') && !textCorpus.includes('655') && !textCorpus.includes('1-hour')) {
        return false;
      }
      if (topic === 'CLOUD_RESILIENCE' && !textCorpus.includes('cloud') && !textCorpus.includes('resilience') && !textCorpus.includes('downtime')) {
        return false;
      }
      if (topic === 'CYBER_THREATS' && !textCorpus.includes('phishing') && !textCorpus.includes('ransomware') && !textCorpus.includes('cyber')) {
        return false;
      }
      if (topic === 'AI_GOVERNANCE' && !textCorpus.includes('ai') && !textCorpus.includes('algorithm') && !textCorpus.includes('feat')) {
        return false;
      }
      if (topic === 'PAYMENTS' && !textCorpus.includes('payment') && !textCorpus.includes('psn01') && !textCorpus.includes('fast')) {
        return false;
      }
    }

    if (q) {
      const matchesSearch =
        circular.referenceCode.toLowerCase().includes(q) ||
        circular.title.toLowerCase().includes(q) ||
        circular.summary.toLowerCase().includes(q) ||
        circular.statutoryLegalBasis.toLowerCase().includes(q) ||
        circular.keyDirectives.some(d => d.toLowerCase().includes(q)) ||
        circular.tags.some(t => t.toLowerCase().includes(q));

      if (!matchesSearch) return false;
    }

    return true;
  });
}
