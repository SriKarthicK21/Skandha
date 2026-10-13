import { Entity360Graph, EntityNode, EntityEdge, Entity360Metadata } from '../../types/grcCoreTypes';
import { FrameworkLibrary } from './FrameworkLibrary';
import { UnifiedControlLibrary } from './UnifiedControlLibrary';
import { ConfigurableRiskEngine } from './ConfigurableRiskEngine';
import { AuditRemediationEngine } from './AuditRemediationEngine';
import { SmartEvidenceEngine } from './SmartEvidenceEngine';
import { controlTestingService } from '../canonical/ControlTestingService';
import { canonicalEvidenceService } from '../canonical/CanonicalEvidenceService';
import { exceptionManagementService } from '../canonical/ExceptionManagementService';
import { complianceProgramService } from '../canonical/ComplianceProgramService';
import { universalWorkflowService } from '../canonical/WorkflowService';
import {
  organizationalDiscoveryService,
  DEFAULT_DEPARTMENTS,
  ACME_ONBOARDING_BLUEPRINT
} from './organizationalDiscoveryService';
import { policyGovernanceService } from './policyGovernanceService';
import { domainEventBus } from '../canonical/DomainEventBus';
import { dpdpPrivacyEngineService } from '../canonical/DpdpPrivacyEngineService';

export interface CrossFrameworkMappingRow {
  controlId: string;
  controlCode: string;
  controlTitle: string;
  controlCategory: string;
  iso27001?: string;
  soc2?: string;
  masTrm?: string;
  dpdp?: string;
  nistCsf?: string;
  pciDss?: string;
  iso42001?: string;
  iso22301?: string;
  evidenceCount: number;
  linkedRisksCount: number;
}

export class MappingExplorerEngine {
  /**
   * Generate comprehensive multi-framework harmonization matrix table
   */
  public static getHarmonizationMatrix(): CrossFrameworkMappingRow[] {
    const controls = UnifiedControlLibrary.getAllControls();
    
    return controls.map(c => {
      const getReq = (fwCode: string) => {
        const mapping = c.frameworkMappings.find(m => m.frameworkCode === fwCode);
        return mapping ? mapping.requirementCode : undefined;
      };

      return {
        controlId: c.id,
        controlCode: c.code,
        controlTitle: c.title,
        controlCategory: c.category,
        iso27001: getReq('ISO_27001_2022'),
        soc2: getReq('SOC_2_TYPE_2'),
        masTrm: getReq('MAS_TRM_2021'),
        dpdp: getReq('DPDP_ACT_2023'),
        nistCsf: getReq('NIST_CSF_2_0'),
        pciDss: getReq('PCI_DSS_V4_0'),
        iso42001: getReq('ISO_42001_2023'),
        iso22301: getReq('ISO_22301_2019'),
        evidenceCount: c.linkedEvidenceIds.length,
        linkedRisksCount: c.linkedRiskIds.length
      };
    });
  }

  /**
   * Generate 360-degree interconnected relationship graph & contextual metadata for any entity ID
   */
  public static get360GraphForEntity(entityId: string, entityType?: string): Entity360Graph {
    const normalizedId = entityId.trim();
    const normalizedType = (entityType || '').toUpperCase();

    // ------------------------------------------------------------------------
    // 1. CONTROL or CONTROL_IMPL
    // ------------------------------------------------------------------------
    const control = UnifiedControlLibrary.getControlById(normalizedId);
    const impl = controlTestingService.getImplementationByCode(normalizedId) ||
                 controlTestingService.getAllImplementations().find(i => i.id === normalizedId || i.controlCode === normalizedId);
    const globalDef = controlTestingService.getControlDefinitionByCode(normalizedId);

    if (control || impl || globalDef) {
      const code = control?.code || impl?.controlCode || globalDef?.code || normalizedId;
      const title = control?.title || impl?.title || globalDef?.title || code;
      const status = impl?.implementationStatus || control?.implementationStatus || 'IMPLEMENTED';
      const eff = impl?.effectivenessRating || control?.operatingEffectiveness || 'EFFECTIVE';
      const owner = impl?.owner || control?.owner || 'Control Owner';

      const rootNode: EntityNode = {
        id: code,
        type: 'CONTROL',
        code,
        title,
        status: `${status} (${eff})`,
        owner,
        details: {
          category: control?.category || globalDef?.category || 'ACCESS_CONTROL',
          operatingEnvironment: impl?.operatingEnvironment || 'PRODUCTION',
          lastTestedAt: impl?.lastTestedAt || control?.lastTestedAt,
          nextTestDueDate: impl?.nextTestDueDate || control?.nextTestDueDate
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];

      // Framework Mappings
      const mappings = control?.frameworkMappings ||
        globalDef?.frameworkMappings?.map(m => ({ frameworkCode: m.frameworkCode, requirementCode: m.requirementCode, relationshipType: m.mappingType })) ||
        [];
      mappings.forEach(m => {
        const reqNode: EntityNode = {
          id: `req-${m.frameworkCode}-${m.requirementCode}`,
          type: 'REQUIREMENT',
          code: m.requirementCode,
          title: `Requirement ${m.requirementCode} (${m.frameworkCode})`,
          status: 'MAPPED'
        };
        connectedNodes.push(reqNode);
        edges.push({
          sourceId: rootNode.id,
          targetId: reqNode.id,
          relationship: 'MAPS_TO',
          label: m.relationshipType || 'DIRECT_SATISFACTION'
        });
      });

      // Linked Risks
      const riskIds = Array.from(new Set([...(control?.linkedRiskIds || []), ...(impl?.linkedRiskIds || [])]));
      const allRisks = ConfigurableRiskEngine.getAllRisks();
      const metadataRisks: Entity360Metadata['risks'] = [];

      riskIds.forEach(rId => {
        const rsk = allRisks.find(r => r.id === rId || r.riskCode === rId);
        if (rsk) {
          metadataRisks.push({
            id: rsk.id,
            code: rsk.riskCode,
            title: rsk.title,
            inherentScore: rsk.inherentScore,
            residualScore: rsk.residualScore,
            level: rsk.residualLevel,
            treatment: rsk.treatmentStrategy,
            owner: rsk.owner,
            hasControls: rsk.mitigatingControlIds.length > 0
          });
          const rNode: EntityNode = {
            id: rsk.id,
            type: 'RISK',
            code: rsk.riskCode,
            title: rsk.title,
            status: rsk.residualLevel,
            owner: rsk.owner
          };
          connectedNodes.push(rNode);
          edges.push({
            sourceId: rootNode.id,
            targetId: rNode.id,
            relationship: 'MITIGATES'
          });
        }
      });

      // Linked Evidence
      const evIds = Array.from(new Set([...(control?.linkedEvidenceIds || []), ...(impl?.linkedEvidenceIds || [])]));
      const allEv = SmartEvidenceEngine.getAllEvidence();
      const metadataEv: Entity360Metadata['evidence'] = [];

      evIds.forEach(eId => {
        const ev = allEv.find(e => e.id === eId || e.evidenceCode === eId);
        if (ev) {
          metadataEv.push({
            id: ev.id,
            code: ev.evidenceCode,
            name: ev.name || ev.fileName,
            status: ev.verificationStatus,
            hash: ev.sha256Hash,
            validUntil: ev.validUntil,
            isExpired: ev.isExpired,
            sourceType: ev.sourceType,
            verifiedBy: ev.verifiedBy
          });
          const evNode: EntityNode = {
            id: ev.id,
            type: 'EVIDENCE',
            code: ev.evidenceCode,
            title: ev.name || ev.fileName,
            status: ev.verificationStatus
          };
          connectedNodes.push(evNode);
          edges.push({
            sourceId: evNode.id,
            targetId: rootNode.id,
            relationship: 'EVIDENCES'
          });
        }
      });

      // Control Tests
      const tests = controlTestingService.getTestsForControl(code);
      const metadataTests: Entity360Metadata['testing'] = tests.map(t => {
        const tNode: EntityNode = {
          id: t.id,
          type: 'CONTROL_TEST',
          code: t.id,
          title: t.testTitle,
          status: `${t.testResult} - ${t.effectiveness}`,
          owner: t.tester
        };
        connectedNodes.push(tNode);
        edges.push({
          sourceId: tNode.id,
          targetId: rootNode.id,
          relationship: 'TESTS'
        });
        return {
          id: t.id,
          title: t.testTitle,
          testProcedure: t.testProcedure,
          sampleSize: t.sampleSize,
          result: t.testResult,
          effectiveness: t.effectiveness,
          tester: t.tester,
          date: t.performedAt,
          status: t.status
        };
      });

      // Policies & SOPs
      const polIds = Array.from(new Set([...(control?.linkedPolicyIds || []), ...(impl?.linkedPolicyIds || [])]));
      const allDocs = policyGovernanceService.getAllDocuments();
      const metadataPolicies: Entity360Metadata['policies'] = [];

      polIds.forEach(pId => {
        const doc = allDocs.find(d => d.id === pId || d.code === pId);
        if (doc) {
          metadataPolicies.push({
            id: doc.id,
            code: doc.code,
            title: doc.title,
            type: doc.type,
            status: doc.status,
            version: doc.currentVersion,
            owner: doc.ownerRole,
            nextReviewDate: doc.nextReviewDate,
            acknowledgementRate: doc.acknowledgementRate
          });
          const pNode: EntityNode = {
            id: doc.id,
            type: 'POLICY',
            code: doc.code,
            title: doc.title,
            status: doc.status
          };
          connectedNodes.push(pNode);
          edges.push({
            sourceId: pNode.id,
            targetId: rootNode.id,
            relationship: 'GOVERNS'
          });
        }
      });

      // Active & Expired Exceptions
      const exceptions = exceptionManagementService.getExceptionsByControlCode(code);
      const metadataExceptions: Entity360Metadata['exceptions'] = exceptions.map(exc => {
        const excNode: EntityNode = {
          id: exc.id,
          type: 'EXCEPTION',
          code: exc.exceptionCode,
          title: exc.title,
          status: exc.status
        };
        connectedNodes.push(excNode);
        edges.push({
          sourceId: excNode.id,
          targetId: rootNode.id,
          relationship: 'EXEMPTS'
        });
        return {
          id: exc.id,
          code: exc.exceptionCode,
          title: exc.title,
          status: exc.status,
          expiryDate: exc.expiryDate,
          isExpired: exc.hasExpired,
          compensatingControls: exc.compensatingControls,
          approvedBy: exc.approvedBy
        };
      });

      // Findings & CAPA
      const allFindings = AuditRemediationEngine.getAllFindings().filter(f => f.relatedControlId === code);
      const allCapas = AuditRemediationEngine.getAllCapas();
      const metadataFindings: Entity360Metadata['findings'] = [];
      const metadataCapas: Entity360Metadata['capas'] = [];

      allFindings.forEach(fnd => {
        metadataFindings.push({
          id: fnd.id,
          code: fnd.findingCode,
          title: fnd.title,
          severity: fnd.severity,
          status: fnd.status,
          owner: fnd.identifiedBy,
          identifiedBy: fnd.identifiedBy
        });
        const fNode: EntityNode = {
          id: fnd.id,
          type: 'FINDING',
          code: fnd.findingCode,
          title: fnd.title,
          status: fnd.severity
        };
        connectedNodes.push(fNode);
        edges.push({
          sourceId: rootNode.id,
          targetId: fNode.id,
          relationship: 'IDENTIFIES'
        });

        fnd.capaIds.forEach(cId => {
          const capa = allCapas.find(c => c.id === cId || c.capaCode === cId);
          if (capa) {
            metadataCapas.push({
              id: capa.id,
              code: capa.capaCode,
              title: capa.title,
              status: capa.status,
              owner: capa.owner,
              dueDate: capa.dueDate,
              priority: capa.priority,
              rootCause: capa.rootCauseAnalysis,
              hasClosureEvidence: capa.closureEvidenceIds.length > 0,
              retestStatus: capa.status === 'EFFECTIVE_CLOSED' ? 'PASSED' : 'PENDING'
            });
            const cNode: EntityNode = {
              id: capa.id,
              type: 'CAPA',
              code: capa.capaCode,
              title: capa.title,
              status: capa.status,
              owner: capa.owner
            };
            connectedNodes.push(cNode);
            edges.push({
              sourceId: cNode.id,
              targetId: fNode.id,
              relationship: 'REMEDIATES'
            });
          }
        });
      });

      const metadata: Entity360Metadata = {
        overview: {
          description: control?.description || 'Operational technical, administrative or physical safeguard.',
          owner,
          department: impl?.businessUnitId || 'Cloud Security & DevSecOps',
          criticality: 'TIER_1_CRITICAL',
          lifecycleStatus: status
        },
        risks: metadataRisks,
        controls: [{
          id: code,
          code,
          title,
          status,
          effectiveness: eff,
          owner,
          testingFrequency: impl?.testingFrequency || control?.frequency,
          lastTestedAt: impl?.lastTestedAt || control?.lastTestedAt,
          frameworkMappings: mappings.map(m => `${m.frameworkCode}: ${m.requirementCode}`)
        }],
        policies: metadataPolicies,
        evidence: metadataEv,
        testing: metadataTests,
        findings: metadataFindings,
        capas: metadataCapas,
        exceptions: metadataExceptions,
        lineagePath: [
          'Client: Acme Financial Technologies',
          'Organization: FinTech Cloud Operations',
          'Department: Cloud Security & DevSecOps',
          'Business Activity: Identity Lifecycle & Privileged Access',
          'Business Process: User Onboarding & JIT Elevation',
          'Site/Location: Singapore Sovereign Cloud Region',
          'Application: Okta SSO & Teleport PAM Bastion',
          'Asset: AWS Production Kubernetes Infrastructure',
          'Data: Restricted Customer PII & Financial Secrets',
          'Vendor: Okta Inc. & Amazon Web Services (Tier-1)',
          'Critical Service: Real-Time Payment Ingress Clearing Gateway',
          'Risk: RSK-001 Unauthorized Privilege Escalation',
          'Control: CTRL-001 Phishing-Resistant MFA & JIT PAM',
          'Policy: POL-IAM-01 Identity & Access Governance Policy',
          'Procedure: PRO-IAM-001 Privileged Access Elevation Standard',
          'SOP: SOP-IAM-001 Step-by-Step Biometric MFA Verification',
          'Implementation: 100% Hardware FIDO2 WebAuthn Enforced',
          'Evidence: EV-2026-001 SHA-256 Verified Telemetry Artifact',
          'Control Test: TEST-2026-Q3-088 (PASS - 100% Operating Effectiveness)',
          'Finding: FND-001 (Resolved Minor Non-Conformity)',
          'CAPA: CAPA-001 (Root Cause Purge Automation Verified)',
          'Retest: Passed with Zero Deficiencies',
          'Assurance: Continuous Telemetry Stream Active',
          'Audit: 2026 Stage-2 ISO/IEC 27001 & MAS TRM Certification'
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 2. RISK
    // ------------------------------------------------------------------------
    const allRisks = ConfigurableRiskEngine.getAllRisks();
    const risk = allRisks.find(r => r.id === normalizedId || r.riskCode === normalizedId);
    if (risk) {
      const rootNode: EntityNode = {
        id: risk.id,
        type: 'RISK',
        code: risk.riskCode,
        title: risk.title,
        status: `${risk.inherentLevel} Inherent -> ${risk.residualLevel} Residual`,
        owner: risk.owner,
        score: risk.residualScore,
        details: {
          threatVector: risk.threatVector,
          treatmentStrategy: risk.treatmentStrategy,
          inherentScore: risk.inherentScore,
          residualScore: risk.residualScore,
          dueDate: risk.dueDate
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];
      const metadataControls: Entity360Metadata['controls'] = [];

      risk.mitigatingControlIds.forEach(ctrlId => {
        const ctrl = UnifiedControlLibrary.getControlById(ctrlId);
        const ctrlImpl = controlTestingService.getImplementationByCode(ctrlId);
        if (ctrl || ctrlImpl) {
          const cCode = ctrl?.code || ctrlImpl?.controlCode || ctrlId;
          const cTitle = ctrl?.title || ctrlImpl?.title || cCode;
          const cStatus = ctrlImpl?.implementationStatus || ctrl?.implementationStatus || 'IMPLEMENTED';
          const cEff = ctrlImpl?.effectivenessRating || ctrl?.operatingEffectiveness || 'EFFECTIVE';
          const cOwner = ctrlImpl?.owner || ctrl?.owner || 'SecOps';

          metadataControls.push({
            id: cCode,
            code: cCode,
            title: cTitle,
            status: cStatus,
            effectiveness: cEff,
            owner: cOwner
          });

          const ctrlNode: EntityNode = {
            id: cCode,
            type: 'CONTROL',
            code: cCode,
            title: cTitle,
            status: `${cStatus} (${cEff})`,
            owner: cOwner
          };
          connectedNodes.push(ctrlNode);
          edges.push({
            sourceId: ctrlNode.id,
            targetId: rootNode.id,
            relationship: 'MITIGATES'
          });
        }
      });

      // Exceptions connected to risk
      const metadataExceptions: Entity360Metadata['exceptions'] = [];
      if (risk.linkedExceptionId) {
        const exc = exceptionManagementService.getExceptionById(risk.linkedExceptionId);
        if (exc) {
          metadataExceptions.push({
            id: exc.id,
            code: exc.exceptionCode,
            title: exc.title,
            status: exc.status,
            expiryDate: exc.expiryDate,
            isExpired: exc.hasExpired,
            compensatingControls: exc.compensatingControls,
            approvedBy: exc.approvedBy
          });
          const excNode: EntityNode = {
            id: exc.id,
            type: 'EXCEPTION',
            code: exc.exceptionCode,
            title: exc.title,
            status: exc.status
          };
          connectedNodes.push(excNode);
          edges.push({
            sourceId: excNode.id,
            targetId: rootNode.id,
            relationship: 'EXEMPTS'
          });
        }
      }

      const metadata: Entity360Metadata = {
        overview: {
          description: risk.description,
          owner: risk.owner,
          department: 'Enterprise Security & Risk',
          criticality: risk.inherentLevel,
          lifecycleStatus: risk.status,
          updatedAt: risk.updatedAt
        },
        risks: [{
          id: risk.id,
          code: risk.riskCode,
          title: risk.title,
          inherentScore: risk.inherentScore,
          residualScore: risk.residualScore,
          level: risk.residualLevel,
          treatment: risk.treatmentStrategy,
          owner: risk.owner,
          hasControls: risk.mitigatingControlIds.length > 0
        }],
        controls: metadataControls,
        exceptions: metadataExceptions,
        lineagePath: [
          'Enterprise Threat Landscape',
          risk.category,
          risk.riskCode,
          `Inherent Score ${risk.inherentScore}`,
          risk.treatmentStrategy,
          `Residual Score ${risk.residualScore}`
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 3. DEPARTMENT
    // ------------------------------------------------------------------------
    const dept = DEFAULT_DEPARTMENTS.find(d => d.departmentId === normalizedId || d.departmentName.toLowerCase() === normalizedId.toLowerCase()) ||
                 (normalizedType === 'DEPARTMENT' ? DEFAULT_DEPARTMENTS[0] : undefined);
    if (dept && (normalizedType === 'DEPARTMENT' || normalizedId.startsWith('DEP-'))) {
      const rootNode: EntityNode = {
        id: dept.departmentId,
        type: 'DEPARTMENT',
        code: dept.departmentId,
        title: dept.departmentName,
        status: dept.status,
        owner: dept.ownerName,
        department: dept.departmentName,
        details: {
          ownerRole: dept.ownerRole,
          priority: dept.priority,
          processCount: dept.processesCount,
          documentationReadiness: `${dept.documentationReadinessScore}%`
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];

      // Connected Business Processes
      dept.processes.forEach(p => {
        const pNode: EntityNode = {
          id: p.id,
          type: 'PROCESS',
          code: p.id,
          title: p.name,
          status: `Readiness ${p.readiness}%`,
          department: dept.departmentName
        };
        connectedNodes.push(pNode);
        edges.push({
          sourceId: rootNode.id,
          targetId: pNode.id,
          relationship: 'BELONGS_TO'
        });
      });

      // Connected Controls in Scope
      const metadataControls: Entity360Metadata['controls'] = [];
      dept.controlsInScope.forEach(cCode => {
        const cNode: EntityNode = {
          id: cCode,
          type: 'CONTROL',
          code: cCode,
          title: `Control ${cCode} in scope for ${dept.departmentName}`,
          status: 'IN_SCOPE'
        };
        connectedNodes.push(cNode);
        edges.push({
          sourceId: rootNode.id,
          targetId: cNode.id,
          relationship: 'GOVERNS'
        });
        metadataControls.push({
          id: cCode,
          code: cCode,
          title: `Control ${cCode}`,
          status: 'IMPLEMENTED',
          effectiveness: 'EFFECTIVE',
          owner: dept.ownerName
        });
      });

      const metadata: Entity360Metadata = {
        overview: {
          description: `Organizational functional unit responsible for ${dept.departmentName}. Next Best Action: ${dept.nextBestAction}`,
          owner: `${dept.ownerName} (${dept.ownerRole})`,
          department: dept.departmentName,
          criticality: dept.priority,
          lifecycleStatus: dept.status
        },
        context: {
          organization: 'Acme Financial Technologies',
          department: dept.departmentName,
          processName: dept.processes.map(p => p.name).join(', '),
          processOwner: dept.ownerName,
          smes: dept.smes
        },
        controls: metadataControls,
        lineagePath: [
          'Acme Financial Technologies',
          dept.departmentName,
          `${dept.processesCount} Business Processes`,
          `${dept.controlsInScope.length} Governed Controls`
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 4. BUSINESS PROCESS / BLUEPRINT
    // ------------------------------------------------------------------------
    const blueprints = [ACME_ONBOARDING_BLUEPRINT];
    const blueprint = blueprints.find(b => b.processId === normalizedId || b.processName.toLowerCase() === normalizedId.toLowerCase()) ||
                      (normalizedId.startsWith('PROC-') ? blueprints[0] : undefined);
    if (blueprint && (normalizedType === 'PROCESS' || normalizedId.startsWith('PROC-'))) {
      const rootNode: EntityNode = {
        id: blueprint.processId,
        type: 'PROCESS',
        code: blueprint.processId,
        title: blueprint.processName,
        status: blueprint.validationStatus,
        department: blueprint.department,
        details: {
          purpose: blueprint.purpose,
          businessImpact: blueprint.businessImpact,
          stepCount: blueprint.steps.length,
          applicationCount: blueprint.applications.length
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];

      // Owning Department
      const deptNode: EntityNode = {
        id: `DEP-${blueprint.department.toUpperCase().replace(/\s+/g, '_')}`,
        type: 'DEPARTMENT',
        code: `DEP-${blueprint.department.slice(0, 3).toUpperCase()}`,
        title: blueprint.department,
        status: 'ACTIVE'
      };
      connectedNodes.push(deptNode);
      edges.push({
        sourceId: deptNode.id,
        targetId: rootNode.id,
        relationship: 'BELONGS_TO'
      });

      // Connected Applications / Systems
      blueprint.applications.forEach(app => {
        const appNode: EntityNode = {
          id: `app-${app.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'APPLICATION',
          code: app,
          title: app,
          status: 'PRODUCTION'
        };
        connectedNodes.push(appNode);
        edges.push({
          sourceId: rootNode.id,
          targetId: appNode.id,
          relationship: 'DEPENDS_ON'
        });
      });

      // Governed Controls
      const metadataControls: Entity360Metadata['controls'] = [];
      blueprint.controls.forEach(cCode => {
        const ctrlNode: EntityNode = {
          id: cCode,
          type: 'CONTROL',
          code: cCode,
          title: `Control ${cCode} in ${blueprint.processName}`,
          status: 'IMPLEMENTED'
        };
        connectedNodes.push(ctrlNode);
        edges.push({
          sourceId: rootNode.id,
          targetId: ctrlNode.id,
          relationship: 'GOVERNS'
        });
        metadataControls.push({
          id: cCode,
          code: cCode,
          title: `Control ${cCode}`,
          status: 'IMPLEMENTED',
          effectiveness: 'EFFECTIVE',
          owner: blueprint.department
        });
      });

      const metadata: Entity360Metadata = {
        overview: {
          description: blueprint.purpose,
          department: blueprint.department,
          criticality: blueprint.businessImpact,
          lifecycleStatus: blueprint.validationStatus
        },
        context: {
          organization: 'Acme Financial Technologies',
          department: blueprint.department,
          processName: blueprint.processName,
          applications: blueprint.applications,
          assets: blueprint.assets,
          vendors: blueprint.vendors,
          raci: blueprint.raci
        },
        controls: metadataControls,
        lineagePath: [
          'Acme Financial Technologies',
          blueprint.department,
          blueprint.processName,
          `${blueprint.steps.length} Validated Steps`,
          `${blueprint.controls.length} Mapped Controls`
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 5. POLICY / PROCEDURE / SOP
    // ------------------------------------------------------------------------
    const allDocs = policyGovernanceService.getAllDocuments();
    const doc = allDocs.find(d => d.id === normalizedId || d.code === normalizedId);
    if (doc || normalizedType === 'POLICY' || normalizedId.startsWith('POL-') || normalizedId.startsWith('DOC-')) {
      const targetDoc = doc || allDocs[0];
      const rootNode: EntityNode = {
        id: targetDoc.id,
        type: 'POLICY',
        code: targetDoc.code,
        title: targetDoc.title,
        status: `${targetDoc.status} (v${targetDoc.currentVersion})`,
        owner: targetDoc.ownerRole,
        department: targetDoc.departmentName,
        details: {
          docType: targetDoc.type,
          reviewCadence: targetDoc.reviewCadence,
          nextReviewDate: targetDoc.nextReviewDate,
          acknowledgementRate: `${targetDoc.acknowledgementRate}%`,
          sha256Digest: targetDoc.sha256Digest
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];
      const metadataControls: Entity360Metadata['controls'] = [];

      targetDoc.linkedControlCodes.forEach(cCode => {
        const ctrlNode: EntityNode = {
          id: cCode,
          type: 'CONTROL',
          code: cCode,
          title: `Implemented Control ${cCode}`,
          status: 'IMPLEMENTED'
        };
        connectedNodes.push(ctrlNode);
        edges.push({
          sourceId: rootNode.id,
          targetId: ctrlNode.id,
          relationship: 'IMPLEMENTS'
        });
        metadataControls.push({
          id: cCode,
          code: cCode,
          title: `Control ${cCode}`,
          status: 'IMPLEMENTED',
          effectiveness: 'EFFECTIVE',
          owner: targetDoc.ownerRole
        });
      });

      const metadata: Entity360Metadata = {
        overview: {
          description: targetDoc.content.purpose,
          owner: targetDoc.ownerRole,
          department: targetDoc.departmentName,
          criticality: 'TIER_1_CRITICAL',
          lifecycleStatus: targetDoc.status
        },
        policies: [{
          id: targetDoc.id,
          code: targetDoc.code,
          title: targetDoc.title,
          type: targetDoc.type,
          status: targetDoc.status,
          version: targetDoc.currentVersion,
          owner: targetDoc.ownerRole,
          nextReviewDate: targetDoc.nextReviewDate,
          acknowledgementRate: targetDoc.acknowledgementRate
        }],
        controls: metadataControls,
        lineagePath: [
          'Enterprise Governance Studio',
          targetDoc.departmentName,
          targetDoc.processName,
          `${targetDoc.type}: ${targetDoc.code}`,
          `Version ${targetDoc.currentVersion}`,
          targetDoc.status
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 6. EVIDENCE / EVIDENCE ASSERTION
    // ------------------------------------------------------------------------
    const allEv = SmartEvidenceEngine.getAllEvidence();
    const ev = allEv.find(e => e.id === normalizedId || e.evidenceCode === normalizedId);
    if (ev || normalizedType === 'EVIDENCE' || normalizedId.startsWith('EV-')) {
      const targetEv = ev || allEv[0];
      const rootNode: EntityNode = {
        id: targetEv.id,
        type: 'EVIDENCE',
        code: targetEv.evidenceCode,
        title: targetEv.name || targetEv.fileName,
        status: targetEv.verificationStatus,
        owner: targetEv.owner,
        details: {
          sourceType: targetEv.sourceType,
          sha256Hash: targetEv.sha256Hash,
          validUntil: targetEv.validUntil,
          isExpired: targetEv.isExpired,
          verifiedBy: targetEv.verifiedBy
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];
      const metadataControls: Entity360Metadata['controls'] = [];

      targetEv.mappedControlIds.forEach(cCode => {
        const ctrl = UnifiedControlLibrary.getControlById(cCode);
        const ctrlNode: EntityNode = {
          id: cCode,
          type: 'CONTROL',
          code: cCode,
          title: ctrl?.title || `Control ${cCode}`,
          status: ctrl?.implementationStatus || 'IMPLEMENTED'
        };
        connectedNodes.push(ctrlNode);
        edges.push({
          sourceId: rootNode.id,
          targetId: ctrlNode.id,
          relationship: 'EVIDENCES'
        });
        metadataControls.push({
          id: cCode,
          code: cCode,
          title: ctrl?.title || `Control ${cCode}`,
          status: ctrl?.implementationStatus || 'IMPLEMENTED',
          effectiveness: ctrl?.operatingEffectiveness || 'EFFECTIVE',
          owner: ctrl?.owner || 'SecOps'
        });
      });

      const metadata: Entity360Metadata = {
        overview: {
          description: `Cryptographic evidence artifact collected via ${targetEv.sourceType} with SHA-256 immutability.`,
          owner: targetEv.owner,
          department: 'Security Operations & Audit',
          criticality: 'HIGH',
          lifecycleStatus: targetEv.verificationStatus
        },
        evidence: [{
          id: targetEv.id,
          code: targetEv.evidenceCode,
          name: targetEv.name || targetEv.fileName,
          status: targetEv.verificationStatus,
          hash: targetEv.sha256Hash,
          validUntil: targetEv.validUntil,
          isExpired: targetEv.isExpired,
          sourceType: targetEv.sourceType,
          verifiedBy: targetEv.verifiedBy
        }],
        controls: metadataControls,
        lineagePath: [
          'Smart Evidence Ledger',
          targetEv.sourceType,
          targetEv.evidenceCode,
          `SHA-256 ${targetEv.sha256Hash.slice(0, 12)}...`,
          targetEv.verificationStatus
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 7. CONTROL TEST
    // ------------------------------------------------------------------------
    const allTests = controlTestingService.getAllTests();
    const test = allTests.find(t => t.id === normalizedId);
    if (test || normalizedType === 'CONTROL_TEST' || normalizedId.startsWith('TEST-')) {
      const targetTest = test || allTests[0];
      const rootNode: EntityNode = {
        id: targetTest.id,
        type: 'CONTROL_TEST',
        code: targetTest.id,
        title: targetTest.testTitle,
        status: `${targetTest.testResult} (${targetTest.effectiveness})`,
        owner: targetTest.tester,
        details: {
          sampleSize: targetTest.sampleSize,
          populationSize: targetTest.populationSize,
          samplingMethod: targetTest.samplingMethod,
          performedAt: targetTest.performedAt,
          approvedBy: targetTest.approvedBy
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];

      // Tested Control Implementation
      const ctrlNode: EntityNode = {
        id: targetTest.controlCode,
        type: 'CONTROL',
        code: targetTest.controlCode,
        title: `Tested Control ${targetTest.controlCode}`,
        status: targetTest.effectiveness
      };
      connectedNodes.push(ctrlNode);
      edges.push({
        sourceId: rootNode.id,
        targetId: ctrlNode.id,
        relationship: 'TESTS'
      });

      const metadata: Entity360Metadata = {
        overview: {
          description: targetTest.testObjective,
          owner: targetTest.tester,
          department: 'Internal Audit & Risk Assurance',
          criticality: targetTest.testResult === 'PASS' ? 'LOW' : 'HIGH',
          lifecycleStatus: targetTest.status
        },
        testing: [{
          id: targetTest.id,
          title: targetTest.testTitle,
          testProcedure: targetTest.testProcedure,
          sampleSize: targetTest.sampleSize,
          result: targetTest.testResult,
          effectiveness: targetTest.effectiveness,
          tester: targetTest.tester,
          date: targetTest.performedAt,
          status: targetTest.status
        }],
        lineagePath: [
          'Assurance & Fieldwork Engine',
          targetTest.testerRole,
          targetTest.controlCode,
          targetTest.id,
          targetTest.testResult,
          targetTest.effectiveness
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 8. FINDING & CAPA
    // ------------------------------------------------------------------------
    const allFindings = AuditRemediationEngine.getAllFindings();
    const finding = allFindings.find(f => f.id === normalizedId || f.findingCode === normalizedId);
    if (finding || normalizedType === 'FINDING' || normalizedId.startsWith('FND-')) {
      const targetFnd = finding || allFindings[0];
      const rootNode: EntityNode = {
        id: targetFnd.id,
        type: 'FINDING',
        code: targetFnd.findingCode,
        title: targetFnd.title,
        status: targetFnd.status,
        owner: targetFnd.identifiedBy,
        criticality: targetFnd.severity,
        details: {
          severity: targetFnd.severity,
          sourceAudit: targetFnd.sourceAuditId,
          relatedControl: targetFnd.relatedControlId
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];
      const metadataCapas: Entity360Metadata['capas'] = [];

      // Related Control
      const ctrlNode: EntityNode = {
        id: targetFnd.relatedControlId,
        type: 'CONTROL',
        code: targetFnd.relatedControlId,
        title: `Non-Conformant Control ${targetFnd.relatedControlId}`,
        status: 'DEFICIENT'
      };
      connectedNodes.push(ctrlNode);
      edges.push({
        sourceId: ctrlNode.id,
        targetId: rootNode.id,
        relationship: 'IDENTIFIES'
      });

      // Remediating CAPAs
      const allCapas = AuditRemediationEngine.getAllCapas();
      targetFnd.capaIds.forEach(cId => {
        const capa = allCapas.find(c => c.id === cId || c.capaCode === cId);
        if (capa) {
          metadataCapas.push({
            id: capa.id,
            code: capa.capaCode,
            title: capa.title,
            status: capa.status,
            owner: capa.owner,
            dueDate: capa.dueDate,
            priority: capa.priority,
            rootCause: capa.rootCauseAnalysis,
            hasClosureEvidence: capa.closureEvidenceIds.length > 0
          });
          const cNode: EntityNode = {
            id: capa.id,
            type: 'CAPA',
            code: capa.capaCode,
            title: capa.title,
            status: capa.status,
            owner: capa.owner
          };
          connectedNodes.push(cNode);
          edges.push({
            sourceId: cNode.id,
            targetId: rootNode.id,
            relationship: 'REMEDIATES'
          });
        }
      });

      const metadata: Entity360Metadata = {
        overview: {
          description: targetFnd.description,
          owner: targetFnd.identifiedBy,
          department: 'Audit & Remediation',
          criticality: targetFnd.severity,
          lifecycleStatus: targetFnd.status
        },
        findings: [{
          id: targetFnd.id,
          code: targetFnd.findingCode,
          title: targetFnd.title,
          severity: targetFnd.severity,
          status: targetFnd.status,
          owner: targetFnd.identifiedBy,
          identifiedBy: targetFnd.identifiedBy
        }],
        capas: metadataCapas,
        lineagePath: [
          'Audit Examination Fieldwork',
          targetFnd.sourceAuditId || 'Annual Surveillance',
          targetFnd.relatedControlId,
          targetFnd.findingCode,
          targetFnd.severity,
          targetFnd.status
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 9. CAPA ACTION
    // ------------------------------------------------------------------------
    const allCapas = AuditRemediationEngine.getAllCapas();
    const capa = allCapas.find(c => c.id === normalizedId || c.capaCode === normalizedId);
    if (capa || normalizedType === 'CAPA' || normalizedId.startsWith('CAPA-')) {
      const targetCapa = capa || allCapas[0];
      const rootNode: EntityNode = {
        id: targetCapa.id,
        type: 'CAPA',
        code: targetCapa.capaCode,
        title: targetCapa.title,
        status: targetCapa.status,
        owner: targetCapa.owner,
        criticality: targetCapa.priority,
        details: {
          rootCause: targetCapa.rootCauseAnalysis,
          immediateCorrection: targetCapa.immediateCorrection,
          preventiveAction: targetCapa.preventiveAction,
          dueDate: targetCapa.dueDate
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];

      if (targetCapa.findingId) {
        const findingNode: EntityNode = {
          id: targetCapa.findingId,
          type: 'FINDING',
          code: targetCapa.findingId,
          title: `Audit Finding ${targetCapa.findingId}`,
          status: 'OPEN'
        };
        connectedNodes.push(findingNode);
        edges.push({
          sourceId: rootNode.id,
          targetId: findingNode.id,
          relationship: 'REMEDIATES'
        });
      }

      const metadata: Entity360Metadata = {
        overview: {
          description: `Corrective and Preventive Action plan to remediate ${targetCapa.findingId}. Root Cause: ${targetCapa.rootCauseAnalysis}`,
          owner: targetCapa.owner,
          department: 'Continuous Remediation',
          criticality: targetCapa.priority,
          lifecycleStatus: targetCapa.status
        },
        capas: [{
          id: targetCapa.id,
          code: targetCapa.capaCode,
          title: targetCapa.title,
          status: targetCapa.status,
          owner: targetCapa.owner,
          dueDate: targetCapa.dueDate,
          priority: targetCapa.priority,
          rootCause: targetCapa.rootCauseAnalysis,
          hasClosureEvidence: targetCapa.closureEvidenceIds.length > 0,
          retestStatus: targetCapa.status === 'EFFECTIVE_CLOSED' ? 'PASSED' : 'PENDING'
        }],
        lineagePath: [
          'Remediation Cockpit',
          targetCapa.findingId,
          targetCapa.capaCode,
          `Due ${targetCapa.dueDate}`,
          targetCapa.status
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 10. EXCEPTION
    // ------------------------------------------------------------------------
    const allExceptions = exceptionManagementService.getAllExceptions();
    const exc = allExceptions.find(e => e.id === normalizedId || e.exceptionCode === normalizedId);
    if (exc || normalizedType === 'EXCEPTION' || normalizedId.startsWith('EXC-')) {
      const targetExc = exc || allExceptions[0];
      const rootNode: EntityNode = {
        id: targetExc.id,
        type: 'EXCEPTION',
        code: targetExc.exceptionCode,
        title: targetExc.title,
        status: targetExc.status,
        owner: targetExc.requestedBy,
        department: targetExc.department,
        details: {
          businessJustification: targetExc.businessJustification,
          compensatingControls: targetExc.compensatingControls,
          expiryDate: targetExc.expiryDate,
          isExpired: targetExc.hasExpired,
          approvedBy: targetExc.approvedBy
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];

      // Related Control
      const ctrlNode: EntityNode = {
        id: targetExc.relatedControlId,
        type: 'CONTROL',
        code: targetExc.relatedControlId,
        title: `Exempted Control ${targetExc.relatedControlId}`,
        status: targetExc.status
      };
      connectedNodes.push(ctrlNode);
      edges.push({
        sourceId: rootNode.id,
        targetId: ctrlNode.id,
        relationship: 'EXEMPTS'
      });

      const metadata: Entity360Metadata = {
        overview: {
          description: targetExc.businessJustification,
          owner: targetExc.requestedBy,
          department: targetExc.department,
          criticality: targetExc.hasExpired ? 'CRITICAL' : 'HIGH',
          lifecycleStatus: targetExc.status
        },
        exceptions: [{
          id: targetExc.id,
          code: targetExc.exceptionCode,
          title: targetExc.title,
          status: targetExc.status,
          expiryDate: targetExc.expiryDate,
          isExpired: targetExc.hasExpired,
          compensatingControls: targetExc.compensatingControls,
          approvedBy: targetExc.approvedBy
        }],
        lineagePath: [
          'Exception Management Workspace',
          targetExc.department,
          targetExc.relatedControlId,
          targetExc.exceptionCode,
          `Expires ${targetExc.expiryDate}`,
          targetExc.status
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 11. AUDIT ENGAGEMENT / ASSESSMENT
    // ------------------------------------------------------------------------
    const allAudits = AuditRemediationEngine.getAllAudits();
    const audit = allAudits.find(a => a.id === normalizedId || a.auditCode === normalizedId);
    if (audit || normalizedType === 'AUDIT' || normalizedId.startsWith('AUD-')) {
      const targetAudit = audit || allAudits[0];
      const rootNode: EntityNode = {
        id: targetAudit.id,
        type: 'AUDIT',
        code: targetAudit.auditCode,
        title: targetAudit.title,
        status: targetAudit.status,
        owner: targetAudit.leadAuditor,
        details: {
          auditType: targetAudit.auditType,
          frameworkCode: targetAudit.frameworkCode,
          auditFirm: targetAudit.auditFirm,
          totalCheckpoints: targetAudit.totalCheckpoints,
          testedCheckpoints: targetAudit.testedCheckpoints,
          passedCheckpoints: targetAudit.passedCheckpoints,
          auditorOpinion: targetAudit.auditorOpinion
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];

      // Framework Requirement Node
      const fwNode: EntityNode = {
        id: `fw-${targetAudit.frameworkCode}`,
        type: 'FRAMEWORK',
        code: targetAudit.frameworkCode,
        title: `Framework Standard ${targetAudit.frameworkCode}`,
        status: 'AUDITED'
      };
      connectedNodes.push(fwNode);
      edges.push({
        sourceId: rootNode.id,
        targetId: fwNode.id,
        relationship: 'AUDITS'
      });

      const metadata: Entity360Metadata = {
        overview: {
          description: targetAudit.scopeDescription,
          owner: targetAudit.leadAuditor,
          department: targetAudit.auditFirm || 'External Certification Body',
          criticality: 'TIER_1_CRITICAL',
          lifecycleStatus: targetAudit.status
        },
        audits: [{
          id: targetAudit.id,
          code: targetAudit.auditCode,
          title: targetAudit.title,
          status: targetAudit.status,
          leadAuditor: targetAudit.leadAuditor,
          auditFirm: targetAudit.auditFirm,
          startDate: targetAudit.startDate,
          endDate: targetAudit.endDate
        }],
        lineagePath: [
          'Auditor Clean Room',
          targetAudit.frameworkCode,
          targetAudit.auditCode,
          `${targetAudit.testedCheckpoints}/${targetAudit.totalCheckpoints} Checkpoints`,
          targetAudit.status
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 12. DPDP PRIVACY ENTITY (Personal Data, RoPA, Notice, DSR, Processor)
    // ------------------------------------------------------------------------
    if (
      normalizedId.startsWith('pde-') ||
      normalizedId.startsWith('act-') ||
      normalizedId.startsWith('purp-') ||
      normalizedId.startsWith('not-') ||
      normalizedId.startsWith('cst-') ||
      normalizedId.startsWith('dsr-') ||
      normalizedId.startsWith('proc-') ||
      normalizedId.startsWith('inc-') ||
      normalizedId.startsWith('ret-') ||
      normalizedId.startsWith('DPDP-') ||
      normalizedType.includes('DPDP') ||
      normalizedType.includes('PERSONAL_DATA') ||
      normalizedType.includes('ROPA') ||
      normalizedType.includes('DSR')
    ) {
      const dpdp360 = dpdpPrivacyEngineService.resolveDpdpEntity360('tenant_skanda', normalizedId);
      const record = dpdp360.entityRecord as any;

      const rootNode: EntityNode = {
        id: normalizedId,
        type: dpdp360.entityType as any,
        code: normalizedId,
        title: record?.name || record?.title || `${dpdp360.entityType}: ${normalizedId}`,
        status: record?.status || record?.discoveryStatus || 'ACTIVE_APPROVED',
        owner: record?.owner || 'Chief Privacy Officer',
        details: {
          classification: record?.classification || 'CONFIDENTIAL',
          lawfulBasis: record?.lawfulBasis || record?.applicableBasis || 'CONSENT',
          riskRating: record?.riskRating || record?.riskTier || 'MEDIUM'
        }
      };

      const connectedNodes: EntityNode[] = [];
      const edges: EntityEdge[] = [];

      dpdp360.linkedDataElements.forEach(elem => {
        connectedNodes.push({
          id: elem.id,
          type: 'PERSONAL_DATA' as any,
          code: elem.id,
          title: elem.name,
          status: elem.discoveryStatus,
          owner: elem.owner
        });
        edges.push({
          sourceId: rootNode.id,
          targetId: elem.id,
          relationship: 'INVENTORIES'
        });
      });

      dpdp360.linkedActivities.forEach(act => {
        connectedNodes.push({
          id: act.id,
          type: 'PROCESSING_ACTIVITY' as any,
          code: act.id,
          title: act.name,
          status: act.status,
          owner: act.owner
        });
        edges.push({
          sourceId: rootNode.id,
          targetId: act.id,
          relationship: 'PROCESSES'
        });
      });

      dpdp360.linkedControls.forEach(ctrlCode => {
        connectedNodes.push({
          id: ctrlCode,
          type: 'CONTROL',
          code: ctrlCode,
          title: `Privacy Safeguard ${ctrlCode}`,
          status: 'EFFECTIVE'
        });
        edges.push({
          sourceId: rootNode.id,
          targetId: ctrlCode,
          relationship: 'SAFEGUARDS'
        });
      });

      const metadata: Entity360Metadata = {
        overview: {
          description: record?.businessPurpose || record?.officialText || `DPDP Statutory Entity ${normalizedId}`,
          owner: record?.owner || 'Chief Privacy Officer',
          department: 'Data Protection & Privacy Office',
          criticality: record?.riskRating === 'CRITICAL' || record?.isSensitivePersonalData ? 'TIER_1_CRITICAL' : 'HIGH',
          lifecycleStatus: record?.status || 'ACTIVE'
        },
        lineagePath: [
          'DPDP Privacy Operations & Assurance Platform',
          dpdp360.entityType,
          normalizedId,
          record?.lawfulBasis || 'Statutory Basis Governed',
          'Assurance Verified'
        ]
      };

      return { rootEntity: rootNode, connectedNodes, edges, metadata };
    }

    // ------------------------------------------------------------------------
    // 13. GENERIC FALLBACK FOR ANY OTHER ENTITY
    // ------------------------------------------------------------------------
    const defaultRoot: EntityNode = {
      id: normalizedId,
      type: (entityType as any) || 'CONTROL',
      code: normalizedId,
      title: `${entityType || 'Entity'}: ${normalizedId}`,
      status: 'ACTIVE'
    };

    return {
      rootEntity: defaultRoot,
      connectedNodes: [],
      edges: [],
      metadata: {
        overview: {
          description: `Canonical GRC domain entity ${normalizedId}`,
          owner: 'Enterprise Administrator',
          department: 'Corporate Governance',
          lifecycleStatus: 'ACTIVE'
        },
        lineagePath: ['SKANDA GRC Operating Platform', normalizedType || 'Domain Entity', normalizedId]
      }
    };
  }

  /**
   * Retrieve the complete canonical end-to-end lineage trace for any entity
   */
  public static getCanonicalLineageTrace(entityId: string, entityType?: string): string[] {
    const graph = this.get360GraphForEntity(entityId, entityType);
    return graph.metadata?.lineagePath || [
      'Client (Acme Financial Technologies)',
      'Organization (FinTech Cloud Operations)',
      'Department (Cloud Security & DevSecOps)',
      'Business Process (Access Provisioning & JIT Elevation)',
      'Application (Okta / Teleport Bastion)',
      'Asset (AWS Multi-Region Infrastructure)',
      'Risk (RSK-001 Unauthorized Privilege Escalation)',
      'Control (CTRL-001 Phishing-Resistant MFA)',
      'Policy (POL-IAM-01 Identity & Access Governance)',
      'Procedure (SOP-IAM-001 User Onboarding & JIT Approval)',
      'Implementation (100% Hardware Key Enforcement)',
      'Evidence (EV-2026-001 SHA-256 Verified Telemetry)',
      'Control Test (TEST-2026-Q3-088 PASS - Effective)',
      'Finding (FND-001 Resolved Non-Conformity)',
      'CAPA (CAPA-001 Automated Key Rotation Verified)',
      'Retest (Passed with Zero Deficiencies)',
      'Assurance (Stage-2 ISO 27001 Certification Achieved)'
    ];
  }
}
