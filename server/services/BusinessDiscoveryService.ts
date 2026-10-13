/**
 * SKANDA BUSINESS DISCOVERY SERVICE
 * File: server/services/BusinessDiscoveryService.ts
 * 
 * Implements "CREATE ONCE -> UNDERSTAND ONCE -> REUSE EVERYWHERE"
 * Ingests, normalizes, and interlinks enterprise entities into canonical GRC graphs.
 * Generates stable IDs (PROC-001, SITE-001, APP-001, AST-001, DAT-001, VND-001, CBS-001),
 * establishes bidirectional 360° relationships, and feeds downstream GRC modules.
 */

import {
  EnterpriseDiscoveryData,
  DiscoveryProcessItem,
  DiscoveryDepartmentItem,
  DiscoverySiteItem,
  DiscoveryApplicationItem,
  DiscoveryAssetItem,
  DiscoveryDataAssetItem,
  DiscoveryVendorItem,
  DiscoveryCriticalBusinessService,
  BusinessActivityItem,
  ProcessTemplateItem,
  StageProgressItem,
  DiscoveryCompletenessReport,
  DiscoveryQualityGap,
  ImportPreviewResult,
  DiscoveredDocument
} from '../../src/types/onboardingTypes.js';

import { Entity360Graph, EntityNode, EntityEdge } from '../../src/types/grcCoreTypes.js';
import crypto from 'crypto';

export class BusinessDiscoveryService {
  /**
   * Generates default baseline discovery data for a newly registered tenant
   */
  public generateDefaultDiscoveryData(
    tenantName: string = 'Enterprise Organization',
    industry: string = 'SaaS, Cloud & Enterprise Software'
  ): EnterpriseDiscoveryData {
    return {
      orgProfile: {
        legalName: `${tenantName} Inc.`,
        tradingName: tenantName,
        registrationNumber: 'REG-2026-88194',
        industry: industry,
        website: `https://www.${tenantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        country: 'US',
        state: 'California',
        city: 'San Francisco',
        addressLine1: '500 Howard Street, Suite 400',
        postalCode: '94105',
        headquarters: 'San Francisco Global HQ',
        operatingModel: 'HYBRID',
        organizationSize: '201-1000',
        totalEmployeeCount: 350,
        primaryContactName: 'Alex Mercer',
        primaryContactEmail: 'alex.mercer@enterprise.io',
        primaryContactPhone: '+1-415-555-0199',
        cisoName: 'Sarah Chen, CISO',
        cisoEmail: 'ciso@enterprise.io',
        dpoName: 'Eleanor Vance, CIPP/E',
        dpoEmail: 'privacy@enterprise.io'
      },
      selectedPrograms: [
        {
          frameworkCode: 'ISO_27001_2022',
          programCode: 'PROG-SEC-01',
          name: 'Enterprise Information Security Management System (ISMS)',
          type: 'INFORMATION_SECURITY',
          targetCertificationDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
          executiveSponsor: 'Chief Information Security Officer',
          programLead: 'Head of Information Security & GRC',
          isPrimary: true
        },
        {
          frameworkCode: 'SOC_2_TYPE_2',
          programCode: 'PROG-SOC2-01',
          name: 'SOC 2 Type II Trust Services Criteria Assurance',
          type: 'ENTERPRISE_INTEGRATED',
          targetCertificationDate: new Date(Date.now() + 210 * 86400000).toISOString().split('T')[0],
          executiveSponsor: 'Chief Technology Officer',
          programLead: 'Director of Cloud SecOps',
          isPrimary: false
        }
      ],
      businessActivities: [
        {
          id: 'act_1',
          code: 'ACT-001',
          name: 'Cloud-Native GRC & Security Command SaaS Platform',
          category: 'REVENUE_GENERATING',
          description: 'Design, development, hosting, and global enterprise support of multi-tenant GRC command SaaS.',
          productsAndServices: ['SKANDA SaaS Portal', 'Continuous Compliance Engine', 'Smart Evidence Ledger'],
          customerTypes: ['B2B_ENTERPRISE', 'FINANCIAL_INSTITUTIONS'],
          deliveryChannels: ['WEB_SAAS', 'API_SDK']
        },
        {
          id: 'act_2',
          code: 'ACT-002',
          name: 'Continuous Security Telemetry & Automated Audit Feed',
          category: 'CORE_CAPABILITY',
          description: 'Real-time telemetry ingestion from hyperscale cloud accounts (AWS/Azure) and automated evidence hashing.',
          productsAndServices: ['Telemetry Ingestion Service', 'Automated Control Testing Pipeline'],
          customerTypes: ['B2B_ENTERPRISE'],
          deliveryChannels: ['API_SDK']
        }
      ],
      departments: [
        {
          id: 'dept_1',
          code: 'DEPT-001',
          name: 'Information Security & GRC',
          headName: 'Sarah Chen',
          headEmail: 'sarah.chen@enterprise.io',
          location: 'San Francisco HQ',
          siteId: 'site_1',
          functions: ['Security Operations', 'Compliance & Audit', 'Vulnerability Management', 'Vendor Risk'],
          processesOwnedIds: ['proc_1', 'proc_4'],
          processesSupportedIds: ['proc_2', 'proc_3'],
          employeeCount: 14
        },
        {
          id: 'dept_2',
          code: 'DEPT-002',
          name: 'Cloud Platform & Infrastructure Engineering',
          headName: 'Marcus Brody',
          headEmail: 'marcus.brody@enterprise.io',
          location: 'San Francisco HQ',
          siteId: 'site_1',
          functions: ['Kubernetes Infrastructure', 'CI/CD Pipelines', 'Cloud Security Architecture', 'Disaster Recovery'],
          processesOwnedIds: ['proc_2'],
          processesSupportedIds: ['proc_1', 'proc_3'],
          employeeCount: 42
        },
        {
          id: 'dept_3',
          code: 'DEPT-003',
          name: 'Product Engineering & Application Development',
          headName: 'David Vance',
          headEmail: 'david.vance@enterprise.io',
          location: 'Bangalore Development Hub',
          siteId: 'site_2',
          functions: ['Frontend React Development', 'Core Microservices', 'API Architecture', 'QA Automation'],
          processesOwnedIds: ['proc_3'],
          processesSupportedIds: [],
          employeeCount: 120
        },
        {
          id: 'dept_4',
          code: 'DEPT-004',
          name: 'Customer Success & Technical Operations',
          headName: 'Kavita Sundaram',
          headEmail: 'kavita.sundaram@enterprise.io',
          location: 'Singapore Regional Office',
          siteId: 'site_3',
          functions: ['Client Onboarding', 'Technical Support', 'SLA Management', 'Identity Provisioning'],
          processesOwnedIds: ['proc_1'],
          processesSupportedIds: ['proc_3'],
          employeeCount: 35
        }
      ],
      sites: [
        {
          id: 'site_1',
          code: 'SITE-001',
          name: 'Global Headquarters & Primary Executive Office',
          address: '500 Howard Street, Suite 400',
          city: 'San Francisco',
          state: 'California',
          country: 'US',
          siteType: 'HEADQUARTERS',
          departments: ['Information Security & GRC', 'Cloud Platform & Infrastructure Engineering', 'Executive Leadership'],
          activities: ['Corporate Governance', 'Security Management', 'Cloud Operations'],
          onSiteEmployees: 65,
          remoteEmployees: 85,
          shiftModel: 'SINGLE_SHIFT_DAY',
          isPrimaryDc: false
        },
        {
          id: 'site_2',
          code: 'SITE-002',
          name: 'Bangalore Engineering & Development Center',
          address: 'Prestige Tech Park, Block B, Outer Ring Road',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'IN',
          siteType: 'REGIONAL_OFFICE',
          departments: ['Product Engineering & Application Development', 'QA Automation'],
          activities: ['Software Engineering', 'Code Review', 'Release Management'],
          onSiteEmployees: 110,
          remoteEmployees: 40,
          shiftModel: 'TWO_SHIFTS',
          isPrimaryDc: false
        },
        {
          id: 'site_3',
          code: 'SITE-003',
          name: 'AWS US-East-1 Production Cloud VPC Perimeter',
          address: 'Amazon Web Services N. Virginia Region (us-east-1)',
          city: 'Ashburn',
          state: 'Virginia',
          country: 'US',
          siteType: 'CLOUD_VPC_REGION',
          departments: ['Cloud Platform & Infrastructure Engineering'],
          activities: ['Multi-Tenant SaaS Workloads', 'Production Database Hosting', 'WORM Evidence Storage'],
          onSiteEmployees: 0,
          remoteEmployees: 0,
          shiftModel: 'THREE_SHIFTS_24_7',
          isPrimaryDc: true
        }
      ],
      workforce: {
        fullTimeEmployees: 295,
        partTimeEmployees: 15,
        contractors: 40,
        remoteWorkforceCount: 160,
        onSiteWorkforceCount: 190,
        shifts: [
          { name: 'Standard Corporate Shift', description: 'Day shift 9:00 AM - 6:00 PM local time', headcount: 280, locations: ['San Francisco HQ', 'Bangalore Hub'] },
          { name: '24/7 Follow-the-Sun Cloud SecOps', description: '3 rotational shifts covering 24/7 cloud monitoring', headcount: 70, locations: ['Global Remote'] }
        ],
        departmentAllocations: [
          { departmentName: 'Product Engineering', headcount: 120 },
          { departmentName: 'Cloud Platform & Ops', headcount: 42 },
          { departmentName: 'Customer Success', headcount: 35 },
          { departmentName: 'Information Security & GRC', headcount: 14 },
          { departmentName: 'Sales & Marketing', headcount: 65 },
          { departmentName: 'General & Administrative', headcount: 74 }
        ],
        securityBackgroundChecksRequired: true,
        securityTrainingFrequency: 'QUARTERLY'
      },
      businessProcesses: [
        {
          id: 'proc_1',
          code: 'PROC-001',
          name: 'Enterprise Client Onboarding & Identity Provisioning',
          description: 'End-to-end verification, tenant database isolation provisioning, and admin credential enrollment for enterprise clients.',
          businessUnit: 'Customer Operations & Security',
          department: 'Customer Success & Technical Operations',
          processOwner: 'Kavita Sundaram',
          siteId: 'site_1',
          criticality: 'TIER_1_MISSION_CRITICAL',
          frequency: 'ON_DEMAND',
          isCustomerFacing: true,
          processesPii: true,
          processesSensitiveInfo: true,
          isCriticalBusinessService: true,
          hasExternalDependencies: true,
          applicationsUsed: ['Salesforce Enterprise', 'Okta SSO', 'AWS IAM Identity Center'],
          vendorsUsed: ['Okta', 'Amazon Web Services', 'Twilio'],
          rtoMinutes: 60,
          rpoMinutes: 15
        },
        {
          id: 'proc_2',
          code: 'PROC-002',
          name: 'Cloud Infrastructure Provisioning & CI/CD Release Pipeline',
          description: 'Automated infrastructure-as-code deployment via Terraform, container image scanning, and blue/green production releases.',
          businessUnit: 'Platform Engineering',
          department: 'Cloud Platform & Infrastructure Engineering',
          processOwner: 'Marcus Brody',
          siteId: 'site_3',
          criticality: 'TIER_1_MISSION_CRITICAL',
          frequency: 'CONTINUOUS_REALTIME',
          isCustomerFacing: false,
          processesPii: false,
          processesSensitiveInfo: true,
          isCriticalBusinessService: true,
          hasExternalDependencies: true,
          applicationsUsed: ['GitHub Enterprise', 'AWS EKS', 'HashiCorp Terraform', 'Datadog'],
          vendorsUsed: ['Amazon Web Services', 'GitHub', 'Datadog'],
          rtoMinutes: 30,
          rpoMinutes: 5
        },
        {
          id: 'proc_3',
          code: 'PROC-003',
          name: 'Core SaaS Application Processing & Data Ingestion',
          description: 'High-throughput transactional GRC compliance evaluation, calculation of posture scores, and audit artifact generation.',
          businessUnit: 'Product & Technology',
          department: 'Product Engineering & Application Development',
          processOwner: 'David Vance',
          siteId: 'site_3',
          criticality: 'TIER_1_MISSION_CRITICAL',
          frequency: 'CONTINUOUS_REALTIME',
          isCustomerFacing: true,
          processesPii: true,
          processesSensitiveInfo: true,
          isCriticalBusinessService: true,
          hasExternalDependencies: false,
          applicationsUsed: ['PostgreSQL Relational DB', 'AWS S3 WORM Vault', 'Redis Cluster'],
          vendorsUsed: ['Amazon Web Services'],
          rtoMinutes: 15,
          rpoMinutes: 0
        },
        {
          id: 'proc_4',
          code: 'PROC-004',
          name: 'Security Incident Detection, Triage & Response',
          description: 'Continuous monitoring of cloud SIEM alerts, EDR telemetry, automated threat containment, and statutory breach notifications.',
          businessUnit: 'Information Security',
          department: 'Information Security & GRC',
          processOwner: 'Sarah Chen',
          siteId: 'site_1',
          criticality: 'TIER_1_MISSION_CRITICAL',
          frequency: 'CONTINUOUS_REALTIME',
          isCustomerFacing: false,
          processesPii: true,
          processesSensitiveInfo: true,
          isCriticalBusinessService: true,
          hasExternalDependencies: true,
          applicationsUsed: ['CrowdStrike Falcon', 'AWS GuardDuty', 'PagerDuty', 'Jira Service Desk'],
          vendorsUsed: ['CrowdStrike', 'Amazon Web Services', 'PagerDuty'],
          rtoMinutes: 15,
          rpoMinutes: 0
        }
      ],
      applications: [
        {
          id: 'app_1',
          code: 'APP-001',
          name: 'SKANDA Core GRC Command Engine',
          purpose: 'Primary multi-tenant web application and REST API providing compliance, risk, and evidence management.',
          businessProcess: 'Core SaaS Application Processing',
          owner: 'David Vance',
          department: 'Product Engineering',
          hostingModel: 'CLOUD_AWS',
          cloudProvider: 'AWS (us-east-1)',
          criticality: 'CRITICAL',
          authenticationMethod: 'SSO_SAML_OIDC',
          mfaEnforced: true,
          processesPii: true,
          processesSensitiveData: true,
          environment: 'PRODUCTION'
        },
        {
          id: 'app_2',
          code: 'APP-002',
          name: 'Okta Workforce Identity Provider',
          purpose: 'Centralized directory services, employee SSO, WebAuthn MFA enforcement, and lifecycle deprovisioning.',
          businessProcess: 'Enterprise Client Onboarding & Identity Provisioning',
          owner: 'Sarah Chen',
          department: 'Information Security & GRC',
          hostingModel: 'SAAS',
          criticality: 'CRITICAL',
          authenticationMethod: 'PASSWORD_MFA',
          mfaEnforced: true,
          processesPii: true,
          processesSensitiveData: true,
          vendorName: 'Okta Inc.',
          environment: 'PRODUCTION'
        },
        {
          id: 'app_3',
          code: 'APP-003',
          name: 'GitHub Enterprise Cloud',
          purpose: 'Source code version control, automated CI/CD workflows, and branch protection security enforcement.',
          businessProcess: 'Cloud Infrastructure Provisioning & CI/CD Release Pipeline',
          owner: 'Marcus Brody',
          department: 'Cloud Platform & Infrastructure Engineering',
          hostingModel: 'SAAS',
          criticality: 'HIGH',
          authenticationMethod: 'SSO_SAML_OIDC',
          mfaEnforced: true,
          processesPii: false,
          processesSensitiveData: true,
          vendorName: 'GitHub / Microsoft',
          environment: 'PRODUCTION'
        },
        {
          id: 'app_4',
          code: 'APP-004',
          name: 'CrowdStrike Falcon EDR',
          purpose: 'Endpoint threat prevention, host-based telemetry monitoring, and automated quarantine isolation.',
          businessProcess: 'Security Incident Detection, Triage & Response',
          owner: 'Sarah Chen',
          department: 'Information Security & GRC',
          hostingModel: 'SAAS',
          criticality: 'CRITICAL',
          authenticationMethod: 'SSO_SAML_OIDC',
          mfaEnforced: true,
          processesPii: false,
          processesSensitiveData: true,
          vendorName: 'CrowdStrike Inc.',
          environment: 'PRODUCTION'
        }
      ],
      assets: [
        {
          id: 'ast_1',
          code: 'AST-001',
          name: 'AWS Production EKS Kubernetes Cluster (us-east-1)',
          category: 'CLOUD_RESOURCE',
          owner: 'Marcus Brody',
          processId: 'proc_2',
          applicationId: 'app_1',
          siteId: 'site_3',
          department: 'Cloud Platform & Infrastructure Engineering',
          classification: 'CONFIDENTIAL',
          cloudProvider: 'AWS',
          ipOrHostname: 'k8s-prod-useast1.skanda.internal',
          criticality: 'CRITICAL'
        },
        {
          id: 'ast_2',
          code: 'AST-002',
          name: 'AWS Aurora PostgreSQL Production Multi-AZ Cluster',
          category: 'DATABASE',
          owner: 'Marcus Brody',
          processId: 'proc_3',
          applicationId: 'app_1',
          siteId: 'site_3',
          department: 'Cloud Platform & Infrastructure Engineering',
          classification: 'RESTRICTED',
          cloudProvider: 'AWS',
          ipOrHostname: 'aurora-pg-prod.cluster-ro-xyz.us-east-1.rds.amazonaws.com',
          criticality: 'CRITICAL'
        },
        {
          id: 'ast_3',
          code: 'AST-003',
          name: 'AWS S3 Immutable WORM Audit Evidence Vault',
          category: 'STORAGE',
          owner: 'Sarah Chen',
          processId: 'proc_3',
          applicationId: 'app_1',
          siteId: 'site_3',
          department: 'Information Security & GRC',
          classification: 'RESTRICTED',
          cloudProvider: 'AWS',
          ipOrHostname: 's3://skanda-worm-evidence-vault-prod',
          criticality: 'CRITICAL'
        },
        {
          id: 'ast_4',
          code: 'AST-004',
          name: 'Corporate Fleet Managed MacBooks & Laptops (350 Units)',
          category: 'ENDPOINT',
          owner: 'Sarah Chen',
          siteId: 'site_1',
          department: 'Information Security & GRC',
          classification: 'CONFIDENTIAL',
          criticality: 'HIGH'
        }
      ],
      dataAssets: [
        {
          id: 'dat_1',
          code: 'DAT-001',
          name: 'Enterprise Client User Profile & Authentication Data',
          dataCategory: 'CUSTOMER_PII',
          dataOwner: 'Sarah Chen',
          processId: 'proc_1',
          applicationId: 'app_1',
          storageSystems: ['PostgreSQL Production DB', 'Okta Directory'],
          geographicLocations: ['US (us-east-1)'],
          classification: 'CONFIDENTIAL',
          isPii: true,
          isSensitivePersonalData: false,
          retentionPeriodMonths: 84,
          encryptionAtRest: true,
          encryptionInTransit: true,
          sharedWithThirdParties: false,
          crossBorderTransfer: false,
          dpdpRelevant: true,
          gdprRelevant: true
        },
        {
          id: 'dat_2',
          code: 'DAT-002',
          name: 'Statutory Compliance Audit Evidence & Cryptographic Hashes',
          dataCategory: 'BUSINESS_CONFIDENTIAL',
          dataOwner: 'Sarah Chen',
          processId: 'proc_3',
          applicationId: 'app_1',
          storageSystems: ['AWS S3 WORM Vault', 'PostgreSQL DB'],
          geographicLocations: ['US (us-east-1)'],
          classification: 'RESTRICTED',
          isPii: false,
          isSensitivePersonalData: false,
          retentionPeriodMonths: 120,
          encryptionAtRest: true,
          encryptionInTransit: true,
          sharedWithThirdParties: true, // Accredited Auditors
          crossBorderTransfer: false,
          dpdpRelevant: false,
          gdprRelevant: false
        }
      ],
      vendors: [
        {
          id: 'vnd_1',
          code: 'VND-001',
          name: 'Amazon Web Services (AWS)',
          serviceCategory: 'Cloud Infrastructure & Managed Services (IaaS/PaaS)',
          supportedProcessIds: ['proc_1', 'proc_2', 'proc_3', 'proc_4'],
          criticality: 'TIER_1_CRITICAL',
          hasDataAccess: true,
          hasPiiAccess: false, // Customer encrypted via KMS HSM
          hostingLocation: 'USA (us-east-1, us-west-2)',
          country: 'United States',
          contractStatus: 'ACTIVE',
          dpaSigned: true,
          securityCertifications: ['ISO/IEC 27001:2022', 'SOC 2 Type II', 'PCI-DSS Level 1', 'FedRAMP High'],
          assessedRiskLevel: 'LOW',
          primaryContactEmail: 'aws-enterprise-support@amazon.com'
        },
        {
          id: 'vnd_2',
          code: 'VND-002',
          name: 'Okta, Inc.',
          serviceCategory: 'Cloud Identity Provider & MFA',
          supportedProcessIds: ['proc_1'],
          criticality: 'TIER_1_CRITICAL',
          hasDataAccess: true,
          hasPiiAccess: true,
          hostingLocation: 'USA & Global',
          country: 'United States',
          contractStatus: 'ACTIVE',
          dpaSigned: true,
          securityCertifications: ['ISO/IEC 27001:2022', 'ISO 27018', 'SOC 2 Type II'],
          assessedRiskLevel: 'LOW',
          primaryContactEmail: 'support@okta.com'
        },
        {
          id: 'vnd_3',
          code: 'VND-003',
          name: 'CrowdStrike, Inc.',
          serviceCategory: 'Managed EDR & Incident Response Telemetry',
          supportedProcessIds: ['proc_4'],
          criticality: 'TIER_1_CRITICAL',
          hasDataAccess: true,
          hasPiiAccess: false,
          hostingLocation: 'USA',
          country: 'United States',
          contractStatus: 'ACTIVE',
          dpaSigned: true,
          securityCertifications: ['SOC 2 Type II', 'ISO 27001'],
          assessedRiskLevel: 'LOW',
          primaryContactEmail: 'enterprise@crowdstrike.com'
        }
      ],
      technology: {
        cloudProviders: ['AWS'],
        awsDetails: {
          regions: ['us-east-1', 'us-west-2'],
          coreServices: ['EKS', 'RDS Aurora', 'S3 WORM', 'KMS HSM', 'GuardDuty', 'WAF', 'CloudWatch'],
          accountCount: 4
        },
        containerization: ['KUBERNETES', 'DOCKER_ECS'],
        databases: ['PostgreSQL Relational', 'Redis Cache', 'AWS DynamoDB'],
        securityStack: {
          siemSolution: 'AWS GuardDuty & Datadog Cloud SIEM',
          edrSolution: 'CrowdStrike Falcon',
          dlpSolution: 'AWS Macie & Symantec DLP',
          wafSolution: 'AWS WAF Enterprise Rule Sets',
          iamProvider: 'Okta Enterprise + AWS IAM Identity Center',
          vulnerabilityManagement: 'Qualys VMDR & Snyk Container Scan',
          backupFrequency: 'CONTINUOUS_REPLICATION',
          drTestingFrequency: 'SEMI_ANNUAL'
        },
        hasOtIcsSystems: false,
        remoteAccessSecurity: ['MFA_VPN', 'ZTNA_ZERO_TRUST', 'DEVICE_CERTIFICATES', 'MDM_ENFORCED']
      },
      criticalServices: [
        {
          id: 'cbs_1',
          code: 'CBS-001',
          serviceName: 'Continuous Compliance & Real-Time GRC Evaluation Engine',
          serviceOwner: 'Sarah Chen',
          description: 'Core evaluation cluster computing compliance posture, processing telemetry events, and maintaining audit assertions.',
          criticality: 'TIER_1_MISSION_CRITICAL',
          maxTolerableDowntimeHours: 2,
          targetRtoHours: 1,
          targetRpoHours: 0.25,
          dependentProcessIds: ['proc_1', 'proc_2', 'proc_3'],
          dependentApplicationIds: ['app_1'],
          dependentDataAssetIds: ['dat_1', 'dat_2'],
          dependentSiteIds: ['site_3'],
          dependentVendorIds: ['vnd_1'],
          financialImpactPerHour: 25000,
          regulatoryImpact: 'HIGH'
        },
        {
          id: 'cbs_2',
          code: 'CBS-002',
          serviceName: 'Cryptographic WORM Evidence Ingestion & Verification Vault',
          serviceOwner: 'Sarah Chen',
          description: 'Immutable ledger verifying SHA-256 evidence integrity for external auditors and statutory certifiers.',
          criticality: 'TIER_1_MISSION_CRITICAL',
          maxTolerableDowntimeHours: 4,
          targetRtoHours: 2,
          targetRpoHours: 0,
          dependentProcessIds: ['proc_3'],
          dependentApplicationIds: ['app_1'],
          dependentDataAssetIds: ['dat_2'],
          dependentSiteIds: ['site_3'],
          dependentVendorIds: ['vnd_1'],
          financialImpactPerHour: 15000,
          regulatoryImpact: 'HIGH'
        }
      ]
    };
  }

  /**
   * Helper to generate stable next IDs
   */
  public generateNextCode(prefix: string, existingItems: Array<{ code?: string }>): string {
    const existingNumbers = existingItems
      .map(item => item.code || '')
      .filter(code => code.startsWith(prefix + '-'))
      .map(code => parseInt(code.replace(prefix + '-', ''), 10))
      .filter(n => !isNaN(n));

    const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
  }

  /**
   * Generates a 360-degree relationship graph from the discovery data
   */
  public buildEntity360Graph(data: EnterpriseDiscoveryData, rootEntityCode?: string): Entity360Graph {
    const nodes: EntityNode[] = [];
    const edges: EntityEdge[] = [];

    // Add Processes
    for (const p of data.businessProcesses) {
      nodes.push({
        id: p.id,
        type: 'PROCESS',
        code: p.code,
        title: p.name,
        status: p.criticality
      });
    }

    // Add Applications
    for (const a of data.applications) {
      nodes.push({
        id: a.id,
        type: 'ASSET',
        code: a.code,
        title: a.name,
        status: a.criticality
      });
    }

    // Add Assets
    for (const ast of data.assets) {
      nodes.push({
        id: ast.id,
        type: 'ASSET',
        code: ast.code,
        title: ast.name,
        status: ast.classification
      });
    }

    // Add Vendors
    for (const v of data.vendors) {
      nodes.push({
        id: v.id,
        type: 'VENDOR',
        code: v.code,
        title: v.name,
        status: v.criticality
      });
    }

    // Relationships: Process -> Applications
    for (const p of data.businessProcesses) {
      for (const appName of p.applicationsUsed) {
        const app = data.applications.find(a => a.name === appName || a.code === appName || a.id === appName);
        if (app) {
          edges.push({
            sourceId: p.id,
            targetId: app.id,
            relationship: 'DEPENDS_ON'
          });
        }
      }

      // Process -> Vendors
      for (const vName of p.vendorsUsed) {
        const vnd = data.vendors.find(v => v.name === vName || v.code === vName || v.id === vName);
        if (vnd) {
          edges.push({
            sourceId: p.id,
            targetId: vnd.id,
            relationship: 'DEPENDS_ON'
          });
        }
      }
    }

    // Relationships: Asset -> Process / App
    for (const ast of data.assets) {
      if (ast.processId) {
        edges.push({
          sourceId: ast.id,
          targetId: ast.processId,
          relationship: 'PROTECTS'
        });
      }
      if (ast.applicationId) {
        edges.push({
          sourceId: ast.id,
          targetId: ast.applicationId,
          relationship: 'MAPS_TO'
        });
      }
    }

    // Select root
    const rootNode = nodes.find(n => n.code === rootEntityCode) || nodes[0] || {
      id: 'root_default',
      type: 'PROCESS',
      code: 'ROOT',
      title: 'Primary Entity',
      status: 'ACTIVE'
    };

    return {
      rootEntity: rootNode,
      connectedNodes: nodes,
      nodes,
      edges
    };
  }

  /**
   * Calculate live summary metrics across discovered business entities
   */
  public getDiscoverySummaryMetrics(data: EnterpriseDiscoveryData) {
    return {
      totalProcesses: data.businessProcesses?.length || 0,
      totalDepartments: data.departments?.length || 0,
      totalApplications: data.applications?.length || 0,
      totalAssets: data.assets?.length || 0,
      totalDataAssets: data.dataAssets?.length || 0,
      totalVendors: data.vendors?.length || 0,
      totalSites: data.sites?.length || 0,
      totalCriticalServices: data.criticalServices?.length || 0,
      criticalProcessesCount: (data.businessProcesses || []).filter(p => p.criticality === 'TIER_1_MISSION_CRITICAL').length,
      piiProcessesCount: (data.businessProcesses || []).filter(p => p.processesPii).length,
      criticalVendorsCount: (data.vendors || []).filter(v => v.criticality === 'TIER_1_CRITICAL' || v.criticality === 'TIER_2_MAJOR').length,
      criticalApplicationsCount: (data.applications || []).filter(a => a.criticality === 'CRITICAL' || a.criticality === 'HIGH').length
    };
  }

  /**
   * Catalog of Enterprise Process Starter Templates
   */
  public getProcessTemplates(industry?: string, framework?: string): ProcessTemplateItem[] {
    const templates: ProcessTemplateItem[] = [
      {
        id: 'tmpl_sdlc',
        name: 'Software Development Lifecycle (SDLC) & CI/CD Pipeline',
        category: 'ENGINEERING',
        industryRelevance: ['SAAS_CLOUD_SOFTWARE', 'FINTECH_BANKING', 'AI_ML_DATA_ANALYTICS', 'ECOMMERCE_RETAIL'],
        frameworkRelevance: ['ISO_27001_2022', 'SOC_2_TYPE_2', 'MAS_TRM_2024', 'ISO_42001_2023'],
        defaultOwner: 'Head of Engineering / CTO',
        defaultDepartment: 'Product Engineering',
        criticality: 'TIER_1_MISSION_CRITICAL',
        isCustomerFacing: false,
        processesPii: false,
        processesSensitiveInfo: true,
        suggestedApplications: ['GitHub Enterprise', 'Jira Software', 'AWS CodePipeline', 'SonarQube'],
        suggestedVendors: ['GitHub / Microsoft', 'Amazon Web Services', 'Atlassian'],
        suggestedDataAssets: ['Proprietary Source Code', 'Build Artifacts & Secrets'],
        description: 'End-to-end agile software development, code peer reviews, static analysis, vulnerability scanning, automated testing, and production deployment pipeline.'
      },
      {
        id: 'tmpl_customer_onb',
        name: 'Enterprise Customer Onboarding & KYC Verification',
        category: 'OPERATIONS',
        industryRelevance: ['FINTECH_BANKING', 'SAAS_CLOUD_SOFTWARE', 'HEALTHCARE_MEDTECH', 'ECOMMERCE_RETAIL'],
        frameworkRelevance: ['ISO_27001_2022', 'ISO_27701_2019', 'DPDPA_2023', 'MAS_TRM_2024', 'SOC_2_TYPE_2'],
        defaultOwner: 'VP of Operations',
        defaultDepartment: 'Client Operations & Support',
        criticality: 'TIER_1_MISSION_CRITICAL',
        isCustomerFacing: true,
        processesPii: true,
        processesSensitiveInfo: true,
        suggestedApplications: ['Salesforce CRM', 'Jumio / Trulioo KYC Platform', 'Okta Customer Identity'],
        suggestedVendors: ['Salesforce Inc.', 'Okta Inc.'],
        suggestedDataAssets: ['Customer PII & Identity Records', 'Payment & Billing Metadata'],
        description: 'Client account registration, identity document verification, AML sanctions screening, credential issuance, and enterprise workspace provisioning.'
      },
      {
        id: 'tmpl_employee_lifecycle',
        name: 'Employee Onboarding, Role-Based Access & Deprovisioning',
        category: 'HR',
        industryRelevance: ['SAAS_CLOUD_SOFTWARE', 'FINTECH_BANKING', 'HEALTHCARE_MEDTECH', 'ALL'],
        frameworkRelevance: ['ISO_27001_2022', 'ISO_27701_2019', 'SOC_2_TYPE_2', 'MAS_TRM_2024'],
        defaultOwner: 'Head of People Operations',
        defaultDepartment: 'Human Resources & Talent',
        criticality: 'TIER_2_BUSINESS_CRITICAL',
        isCustomerFacing: false,
        processesPii: true,
        processesSensitiveInfo: true,
        suggestedApplications: ['Workday HRIS', 'Okta SSO', 'Google Workspace / M365'],
        suggestedVendors: ['Workday Inc.', 'Okta Inc.', 'Microsoft Corporation'],
        suggestedDataAssets: ['Employee HR Records', 'Background Check Dossiers', 'Payroll Bank Data'],
        description: 'Recruitment screening, criminal background verification, security awareness training, least-privilege role provisioning, and immediate same-day exit deactivation.'
      },
      {
        id: 'tmpl_secops_incident',
        name: 'Security Incident Detection, Triage & Breach Notification',
        category: 'SECURITY',
        industryRelevance: ['SAAS_CLOUD_SOFTWARE', 'FINTECH_BANKING', 'HEALTHCARE_MEDTECH', 'CRITICAL_INFRA'],
        frameworkRelevance: ['ISO_27001_2022', 'MAS_TRM_2024', 'DPDPA_2023', 'SOC_2_TYPE_2', 'NIST_CSF_2_0'],
        defaultOwner: 'Chief Information Security Officer',
        defaultDepartment: 'Information Security & GRC',
        criticality: 'TIER_1_MISSION_CRITICAL',
        isCustomerFacing: false,
        processesPii: true,
        processesSensitiveInfo: true,
        suggestedApplications: ['CrowdStrike Falcon', 'Splunk SIEM', 'PagerDuty', 'AWS GuardDuty'],
        suggestedVendors: ['CrowdStrike', 'Splunk / Cisco', 'PagerDuty Inc.'],
        suggestedDataAssets: ['Security Audit Logs', 'Threat Telemetry Streams', 'Incident Forensic Captures'],
        description: '24/7 continuous threat monitoring, automated endpoint quarantine, containment playbooks, forensic ledger analysis, and statutory 6-hour regulatory breach disclosure.'
      },
      {
        id: 'tmpl_vendor_tprm',
        name: 'Third-Party Vendor Risk Assessment & DPA Governance',
        category: 'GOVERNANCE',
        industryRelevance: ['SAAS_CLOUD_SOFTWARE', 'FINTECH_BANKING', 'HEALTHCARE_MEDTECH', 'ALL'],
        frameworkRelevance: ['ISO_27001_2022', 'ISO_27701_2019', 'MAS_TRM_2024', 'SOC_2_TYPE_2'],
        defaultOwner: 'Head of Procurement & Legal',
        defaultDepartment: 'Legal & Risk Management',
        criticality: 'TIER_2_BUSINESS_CRITICAL',
        isCustomerFacing: false,
        processesPii: false,
        processesSensitiveInfo: true,
        suggestedApplications: ['SKANDA TPRM Module', 'Ironclad Contract Lifecycle', 'Whistic Vendor Security'],
        suggestedVendors: ['Ironclad Inc.'],
        suggestedDataAssets: ['Executed Vendor Contracts', 'Data Protection Agreements (DPA)', 'SOC 2 / ISO Certificates'],
        description: 'Vendor due diligence, security architecture review, Data Protection Agreement (DPA) execution, annual SOC2/ISO review, and SLA monitoring.'
      },
      {
        id: 'tmpl_bcp_dr',
        name: 'Backup, Point-in-Time Recovery & Disaster Resilience (DR)',
        category: 'OPERATIONS',
        industryRelevance: ['SAAS_CLOUD_SOFTWARE', 'FINTECH_BANKING', 'HEALTHCARE_MEDTECH', 'CRITICAL_INFRA'],
        frameworkRelevance: ['ISO_27001_2022', 'MAS_TRM_2024', 'ISO_22301_2019', 'SOC_2_TYPE_2'],
        defaultOwner: 'Director of Cloud Operations',
        defaultDepartment: 'Cloud Platform & Infrastructure Engineering',
        criticality: 'TIER_1_MISSION_CRITICAL',
        isCustomerFacing: false,
        processesPii: true,
        processesSensitiveInfo: true,
        suggestedApplications: ['AWS Backup', 'AWS KMS Envelope Encryption', 'Terraform Cloud'],
        suggestedVendors: ['Amazon Web Services', 'HashiCorp'],
        suggestedDataAssets: ['Immutable Encrypted Database Snapshots', 'Multi-Region Replication Archives'],
        description: 'Automated continuous database replication (RPO <= 5m), cross-region hot standby failover (RTO <= 15m), and bi-annual audited DR recovery drills.'
      }
    ];

    if (industry) {
      const norm = industry.toUpperCase();
      return templates.filter(t => 
        t.industryRelevance.includes('ALL') || 
        t.industryRelevance.some(rel => norm.includes(rel) || rel.includes(norm) || 
          (norm.includes('SAAS') && rel.includes('SAAS')) || 
          (norm.includes('FINTECH') && rel.includes('FINTECH')) || 
          (norm.includes('HEALTH') && rel.includes('HEALTH')) ||
          (norm.includes('TECH') && rel.includes('SAAS'))
        )
      );
    }
    if (framework) {
      const normF = framework.toUpperCase();
      return templates.filter(t => t.frameworkRelevance.some(fr => fr.toUpperCase().includes(normF) || normF.includes(fr.toUpperCase())));
    }
    return templates;
  }

  /**
   * Workshop Activity Suggestions Generator
   * Maps selected business activities into recommended candidate processes, applications, data assets, and risks.
   */
  public getWorkshopActivitySuggestions(activityKeys: string[]): {
    suggestedProcesses: Array<{ name: string; department: string; criticality: string; description: string }>;
    suggestedApplications: Array<{ name: string; hostingModel: string; criticality: string; purpose: string }>;
    suggestedDataAssets: Array<{ name: string; category: string; isPii: boolean }>;
    suggestedVendors: Array<{ name: string; category: string; criticality: string }>;
  } {
    const processes: Array<{ name: string; department: string; criticality: string; description: string }> = [];
    const applications: Array<{ name: string; hostingModel: string; criticality: string; purpose: string }> = [];
    const dataAssets: Array<{ name: string; category: string; isPii: boolean }> = [];
    const vendors: Array<{ name: string; category: string; criticality: string }> = [];

    const keys = activityKeys.map(k => k.toUpperCase());

    if (keys.some(k => k.includes('SOFTWARE') || k.includes('TECH') || k.includes('DEV'))) {
      processes.push(
        { name: 'Software Development Lifecycle (SDLC)', department: 'Product Engineering', criticality: 'TIER_1_MISSION_CRITICAL', description: 'Code management, PR reviews, CI/CD pipeline, and automated testing.' },
        { name: 'Production Change Management', department: 'Cloud Infrastructure', criticality: 'TIER_2_BUSINESS_CRITICAL', description: 'Infrastructure-as-code deployments and release approvals.' }
      );
      applications.push(
        { name: 'GitHub Enterprise', hostingModel: 'SAAS', criticality: 'CRITICAL', purpose: 'Source code repository and CI/CD actions.' },
        { name: 'AWS Cloud Infrastructure', hostingModel: 'CLOUD_AWS', criticality: 'CRITICAL', purpose: 'Production VPC, Kubernetes clusters, and databases.' }
      );
      dataAssets.push(
        { name: 'Application Source Code & Secrets', category: 'INTELLECTUAL_PROPERTY', isPii: false },
        { name: 'Application Telemetry & Access Logs', category: 'BUSINESS_CONFIDENTIAL', isPii: false }
      );
      vendors.push(
        { name: 'Amazon Web Services', category: 'Cloud Hosting', criticality: 'TIER_1_CRITICAL' },
        { name: 'GitHub / Microsoft', category: 'Development Tooling', criticality: 'TIER_2_MAJOR' }
      );
    }

    if (keys.some(k => k.includes('FINTECH') || k.includes('FINANCE') || k.includes('FINANCIAL') || k.includes('BANK') || k.includes('PAYMENT'))) {
      processes.push(
        { name: 'Customer Onboarding & KYC Screening', department: 'Compliance & Operations', criticality: 'TIER_1_MISSION_CRITICAL', description: 'Identity verification, AML sanction screening, and account setup.' },
        { name: 'Transaction & Payment Settlement Processing', department: 'Core Banking / Treasury', criticality: 'TIER_1_MISSION_CRITICAL', description: 'Payment routing, clearing, and reconciliation.' }
      );
      applications.push(
        { name: 'Stripe Payment Gateway', hostingModel: 'SAAS', criticality: 'CRITICAL', purpose: 'Card processing and automated billing.' },
        { name: 'Jumio Identity Verification', hostingModel: 'SAAS', criticality: 'HIGH', purpose: 'KYC biometric and government ID verification.' }
      );
      dataAssets.push(
        { name: 'Customer Identity & KYC Documents', category: 'CUSTOMER_PII', isPii: true },
        { name: 'Payment Card & Account Numbers (PAN)', category: 'FINANCIAL_PAYMENT', isPii: true }
      );
      vendors.push(
        { name: 'Stripe Inc.', category: 'Payment Gateway', criticality: 'TIER_1_CRITICAL' },
        { name: 'Jumio Inc.', category: 'Identity Verification', criticality: 'TIER_2_MAJOR' }
      );
    }

    if (keys.some(k => k.includes('AI') || k.includes('ML') || k.includes('DATA'))) {
      processes.push(
        { name: 'AI Model Training & Evaluation', department: 'AI Research & Data Science', criticality: 'TIER_2_BUSINESS_CRITICAL', description: 'Data ingestion, prompt tuning, bias auditing, and model governance (ISO 42001).' }
      );
      applications.push(
        { name: 'OpenAI Enterprise / Anthropic API', hostingModel: 'SAAS', criticality: 'HIGH', purpose: 'LLM inference and semantic search.' }
      );
      dataAssets.push(
        { name: 'AI Fine-Tuning Training Datasets', category: 'INTELLECTUAL_PROPERTY', isPii: false }
      );
    }

    // Default general enterprise baseline if empty
    if (processes.length === 0) {
      processes.push(
        { name: 'Enterprise Employee Lifecycle & Access Provisioning', department: 'Human Resources', criticality: 'TIER_2_BUSINESS_CRITICAL', description: 'Onboarding, background verification, and access deprovisioning.' },
        { name: 'SecOps Incident Response & Threat Monitoring', department: 'Information Security', criticality: 'TIER_1_MISSION_CRITICAL', description: '24/7 log monitoring, alert triage, and incident containment.' }
      );
      applications.push(
        { name: 'Okta Workforce Identity', hostingModel: 'SAAS', criticality: 'CRITICAL', purpose: 'Single Sign-On and Multi-Factor Authentication.' },
        { name: 'Google Workspace / M365', hostingModel: 'SAAS', criticality: 'HIGH', purpose: 'Corporate email, documents, and communication.' }
      );
      dataAssets.push(
        { name: 'Employee HR & Payroll Records', category: 'EMPLOYEE_HR', isPii: true }
      );
    }

    return {
      suggestedProcesses: processes,
      suggestedApplications: applications,
      suggestedDataAssets: dataAssets,
      suggestedVendors: vendors
    };
  }

  /**
   * Process Builder: Duplicate an existing process
   */
  public duplicateProcess(data: EnterpriseDiscoveryData, processId: string): DiscoveryProcessItem | null {
    const existing = data.businessProcesses.find(p => p.id === processId);
    if (!existing) return null;

    const nextCode = `PROC-${String(data.businessProcesses.length + 1).padStart(3, '0')}`;
    const duplicated: DiscoveryProcessItem = {
      ...existing,
      id: `proc_dup_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      code: nextCode,
      name: `${existing.name} (Copy)`
    };

    data.businessProcesses.push(duplicated);
    return duplicated;
  }

  /**
   * Process Builder: Archive a process
   */
  public archiveProcess(data: EnterpriseDiscoveryData, processId: string): boolean {
    const idx = data.businessProcesses.findIndex(p => p.id === processId);
    if (idx >= 0) {
      data.businessProcesses.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Calculates comprehensive discovery completeness and stage progress
   */
  public calculateDiscoveryCompleteness(data: EnterpriseDiscoveryData): DiscoveryCompletenessReport {
    const stages: StageProgressItem[] = [];

    // 1. Org Profile (weight: 10%)
    const orgReq = ['legalName', 'industry', 'country', 'operatingModel', 'organizationSize', 'cisoEmail'];
    const orgFilled = orgReq.filter(f => Boolean((data.orgProfile as any)[f])).length;
    const orgPct = Math.round((orgFilled / orgReq.length) * 100);
    stages.push({
      stageKey: 'ORG_PROFILE',
      title: 'Organization Profile',
      percentage: orgPct,
      status: orgPct >= 100 ? 'COMPLETED' : orgPct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
      itemsCount: orgFilled,
      requiredCount: orgReq.length
    });

    // 2. Compliance Goals (weight: 10%)
    const progPct = data.selectedPrograms.length > 0 ? 100 : 0;
    stages.push({
      stageKey: 'COMPLIANCE_GOALS',
      title: 'Compliance Standards & Goals',
      percentage: progPct,
      status: progPct === 100 ? 'COMPLETED' : 'NOT_STARTED',
      itemsCount: data.selectedPrograms.length,
      requiredCount: 1
    });

    // 3. Business Context & Activities (weight: 10%)
    const actPct = data.businessActivities.length >= 2 ? 100 : data.businessActivities.length === 1 ? 50 : 0;
    stages.push({
      stageKey: 'BUSINESS_ACTIVITIES',
      title: 'Business Context & Activities',
      percentage: actPct,
      status: actPct >= 100 ? 'COMPLETED' : actPct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
      itemsCount: data.businessActivities.length,
      requiredCount: 2
    });

    // 4. Business Processes (weight: 20%)
    const procPct = data.businessProcesses.length >= 4 ? 100 : Math.round((data.businessProcesses.length / 4) * 100);
    stages.push({
      stageKey: 'PROCESSES',
      title: 'Business Process Catalog',
      percentage: procPct,
      status: procPct >= 100 ? 'COMPLETED' : procPct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
      itemsCount: data.businessProcesses.length,
      requiredCount: 4
    });

    // 5. Technology & Applications (weight: 20%)
    const techItems = data.applications.length + data.assets.length;
    const techPct = techItems >= 8 ? 100 : Math.round((techItems / 8) * 100);
    stages.push({
      stageKey: 'TECHNOLOGY',
      title: 'Applications & Infrastructure',
      percentage: techPct,
      status: techPct >= 100 ? 'COMPLETED' : techPct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
      itemsCount: techItems,
      requiredCount: 8
    });

    // 6. Data & Privacy (weight: 10%)
    const dataPct = data.dataAssets.length >= 3 ? 100 : Math.round((data.dataAssets.length / 3) * 100);
    stages.push({
      stageKey: 'DATA_PRIVACY',
      title: 'Data Classification & PII',
      percentage: dataPct,
      status: dataPct >= 100 ? 'COMPLETED' : dataPct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
      itemsCount: data.dataAssets.length,
      requiredCount: 3
    });

    // 7. Vendors & TPRM (weight: 10%)
    const vndPct = data.vendors.length >= 3 ? 100 : Math.round((data.vendors.length / 3) * 100);
    stages.push({
      stageKey: 'VENDORS_TPRM',
      title: 'Third-Party Risk (Vendors)',
      percentage: vndPct,
      status: vndPct >= 100 ? 'COMPLETED' : vndPct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
      itemsCount: data.vendors.length,
      requiredCount: 3
    });

    // 8. Critical Services & Resilience (weight: 10%)
    const cbsPct = data.criticalServices.length >= 1 ? 100 : 0;
    stages.push({
      stageKey: 'CRITICAL_SERVICES',
      title: 'Critical Services & Resilience',
      percentage: cbsPct,
      status: cbsPct === 100 ? 'COMPLETED' : 'NOT_STARTED',
      itemsCount: data.criticalServices.length,
      requiredCount: 1
    });

    // Compute weighted score
    const overallScore = Math.round(
      (orgPct * 0.1) +
      (progPct * 0.1) +
      (actPct * 0.1) +
      (procPct * 0.2) +
      (techPct * 0.2) +
      (dataPct * 0.1) +
      (vndPct * 0.1) +
      (cbsPct * 0.1)
    );

    const qualityGaps = this.detectDiscoveryQualityGaps(data);

    const nextBestActions = qualityGaps.map(g => ({
      id: `nba_${g.id}`,
      title: `${g.title}: ${g.issue}`,
      priority: g.severity === 'CRITICAL' ? 'CRITICAL' as const : g.severity === 'HIGH' ? 'HIGH' as const : 'MEDIUM' as const,
      category: g.entityType,
      actionUrl: `#step-${g.entityType.toLowerCase()}`,
      suggestedFix: g.recommendation
    }));

    return {
      overallScore,
      stages,
      stageProgress: stages,
      qualityGaps,
      missingInformationCount: qualityGaps.length,
      nextBestActions
    };
  }

  /**
   * Deterministic Discovery Quality Checks Engine
   */
  public detectDiscoveryQualityGaps(data: EnterpriseDiscoveryData): DiscoveryQualityGap[] {
    const gaps: DiscoveryQualityGap[] = [];

    // 1. Process checks
    data.businessProcesses.forEach(p => {
      if (!p.processOwner || p.processOwner.trim() === '') {
        gaps.push({
          id: `gap_proc_no_owner_${p.id}`,
          entityType: 'PROCESS',
          entityId: p.id,
          entityCode: p.code,
          title: `Process Without Owner`,
          severity: 'HIGH',
          issue: `Business process "${p.name}" has no assigned Process Owner.`,
          recommendation: 'Assign a designated Department or Operational Lead as the process owner.'
        });
      }
      if (p.criticality === 'TIER_1_MISSION_CRITICAL' && (!p.applicationsUsed || p.applicationsUsed.length === 0)) {
        gaps.push({
          id: `gap_proc_app_${p.id}`,
          entityType: 'PROCESS',
          entityId: p.id,
          entityCode: p.code,
          title: `Mission-Critical Process Missing Systems`,
          severity: 'CRITICAL',
          issue: `Tier 1 process "${p.name}" has no supporting applications or systems registered.`,
          recommendation: 'Link at least one primary software system or database that executes this process.'
        });
      }
      if (p.processesPii && (!p.vendorsUsed || p.vendorsUsed.length === 0) && data.dataAssets.length === 0) {
        gaps.push({
          id: `gap_proc_pii_${p.id}`,
          entityType: 'PROCESS',
          entityId: p.id,
          entityCode: p.code,
          title: `PII Processing Data Asset Unlinked`,
          severity: 'HIGH',
          issue: `Process "${p.name}" declares personal data handling but links zero Data Assets.`,
          recommendation: 'Catalog the specific PII data categories processed during this workflow.'
        });
      }
    });

    // 2. Application checks
    data.applications.forEach(a => {
      if (!a.owner || a.owner.trim() === '') {
        gaps.push({
          id: `gap_app_owner_${a.id}`,
          entityType: 'APPLICATION',
          entityId: a.id,
          entityCode: a.code,
          title: `Application Owner Missing`,
          severity: 'MEDIUM',
          issue: `Application "${a.name}" has no system custodian assigned.`,
          recommendation: 'Assign an IT or SecOps custodian responsible for access and patching.'
        });
      }
      if (a.criticality === 'CRITICAL' && !a.mfaEnforced) {
        gaps.push({
          id: `gap_app_no_mfa_${a.id}`,
          entityType: 'APPLICATION',
          entityId: a.id,
          entityCode: a.code,
          title: `Critical Application Without MFA`,
          severity: 'CRITICAL',
          issue: `Tier 1 application "${a.name}" does not enforce Multi-Factor Authentication (MFA).`,
          recommendation: 'Enforce SSO SAML/OIDC or hardware WebAuthn MFA.'
        });
      }
    });

    // 3. Vendor checks
    data.vendors.forEach(v => {
      if (v.hasPiiAccess && !v.dpaSigned) {
        gaps.push({
          id: `gap_vnd_dpa_${v.id}`,
          entityType: 'VENDOR',
          entityId: v.id,
          entityCode: v.code,
          title: `Vendor PII Access without Signed DPA`,
          severity: 'CRITICAL',
          issue: `Vendor "${v.name}" accesses personal data but Data Protection Agreement (DPA) is not signed.`,
          recommendation: 'Execute statutory GDPR / DPDP Data Protection Addendum immediately.'
        });
      }
    });

    // 4. Data asset checks
    data.dataAssets.forEach(d => {
      if (d.isPii && (!d.retentionPeriodMonths || d.retentionPeriodMonths <= 0)) {
        gaps.push({
          id: `gap_dat_ret_${d.id}`,
          entityType: 'DATA_ASSET',
          entityId: d.id,
          entityCode: d.code,
          title: `PII Data Asset Missing Retention Period`,
          severity: 'HIGH',
          issue: `Data Asset "${d.name}" has no formal retention schedule defined.`,
          recommendation: 'Define statutory retention schedule in months and automated erasure rules.'
        });
      }
    });

    // 5. Critical service checks
    data.criticalServices.forEach(c => {
      if (!c.maxTolerableDowntimeHours || c.maxTolerableDowntimeHours <= 0) {
        gaps.push({
          id: `gap_cbs_mtd_${c.id}`,
          entityType: 'CRITICAL_SERVICE',
          entityId: c.id,
          entityCode: c.code,
          title: `Critical Service Missing MTD`,
          severity: 'HIGH',
          issue: `Critical Business Service "${c.serviceName}" has no Maximum Tolerable Downtime (MTD) defined.`,
          recommendation: 'Establish executive MTD ceiling and target RTO/RPO metrics.'
        });
      }
    });

    // 6. Department checks
    if (data.departments) {
      data.departments.forEach(dept => {
        if (!dept.headEmail || dept.headEmail.trim() === '') {
          gaps.push({
            id: `gap_dept_head_${dept.id}`,
            entityType: 'ORG_PROFILE',
            entityId: dept.id,
            entityCode: dept.code,
            title: `Department Head Unassigned`,
            severity: 'MEDIUM',
            issue: `Department "${dept.name}" has no designated department head or lead email.`,
            recommendation: 'Assign a designated functional lead responsible for departmental governance.'
          });
        }
      });
    }

    return gaps;
  }

  /**
   * Client CSV / Excel Data Import Parser & Deduplication Engine
   */
  private normalizeImportType(entityType: string): string {
    const upper = String(entityType || '').toUpperCase().trim();
    if (upper.startsWith('PROC')) return 'PROCESS';
    if (upper.startsWith('APP')) return 'APPLICATION';
    if (upper.startsWith('VEND') || upper.startsWith('VND')) return 'VENDOR';
    if (upper.startsWith('ASSET') || upper.startsWith('AST')) return 'ASSET';
    if (upper.startsWith('SITE')) return 'SITE';
    if (upper.startsWith('DATA') || upper.startsWith('DAT')) return 'DATA_ASSET';
    if (upper.startsWith('SERVICE') || upper.startsWith('CBS')) return 'CRITICAL_SERVICE';
    return upper.replace(/(ES|S)$/, '');
  }

  /**
   * Client CSV / Excel Data Import Parser & Deduplication Engine
   */
  public parseAndValidateImportData<T = any>(
    entityType: string,
    csvContent: string,
    existingData: EnterpriseDiscoveryData | any[] = []
  ): ImportPreviewResult<T> {
    const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const typeNorm = this.normalizeImportType(entityType);

    if (lines.length <= 1) {
      return {
        entityType: typeNorm as any,
        totalRows: 0,
        validCount: 0,
        invalidCount: 0,
        duplicateCount: 0,
        validRecords: [],
        invalidRows: [],
        duplicateRows: []
      };
    }

    // Safely extract existing lists
    const existingProcesses = Array.isArray(existingData) ? (typeNorm === 'PROCESS' ? existingData : []) : (existingData?.businessProcesses || []);
    const existingApps = Array.isArray(existingData) ? (typeNorm === 'APPLICATION' ? existingData : []) : (existingData?.applications || []);
    const existingAssets = Array.isArray(existingData) ? (typeNorm === 'ASSET' ? existingData : []) : (existingData?.assets || []);
    const existingVendors = Array.isArray(existingData) ? (typeNorm === 'VENDOR' ? existingData : []) : (existingData?.vendors || []);
    const existingSites = Array.isArray(existingData) ? (typeNorm === 'SITE' ? existingData : []) : (existingData?.sites || []);

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const rows = lines.slice(1);

    const validRecords: any[] = [];
    const invalidRows: Array<{ rowNumber: number; data: any; errors: string[] }> = [];
    const duplicateRows: Array<{ rowNumber: number; data: any; existingCodeOrName: string }> = [];

    rows.forEach((line, idx) => {
      const rowNum = idx + 2;
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const rowObj: Record<string, string> = {};
      headers.forEach((h, i) => {
        rowObj[h] = values[i] || '';
      });

      const errors: string[] = [];

      if (typeNorm === 'PROCESS') {
        const name = rowObj.name || rowObj.processname || rowObj.title;
        if (!name) errors.push('Process Name is required');
        
        // Check duplicate
        const isDup = Boolean(name && existingProcesses.some(p => p.name && p.name.toLowerCase() === name.toLowerCase()));
        if (isDup) {
          duplicateRows.push({ rowNumber: rowNum, data: rowObj, existingCodeOrName: name });
          return;
        }

        if (errors.length > 0) {
          invalidRows.push({ rowNumber: rowNum, data: rowObj, errors });
        } else {
          validRecords.push({
            id: `proc_imp_${Date.now()}_${idx}`,
            code: `PROC-${String(existingProcesses.length + validRecords.length + 1).padStart(3, '0')}`,
            name,
            description: rowObj.description || 'Imported via CSV',
            businessUnit: rowObj.businessunit || 'Core Operations',
            department: rowObj.department || 'Operations',
            processOwner: rowObj.owner || rowObj.processowner || 'Operations Lead',
            siteId: 'site_1',
            criticality: (rowObj.criticality?.toUpperCase() as any) || 'TIER_2_BUSINESS_CRITICAL',
            frequency: 'CONTINUOUS_REALTIME',
            isCustomerFacing: rowObj.customerfacing?.toLowerCase() === 'true' || rowObj.customerfacing?.toLowerCase() === 'yes',
            processesPii: rowObj.pii?.toLowerCase() === 'true' || rowObj.pii?.toLowerCase() === 'yes',
            processesSensitiveInfo: true,
            isCriticalBusinessService: false,
            hasExternalDependencies: false,
            applicationsUsed: rowObj.applications ? rowObj.applications.split(';').map((s: string) => s.trim()) : [],
            vendorsUsed: rowObj.vendors ? rowObj.vendors.split(';').map((s: string) => s.trim()) : []
          });
        }
      } else if (typeNorm === 'APPLICATION') {
        const name = rowObj.name || rowObj.appname || rowObj.title;
        if (!name) errors.push('Application Name is required');

        const isDup = Boolean(name && existingApps.some(a => a.name && a.name.toLowerCase() === name.toLowerCase()));
        if (isDup) {
          duplicateRows.push({ rowNumber: rowNum, data: rowObj, existingCodeOrName: name });
          return;
        }

        if (errors.length > 0) {
          invalidRows.push({ rowNumber: rowNum, data: rowObj, errors });
        } else {
          validRecords.push({
            id: `app_imp_${Date.now()}_${idx}`,
            code: `APP-${String(existingApps.length + validRecords.length + 1).padStart(3, '0')}`,
            name,
            purpose: rowObj.purpose || 'Imported via CSV',
            businessProcess: rowObj.process || 'Core Operations',
            owner: rowObj.owner || 'IT Custodian',
            department: rowObj.department || 'Engineering',
            hostingModel: (rowObj.hosting?.toUpperCase() as any) || 'SAAS',
            criticality: (rowObj.criticality?.toUpperCase() as any) || 'HIGH',
            authenticationMethod: 'SSO_SAML_OIDC',
            mfaEnforced: rowObj.mfa?.toLowerCase() !== 'false' && rowObj.mfa?.toLowerCase() !== 'no',
            processesPii: rowObj.pii?.toLowerCase() === 'true' || rowObj.pii?.toLowerCase() === 'yes',
            processesSensitiveData: true,
            vendorName: rowObj.vendor || '',
            environment: 'PRODUCTION'
          });
        }
      } else if (typeNorm === 'VENDOR') {
        const name = rowObj.name || rowObj.vendorname;
        if (!name) errors.push('Vendor Name is required');

        const isDup = Boolean(name && existingVendors.some(v => v.name && v.name.toLowerCase() === name.toLowerCase()));
        if (isDup) {
          duplicateRows.push({ rowNumber: rowNum, data: rowObj, existingCodeOrName: name });
          return;
        }

        if (errors.length > 0) {
          invalidRows.push({ rowNumber: rowNum, data: rowObj, errors });
        } else {
          validRecords.push({
            id: `vnd_imp_${Date.now()}_${idx}`,
            code: `VND-${String(existingVendors.length + validRecords.length + 1).padStart(3, '0')}`,
            name,
            serviceCategory: rowObj.service || rowObj.category || 'Cloud Service',
            supportedProcessIds: [],
            criticality: (rowObj.criticality?.toUpperCase() as any) || 'TIER_2_MAJOR',
            hasDataAccess: rowObj.dataaccess?.toLowerCase() === 'true' || rowObj.dataaccess?.toLowerCase() === 'yes',
            hasPiiAccess: rowObj.piiaccess?.toLowerCase() === 'true' || rowObj.piiaccess?.toLowerCase() === 'yes',
            hostingLocation: rowObj.location || 'Global Cloud',
            country: rowObj.country || 'US',
            contractStatus: 'ACTIVE',
            dpaSigned: rowObj.dpa?.toLowerCase() === 'true' || rowObj.dpa?.toLowerCase() === 'yes',
            securityCertifications: rowObj.certifications ? rowObj.certifications.split(';').map((c: string) => c.trim()) : ['ISO 27001'],
            assessedRiskLevel: 'MEDIUM',
            primaryContactEmail: rowObj.email || 'support@vendor.com'
          });
        }
      } else {
        // Fallback for Assets or Sites
        const name = rowObj.name || rowObj.title;
        if (!name) errors.push('Name is required');
        if (errors.length > 0) {
          invalidRows.push({ rowNumber: rowNum, data: rowObj, errors });
        } else {
          validRecords.push({
            id: `ast_imp_${Date.now()}_${idx}`,
            code: `AST-${String(existingAssets.length + validRecords.length + 1).padStart(3, '0')}`,
            name,
            category: 'SERVER',
            owner: rowObj.owner || 'DevOps',
            siteId: 'site_1',
            department: 'Cloud Platform Engineering',
            classification: 'CONFIDENTIAL',
            criticality: 'HIGH'
          });
        }
      }
    });

    return {
      entityType: typeNorm as any,
      totalRows: rows.length,
      validCount: validRecords.length,
      invalidCount: invalidRows.length,
      duplicateCount: duplicateRows.length,
      validRecords,
      invalidRows,
      duplicateRows
    };
  }

  /**
   * Merges verified imported records into canonical discovery data
   */
  public mergeImportedRecords(
    arg1: any,
    arg2: any,
    arg3?: any
  ): EnterpriseDiscoveryData {
    let entityType: string;
    let validRecords: any[];
    let data: EnterpriseDiscoveryData;

    if (typeof arg1 === 'string') {
      entityType = arg1;
      validRecords = Array.isArray(arg2) ? arg2 : [];
      data = arg3 || {};
    } else if (typeof arg2 === 'string') {
      data = arg1 || {};
      entityType = arg2;
      validRecords = Array.isArray(arg3) ? arg3 : [];
    } else {
      entityType = 'PROCESS';
      validRecords = [];
      data = arg1 || {};
    }

    const typeNorm = this.normalizeImportType(entityType);
    if (!data.businessProcesses) data.businessProcesses = [];
    if (!data.applications) data.applications = [];
    if (!data.vendors) data.vendors = [];
    if (!data.assets) data.assets = [];
    if (!data.sites) data.sites = [];

    if (typeNorm === 'PROCESS') {
      data.businessProcesses = [...data.businessProcesses, ...validRecords];
    } else if (typeNorm === 'APPLICATION') {
      data.applications = [...data.applications, ...validRecords];
    } else if (typeNorm === 'VENDOR') {
      data.vendors = [...data.vendors, ...validRecords];
    } else if (typeNorm === 'ASSET') {
      data.assets = [...data.assets, ...validRecords];
    } else if (typeNorm === 'SITE') {
      data.sites = [...data.sites, ...validRecords];
    }
    return data;
  }

  /**
   * Secure Document Ingestion, Hashing & Extraction Classifier
   */
  public ingestDocumentDiscovery(
    fileName: string,
    fileSize: number,
    mimeType: string,
    rawTextOrBuffer: string,
    uploadedBy: string = 'ciso@enterprise.io'
  ): DiscoveredDocument {
    const sha256Hash = crypto.createHash('sha256').update(rawTextOrBuffer).digest('hex');

    // Deterministic Classification
    const fnLower = fileName.toLowerCase();
    let documentType: DiscoveredDocument['documentType'] = 'OTHER';
    let confidence = 0.85;

    if (fnLower.includes('policy') || fnLower.includes('handbook')) {
      documentType = 'POLICY';
    } else if (fnLower.includes('soa') || fnLower.includes('applicability')) {
      documentType = 'SOA';
      confidence = 0.95;
    } else if (fnLower.includes('risk') || fnLower.includes('threat')) {
      documentType = 'RISK_REGISTER';
    } else if (fnLower.includes('asset') || fnLower.includes('hardware') || fnLower.includes('inventory')) {
      documentType = 'ASSET_INVENTORY';
    } else if (fnLower.includes('vendor') || fnLower.includes('supplier') || fnLower.includes('tprm')) {
      documentType = 'VENDOR_LIST';
    } else if (fnLower.includes('audit') || fnLower.includes('assessment') || fnLower.includes('report')) {
      documentType = 'AUDIT_REPORT';
    } else if (fnLower.includes('cert') || fnLower.includes('iso') || fnLower.includes('soc2')) {
      documentType = 'CERTIFICATE';
    }

    return {
      id: `doc_disc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      fileName,
      fileSize,
      mimeType,
      hash: sha256Hash,
      sha256Hash,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
      classification: documentType,
      documentType,
      confidenceScore: confidence,
      suggestedMappings: ['ISO_27001_A_5_1', 'ISO_27001_A_5_15'],
      extractedEntities: {
        suggestedProcesses: ['Information Security Governance', 'Access Control Review'],
        suggestedApplications: ['Okta Workforce', 'AWS Production Cloud'],
        suggestedVendors: ['Amazon Web Services', 'CrowdStrike Inc.'],
        suggestedControls: ['A.5.1 Policies for information security', 'A.5.15 Access control']
      },
      status: 'EXTRACTED'
    };
  }
}

export const businessDiscoveryService = new BusinessDiscoveryService();

