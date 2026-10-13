export interface CorporateEntity {
  id: string;
  name: string;
  legalIdentifier: string;
  countryCode: string;
  countryName: string;
  flag: string;
  region: string;
  regulatoryJurisdiction: string;
  primaryRegulator: string;
  mandatedFrameworks: string[];
  recommendedFrameworkId: string;
  currency: string;
  activeDpo: string;
  leadAuditor: string;
  readinessScore: number;
}

export const CORPORATE_ENTITIES: CorporateEntity[] = [
  {
    id: 'entity_uk_global',
    name: 'SKANDA Global Holdings Ltd',
    legalIdentifier: 'UK-CRN-11948201',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Global & Europe HQ',
    regulatoryJurisdiction: 'United Kingdom / International',
    primaryRegulator: 'Information Commissioner\'s Office (ICO) & UK FCA',
    mandatedFrameworks: ['ISO/IEC 27001:2022', 'ISO/IEC 42001:2023', 'ISO 27701:2019', 'SOC 2 Type II'],
    recommendedFrameworkId: 'ISO/IEC 27001:2022',
    currency: 'GBP (£)',
    activeDpo: 'Eleanor Vance, CIPP/E',
    leadAuditor: 'BSI Group UK (Lead: David Vance)',
    readinessScore: 88
  },
  {
    id: 'entity_sg',
    name: 'SKANDA Technologies Singapore Pte Ltd',
    legalIdentifier: 'SG-UEN-202039182K',
    countryCode: 'SG',
    countryName: 'Singapore',
    flag: '🇸🇬',
    region: 'Southeast Asia / ASEAN',
    regulatoryJurisdiction: 'Singapore (Monetary Authority of Singapore)',
    primaryRegulator: 'Monetary Authority of Singapore (MAS)',
    mandatedFrameworks: ['MAS TRM 2021', 'MAS Notice 644/655', 'Singapore PDPA', 'ISO/IEC 27001:2022'],
    recommendedFrameworkId: 'MAS TRM 2021',
    currency: 'SGD (S$)',
    activeDpo: 'Tan Wei Ming, CISM',
    leadAuditor: 'MAS Regulatory Inspection Directorate',
    readinessScore: 92
  },
  {
    id: 'entity_in',
    name: 'SKANDA Digital Systems India Pvt Ltd',
    legalIdentifier: 'IN-CIN-U72900KA2021PTC148922',
    countryCode: 'IN',
    countryName: 'India',
    flag: '🇮🇳',
    region: 'South Asia / Bangalore Hub',
    regulatoryJurisdiction: 'Republic of India',
    primaryRegulator: 'Data Protection Board of India (DPBI) & CERT-In',
    mandatedFrameworks: ['India DPDP Act 2023', 'CERT-In Cyber Directives', 'ISO/IEC 27001:2022'],
    recommendedFrameworkId: 'India DPDP Act 2023',
    currency: 'INR (₹)',
    activeDpo: 'Kavita Sundaram, Advocate & DPO',
    leadAuditor: 'STQC / Ministry of Electronics & IT (MeitY)',
    readinessScore: 84
  },
  {
    id: 'entity_us',
    name: 'SKANDA Cloud Americas Corp',
    legalIdentifier: 'US-DEL-5839201',
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    region: 'North America / Delaware',
    regulatoryJurisdiction: 'United States & California (CCPA/CPRA)',
    primaryRegulator: 'AICPA, HHS (HIPAA), SEC Cyber Rules',
    mandatedFrameworks: ['SOC 2 Type II', 'NIST CSF 2.0', 'HIPAA Security', 'ISO/IEC 27001:2022'],
    recommendedFrameworkId: 'SOC 2 Type II',
    currency: 'USD ($)',
    activeDpo: 'Marcus Brody, Esq.',
    leadAuditor: 'Ernst & Young LLP (Tech Assurance)',
    readinessScore: 79
  },
  {
    id: 'entity_eu',
    name: 'SKANDA Europe B.V.',
    legalIdentifier: 'NL-KVK-84920183',
    countryCode: 'NL',
    countryName: 'Netherlands',
    flag: '🇪🇺',
    region: 'European Union / Amsterdam',
    regulatoryJurisdiction: 'European Union (GDPR / DORA / NIS2)',
    primaryRegulator: 'European Banking Authority & Dutch DPA (AP)',
    mandatedFrameworks: ['EU GDPR', 'DORA', 'NIS2 Directive', 'ISO 27701:2019'],
    recommendedFrameworkId: 'ISO 27701:2019',
    currency: 'EUR (€)',
    activeDpo: 'Anouk van Dijk, CIPM',
    leadAuditor: 'TÜV SÜD Management Service GmbH',
    readinessScore: 86
  }
];
