/**
 * MAS TRM & Statutory Notice 644/655 Incident Severity Scoring Service
 * 
 * Implements multi-factor mathematical scoring aligned with:
 * - MAS Notice 644 (Banking Act) / Notice 655 (Payment Services Act) Section 8
 * - MAS Technology Risk Management Guidelines (2021) Section 14 (Incident Management)
 * - MAS Cyber Incident Notification Guidelines (TRS Department)
 */

export type ServiceCriticalityFactor = 
  | 'CORE_CIS_PAYMENTS'        // FAST, PayNow, MEPS+, Core Clearing (35 pts)
  | 'CORE_CIS_BANKING'         // Core Deposit, Wealth, Trading Platform (28 pts)
  | 'HIGH_PRIORITY_INTERNAL'   // Treasury, Risk Engines, Market Feeds (18 pts)
  | 'STANDARD_SUPPORTING';     // Internal Analytics, Ticketing, HR (8 pts)

export type OutageDurationFactor = 
  | 'EXCEEDS_4_HOURS'          // > 4 Hours (MAS Statutory Downtime Cap Breach) (25 pts)
  | 'BETWEEN_2_AND_4_HOURS'    // 2-4 Hours (High Severity Outage) (18 pts)
  | 'BETWEEN_1_AND_2_HOURS'    // 1-2 Hours (Material Service Disruption) (12 pts)
  | 'UNDER_1_HOUR';            // < 1 Hour (Transient / Rapid Failover) (5 pts)

export type CustomerImpactFactor = 
  | 'MASSIVE_OVER_50K'         // > 50,000 customers or interbank rail halt (20 pts)
  | 'SIGNIFICANT_10K_TO_50K'   // 10,000 - 50,000 customers (14 pts)
  | 'MODERATE_1K_TO_10K'       // 1,000 - 10,000 customers (8 pts)
  | 'LIMITED_UNDER_1K';        // < 1,000 customers (3 pts)

export type CyberCompromiseFactor = 
  | 'CRITICAL_EXFILTRATION_RANSOMWARE' // Ransomware / PII or credential exfiltration (20 pts)
  | 'CONTAINED_MALWARE_ADMIN_BREACH'   // Admin account compromised or contained malware (12 pts)
  | 'EXTERNAL_ATTACK_NO_DATA_LOSS'     // DDoS / Web defacement without data loss (7 pts)
  | 'NO_CYBER_INTERNAL_GLITCH';        // Infrastructure / Hardware fault, no cyber breach (2 pts)

export type FinancialExposureFactor = 
  | 'SEVERE_OVER_500K'         // Estimated Loss > SGD 500,000 or systemic market risk (15 pts)
  | 'MODERATE_50K_TO_500K'     // Estimated Loss SGD 50,000 - 500,000 (8 pts)
  | 'LOW_UNDER_50K';           // Estimated Loss < SGD 50,000 (2 pts)

export interface IncidentSeverityInput {
  serviceCriticality: ServiceCriticalityFactor;
  outageDuration: OutageDurationFactor;
  customerImpact: CustomerImpactFactor;
  cyberCompromise: CyberCompromiseFactor;
  financialExposure: FinancialExposureFactor;
  isCriticalInformationSystem: boolean;
}

export type MASDerivedSeverityLevel = 
  | 'SEVERITY_1_CRITICAL_SERVICE_DISRUPTION'
  | 'SEVERITY_2_MAJOR_SECURITY_EVENT'
  | 'SEVERITY_3_SIGNIFICANT_DATA_EXPOSURE'
  | 'SEVERITY_4_MINOR';

export interface SeverityScoreResult {
  totalScore: number; // 0 to 100
  derivedSeverity: MASDerivedSeverityLevel;
  severityLabel: string;
  isMandatory1HourNotice: boolean;
  regulatoryNoticeReason: string;
  riskTierBadgeColor: string;
  statutorySanctionWarning: string | null;
  factorBreakdown: {
    serviceCriticalityScore: number;
    outageDurationScore: number;
    customerImpactScore: number;
    cyberCompromiseScore: number;
    financialExposureScore: number;
  };
}

export const calculateMASIncidentSeverity = (input: IncidentSeverityInput): SeverityScoreResult => {
  let criticalityScore = 8;
  switch (input.serviceCriticality) {
    case 'CORE_CIS_PAYMENTS': criticalityScore = 35; break;
    case 'CORE_CIS_BANKING': criticalityScore = 28; break;
    case 'HIGH_PRIORITY_INTERNAL': criticalityScore = 18; break;
    case 'STANDARD_SUPPORTING': criticalityScore = 8; break;
  }

  let durationScore = 5;
  switch (input.outageDuration) {
    case 'EXCEEDS_4_HOURS': durationScore = 25; break;
    case 'BETWEEN_2_AND_4_HOURS': durationScore = 18; break;
    case 'BETWEEN_1_AND_2_HOURS': durationScore = 12; break;
    case 'UNDER_1_HOUR': durationScore = 5; break;
  }

  let customerScore = 3;
  switch (input.customerImpact) {
    case 'MASSIVE_OVER_50K': customerScore = 20; break;
    case 'SIGNIFICANT_10K_TO_50K': customerScore = 14; break;
    case 'MODERATE_1K_TO_10K': customerScore = 8; break;
    case 'LIMITED_UNDER_1K': customerScore = 3; break;
  }

  let cyberScore = 2;
  switch (input.cyberCompromise) {
    case 'CRITICAL_EXFILTRATION_RANSOMWARE': cyberScore = 20; break;
    case 'CONTAINED_MALWARE_ADMIN_BREACH': cyberScore = 12; break;
    case 'EXTERNAL_ATTACK_NO_DATA_LOSS': cyberScore = 7; break;
    case 'NO_CYBER_INTERNAL_GLITCH': cyberScore = 2; break;
  }

  let financialScore = 2;
  switch (input.financialExposure) {
    case 'SEVERE_OVER_500K': financialScore = 15; break;
    case 'MODERATE_50K_TO_500K': financialScore = 8; break;
    case 'LOW_UNDER_50K': financialScore = 2; break;
  }

  // Calculate sum (capped at 100)
  let totalScore = criticalityScore + durationScore + customerScore + cyberScore + financialScore;
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Determine Severity Level and Statutory Notice Mandate
  let derivedSeverity: MASDerivedSeverityLevel = 'SEVERITY_4_MINOR';
  let severityLabel = 'Severity 4: Minor Operational Anomaly';
  let isMandatory1HourNotice = false;
  let regulatoryNoticeReason = 'Internal ticketing and post-incident tracking. Formal 1-hour MAS notification is optional.';
  let riskTierBadgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  let statutorySanctionWarning: string | null = null;

  // Regulatory override: Core CIS rail outage or Outage > 4 hours or Total Score >= 70
  if (
    totalScore >= 70 ||
    input.serviceCriticality === 'CORE_CIS_PAYMENTS' ||
    input.outageDuration === 'EXCEEDS_4_HOURS' ||
    input.cyberCompromise === 'CRITICAL_EXFILTRATION_RANSOMWARE'
  ) {
    derivedSeverity = 'SEVERITY_1_CRITICAL_SERVICE_DISRUPTION';
    severityLabel = 'Severity 1: Critical Service Disruption / Major Cyber Incident';
    isMandatory1HourNotice = true;
    regulatoryNoticeReason = 'STATUTORILY MANDATED under MAS Notice 644/655 Cl. 8 & PSN01 Cl. 9. Must notify MAS Technology Risk Supervision Department within 60 minutes of confirmation.';
    riskTierBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    statutorySanctionWarning = 'Failure to submit notification within 1 hour constitutes a statutory offense under Section 55 of the Banking Act / Section 23 of Payment Services Act (Fines up to $100,000 + $10,000/day).';
  } else if (totalScore >= 45 || input.isCriticalInformationSystem) {
    derivedSeverity = 'SEVERITY_2_MAJOR_SECURITY_EVENT';
    severityLabel = 'Severity 2: Major Security Event / Service Degradation';
    isMandatory1HourNotice = true;
    regulatoryNoticeReason = 'STATUTORILY MANDATED: Affects Critical Information System or significant customer-facing surface. 1-Hour rapid disclosure required.';
    riskTierBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    statutorySanctionWarning = 'Mandatory disclosure within 1 hour if public-facing operations or customer funds are impeded.';
  } else if (totalScore >= 25) {
    derivedSeverity = 'SEVERITY_3_SIGNIFICANT_DATA_EXPOSURE';
    severityLabel = 'Severity 3: Moderate Operational Incident';
    isMandatory1HourNotice = false;
    regulatoryNoticeReason = 'Discretionary early warning. If condition escalates to affect core rails or customer funds, 1-hour SLA activates immediately.';
    riskTierBadgeColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
  }

  return {
    totalScore,
    derivedSeverity,
    severityLabel,
    isMandatory1HourNotice,
    regulatoryNoticeReason,
    riskTierBadgeColor,
    statutorySanctionWarning,
    factorBreakdown: {
      serviceCriticalityScore: criticalityScore,
      outageDurationScore: durationScore,
      customerImpactScore: customerScore,
      cyberCompromiseScore: cyberScore,
      financialExposureScore: financialScore
    }
  };
};

// ============================================================================
// ENHANCED AUTOMATED SEVERITY SCORING ENGINE (CUSTOMER IMPACT + FINANCIAL LOSS + REGULATORY URGENCY)
// ============================================================================

export type CustomerSegmentType =
  | 'INSTITUTIONAL_CLEARING'   // Bank clearing members, MEPS+ participants, wholesale brokerages
  | 'CORPORATE_TREASURY'       // Commercial corporate payroll, treasury liquidity desks
  | 'RETAIL_CONSUMERS'         // Consumer mobile banking, mass retail deposit accounts
  | 'WEALTH_HNW'               // Private banking, high net worth wealth portals
  | 'INTERNAL_OPERATIONS';     // Internal employees, test accounts only

export type ChannelDisruptionType =
  | 'CORE_PAYMENT_FAST_PAYNOW' // Real-time interbank rails (FAST, PayNow, MEPS+)
  | 'INTERNET_MOBILE_BANKING'  // Consumer web and mobile native applications
  | 'API_GATEWAY_INTEGRATIONS' // Open banking APIs, e-commerce payment checkouts
  | 'BRANCH_ATM_NETWORK'       // Physical branch cash dispensers, self-service kiosks
  | 'INTERNAL_BACKOFFICE';     // Data pipelines, batch accounting reconciliation

export type FundAccessImpactType =
  | 'TOTAL_LOCKOUT'            // Zero ability to withdraw funds or initiate debit transfers
  | 'DEGRADED_LATENCY'         // Severe latency (>5,000ms), intermittent transaction dropouts
  | 'READ_ONLY_BALANCE'        // Account balances visible but transaction creation disabled
  | 'NO_TRANSACTION_IMPACT';   // Purely informational or non-monetary impact

export type CyberCompromiseLevel =
  | 'ACTIVE_EXFILTRATION_RANSOMWARE' // Ransomware payload active, customer PII or card data exfiltrated
  | 'ADMIN_CREDENTIAL_COMPROMISED'   // Privileged admin/root account compromised, contained
  | 'DDOS_PERIMETER_SURGE'           // Edge volumetric flood, WAF active, zero data compromise
  | 'NONE_HARDWARE_DEFECT';          // Infrastructure, cloud provider outage or code defect

export type PublicSentimentExposure =
  | 'VIRAL_NATIONAL_PRESS'     // Top headline in mainstream news (e.g. Straits Times, CNA)
  | 'LOCALIZED_SOCIAL_MEDIA'   // Spiking complaints on Reddit, Twitter/X, Telegram
  | 'NONE_CONTAINED';          // Zero external public chatter, internal incident only

export interface DetailedSeverityCalculatorInput {
  // 1. CUSTOMER IMPACT METRICS (Max 30 pts)
  affectedCustomerCount: number;
  customerBasePercentage: number;
  customerSegment: CustomerSegmentType;
  channelDisrupted: ChannelDisruptionType;
  fundAccessImpact: FundAccessImpactType;

  // 2. FINANCIAL LOSS METRICS (Max 30 pts)
  directFinancialLossSGD: number;
  stalledTransactionVolumeSGD: number;
  potentialRegulatoryFinesRisk: boolean;
  thirdPartyContractualLiability: boolean;

  // 3. REGULATORY REPORTING URGENCY METRICS (Max 40 pts)
  isCriticalInformationSystem: boolean; // MAS TRM Guidelines Section 4 Designated CIS
  projectedOutageDurationMinutes: number; // MAS TRM Cl. 5.3 statutory annual cap = 240 mins (4 hrs)
  interbankContagionRisk: boolean; // Threatens broader Singapore financial clearing stability
  cyberCompromiseLevel: CyberCompromiseLevel;
  minutesElapsedSinceDiscovery: number; // Against the 60-minute statutory deadline (Notice 644/655 Cl. 8)
  publicSentimentExposure: PublicSentimentExposure;
}

export interface DetailedSeverityScoreResult {
  compositeScore: number; // 0 to 100
  customerImpactScore: number; // 0 to 30
  financialLossScore: number; // 0 to 30
  regulatoryUrgencyScore: number; // 0 to 40
  severityTier: MASDerivedSeverityLevel;
  severityLabel: string;
  badgeColor: string;
  isStatutory1HourNoticeMandatory: boolean;
  statutoryDeadlineMinutesRemaining: number;
  statutoryNoticeReason: string;
  statutoryPenaltiesRiskSummary: string;
  customerImpactLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  financialLossLevel: 'Catastrophic' | 'Material' | 'Moderate' | 'Negligible';
  regulatoryUrgencyLevel: 'Emergency (Immediate Filing)' | 'High Statutory Urgency' | 'Moderate Vigilance' | 'Standard Internal Logging';
  recommendedActions: string[];
  radarBreakdown: {
    customerImpactPercent: number;
    financialLossPercent: number;
    regulatoryUrgencyPercent: number;
  };
}

export const calculateDetailedMASIncidentSeverity = (
  input: DetailedSeverityCalculatorInput
): DetailedSeverityScoreResult => {
  // --------------------------------------------------------------------------
  // 1. CUSTOMER IMPACT SCORING (0 to 30 pts)
  // --------------------------------------------------------------------------
  let customerScore = 0;

  // 1a. Absolute Customer Count (0 - 12 pts)
  if (input.affectedCustomerCount >= 50000) {
    customerScore += 12;
  } else if (input.affectedCustomerCount >= 10000) {
    customerScore += 9;
  } else if (input.affectedCustomerCount >= 1000) {
    customerScore += 6;
  } else if (input.affectedCustomerCount >= 100) {
    customerScore += 3;
  } else if (input.affectedCustomerCount > 0) {
    customerScore += 1;
  }

  // 1b. Customer Base Percentage (0 - 6 pts)
  if (input.customerBasePercentage >= 25) {
    customerScore += 6;
  } else if (input.customerBasePercentage >= 10) {
    customerScore += 4;
  } else if (input.customerBasePercentage >= 2) {
    customerScore += 2;
  } else if (input.customerBasePercentage > 0) {
    customerScore += 1;
  }

  // 1c. Customer Segment (0 - 5 pts)
  switch (input.customerSegment) {
    case 'INSTITUTIONAL_CLEARING':
      customerScore += 5;
      break;
    case 'CORPORATE_TREASURY':
      customerScore += 4;
      break;
    case 'RETAIL_CONSUMERS':
      customerScore += 4;
      break;
    case 'WEALTH_HNW':
      customerScore += 3;
      break;
    case 'INTERNAL_OPERATIONS':
      customerScore += 1;
      break;
  }

  // 1d. Fund Access & Transaction Impact (0 - 5 pts)
  switch (input.fundAccessImpact) {
    case 'TOTAL_LOCKOUT':
      customerScore += 5;
      break;
    case 'DEGRADED_LATENCY':
      customerScore += 3;
      break;
    case 'READ_ONLY_BALANCE':
      customerScore += 2;
      break;
    case 'NO_TRANSACTION_IMPACT':
      customerScore += 0;
      break;
  }

  // 1e. Channel Disruption (0 - 2 pts)
  if (input.channelDisrupted === 'CORE_PAYMENT_FAST_PAYNOW') {
    customerScore += 2;
  } else if (input.channelDisrupted === 'INTERNET_MOBILE_BANKING') {
    customerScore += 2;
  } else if (input.channelDisrupted === 'API_GATEWAY_INTEGRATIONS') {
    customerScore += 1;
  }

  const finalCustomerScore = Math.min(30, Math.max(0, customerScore));

  // --------------------------------------------------------------------------
  // 2. FINANCIAL LOSS & TRANSACTION VOLUME SCORING (0 to 30 pts)
  // --------------------------------------------------------------------------
  let financialScore = 0;

  // 2a. Direct Financial Loss in SGD (0 - 12 pts)
  if (input.directFinancialLossSGD >= 1000000) {
    financialScore += 12;
  } else if (input.directFinancialLossSGD >= 250000) {
    financialScore += 9;
  } else if (input.directFinancialLossSGD >= 50000) {
    financialScore += 6;
  } else if (input.directFinancialLossSGD >= 10000) {
    financialScore += 3;
  } else if (input.directFinancialLossSGD > 0) {
    financialScore += 1;
  }

  // 2b. Stalled / Failed Transaction Volume in SGD (0 - 8 pts)
  if (input.stalledTransactionVolumeSGD >= 10000000) {
    financialScore += 8;
  } else if (input.stalledTransactionVolumeSGD >= 2000000) {
    financialScore += 6;
  } else if (input.stalledTransactionVolumeSGD >= 250000) {
    financialScore += 4;
  } else if (input.stalledTransactionVolumeSGD > 0) {
    financialScore += 2;
  }

  // 2c. Potential Statutory Regulatory Penalties (0 - 5 pts)
  if (input.potentialRegulatoryFinesRisk) {
    financialScore += 5;
  }

  // 2d. Third-Party Contractual Liabilities & SLA Liquidated Damages (0 - 5 pts)
  if (input.thirdPartyContractualLiability) {
    financialScore += 5;
  }

  const finalFinancialScore = Math.min(30, Math.max(0, financialScore));

  // --------------------------------------------------------------------------
  // 3. REGULATORY REPORTING URGENCY SCORING (0 to 40 pts)
  // --------------------------------------------------------------------------
  let regulatoryScore = 0;

  // 3a. System Classification (0 - 12 pts)
  if (input.isCriticalInformationSystem) {
    regulatoryScore += 8;
  }
  if (input.channelDisrupted === 'CORE_PAYMENT_FAST_PAYNOW') {
    regulatoryScore += 4;
  } else if (input.channelDisrupted === 'INTERNET_MOBILE_BANKING') {
    regulatoryScore += 2;
  }

  // 3b. Projected Outage Duration vs MAS 4-Hour Cap (0 - 10 pts)
  // Under MAS TRM Guidelines Cl. 5.3, unscheduled downtime of CIS must not exceed 4 hours in any 12-month period
  if (input.projectedOutageDurationMinutes >= 240) {
    regulatoryScore += 10;
  } else if (input.projectedOutageDurationMinutes >= 120) {
    regulatoryScore += 7;
  } else if (input.projectedOutageDurationMinutes >= 60) {
    regulatoryScore += 5;
  } else if (input.projectedOutageDurationMinutes >= 20) {
    regulatoryScore += 2;
  }

  // 3c. Interbank Contagion & Financial System Stability Risk (0 - 6 pts)
  if (input.interbankContagionRisk) {
    regulatoryScore += 6;
  }

  // 3d. Cyber Exfiltration & Data Confidentiality (0 - 6 pts)
  switch (input.cyberCompromiseLevel) {
    case 'ACTIVE_EXFILTRATION_RANSOMWARE':
      regulatoryScore += 6;
      break;
    case 'ADMIN_CREDENTIAL_COMPROMISED':
      regulatoryScore += 4;
      break;
    case 'DDOS_PERIMETER_SURGE':
      regulatoryScore += 2;
      break;
    case 'NONE_HARDWARE_DEFECT':
      regulatoryScore += 0;
      break;
  }

  // 3e. Discovery Clock Urgency (0 - 4 pts)
  // Minutes elapsed against 60-minute statutory deadline under MAS Notice 644/655 Cl. 8
  if (input.minutesElapsedSinceDiscovery >= 45) {
    regulatoryScore += 4;
  } else if (input.minutesElapsedSinceDiscovery >= 30) {
    regulatoryScore += 3;
  } else if (input.minutesElapsedSinceDiscovery >= 15) {
    regulatoryScore += 2;
  } else {
    regulatoryScore += 1;
  }

  // 3f. Public Sentiment & Press Exposure (0 - 2 pts)
  if (input.publicSentimentExposure === 'VIRAL_NATIONAL_PRESS') {
    regulatoryScore += 2;
  } else if (input.publicSentimentExposure === 'LOCALIZED_SOCIAL_MEDIA') {
    regulatoryScore += 1;
  }

  const finalRegulatoryScore = Math.min(40, Math.max(0, regulatoryScore));

  // --------------------------------------------------------------------------
  // COMPOSITE SCORE & STATUTORY SEVERITY DERIVATION
  // --------------------------------------------------------------------------
  const compositeScore = finalCustomerScore + finalFinancialScore + finalRegulatoryScore;

  // Minutes remaining in statutory 60-minute window
  const statutoryDeadlineMinutesRemaining = Math.max(0, 60 - input.minutesElapsedSinceDiscovery);

  // Default classification values
  let severityTier: MASDerivedSeverityLevel = 'SEVERITY_4_MINOR';
  let severityLabel = 'Severity 4: Minor Operational Anomaly';
  let badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  let isStatutory1HourNoticeMandatory = false;
  let statutoryNoticeReason = 'Internal operational anomaly. Standard post-incident ticketing applies. Formal 1-hour MAS notification is optional.';
  let statutoryPenaltiesRiskSummary = 'Low risk of statutory sanctions, provided internal incident logs are maintained for annual supervisory audit.';

  // Regulatory overrides and thresholds
  const isAutomaticSeverity1 =
    compositeScore >= 70 ||
    input.channelDisrupted === 'CORE_PAYMENT_FAST_PAYNOW' ||
    input.projectedOutageDurationMinutes >= 240 ||
    input.cyberCompromiseLevel === 'ACTIVE_EXFILTRATION_RANSOMWARE' ||
    (input.isCriticalInformationSystem && input.fundAccessImpact === 'TOTAL_LOCKOUT');

  if (isAutomaticSeverity1) {
    severityTier = 'SEVERITY_1_CRITICAL_SERVICE_DISRUPTION';
    severityLabel = 'Severity 1: Critical Service Disruption / Major Cyber Incident';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    isStatutory1HourNoticeMandatory = true;
    statutoryNoticeReason =
      'STATUTORILY MANDATED under MAS Notice 644/655 Cl. 8 & Notice PSN01 Cl. 9. Must submit formal written notification to MAS Technology Risk Supervision Department within 60 minutes of confirmation.';
    statutoryPenaltiesRiskSummary =
      'Statutory offense under Section 55 Banking Act / Section 23 Payment Services Act. Default carries fines up to SGD 100,000 plus SGD 10,000 for every day default continues, alongside mandatory supervisory capital buffer adjustments.';
  } else if (compositeScore >= 45 || input.isCriticalInformationSystem) {
    severityTier = 'SEVERITY_2_MAJOR_SECURITY_EVENT';
    severityLabel = 'Severity 2: Major Security Event / Service Degradation';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    isStatutory1HourNoticeMandatory = true;
    statutoryNoticeReason =
      'STATUTORILY MANDATED: Affects designated Critical Information System (CIS) or material customer transactional capacity. 1-Hour rapid disclosure to MAS required.';
    statutoryPenaltiesRiskSummary =
      'Mandatory disclosure within 1 hour. Late filing may trigger formal MAS Supervisory Letter of Inquiry and heightened audit inspection frequency.';
  } else if (compositeScore >= 25) {
    severityTier = 'SEVERITY_3_SIGNIFICANT_DATA_EXPOSURE';
    severityLabel = 'Severity 3: Moderate Operational Incident';
    badgeColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    isStatutory1HourNoticeMandatory = false;
    statutoryNoticeReason =
      'Discretionary early notification recommended if customer complaint volume escalates or root cause diagnostic is indeterminate within 45 minutes.';
    statutoryPenaltiesRiskSummary = 'Internal operational risk review required. Must be archived in quarterly operational risk dashboard for MAS inspection.';
  }

  // Qualitative sub-levels for executive reporting
  const customerImpactLevel: 'Critical' | 'High' | 'Moderate' | 'Low' =
    finalCustomerScore >= 22 ? 'Critical' : finalCustomerScore >= 14 ? 'High' : finalCustomerScore >= 7 ? 'Moderate' : 'Low';

  const financialLossLevel: 'Catastrophic' | 'Material' | 'Moderate' | 'Negligible' =
    finalFinancialScore >= 22 ? 'Catastrophic' : finalFinancialScore >= 14 ? 'Material' : finalFinancialScore >= 6 ? 'Moderate' : 'Negligible';

  const regulatoryUrgencyLevel: 'Emergency (Immediate Filing)' | 'High Statutory Urgency' | 'Moderate Vigilance' | 'Standard Internal Logging' =
    isStatutory1HourNoticeMandatory
      ? (statutoryDeadlineMinutesRemaining <= 15 ? 'Emergency (Immediate Filing)' : 'High Statutory Urgency')
      : (finalRegulatoryScore >= 15 ? 'Moderate Vigilance' : 'Standard Internal Logging');

  // Tailored recommended actions
  const recommendedActions: string[] = [];
  if (isStatutory1HourNoticeMandatory) {
    recommendedActions.push(`Dispatch formal 1-Hour Incident Notification to MAS TRS Department immediately (${statutoryDeadlineMinutesRemaining}m remaining).`);
    recommendedActions.push('Convene Executive Incident Management Team (IMT) including CISO, CEO, and Head of Compliance.');
    recommendedActions.push('Establish immutable audit log freeze and commence volatile memory capture for 14-day Root Cause Analysis.');
  } else {
    recommendedActions.push('Log incident in internal GRC Incident Register with assigned ticket ID.');
    recommendedActions.push('Monitor telemetry for 30 minutes; escalate to MAS notification if service degradation spreads to core rails.');
  }

  if (input.projectedOutageDurationMinutes >= 180) {
    recommendedActions.push('ALERT: Approaching MAS 4-hour statutory cumulative CIS downtime cap (Section 5.3). Trigger Secondary Disaster Recovery Hot Site failover.');
  }

  if (input.directFinancialLossSGD >= 250000 || input.stalledTransactionVolumeSGD >= 2000000) {
    recommendedActions.push('Notify Corporate Treasury and Reinsurance broker of potential financial liability exposure.');
  }

  if (input.cyberCompromiseLevel === 'ACTIVE_EXFILTRATION_RANSOMWARE') {
    recommendedActions.push('Engage external cyber incident response retainer and notify Singapore Cyber Security Agency (CSA / SingCERT).');
  }

  return {
    compositeScore,
    customerImpactScore: finalCustomerScore,
    financialLossScore: finalFinancialScore,
    regulatoryUrgencyScore: finalRegulatoryScore,
    severityTier,
    severityLabel,
    badgeColor,
    isStatutory1HourNoticeMandatory,
    statutoryDeadlineMinutesRemaining,
    statutoryNoticeReason,
    statutoryPenaltiesRiskSummary,
    customerImpactLevel,
    financialLossLevel,
    regulatoryUrgencyLevel,
    recommendedActions,
    radarBreakdown: {
      customerImpactPercent: Math.round((finalCustomerScore / 30) * 100),
      financialLossPercent: Math.round((finalFinancialScore / 30) * 100),
      regulatoryUrgencyPercent: Math.round((finalRegulatoryScore / 40) * 100)
    }
  };
};

// ============================================================================
// STANDARD INDUSTRY SCENARIO PRESETS
// ============================================================================

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  input: DetailedSeverityCalculatorInput;
}

export const MAS_SEVERITY_SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'preset_fast_paynow_outage',
    name: 'FAST & PayNow Interbank Settlement Rail Timeout',
    description: 'Core transaction routing node encounters connection pool saturation; customer payments stall across banking apps.',
    category: 'Payment Infrastructure',
    input: {
      affectedCustomerCount: 42000,
      customerBasePercentage: 18,
      customerSegment: 'RETAIL_CONSUMERS',
      channelDisrupted: 'CORE_PAYMENT_FAST_PAYNOW',
      fundAccessImpact: 'TOTAL_LOCKOUT',
      directFinancialLossSGD: 120000,
      stalledTransactionVolumeSGD: 8500000,
      potentialRegulatoryFinesRisk: true,
      thirdPartyContractualLiability: true,
      isCriticalInformationSystem: true,
      projectedOutageDurationMinutes: 110,
      interbankContagionRisk: true,
      cyberCompromiseLevel: 'NONE_HARDWARE_DEFECT',
      minutesElapsedSinceDiscovery: 22,
      publicSentimentExposure: 'LOCALIZED_SOCIAL_MEDIA'
    }
  },
  {
    id: 'preset_ransomware_trade_finance',
    name: 'Ransomware Detected on Trade Finance & Credit Portal',
    description: 'Active malware infection with potential exfiltration of sensitive corporate KYC dossiers and letters of credit.',
    category: 'Cyber Security Breach',
    input: {
      affectedCustomerCount: 15000,
      customerBasePercentage: 8,
      customerSegment: 'CORPORATE_TREASURY',
      channelDisrupted: 'API_GATEWAY_INTEGRATIONS',
      fundAccessImpact: 'TOTAL_LOCKOUT',
      directFinancialLossSGD: 750000,
      stalledTransactionVolumeSGD: 4200000,
      potentialRegulatoryFinesRisk: true,
      thirdPartyContractualLiability: true,
      isCriticalInformationSystem: true,
      projectedOutageDurationMinutes: 280,
      interbankContagionRisk: false,
      cyberCompromiseLevel: 'ACTIVE_EXFILTRATION_RANSOMWARE',
      minutesElapsedSinceDiscovery: 48,
      publicSentimentExposure: 'VIRAL_NATIONAL_PRESS'
    }
  },
  {
    id: 'preset_db_replica_lag',
    name: 'Core Banking Read-Replica Synchronization Lag',
    description: 'Database read replicas lag by 12 minutes following an automated database index rollout, causing UI timeout errors.',
    category: 'Operational / Software',
    input: {
      affectedCustomerCount: 3800,
      customerBasePercentage: 2.5,
      customerSegment: 'RETAIL_CONSUMERS',
      channelDisrupted: 'INTERNET_MOBILE_BANKING',
      fundAccessImpact: 'DEGRADED_LATENCY',
      directFinancialLossSGD: 28000,
      stalledTransactionVolumeSGD: 420000,
      potentialRegulatoryFinesRisk: false,
      thirdPartyContractualLiability: false,
      isCriticalInformationSystem: true,
      projectedOutageDurationMinutes: 45,
      interbankContagionRisk: false,
      cyberCompromiseLevel: 'NONE_HARDWARE_DEFECT',
      minutesElapsedSinceDiscovery: 15,
      publicSentimentExposure: 'NONE_CONTAINED'
    }
  },
  {
    id: 'preset_ddos_waf_contained',
    name: 'Volumetric DDoS Attack on Public Web Application',
    description: 'Edge cloud WAF absorbs 450 Gbps volumetric flood; latency increases briefly but customer sessions remain secure.',
    category: 'Cyber Perimeter',
    input: {
      affectedCustomerCount: 850,
      customerBasePercentage: 0.6,
      customerSegment: 'RETAIL_CONSUMERS',
      channelDisrupted: 'INTERNET_MOBILE_BANKING',
      fundAccessImpact: 'DEGRADED_LATENCY',
      directFinancialLossSGD: 8500,
      stalledTransactionVolumeSGD: 95000,
      potentialRegulatoryFinesRisk: false,
      thirdPartyContractualLiability: false,
      isCriticalInformationSystem: false,
      projectedOutageDurationMinutes: 30,
      interbankContagionRisk: false,
      cyberCompromiseLevel: 'DDOS_PERIMETER_SURGE',
      minutesElapsedSinceDiscovery: 10,
      publicSentimentExposure: 'NONE_CONTAINED'
    }
  },
  {
    id: 'preset_batch_payroll_delay',
    name: 'Internal Batch Payroll Reconciliation Delay (<30m)',
    description: 'End-of-day clearing batch runs 28 minutes late due to scheduled storage volume snapshot; zero transaction loss.',
    category: 'Backoffice / Routine',
    input: {
      affectedCustomerCount: 0,
      customerBasePercentage: 0,
      customerSegment: 'INTERNAL_OPERATIONS',
      channelDisrupted: 'INTERNAL_BACKOFFICE',
      fundAccessImpact: 'NO_TRANSACTION_IMPACT',
      directFinancialLossSGD: 1200,
      stalledTransactionVolumeSGD: 0,
      potentialRegulatoryFinesRisk: false,
      thirdPartyContractualLiability: false,
      isCriticalInformationSystem: false,
      projectedOutageDurationMinutes: 28,
      interbankContagionRisk: false,
      cyberCompromiseLevel: 'NONE_HARDWARE_DEFECT',
      minutesElapsedSinceDiscovery: 5,
      publicSentimentExposure: 'NONE_CONTAINED'
    }
  }
];

