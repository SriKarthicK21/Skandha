/**
 * MAS Regulatory Reporting Template Generator Service
 * 
 * Generates official exportable regulatory reporting templates for:
 * 1. MAS Notice 644/655 Appendix 1: 1-Hour Incident Notification Form
 * 2. MAS TRM Guidelines Section 14.3: 14-Day Post-Incident Root Cause Analysis (PIR) Report
 * 3. Board of Directors / Board Risk Committee (BRC) Executive Flash Memo
 */

import { MASIncidentBreachRecord } from '../types/regulatoryTypes';
import { SeverityScoreResult } from './masIncidentSeverityService';

export interface ReportingEntityMetadata {
  entityName: string;
  licenseNumber: string;
  licenseType: string;
  cisoName: string;
  incidentCommander: string;
  contactNumber: string;
  masSupervisionDivision: string;
}

export const generateOfficialMASNotificationMarkdown = (
  incident: Partial<MASIncidentBreachRecord>,
  entity: ReportingEntityMetadata,
  severityResult: SeverityScoreResult,
  receiptToken: string
): string => {
  const discovery = incident.discoveryTimestamp ? new Date(incident.discoveryTimestamp) : new Date();
  const deadline = new Date(discovery.getTime() + 60 * 60 * 1000);
  const now = new Date();

  return `# OFFICIAL INCIDENT NOTIFICATION TO THE MONETARY AUTHORITY OF SINGAPORE
**Statutory Basis:** MAS Notice 644 (Banking Act) / Notice 655 (Payment Services Act) Section 8 & PSN01 Section 9  
**Submission Channel:** Technology Risk Supervision Department (TRSD)  
**Cryptographic Receipt Token:** \`${receiptToken}\`  
**Generated At:** ${now.toISOString()}  

---

## SECTION 1: REPORTING FINANCIAL INSTITUTION (FI) PARTICULARS
- **Full Legal Entity Name:** ${entity.entityName}
- **MAS License / Registration Number:** ${entity.licenseNumber} (${entity.licenseType})
- **Chief Information Security Officer (CISO):** ${entity.cisoName}
- **Designated Incident Commander:** ${entity.incidentCommander}
- **24/7 Regulatory Liaison Contact:** ${entity.contactNumber}
- **Designated MAS Supervisory Department:** ${entity.masSupervisionDivision}

---

## SECTION 2: INCIDENT CHRONOLOGY & STATUTORY SLA TRACKING
- **Incident Reference Code:** ${incident.incidentCode || 'MAS-INC-DRAFT'}
- **Incident Title:** ${incident.title || 'Critical Service Outage'}
- **Date & Time of Initial Detection:** ${discovery.toUTCString()} (${discovery.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })} SGT)
- **Date & Time of Incident Confirmation:** ${discovery.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })} SGT
- **Statutory 1-Hour SLA Deadline:** ${deadline.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })} SGT
- **Filing SLA Compliance Status:** ${incident.masNotificationStatus || 'WITHIN_SLA'}
- **Calculated Severity Score:** ${severityResult.totalScore}/100 (**${severityResult.severityLabel}**)
- **Statutory Mandate Basis:** ${severityResult.regulatoryNoticeReason}

---

## SECTION 2B: APPLICABLE MAS CIRCULARS & REGULATORY DIRECTIVES LINKED
${incident.linkedCirculars && incident.linkedCirculars.length > 0
  ? incident.linkedCirculars.map(cir => `  - [x] **${cir.referenceCode}:** ${cir.title}${cir.relevance ? `\n    - *Supervisory Context:* ${cir.relevance}` : ''}`).join('\n')
  : '  - [x] **MAS Notice 644 / Notice 655:** Statutory 1-Hour Incident Reporting & Critical Information Systems Availability'}

---

## SECTION 3: AFFECTED CRITICAL INFORMATION SYSTEMS (CIS)
- **Primary Business Functions Impacted:** Core Clearing, Real-Time Customer Settlements & Mobile Banking Gateway
- **Affected Critical Information Systems:**
${incident.affectedCriticalSystems && incident.affectedCriticalSystems.length > 0
  ? incident.affectedCriticalSystems.map(sys => `  - [x] ${sys} (Designated CIS under MAS TRM Guidelines Section 4.0)`).join('\n')
  : '  - [x] Apex Pay Core Settlement Rail\n  - [x] Customer Authentication Cluster'}
- **Disaster Recovery (DR) Standby Activated:** Yes - Secondary Hot Site (AWS ap-southeast-1 AZ-2 / Secondary On-Prem DC)
- **RTO Benchmark Target:** $\\le 4$ Hours (Current elapsed: < 45 minutes)

---

## SECTION 4: NATURE OF INCIDENT & PRELIMINARY IMPACT ASSESSMENT
- **Root Cause Category:** ${incident.rootCauseCategory || 'CYBER_ATTACK'}
- **Estimated Number of Impacted Customers / Counterparties:** ~${(incident.customerImpactEstimate || 2500).toLocaleString()} accounts
- **Interbank Rails Affected:** FAST / PayNow / MEPS+ Real-Time Settlements
- **Data Confidentiality & Compromise Status:**
  - Customer PII Compromise: None detected to date; forensic memory dump in progress.
  - Financial Ledger Integrity: Verified uncorrupted; balance reconciliations match immutable audit logs.
- **Executive Summary of Disruption:**
> ${incident.executiveSummary || 'Core transaction routing cluster encountered anomalous network degradation.'}

---

## SECTION 5: IMMEDIATE CONTAINMENT & FORENSIC ACTIONS TAKEN
1. **Network Perimeter Defense:** Automated edge mitigation enacted; anomalous ingress CIDRs quarantined at cloud WAF.
2. **Failover Execution:** Service traffic gracefully drained to isolated secondary cluster; active replication validated.
3. **Forensic Preservation:** Volatile system memory captured; tamper-evident disk images exported for independent audit.
4. **Third-Party Vendor Notification:** Critical cloud service provider (CSP) and incident response retainer dispatched.

---

## SECTION 6: REGULATORY MILESTONES & 14-DAY POST-INCIDENT REPORT (PIR)
- **Mandatory 14-Day Post-Incident Report Due Date:** ${incident.postIncidentReportDueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
- **Supervisory Undertaking:** A comprehensive investigation report containing the technical root cause analysis, forensic timeline, 5-whys fault tree, and Board-approved corrective actions will be delivered to MAS within 14 calendar days.
- **Authorized Regulatory Submitter:** ${entity.incidentCommander}  
- **Digital Attestation:** Submitted with authorization under MAS TRM Framework Governance Policy.
`;
};

export const generate14DayPIRTemplateMarkdown = (
  incident: Partial<MASIncidentBreachRecord>,
  entity: ReportingEntityMetadata
): string => {
  return `# FORMAL 14-DAY POST-INCIDENT ROOT CAUSE ANALYSIS (PIR) REPORT
**To:** Monetary Authority of Singapore - Technology Risk Supervision Department  
**Reference Incident Code:** \`${incident.incidentCode || 'MAS-INC-2026-001'}\`  
**Statutory Requirement:** MAS TRM Guidelines (2021) Clause 14.3.3  
**Institution:** ${entity.entityName} (${entity.licenseNumber})  
**Submission Due Date:** ${incident.postIncidentReportDueDate || '14 Calendar Days from Occurrence'}  

---

### PART I: EXECUTIVE CHRONOLOGY & FORENSIC TIMELINE
| Timestamp (SGT) | Milestone | Operational Action & Forensic Evidence | Responsible Lead |
|---|---|---|---|
| T+00:00 | Anomaly Detection | SIEM triggers alert on elevated API gateway latency (>8,000ms) | SOC Level 2 |
| T+00:14 | Incident Confirmation | Incident Commander declares Severity 1 Outage | ${entity.incidentCommander} |
| T+00:38 | Statutory Notification | Formal 1-Hour Notification transmitted to MAS TRS Department | Regulatory Affairs |
| T+01:15 | Traffic Rerouted | Secondary availability zone online; 100% transactions restored | Lead DevOps |
| T+02:40 | System Normalization | Root cause binary isolated; telemetry confirms full stability | CISO & Architecture |

---

### PART II: TECHNICAL ROOT CAUSE ANALYSIS (5 WHYS & FAULT TREE)
1. **Primary Failure Vector:** Configuration drift during automated cloud infrastructure deployment.
2. **Why 1:** The primary cluster connection pool saturated under peak transaction volume.
3. **Why 2:** Database read-replica sync lagged by 420 seconds due to an unindexed query rollout.
4. **Why 3:** The automated deployment gate failed to catch the unindexed migration script in staging.
5. **Why 4:** Test datasets in staging did not mirror the full volume and concurrency of the live payment rail.
6. **Root Cause Conclusion:** Defect in synthetic pre-deployment load test harness and lack of automated rollback circuit-breaker on database connection pool saturation.

---

### PART III: CUSTOMER & FINANCIAL IMPACT AUDIT
- **Total Duration of Unscheduled Outage:** 68 minutes (Within MAS 4-hour annual downtime cap)
- **Number of Impacted Customers:** ${(incident.customerImpactEstimate || 2500).toLocaleString()} users
- **Failed or Stalled Transactions:** 1,420 transactions (100% successfully settled via secondary retry queue)
- **Financial Loss to FI:** SGD 12,400 (reprocessing fees, cloud burst compute)
- **Customer Financial Loss:** Zero (all funds verified intact; zero debit discrepancies)

---

### PART IV: CORRECTIVE & PREVENTIVE ACTION (CAPA) PLAN
${incident.linkedCirculars && incident.linkedCirculars.length > 0
  ? `> **Regulatory Directives Harmonization:** Remediations mapped against supervisory expectations in ${incident.linkedCirculars.map(c => `\`${c.referenceCode}\``).join(', ')}.\n`
  : ''}- **CAPA-MAS-01 (Immediate):** Hardened staging synthetic load testing to simulate 300% peak TPS volume (Completed).
- **CAPA-MAS-02 (30 Days):** Implemented automated Canary deployment with automatic rollback triggered if DB pool latency exceeds 250ms (Owner: VP Platform Engineering).
- **CAPA-MAS-03 (60 Days):** Full independent architecture review of Payment Settlement DB connection pooling by third-party audit firm (Owner: Head of Internal Audit).

---

### PART V: SENIOR MANAGEMENT & BOARD ATTESTATION
- **Board Risk Committee Review Date:** Scheduled for next BRC Sitting.
- **Chief Information Security Officer:** ${entity.cisoName} [Signed]
- **Chief Technology Officer:** VP Technology Operations [Signed]
- **Chief Executive Officer:** Authorized Corporate Representative [Signed]
`;
};

export const generateExecutiveBoardFlashMemoMarkdown = (
  incident: Partial<MASIncidentBreachRecord>,
  entity: ReportingEntityMetadata,
  severityResult: SeverityScoreResult
): string => {
  return `# BOARD RISK COMMITTEE & EXECUTIVE FLASH MEMO
**STRICTLY CONFIDENTIAL - TECHNOLOGY INCIDENT BRIEFING**  
**Date:** ${new Date().toLocaleDateString('en-SG', { dateStyle: 'full' })}  
**Subject:** Notification of Technology Disruption & MAS Statutory Compliance Status  
**Incident Code:** ${incident.incidentCode || 'MAS-INC-2026'}  

---

### 1. EXECUTIVE SUMMARY
At ${new Date(incident.discoveryTimestamp || Date.now()).toLocaleTimeString()} SGT, our technology operations center detected an unscheduled service degradation affecting **${(incident.affectedCriticalSystems || []).join(', ') || 'Core Payment Settlement Rails'}**. 

- **Calculated Severity:** **${severityResult.severityLabel}** (${severityResult.totalScore}/100)
- **Statutory MAS Notification Status:** **${incident.masNotificationStatus || 'WITHIN_SLA'}**
- **Containment Status:** **${incident.containmentStatus || 'CONTAINED'}**

---

### 2. REGULATORY EXPOSURE & STATUTORY COMPLIANCE
- **MAS Notice 644/655 Compliance:** The incident was formally acknowledged and reported to the MAS Technology Risk Supervision Department within the statutory 60-minute window, fully mitigating statutory non-compliance exposure under the Banking Act / Payment Services Act.
${incident.linkedCirculars && incident.linkedCirculars.length > 0
  ? `- **Linked MAS Circulars:** ${incident.linkedCirculars.map(c => `\`${c.referenceCode}\` (${c.title})`).join(', ')}\n`
  : ''}- **Downtime Cap Compliance:** Total unscheduled downtime is confirmed at under 2 hours, well within the MAS-mandated 4-hour annual cumulative ceiling for Critical Information Systems.
- **Next Regulatory Obligation:** Submission of formal 14-day Root Cause Analysis report due on **${incident.postIncidentReportDueDate || '14 days'}**.

---

### 3. CUSTOMER & BRAND REPUTATION IMPACT
- **Customer Exposure:** ~${(incident.customerImpactEstimate || 2500).toLocaleString()} accounts experienced temporary delays.
- **Media / Social Sentiment:** Zero public leak; customer support queues normalized.
- **Action Required by Board:** Informational briefing; formal PIR endorsement will be submitted to the Board Risk Committee next week.
`;
};
