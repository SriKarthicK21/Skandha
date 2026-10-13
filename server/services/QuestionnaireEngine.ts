/**
 * SKANDA CONFIGURATION-DRIVEN QUESTIONNAIRE ENGINE
 * File: server/services/QuestionnaireEngine.ts
 * 
 * Source: Certification Questionnaire Intake Library (Field IDs 1.01 - 15.x)
 * Fully decoupled, configuration-driven, progressive-disclosure question engine.
 * Supports conditional visibility, multi-framework scoping, dependency trees,
 * and canonical entity mapping.
 */

import {
  QuestionDefinition,
  QuestionResponse,
  QuestionVisibilityRule,
  SectionPriorityItem
} from '../../src/types/onboardingTypes.js';

export class QuestionnaireEngine {
  private questionDefinitions: Map<string, QuestionDefinition> = new Map();

  constructor() {
    this.initializeQuestions();
  }

  private initializeQuestions(): void {
    const definitions: QuestionDefinition[] = [
      // ======================================================================
      // SECTION 1: COMPANY & CONTACT DETAILS (1.01 - 1.10)
      // ======================================================================
      {
        id: '1.01',
        section: 'Company & Contact Details',
        question: 'Full Legal Registered Company Name',
        description: 'The exact legal name of the organization as registered with corporate registrar / authority.',
        type: 'TEXT',
        required: true,
        order: 1,
        placeholder: 'e.g. Acme Cloud Technologies Private Limited',
        canonicalTargetField: 'orgProfile.legalName'
      },
      {
        id: '1.02',
        section: 'Company & Contact Details',
        question: 'Corporate Registration / CIN / Tax ID',
        description: 'Official corporate identification number or tax registration.',
        type: 'TEXT',
        required: true,
        order: 2,
        placeholder: 'e.g. U72900KA2021PTC148922 or US-DEL-5839201',
        canonicalTargetField: 'orgProfile.registrationNumber'
      },
      {
        id: '1.03',
        section: 'Company & Contact Details',
        question: 'Primary Industry Sector',
        description: 'Select the primary economic sector your business operates within.',
        type: 'SELECT',
        options: [
          { value: 'FINTECH_BANKING', label: 'FinTech, Banking & Financial Services', badge: 'High Regulatory' },
          { value: 'HEALTHCARE_MEDTECH', label: 'Healthcare, MedTech & Life Sciences', badge: 'HIPAA/DPDP' },
          { value: 'SAAS_CLOUD_SOFTWARE', label: 'SaaS, Cloud & Enterprise Software', badge: 'ISO 27001/SOC 2' },
          { value: 'AI_ML_DATA_ANALYTICS', label: 'AI, LLM & Data Analytics Platforms', badge: 'ISO 42001' },
          { value: 'ECOMMERCE_RETAIL', label: 'E-Commerce, Logistics & Retail', badge: 'PCI-DSS' },
          { value: 'TELECOM_INFRASTRUCTURE', label: 'Telecom & Critical Infrastructure', badge: 'Critical Infra' },
          { value: 'GOVERNMENT_DEFENSE', label: 'Government & Public Sector', badge: 'Statutory' },
          { value: 'OTHER_PROFESSIONAL', label: 'Professional Services & Consulting' }
        ],
        required: true,
        order: 3,
        canonicalTargetField: 'orgProfile.industry'
      },
      {
        id: '1.04',
        section: 'Company & Contact Details',
        question: 'Corporate Website & Public Domain Names',
        description: 'Primary web domain and customer-facing service portals.',
        type: 'TEXT',
        required: true,
        order: 4,
        placeholder: 'https://www.acmecloud.io',
        canonicalTargetField: 'orgProfile.website'
      },
      {
        id: '1.05',
        section: 'Company & Contact Details',
        question: 'Primary Operational / Registered Country',
        description: 'Country of corporate headquarters.',
        type: 'SELECT',
        options: [
          { value: 'US', label: 'United States' },
          { value: 'GB', label: 'United Kingdom' },
          { value: 'SG', label: 'Singapore' },
          { value: 'IN', label: 'India' },
          { value: 'DE', label: 'Germany' },
          { value: 'NL', label: 'Netherlands' },
          { value: 'AU', label: 'Australia' },
          { value: 'AE', label: 'United Arab Emirates' },
          { value: 'OTHER', label: 'Other Global Jurisdiction' }
        ],
        required: true,
        order: 5,
        canonicalTargetField: 'orgProfile.country'
      },
      {
        id: '1.06',
        section: 'Company & Contact Details',
        question: 'Headquarters Full Postal Address',
        description: 'Physical location of the primary corporate headquarters.',
        type: 'TEXTAREA',
        required: true,
        order: 6,
        placeholder: 'Suite 800, Tech Park, Outer Ring Road, Bangalore 560103',
        canonicalTargetField: 'orgProfile.addressLine1'
      },
      {
        id: '1.07',
        section: 'Company & Contact Details',
        question: 'Designated CISO / Head of Information Security',
        description: 'Name and official title of the executive responsible for security & compliance.',
        type: 'TEXT',
        required: true,
        order: 7,
        placeholder: 'e.g. Sarah Chen, Chief Information Security Officer',
        canonicalTargetField: 'orgProfile.cisoName'
      },
      {
        id: '1.08',
        section: 'Company & Contact Details',
        question: 'CISO / Security Lead Official Email Address',
        description: 'Corporate email for audit communications and executive security alerts.',
        type: 'TEXT',
        required: true,
        order: 8,
        placeholder: 'ciso@acmecloud.io',
        canonicalTargetField: 'orgProfile.cisoEmail'
      },

      // ======================================================================
      // SECTION 2: BUSINESS ACTIVITY & SCOPE (2.01 - 2.05)
      // ======================================================================
      {
        id: '2.01',
        section: 'Business Activity & Scope',
        question: 'Core Revenue-Generating Business Activities & Products',
        description: 'Concise summary of the primary products, software platforms, and commercial services provided.',
        type: 'TEXTAREA',
        required: true,
        order: 9,
        placeholder: 'Design, development, hosting, and customer support of multi-tenant cloud-native payment automation platform.',
        canonicalTargetField: 'businessActivities'
      },
      {
        id: '2.02',
        section: 'Business Activity & Scope',
        question: 'Primary Customer Base / Market Type',
        description: 'Types of organizations or consumers using your services.',
        type: 'MULTI_SELECT',
        options: [
          { value: 'B2B_ENTERPRISE', label: 'Tier-1 B2B Enterprise & Multinational Clients' },
          { value: 'FINANCIAL_INSTITUTIONS', label: 'Banks, Payment Networks & FinTech Institutions' },
          { value: 'B2C_CONSUMER', label: 'Direct Consumers / High-Volume B2C' },
          { value: 'GOVERNMENT_REGULATED', label: 'Government & Regulated Public Agencies' }
        ],
        required: true,
        order: 10
      },
      {
        id: '2.03',
        section: 'Business Activity & Scope',
        question: 'Are any core software development or operational functions outsourced?',
        description: 'Declare whether software engineering, infrastructure management, or support is handled by 3rd-party vendors.',
        type: 'RADIO',
        options: [
          { value: 'NO_FULLY_INTERNAL', label: 'No, all core engineering and operations are handled internally' },
          { value: 'HYBRID_STAFF_AUGMENTATION', label: 'Hybrid: Internal core leads with contractor staff augmentation' },
          { value: 'OUTSOURCED_MANAGED_SERVICE', label: 'Yes, infrastructure or development is outsourced to a Managed Service Provider (MSP)' }
        ],
        required: true,
        order: 11
      },

      // ======================================================================
      // SECTION 3: SITES & OPERATIONAL LOCATIONS (3.01 - 3.04)
      // ======================================================================
      {
        id: '3.01',
        section: 'Sites & Operational Locations',
        question: 'Total Number of Physical and Virtual Operational Sites in Scope',
        description: 'Count of offices, co-locations, and primary cloud VPC regions to be covered.',
        type: 'NUMBER',
        required: true,
        order: 12,
        placeholder: 'e.g. 3'
      },
      {
        id: '3.02',
        section: 'Sites & Operational Locations',
        question: 'Operating Model Across Workforce Locations',
        description: 'Workplace attendance model for staff in compliance scope.',
        type: 'SELECT',
        options: [
          { value: 'HYBRID', label: 'Hybrid (Mix of corporate offices and remote work)' },
          { value: 'FULLY_REMOTE', label: '100% Distributed / Fully Remote Workforce' },
          { value: 'ON_SITE', label: '100% On-Premise Physical Facility / Secure Workspaces' }
        ],
        required: true,
        order: 13,
        canonicalTargetField: 'orgProfile.operatingModel'
      },

      // ======================================================================
      // SECTION 4: WORKFORCE & SHIFTS (4A - 4D)
      // ======================================================================
      {
        id: '4A',
        section: 'Workforce & Shifts',
        question: 'Total Number of Full-Time Employees (FTE)',
        description: 'Direct payroll personnel.',
        type: 'NUMBER',
        required: true,
        order: 14,
        placeholder: 'e.g. 150',
        canonicalTargetField: 'workforce.fullTimeEmployees'
      },
      {
        id: '4B',
        section: 'Workforce & Shifts',
        question: 'Total Number of Contractors / External Personnel',
        description: 'Third-party contractors, consultants, and offshore staff with logical access.',
        type: 'NUMBER',
        required: true,
        order: 15,
        placeholder: 'e.g. 25',
        canonicalTargetField: 'workforce.contractors'
      },
      {
        id: '4C',
        section: 'Workforce & Shifts',
        question: 'Operational Shift Model',
        description: 'Select standard operational shifts for IT, support, and engineering.',
        type: 'SELECT',
        options: [
          { value: 'SINGLE_SHIFT_DAY', label: 'Single Standard Day Shift (9 AM - 6 PM)' },
          { value: 'TWO_SHIFTS', label: 'Two Shifts Covering Global Timezones' },
          { value: 'THREE_SHIFTS_24_7', label: '24/7 Follow-the-Sun SOC / Support Rotation' }
        ],
        required: true,
        order: 16
      },

      // ======================================================================
      // SECTION 5: IT & INFRASTRUCTURE FACTORS (5.1 - 5.6)
      // ======================================================================
      {
        id: '5.1',
        section: 'IT & Infrastructure Factors',
        question: 'Primary Cloud Infrastructure Platforms',
        description: 'Select all hyperscale cloud platforms hosting production workloads.',
        type: 'MULTI_SELECT',
        options: [
          { value: 'AWS', label: 'Amazon Web Services (AWS)', badge: 'Cloud' },
          { value: 'AZURE', label: 'Microsoft Azure', badge: 'Cloud' },
          { value: 'GCP', label: 'Google Cloud Platform (GCP)', badge: 'Cloud' },
          { value: 'ON_PREMISE', label: 'On-Premise Private Data Center', badge: 'Physical' },
          { value: 'ORACLE_CLOUD', label: 'Oracle Cloud Infrastructure (OCI)', badge: 'Cloud' }
        ],
        required: true,
        order: 17,
        canonicalTargetField: 'technology.cloudProviders'
      },
      {
        id: '5.2_AWS',
        section: 'IT & Infrastructure Factors',
        subSection: 'AWS Architecture Specifics',
        question: 'AWS Production Services in Scope',
        description: 'Select primary AWS services supporting the critical compliance perimeter.',
        type: 'MULTI_SELECT',
        options: [
          { value: 'EKS', label: 'Amazon EKS (Managed Kubernetes)' },
          { value: 'RDS_AURORA', label: 'Amazon RDS / Aurora (Relational Databases)' },
          { value: 'S3', label: 'Amazon S3 (Encrypted Object Storage)' },
          { value: 'KMS', label: 'AWS Key Management Service (KMS HSM)' },
          { value: 'GUARDDUTY', label: 'Amazon GuardDuty & Security Hub' },
          { value: 'LAMBDA', label: 'AWS Lambda (Serverless Compute)' },
          { value: 'WAF', label: 'AWS WAF (Web Application Firewall)' }
        ],
        required: false,
        order: 18,
        visibilityRule: {
          dependsOnQuestionId: '5.1',
          operator: 'CONTAINS',
          expectedValue: 'AWS'
        }
      },
      {
        id: '5.3',
        section: 'IT & Infrastructure Factors',
        question: 'Single Sign-On (SSO) & Identity Access Management (IAM)',
        description: 'Corporate identity provider enforcing centralized authentication and MFA.',
        type: 'SELECT',
        options: [
          { value: 'OKTA', label: 'Okta Enterprise Workforce Identity' },
          { value: 'ENTRA_ID', label: 'Microsoft Entra ID (Azure AD)' },
          { value: 'GOOGLE_WORKSPACE', label: 'Google Workspace Enterprise' },
          { value: 'AWS_IAM_IC', label: 'AWS IAM Identity Center' },
          { value: 'PING_IDENTITY', label: 'Ping Identity' },
          { value: 'OTHER', label: 'Other Enterprise IdP' }
        ],
        required: true,
        order: 19,
        canonicalTargetField: 'technology.securityStack.iamProvider'
      },
      {
        id: '5.4',
        section: 'IT & Infrastructure Factors',
        question: 'Is Multi-Factor Authentication (MFA) strictly enforced on 100% of corporate and cloud accounts?',
        description: 'Hardware tokens, FIDO2/WebAuthn, or authenticator push notifications.',
        type: 'RADIO',
        options: [
          { value: 'ENFORCED_ALL', label: 'Yes, strictly enforced for 100% of users with zero exemptions' },
          { value: 'ENFORCED_ADMINS_ONLY', label: 'Enforced for privileged admins only (High Risk finding)' },
          { value: 'IN_PROGRESS', label: 'Currently being deployed across the fleet' }
        ],
        required: true,
        order: 20
      },
      {
        id: '5.5',
        section: 'IT & Infrastructure Factors',
        question: 'Endpoint Detection & Response (EDR) Fleet Solution',
        description: 'Next-gen anti-malware and EDR running across employee endpoints and servers.',
        type: 'SELECT',
        options: [
          { value: 'CROWDSTRIKE', label: 'CrowdStrike Falcon' },
          { value: 'SENTINELONE', label: 'SentinelOne Singularity' },
          { value: 'DEFENDER_FOR_ENDPOINT', label: 'Microsoft Defender for Endpoint' },
          { value: 'DATADOG_CSM', label: 'Datadog Cloud Security' },
          { value: 'OTHER', label: 'Other Enterprise EDR' }
        ],
        required: true,
        order: 21,
        canonicalTargetField: 'technology.securityStack.edrSolution'
      },
      {
        id: '5.6',
        section: 'IT & Infrastructure Factors',
        question: 'Do you operate Operational Technology (OT), SCADA, or Industrial Control Systems (ICS)?',
        description: 'Physical machinery, IoT gateways, factory automation, or hardware testing rigs.',
        type: 'RADIO',
        options: [
          { value: 'NO_OT', label: 'No, purely pure-play software / cloud-based SaaS' },
          { value: 'YES_OT', label: 'Yes, physical OT / ICS hardware in scope' }
        ],
        required: true,
        order: 22,
        canonicalTargetField: 'technology.hasOtIcsSystems'
      },
      {
        id: '5.7_OT',
        section: 'IT & Infrastructure Factors',
        subSection: 'OT / ICS Security Controls',
        question: 'Specify OT/ICS Air-Gap & Network Segmentation Measures',
        description: 'Provide details on Purdue model segmentation and physical security boundaries.',
        type: 'TEXTAREA',
        required: true,
        order: 23,
        visibilityRule: {
          dependsOnQuestionId: '5.6',
          operator: 'EQUALS',
          expectedValue: 'YES_OT'
        }
      },

      // ======================================================================
      // SECTION 6: DATA PRIVACY & PIMS (ISO 27701 & DPDPA CONDITIONAL)
      // ======================================================================
      {
        id: '6.01_PII',
        section: 'Data Privacy & PII Intake',
        question: 'Does your organization process Personally Identifiable Information (PII) or Sensitive Personal Data?',
        description: 'Customer names, email addresses, national IDs, payment tokens, health records, biometric or employee data.',
        type: 'RADIO',
        options: [
          { value: 'YES_PROCESS_PII', label: 'Yes, we process customer, employee, or third-party PII' },
          { value: 'NO_PII', label: 'No, strictly machine telemetry and non-personal data only' }
        ],
        required: true,
        order: 24
      },
      {
        id: '6.02_PIMS_ROLE',
        section: 'Data Privacy & PII Intake',
        subSection: 'ISO 27701 / DPDPA Privacy Governance',
        question: 'What is your primary privacy role under ISO 27701, GDPR, and DPDP Act 2023?',
        description: 'PII Controller (determines purpose/means) vs PII Processor (processes on behalf of clients).',
        type: 'SELECT',
        options: [
          { value: 'BOTH_CONTROLLER_AND_PROCESSOR', label: 'Joint: PII Controller for employees/direct users, PII Processor for enterprise B2B customers' },
          { value: 'PII_PROCESSOR_ONLY', label: 'PII Processor only (Pure SaaS B2B Data Processor)' },
          { value: 'PII_CONTROLLER_ONLY', label: 'PII Controller only (Direct Consumer B2C Service)' }
        ],
        required: true,
        order: 25,
        visibilityRule: {
          dependsOnQuestionId: '6.01_PII',
          operator: 'EQUALS',
          expectedValue: 'YES_PROCESS_PII'
        }
      },
      {
        id: '6.03_DATA_SUBJECTS',
        section: 'Data Privacy & PII Intake',
        subSection: 'Privacy Scoping',
        question: 'Categories of Data Subjects in Scope',
        description: 'Select all individuals whose personal information is collected or processed.',
        type: 'MULTI_SELECT',
        options: [
          { value: 'ENTERPRISE_CLIENT_USERS', label: 'Enterprise Client End-Users / Employees' },
          { value: 'INTERNAL_EMPLOYEES', label: 'Internal Full-Time & Contract Employees' },
          { value: 'GENERAL_CONSUMERS', label: 'Direct Consumers / Website Visitors' },
          { value: 'VENDORS_PARTNERS', label: 'Third-Party Vendors & Business Partners' }
        ],
        required: true,
        order: 26,
        visibilityRule: {
          dependsOnQuestionId: '6.01_PII',
          operator: 'EQUALS',
          expectedValue: 'YES_PROCESS_PII'
        }
      },
      {
        id: '6.04_CROSS_BORDER',
        section: 'Data Privacy & PII Intake',
        subSection: 'Cross-Border Data Flows',
        question: 'Are personal data records transferred across international borders?',
        description: 'For example, data processed in Singapore or India being accessed by teams in US or EU.',
        type: 'RADIO',
        options: [
          { value: 'YES_CROSS_BORDER', label: 'Yes, international cross-border data transfers occur' },
          { value: 'NO_SOVEREIGN_RESIDENT', label: 'No, all data is strictly stored and processed in local resident jurisdiction' }
        ],
        required: true,
        order: 27,
        visibilityRule: {
          dependsOnQuestionId: '6.01_PII',
          operator: 'EQUALS',
          expectedValue: 'YES_PROCESS_PII'
        }
      },

      // ======================================================================
      // SECTION 7: AI GOVERNANCE & ISO 42001 (CONDITIONAL)
      // ======================================================================
      {
        id: '7.01_AI',
        section: 'AI Governance & Machine Learning Intake',
        question: 'Does your platform build, fine-tune, or deploy AI / Machine Learning models or LLM pipelines?',
        description: 'Generative AI, algorithmic decision systems, automated scoring, computer vision, or predictive analytics.',
        type: 'RADIO',
        options: [
          { value: 'YES_DEPLOY_AI', label: 'Yes, AI/ML models or LLM integrations are core to our platform' },
          { value: 'NO_AI', label: 'No AI/ML capabilities in active scope' }
        ],
        required: true,
        order: 28
      },
      {
        id: '7.02_AI_RISK',
        section: 'AI Governance & Machine Learning Intake',
        subSection: 'ISO 42001 / MAS FEAT Alignment',
        question: 'Select AI Safety & Governance Controls Currently Implemented',
        description: 'Techniques for managing hallucinations, bias, data poisoning, and prompt injection.',
        type: 'MULTI_SELECT',
        options: [
          { value: 'PROMPT_GUARDRAILS', label: 'LLM Input/Output Sanitization & Prompt Injection Guards' },
          { value: 'HUMAN_IN_THE_LOOP', label: 'Human-in-the-Loop (HITL) mandatory approval for critical decisions' },
          { value: 'BIAS_FAIRNESS_AUDIT', label: 'Algorithmic Fairness, Bias & Explainability Testing' },
          { value: 'TRAINING_DATA_PROVENANCE', label: 'Training Data Provenance & Copyright Compliance Review' }
        ],
        required: false,
        order: 29,
        visibilityRule: {
          dependsOnQuestionId: '7.01_AI',
          operator: 'EQUALS',
          expectedValue: 'YES_DEPLOY_AI'
        }
      },

      // ======================================================================
      // SECTION 8: CERTIFICATION & AUDIT OPERATIONS (8.01 - 8.04)
      // ======================================================================
      {
        id: '8.01_TYPE',
        section: 'Certification & Audit Operations',
        question: 'Audit Certification Cycle Objective',
        description: 'Specify whether this is a net-new initial certification or transfer from another registrar.',
        type: 'SELECT',
        options: [
          { value: 'INITIAL_CERTIFICATION', label: 'Initial Certification (Stage 1 Readiness + Stage 2 Full Audit)' },
          { value: 'TRANSFER_CERTIFICATION', label: 'Transfer of Existing Certification from another Accredited Body' },
          { value: 'SURVEILLANCE_AUDIT', label: 'Yearly Surveillance Audit / Continuous Assurance' },
          { value: 'RECERTIFICATION', label: '3-Year Recertification Audit' }
        ],
        required: true,
        order: 30
      },
      {
        id: '8.02_TRANSFER',
        section: 'Certification & Audit Operations',
        subSection: 'Transfer Questionnaire',
        question: 'Previous Accredited Certification Body & Certificate Validity Date',
        description: 'Provide registrar name (e.g. BSI, TÜV SÜD, SGS, DNV) and current certificate expiration date.',
        type: 'TEXT',
        required: true,
        order: 31,
        placeholder: 'e.g. BSI Group UK, Certificate # ISMS-78291, Valid until Nov 2026',
        visibilityRule: {
          dependsOnQuestionId: '8.01_TYPE',
          operator: 'EQUALS',
          expectedValue: 'TRANSFER_CERTIFICATION'
        }
      },
      {
        id: '8.03_TIMELINE',
        section: 'Certification & Audit Operations',
        question: 'Target Audit Execution / Certification Deadline',
        description: 'Target month and year to achieve statutory certificate sign-off.',
        type: 'DATE',
        required: true,
        order: 32
      },

      // ======================================================================
      // SECTION 9: DECLARATION & AUDIT INTEGRITY (9.01)
      // ======================================================================
      {
        id: '9.01_DECLARATION',
        section: 'Declaration & Audit Agreement',
        question: 'Executive Accuracy & Statutory Compliance Declaration',
        description: 'I confirm that the information provided in this onboarding discovery profile is accurate, represents true operational architecture, and will be bound into the canonical SKANDA GRC ledger for continuous audit verification.',
        type: 'BOOLEAN',
        required: true,
        order: 33
      }
    ];

    for (const def of definitions) {
      def.fieldId = def.fieldId || def.id;
      this.questionDefinitions.set(def.id, def);
    }
  }

  public getAllQuestions(): QuestionDefinition[] {
    return Array.from(this.questionDefinitions.values()).sort((a, b) => a.order - b.order);
  }

  public getQuestionById(id: string): QuestionDefinition | undefined {
    return this.questionDefinitions.get(id);
  }

  /**
   * Evaluates conditional visibility for a question given all current responses and selected framework codes
   */
  public isQuestionVisible(
    question: QuestionDefinition,
    responses: Record<string, QuestionResponse | any>,
    selectedProgramFrameworks: string[] = []
  ): boolean {
    if (!question.visibilityRule) return true;

    const rule = question.visibilityRule;
    const parentResponse = responses[rule.dependsOnQuestionId];
    const parentVal = parentResponse && typeof parentResponse === 'object' && 'value' in parentResponse
      ? parentResponse.value
      : parentResponse;

    switch (rule.operator) {
      case 'EQUALS':
        return parentVal === rule.expectedValue;
      case 'NOT_EQUALS':
        return parentVal !== rule.expectedValue;
      case 'CONTAINS':
        if (Array.isArray(parentVal)) {
          return parentVal.includes(rule.expectedValue);
        }
        if (typeof parentVal === 'string') {
          return parentVal.includes(rule.expectedValue);
        }
        return false;
      case 'IN_LIST':
        if (Array.isArray(rule.expectedValue)) {
          return rule.expectedValue.includes(parentVal);
        }
        return false;
      case 'GREATER_THAN':
        return Number(parentVal) > Number(rule.expectedValue);
      case 'PROGRAM_SELECTED':
        return selectedProgramFrameworks.some(f => f.includes(rule.expectedValue));
      default:
        return true;
    }
  }

  /**
   * Filters the full question list down to visible questions for the current session state
   */
  public getVisibleQuestions(
    responses: Record<string, QuestionResponse | any>,
    selectedProgramFrameworks: string[] = []
  ): QuestionDefinition[] {
    return this.getAllQuestions().filter(q =>
      this.isQuestionVisible(q, responses, selectedProgramFrameworks)
    );
  }

  /**
   * Validates answers against definitions
   */
  public validateResponses(
    responses: Record<string, any>,
    selectedProgramFrameworks: string[] = []
  ): { isValid: boolean; errors: Array<{ questionId: string; error: string }> } {
    const visibleQuestions = this.getVisibleQuestions(responses, selectedProgramFrameworks);
    const errors: Array<{ questionId: string; error: string }> = [];

    for (const q of visibleQuestions) {
      const resp = responses[q.id];
      const val = resp && typeof resp === 'object' && 'value' in resp ? resp.value : resp;

      if (q.required) {
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          errors.push({
            questionId: q.id,
            error: `Question "${q.question}" is required.`
          });
          continue;
        }
      }

      if (q.validationRule) {
        if (q.validationRule.min !== undefined && typeof val === 'number' && val < q.validationRule.min) {
          errors.push({
            questionId: q.id,
            error: q.validationRule.customErrorMessage || `Value must be at least ${q.validationRule.min}.`
          });
        }
        if (q.validationRule.pattern && typeof val === 'string') {
          const regex = new RegExp(q.validationRule.pattern);
          if (!regex.test(val)) {
            errors.push({
              questionId: q.id,
              error: q.validationRule.customErrorMessage || `Invalid format for "${q.question}".`
            });
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Dynamically calculates section priority (REQUIRED, RECOMMENDED, OPTIONAL, NOT_APPLICABLE)
   * based on selected frameworks and customer responses.
   */
  public calculateSectionPriorities(
    selectedFrameworks: string[] = [],
    _responses: Record<string, any> = {}
  ): SectionPriorityItem[] {
    const isIso27001 = selectedFrameworks.some(f => f.includes('27001') || f.includes('ISO_27001'));
    const isIso27701 = selectedFrameworks.some(f => f.includes('27701') || f.includes('ISO_27701') || f.includes('DPDP') || f.includes('GDPR'));
    const isIso42001 = selectedFrameworks.some(f => f.includes('42001') || f.includes('ISO_42001') || f.includes('AI'));
    const isMasTrm = selectedFrameworks.some(f => f.includes('MAS') || f.includes('TRM') || f.includes('FINTECH') || f.includes('RBI'));
    const isSoc2 = selectedFrameworks.some(f => f.includes('SOC_2') || f.includes('SOC2') || f.includes('SOC 2'));
    const isPciDss = selectedFrameworks.some(f => f.includes('PCI') || f.includes('PCI_DSS'));

    return [
      {
        stepNumber: 1,
        stepKey: 'WELCOME',
        stepTitle: 'Welcome & Guidance',
        priority: 'REQUIRED',
        relevanceRationale: 'Baseline discovery configuration.'
      },
      {
        stepNumber: 2,
        stepKey: 'ORG_PROFILE',
        stepTitle: 'Organization Profile',
        priority: 'REQUIRED',
        relevanceRationale: 'Mandatory legal entity foundation for statutory compliance scope.'
      },
      {
        stepNumber: 3,
        stepKey: 'COMPLIANCE_PROGRAMS',
        stepTitle: 'Compliance Programs Selection',
        priority: 'REQUIRED',
        relevanceRationale: 'Determines regulatory drivers and control mapping requirements.'
      },
      {
        stepNumber: 4,
        stepKey: 'BUSINESS_DISCOVERY',
        stepTitle: 'Business Context & Workshop',
        priority: 'REQUIRED',
        relevanceRationale: 'Maps primary economic activities and operational dependencies.'
      },
      {
        stepNumber: 5,
        stepKey: 'BUSINESS_ACTIVITIES',
        stepTitle: 'Business Activities Universe',
        priority: 'REQUIRED',
        relevanceRationale: 'Core revenue generating and technical capabilities.'
      },
      {
        stepNumber: 6,
        stepKey: 'BUSINESS_PROCESSES',
        stepTitle: 'Business Processes Universe',
        priority: 'REQUIRED',
        relevanceRationale: 'Underpins risk assessment, BIA, and control allocations.'
      },
      {
        stepNumber: 7,
        stepKey: 'DEPARTMENTS',
        stepTitle: 'Departments & Governance',
        priority: 'REQUIRED',
        relevanceRationale: 'Establishes operational hierarchy and role ownership.'
      },
      {
        stepNumber: 8,
        stepKey: 'SITES',
        stepTitle: 'Physical Sites & Locations',
        priority: 'REQUIRED',
        relevanceRationale: 'Defines physical security perimeter and geographical jurisdictions.'
      },
      {
        stepNumber: 9,
        stepKey: 'WORKFORCE',
        stepTitle: 'Workforce & Headcount',
        priority: 'REQUIRED',
        relevanceRationale: 'Determines HR security controls, background verification, and training quotas.'
      },
      {
        stepNumber: 10,
        stepKey: 'APPLICATIONS',
        stepTitle: 'Applications & Software',
        priority: isSoc2 || isIso27001 ? 'REQUIRED' : 'RECOMMENDED',
        relevanceRationale: isSoc2 ? 'Mandatory system boundary discovery for SOC 2 Type II trust criteria.' : 'Core software inventory for access and vulnerability management.'
      },
      {
        stepNumber: 11,
        stepKey: 'ASSETS',
        stepTitle: 'Assets & Hardware Inventory',
        priority: 'REQUIRED',
        relevanceRationale: 'Asset management controls and cryptographic keys repository.'
      },
      {
        stepNumber: 12,
        stepKey: 'DATA_DISCOVERY',
        stepTitle: 'Data Discovery & Privacy',
        priority: isIso27701 || isPciDss ? 'REQUIRED' : (isIso27001 ? 'RECOMMENDED' : 'OPTIONAL'),
        relevanceRationale: isIso27701 ? 'Statutory PII inventory and privacy role allocation for ISO 27701 / DPDP / GDPR.' : 'Data classification and encryption in transit/at rest.'
      },
      {
        stepNumber: 13,
        stepKey: 'VENDORS',
        stepTitle: 'Vendors & Third Parties (TPRM)',
        priority: 'REQUIRED',
        relevanceRationale: 'Supply chain risk governance and sub-processor DPA tracking.'
      },
      {
        stepNumber: 14,
        stepKey: 'TECH_ENVIRONMENT',
        stepTitle: 'Technology Fleet & Cloud Infrastructure',
        priority: isMasTrm || isSoc2 ? 'REQUIRED' : 'RECOMMENDED',
        relevanceRationale: isMasTrm ? 'MAS TRM mandates comprehensive cloud infrastructure and resilience mapping.' : 'Cloud security posture and container governance.'
      },
      {
        stepNumber: 15,
        stepKey: 'CRITICAL_SERVICES',
        stepTitle: 'Critical Business Services (BIA)',
        priority: isMasTrm || isIso27001 ? 'REQUIRED' : 'RECOMMENDED',
        relevanceRationale: 'Establishes Maximum Tolerable Downtime (MTD), RTO, and RPO metrics.'
      },
      {
        stepNumber: 16,
        stepKey: 'SCOPE',
        stepTitle: 'AI Scope Statement Synthesis & Governance',
        priority: isIso42001 || isIso27001 ? 'REQUIRED' : 'REQUIRED',
        relevanceRationale: isIso42001 ? 'Mandatory AI governance boundary and model safety scope under ISO 42001.' : 'Synthesizes boundaries, exclusions, and statutory inclusions for CISO sign-off.'
      },
      {
        stepNumber: 17,
        stepKey: 'CERT_INTAKE',
        stepTitle: 'Certification & Audit Intake',
        priority: selectedFrameworks.length > 0 ? 'REQUIRED' : 'RECOMMENDED',
        relevanceRationale: 'Captures statutory audit timelines, registrar details, and target certification scope.'
      },
      {
        stepNumber: 18,
        stepKey: 'REVIEW',
        stepTitle: 'Readiness Review & Quality Audit',
        priority: 'REQUIRED',
        relevanceRationale: 'Validates completeness and resolves orphaned or missing entity data.'
      },
      {
        stepNumber: 19,
        stepKey: 'ACTIVATE',
        stepTitle: 'CISO Workspace Activation',
        priority: 'REQUIRED',
        relevanceRationale: 'Transactional commitment to canonical GRC operating system.'
      }
    ];
  }
}

export const questionnaireEngine = new QuestionnaireEngine();
