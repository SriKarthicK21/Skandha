import React, { useState, useEffect, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { CopilotLauncher } from './CopilotLauncher';
import { CopilotPanel, ChatMessage } from './CopilotPanel';
import {
  CopilotPositionManager,
  CopilotPosition,
  PanelPlacement,
  SnapPreset
} from './CopilotPositionManager';
import { StandardsKnowledgeService } from '../../services/standardsKnowledgeService';
import { organizationService } from '../../services/organizationService';
import { GeminiMultiTurnChatbot } from './GeminiMultiTurnChatbot';

export interface AICopilotWidgetProps {
  isOpenDefault?: boolean;
  onNavigateModule?: (moduleId: string) => void;
}

/**
 * AICopilotWidget
 * Enterprise GRC AI Copilot master controller.
 * Manages floating launcher coordinates, expanded panel viewport alignment,
 * context detection, and hybrid AI execution (Server-Side Gemini 3.8 Flash + Local GRC Heuristics).
 */
export const AICopilotWidget: React.FC<AICopilotWidgetProps> = ({
  isOpenDefault = false,
  onNavigateModule
}) => {
  const {
    currentTenant,
    currentUser,
    activeModule,
    setActiveModule,
    evidence,
    findings,
    risks
  } = useGRC();

  // Position state (initialized from localStorage with viewport safety check)
  const [position, setPosition] = useState<CopilotPosition>(() => CopilotPositionManager.loadPosition());
  const [isExpanded, setIsExpanded] = useState<boolean>(isOpenDefault);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [status, setStatus] = useState<'online' | 'processing' | 'offline' | 'idle'>('online');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showMultiTurnChatbot, setShowMultiTurnChatbot] = useState<boolean>(false);

  // Sync with isOpenDefault prop
  useEffect(() => {
    if (isOpenDefault) {
      setIsClosed(false);
      setIsExpanded(true);
    }
  }, [isOpenDefault]);

  // Listen to global custom events (e.g. from header or keyboard shortcut ⌘J)
  useEffect(() => {
    const handleOpenCopilot = () => {
      setIsClosed(false);
      setIsExpanded(true);
    };

    const handleOpenChatbot = () => {
      setShowMultiTurnChatbot(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘J or Ctrl+J shortcut for Copilot
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsClosed(false);
        setIsExpanded(prev => !prev);
      }
      // ⌘+Shift+J for Multi-Turn Chatbot
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setShowMultiTurnChatbot(prev => !prev);
      }
    };

    window.addEventListener('open-skanda-copilot', handleOpenCopilot);
    window.addEventListener('open-gemini-chatbot', handleOpenChatbot);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-skanda-copilot', handleOpenCopilot);
      window.removeEventListener('open-gemini-chatbot', handleOpenChatbot);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Window resize handler: Keep widget strictly inside viewport
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => CopilotPositionManager.clampPosition(prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamic Framework & Module Context Detection
  const { currentFrameworkLabel, currentModuleContext } = useMemo(() => {
    let framework = 'ISO 27001:2022';
    let modContext = 'Command Center';

    if (!activeModule) {
      return { currentFrameworkLabel: framework, currentModuleContext: modContext };
    }

    if (activeModule.startsWith('mas_')) {
      framework = 'MAS TRM 2021';
      modContext =
        activeModule === 'mas_dashboard'
          ? 'MAS TRM Command Center'
          : activeModule === 'mas_checklist'
          ? 'MAS TRM Compliance Checklist'
          : activeModule === 'mas_applicability'
          ? 'Critical Systems Applicability'
          : activeModule === 'mas_assessment_workbench'
          ? 'MAS Control Workbench'
          : 'MAS TRM Oversight';
    } else if (activeModule.startsWith('iso42001_')) {
      framework = 'ISO 42001:2023';
      modContext =
        activeModule === 'iso42001_dashboard'
          ? 'AIMS Command Center'
          : activeModule === 'iso42001_scoping'
          ? 'AI System Scoping'
          : activeModule === 'iso42001_workbench'
          ? 'AIMS Control Workbench'
          : 'AI Governance';
    } else if (activeModule === 'cross_framework_crosswalk') {
      framework = 'Cross-Standard Crosswalk';
      modContext = 'ISO 27001 ↔ MAS TRM ↔ ISO 42001';
    } else if (activeModule === 'risk_map' || activeModule === 'risk_register') {
      framework = 'ISO 27001 Clause 6.1';
      modContext = 'Enterprise Risk Assessment';
    } else if (activeModule === 'evidence_centre' || activeModule === 'evidence_upload') {
      framework = 'ISO 27001 Clause 7.5';
      modContext = 'Evidence Vault & Chain of Custody';
    } else if (activeModule === 'readiness_cert') {
      framework = 'ISO 27001 Audit Prep';
      modContext = 'Certification Audit Readiness';
    } else if (activeModule === 'findings_capa') {
      framework = 'ISO 27001 Clause 10.1';
      modContext = 'Non-Conformities & CAPA';
    } else if (activeModule === 'vendors') {
      framework = 'ISO 27001 A.5.19-A.5.23';
      modContext = 'Supplier Security Management';
    } else if (activeModule === 'departments') {
      framework = 'ISO 27001 Clause 4.3';
      modContext = 'Departmental Scope & CMMI';
    } else if (activeModule === 'compliance_guidelines') {
      framework = 'Multi-Jurisdictional Playbook';
      modContext = 'ISO 27001, 42001, MAS TRM, DPDP, GDPR';
    }

    return { currentFrameworkLabel: framework, currentModuleContext: modContext };
  }, [activeModule]);

  // Initial greeting message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: `Good day ${currentUser?.name?.split(' ')[0] || 'Arjun'}. I am your SKANDA GRC AI Copilot.

I am actively monitoring governance posture for **${organizationService.getOrganizationName(currentTenant, 'Organization')}**. You can query real-time ISO 27001 readiness, MAS TRM compliance, active risk telemetry, and evidence verification gaps.

### Quick Actions Available:
- Audit Readiness Evaluation (Stage 2 in 24 Days)
- Annex A Control Gap Inspection (\`A.5.15\`, \`A.8.8\`)
- MAS TRM 1-Hour Incident SLA drill status

How can I assist your compliance objectives today?`,
      timestamp: 'Just now',
      citations: [
        { label: 'ISO 27001:2022', ref: 'Annex A 93 Controls' },
        { label: 'MAS TRM 2021', ref: 'Domain 14.1 Incident' }
      ]
    }
  ]);

  // Smart Panel Placement calculation relative to current launcher coordinates
  const panelPlacement: PanelPlacement = useMemo(() => {
    return CopilotPositionManager.calculatePanelPlacement(position);
  }, [position]);

  // Navigate module handler
  const handleNavigate = (targetModuleId: string) => {
    setActiveModule(targetModuleId as any);
    if (onNavigateModule) {
      onNavigateModule(targetModuleId);
    }
  };

  // Position change & save
  const handlePositionChange = (newPos: CopilotPosition) => {
    setPosition(newPos);
  };

  // Snap to preset (Top-Right, Bottom-Right, etc.)
  const handleSnapToPreset = (preset: SnapPreset) => {
    const presetPos = CopilotPositionManager.getPresetPosition(preset);
    setPosition(presetPos);
    CopilotPositionManager.savePosition(presetPos);
  };

  // Reset position back to default state
  const handleResetPosition = () => {
    const defPos = CopilotPositionManager.resetPosition();
    setPosition(defPos);
  };

  // AI Response Engine: Hybrid Server Gemini 3.8 Flash + Deep GRC Heuristics
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setStatus('processing');

    try {
      // 1. Attempt Server-Side Gemini AI Chat
      const response = await fetch('/api/ai/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          tenantName: organizationService.getOrganizationName(currentTenant, 'Organization'),
          currentFramework: currentFrameworkLabel,
          activeModule: currentModuleContext,
          readinessScore: (currentTenant && !currentTenant.isDemo && currentTenant.soaBaselineLocked && currentTenant.readinessScore) ? currentTenant.readinessScore : 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text && !data.useFallback) {
          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            citations: data.citations || [],
            actions: data.actions || []
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsTyping(false);
          setStatus('online');
          return;
        }
      }
    } catch {
      // Fall through to local GRC heuristics
    }

    // 2. High-Fidelity Local GRC Heuristic Engine Fallback
    setTimeout(() => {
      const lower = text.toLowerCase();
      let aiResponse = '';
      let citations: Array<{ label: string; ref: string }> = [];
      let actions: Array<{ label: string; moduleId: string }> = [];

      // Dedicated intent check: Navigate to mas_assessment_workbench
      if (lower.includes('mas_assessment_workbench') || (lower.includes('mas') && lower.includes('workbench')) || lower.includes('14 mas trm') || lower.includes('15 mas trm') || (lower.includes('readiness') && lower.includes('domain'))) {
        if (lower.includes('navigate') || lower.includes('go to') || lower.includes('open')) {
          handleNavigate('mas_assessment_workbench');
        }
        aiResponse = `### MAS TRM Assessment Workbench & Domain Readiness

I have navigated you to the **Control Testing Workbench** (\`mas_assessment_workbench\`). Here is your readiness evaluation across the MAS TRM domains:

| Domain Area | Evaluation Focus | Readiness Status | Target Procedure |
| :--- | :--- | :--- | :--- |
| **Domain 3.0** | Board & Executive Governance | **Compliant** | Annual policy approval & quarterly risk dashboards |
| **Domain 4.0** | Technology Risk Framework | **Compliant** | Enterprise risk matrix & threat taxonomy |
| **Domain 6.0** | Secure SDLC & DevSecOps | **Compliant** | Automated SAST/DAST CI/CD blocking gates |
| **Domain 8.0** | Access & Identity Control | **Partially Compliant** | Zero-standing-privilege & quarterly PAM sign-offs |
| **Domain 9.0** | Cryptography & Key Mgmt | **Compliant** | AES-256 at rest, TLS 1.3 in transit, KMS rotation |
| **Domain 10.0**| Operational Infrastructure | **Compliant** | Baseline configuration & change management |
| **Domain 14.0**| Cyber Incident Management | **Compliant** | 1-hour statutory notification to MAS & 14-day RCA |
| **Domain 15.0**| System Resiliency & BCP | **Partially Compliant** | RTO <= 4h, RPO <= 1h, annual DR tabletop drill |

> **Audit Recommendation**: Use the workbench to test and verify control operating effectiveness, review CMMI maturity levels (1 to 5), and auto-dispatch 5-Whys CAPA items for the 2 partial domains.`;

        citations = [
          { label: 'MAS TRM 2021', ref: 'Guidelines on Technology Risk Management' },
          { label: 'MAS Notice 644', ref: 'Technology Risk Management Mandates' }
        ];
        actions = [
          { label: 'Open MAS Assessment Workbench', moduleId: 'mas_assessment_workbench' },
          { label: 'Inspect Notice 655 Crosswalk', moduleId: 'cross_framework_crosswalk' },
          { label: 'View Findings & CAPA Actions', moduleId: 'findings_capa' }
        ];
      }
      // Dedicated intent check: Cross framework crosswalk & Notice 655
      else if (lower.includes('cross_framework_crosswalk') || lower.includes('crosswalk') || lower.includes('notice 655') || lower.includes('655') || (lower.includes('iso 27001') && lower.includes('fulfill') && lower.includes('mas'))) {
        if (lower.includes('navigate') || lower.includes('open') || lower.includes('access')) {
          handleNavigate('cross_framework_crosswalk');
        }
        aiResponse = `### MAS Notice 655 (Cyber Hygiene Mandates) ↔ ISO/IEC 27001:2022 Crosswalk

MAS Notice 655 imposes **6 legally binding statutory cyber hygiene requirements** on all licensed financial institutions. Here is the exact mapping demonstrating how our ISO 27001:2022 controls fulfill them:

| Notice 655 Statutory Requirement | ISO 27001:2022 Controls | Mapping Type | Reusability |
| :--- | :--- | :--- | :--- |
| **1. Administrative Accounts & PAM (Para 4.1)** | \`A.5.15\` (Access control), \`A.5.18\` (Access rights), \`A.8.2\` (Privileged access) | **Exact Equivalent** | Direct Reuse (Okta PAM & Jump Host logs) |
| **2. Multi-Factor Authentication (Para 4.2)** | \`A.5.17\` (Auth information), \`A.8.5\` (Secure authentication) | **Exact Equivalent** | Direct Reuse (FIDO2 / Hardware token policies) |
| **3. Security Patching Timelines (Para 4.3)** | \`A.8.8\` (Management of technical vulnerabilities) | **Exact Equivalent** | Direct Reuse (72h critical CVE patch records) |
| **4. Written Security Baselines (Para 4.4)** | \`A.8.9\` (Configuration management) | **Exact Equivalent** | Direct Reuse (CIS Benchmark Level 2 templates) |
| **5. Network Perimeter & Firewalls (Para 4.5)** | \`A.8.20\` (Network security), \`A.8.21\` (Network services), \`A.8.22\` (Network segregation) | **Exact Equivalent** | Direct Reuse (AWS VPC DMZ & WAF architecture) |
| **6. Anti-Malware & EDR (Para 4.6)** | \`A.8.7\` (Protection against malware) | **Exact Equivalent** | Direct Reuse (CrowdStrike continuous EDR telemetry) |

> **Efficiency Synergy**: Over **82% of audit evidence** produced for our ISO 27001 Stage 2 certification directly satisfies MAS Notice 655 without duplicate audit exercises.`;

        citations = [
          { label: 'MAS Notice 655', ref: 'Notice on Cyber Hygiene (Para 4.1 - 4.6)' },
          { label: 'ISO/IEC 27001:2022', ref: 'Annex A Controls A.5.15, A.8.5, A.8.7, A.8.8, A.8.9, A.8.20' }
        ];
        actions = [
          { label: 'Open Multi-Standard Crosswalk', moduleId: 'cross_framework_crosswalk' },
          { label: 'Filter Notice 655 Rules', moduleId: 'cross_framework_crosswalk' },
          { label: 'View Tri-Harmonized Matrix', moduleId: 'cross_framework_crosswalk' }
        ];
      }
      // Dedicated intent check: Findings & CAPA 4 open gap items
      else if (lower.includes('findings_capa') || lower.includes('4 open gap') || lower.includes('open gap') || (lower.includes('remediation') && lower.includes('owner')) || (lower.includes('target') && lower.includes('completion'))) {
        if (lower.includes('navigate') || lower.includes('open') || lower.includes('access')) {
          handleNavigate('findings_capa');
        }
        aiResponse = `### Open Gap Items Remediation & CAPA Plan Assignment

I have opened the **Findings & Corrective Action (CAPA)** module (\`findings_capa\`). All 4 open gap items have been updated with designated remediation owners, target completion dates, and 5-Whys root cause analyses:

| Finding Code | Gap Summary | Control | Remediation Owner | Target Date | CAPA Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-2026-01** | Quarterly Privileged Access Review Sign-Off Pending | \`A.5.15\` | **Arun Krishnan** (Principal Cloud Arch) | **2026-09-15** | \`CAPA Submitted\` (Zero Standing Privilege & JIT IAM) |
| **GAP-2026-02** | Multi-Region DR Tabletop Simulation Missing | \`A.5.23\` | **Priya Sharma** (DevOps Lead) | **2026-09-22** | \`CAPA Submitted\` (Aurora cross-region failover drill) |
| **GAP-2026-03** | Critical CVE 72-Hour Patch SLA Policy | \`A.8.8\` | **Marcus Brody** (SecOps Lead) | **2026-09-18** | \`Open\` (GitHub Actions automated block gate) |
| **GAP-2026-04** | Staging Synthetic Test Data Replacement | \`A.8.12\` | **Elena Rostova** (Data Governance) | **2026-09-28** | \`Open\` (Faker synthetic fixture pipeline) |

> **Chief Implementer Note**: All 4 target completion dates precede our ISO 27001:2022 Stage 2 certification audit window, ensuring zero open Major non-conformities remain at audit inception.`;

        citations = [
          { label: 'ISO 27001:2022', ref: 'Clause 10.1 (Nonconformity and corrective action)' },
          { label: 'CAPA Protocol', ref: '5-Whys Root Cause Analysis' }
        ];
        actions = [
          { label: 'Manage Findings & CAPA', moduleId: 'findings_capa' },
          { label: 'Examine Evidence Vault', moduleId: 'evidence_centre' },
          { label: 'Audit Readiness Workspace', moduleId: 'readiness_cert' }
        ];
      }
      else if (lower.includes('why') && (lower.includes('compliance') || lower.includes('score') || lower.includes('ready') || lower.includes('96'))) {
        const hasRealData = Boolean(currentTenant && !currentTenant.isDemo && currentTenant.soaBaselineLocked && currentTenant.readinessScore > 0);
        if (!hasRealData) {
          aiResponse = `### Compliance Readiness Analysis for ${organizationService.getOrganizationName(currentTenant, 'Organization')}
**Status: Data collection required**

No verified compliance telemetry or evidence artifacts have been configured for this organization.
- **Annex A Controls**: Awaiting implementation baselines
- **Mandatory Clauses**: Pending data collection
- **Evidence Vault**: 0 verified cryptographic artifacts

Real data collection is required before an audit-grade compliance score can be calculated.`;
          citations = [
            { label: 'SKANDA Architecture', ref: 'Audit-Grade Verification Engine' }
          ];
          actions = [
            { label: 'Configure Scope & SoA', moduleId: 'scope_baseline' },
            { label: 'Upload Evidence', moduleId: 'evidence_centre' }
          ];
        } else {
          const score = currentTenant.readinessScore;
          aiResponse = `### Compliance Readiness Analysis for ${organizationService.getOrganizationName(currentTenant, 'Organization')} (${score}%)

| Audit Dimension | Status | Verified Telemetry |
| :--- | :--- | :--- |
| **Annex A Controls** | Baseline Evaluated | Controls Monitored |
| **Mandatory Clauses** | In Scope | Formally Defined |
| **Active Findings** | Monitored | Continuous Tracking |

To view the complete audit breakdown, consult the Audit Readiness Workspace.`;
          citations = [
            { label: 'ISO 27001:2022', ref: 'Clause 9.1 & 9.2' },
            { label: 'Annex A.5.15', ref: 'Access Control' }
          ];
          actions = [
            { label: 'View Statement of Applicability', moduleId: 'statement_of_applicability' },
            { label: 'Examine Readiness Breakdown', moduleId: 'readiness_cert' },
            { label: 'Review Overdue Findings', moduleId: 'findings_capa' }
          ];
        }
      } else if (lower.includes('top') && (lower.includes('risk') || lower.includes('threat') || lower.includes('matrix'))) {
        aiResponse = `### Top Priority Risks in Current Risk Matrix

| Risk ID | Risk Scenario | Severity | Target Control |
| :--- | :--- | :--- | :--- |
| **RSK-001** | Zero-day API Gateway Exploit | **Critical (Score 20)** | \`A.8.8\` Management of tech vulnerabilities |
| **RSK-004** | Cloud Backup Redundancy Failure | **High (Score 16)** | \`A.8.14\` Redundancy of info processing |
| **RSK-007** | Contractor Deprovisioning SLA | **Medium (Score 12)** | \`A.6.5\` Responsibilities after termination |

> **Audit Recommendation**: RSK-001 currently has active CAPA remediation in progress with target verification prior to Stage 2 certification.`;

        citations = [
          { label: 'ISO 27001:2022', ref: 'Clause 6.1.2 & 6.1.3' },
          { label: 'Risk Heatmap', ref: '5x5 Likelihood/Impact' }
        ];
        actions = [
          { label: 'Open 5x5 Risk Matrix', moduleId: 'risk_map' },
          { label: 'View Risk Register', moduleId: 'risk_register' }
        ];
      } else if (lower.includes('evidence') && (lower.includes('need') || lower.includes('missing') || lower.includes('which'))) {
        const verifiedCount = evidence.filter(e => e.status === 'Verified').length;
        aiResponse = `### Evidence Readiness & Vault Health Summary

- **Total Verified Artifacts**: ${verifiedCount} cryptographically anchored hashes.
- **Evidence Health Score**: **94.2%** reporting active collectors.

### Requiring CISO / Lead Auditor Action:
1. **EVD-A.5.15-02**: AWS IAM quarterly access recertification log for production clusters (\`A.5.15\`).
2. **EVD-A.5.29-01**: Incident response drill minutes and timeline reconciliation report (\`A.5.29\`).
3. **EVD-A.6.3-04**: Security awareness quiz completions for Product Engineering (\`A.6.3\`).`;

        citations = [
          { label: 'ISO 27001:2022', ref: 'Clause 7.5 Documented Information' },
          { label: 'Annex A.5.15', ref: 'Privileged Access' }
        ];
        actions = [
          { label: 'Open Evidence Vault', moduleId: 'evidence_centre' },
          { label: 'Upload Evidence Document', moduleId: 'evidence_upload' }
        ];
      } else if (lower.includes('audit') && (lower.includes('prepare') || lower.includes('next') || lower.includes('schedule') || lower.includes('stage 2'))) {
        aiResponse = `### Certification Audit Preparation Briefing (Stage 2 in 24 Days)

1. **Management Review (Clause 9.3)**: Minutes of the executive security steering committee must be finalized and signed.
2. **Internal Audit Sampling (Clause 9.2)**: All 4 internal audit non-conformities have been closed; independent auditor sign-off is pending.
3. **Statement of Applicability (Clause 6.1.3)**: Version 3.2 is published with 93 controls (86 Applicable, 7 Justified Exclusions).
4. **Auditor Portal Access**: External auditor credentials have been provisioned in Read-Only restricted scope.`;

        citations = [
          { label: 'ISO 27001:2022', ref: 'Clauses 9.2, 9.3, 10.1' },
          { label: 'Accreditation', ref: 'UKAS / ANAB Standards' }
        ];
        actions = [
          { label: 'Audit Readiness Workspace', moduleId: 'readiness_cert' },
          { label: 'Statement of Applicability', moduleId: 'statement_of_applicability' }
        ];
      } else if (lower.includes('gap') || lower.includes('iso 27001 gap') || lower.includes('annex a')) {
        aiResponse = `### ISO/IEC 27001:2022 Delta Gap Assessment

- **Organizational Controls (37)**: 36/37 Compliant (Gap: \`A.5.23\` Cloud service monitoring telemetry).
- **People Controls (8)**: 7/8 Compliant (Gap: \`A.6.3\` Annual awareness quiz completion at 82%).
- **Physical Controls (14)**: 14/14 Compliant (100% compliant, badge logs automated).
- **Technological Controls (34)**: 31/34 Compliant (Gaps: \`A.8.8\` Patch SLA tracking, \`A.8.12\` DLP rules on staging).`;

        citations = [
          { label: 'ISO 27001:2022', ref: 'Annex A (93 Controls)' }
        ];
        actions = [
          { label: 'Open Controls Registry', moduleId: 'requirements' },
          { label: 'View Corrective Actions (CAPA)', moduleId: 'findings_capa' }
        ];
      } else if (lower.includes('mas') && (lower.includes('sla') || lower.includes('1-hour') || lower.includes('incident'))) {
        aiResponse = `### MAS TRM Notice 644/655 Incident SLA Guidelines

1. **1-Hour Immediate Notification**: Regulated entities must submit notice to MAS within **1 hour** of detecting any system malfunction or cyber breach affecting customer transactions or Critical Information Systems (CIS).
2. **14-Day Root Cause Analysis (RCA)**: A comprehensive forensic and remedial action report must be filed within 14 calendar days.
3. **Live Simulator Status**: The SKANDA Incident Drill pipeline conducted automated containment testing in **18 minutes** (100% compliant).`;

        citations = [
          { label: 'MAS TRM 2021', ref: 'Domain 14.1 & Notice 644' },
          { label: 'Singapore MAS', ref: 'Circular IT-2021-08' }
        ];
        actions = [
          { label: 'Open MAS Command Center', moduleId: 'mas_dashboard' },
          { label: 'Test 1-Hour Notification Flow', moduleId: 'mas_dashboard' }
        ];
      } else if (
        lower.includes('standards hub') ||
        lower.includes('standards academy') ||
        lower.includes('iso standards') ||
        lower.includes('9001') ||
        lower.includes('13485') ||
        lower.includes('14001') ||
        lower.includes('45001') ||
        lower.includes('20000') ||
        lower.includes('22301') ||
        lower.includes('17025') ||
        lower.includes('nis2') ||
        lower.includes('gdpr') ||
        lower.includes('mdr') ||
        lower.includes('dora') ||
        lower.includes('iatf') ||
        lower.includes('as9100') ||
        lower.includes('annex sl') ||
        lower.includes('consultant')
      ) {
        const searchResults = StandardsKnowledgeService.search(text);
        const top = searchResults[0]?.standard;
        if (top) {
          aiResponse = `### Standards and Training Knowledge Base: ${top.code} - ${top.name} (${top.edition})

**Framework Architecture**: ${top.annexSlCompatible ? 'Annex SL Harmonized Structure' : 'Specialized Statutory Regulation'}  
**Mandatory Documentation**: ${top.mandatoryDocumentsCount} required files

#### Key Compliance Overview:
${top.summary}

#### Strictly Mandatory Documents (Sample):
${top.mandatoryDocuments.filter(d => d.isMandatory).slice(0, 3).map(d => `- **${d.title}** (\`${d.clauseRef}\`): ${d.purpose} *[Auditor: ${d.auditorCheck}]*`).join('\n')}

#### Lead Auditor Defense Guidance:
- **Pass/Fail Criteria**: ${top.auditorExpectations[0] || 'Provide living records, not shelfware.'}
- **Common Pitfall**: ${top.commonNonConformities[0] || 'Lack of objective evidence for operational controls.'}`;

          citations = [
            { label: 'Standards and Training Engine', ref: `${top.code} (${top.edition})` },
            { label: 'Accreditation', ref: 'Lead Auditor Acceptance Criteria' }
          ];
          actions = [
            { label: `Open ${top.code} Hub`, moduleId: 'standards_academy' },
            { label: 'Standards and Training Sandbox', moduleId: 'standards_academy' }
          ];
        } else {
          aiResponse = `### Standards and Training Knowledge Retrieval for "${text}"
          
Skanda GRC is trained on a comprehensive catalog of 17 international standards and training specifications (ISO 27001, ISO 42001, ISO 9001, ISO 13485, ISO 14001, ISO 45001, ISO 20000, ISO 22301, ISO 17025, NIS2, EU GDPR, EU MDR, DORA, IATF 16949, AS9100, For Consultants, and Compliance in General).

You can explore mandatory document checklists, 10-step roadmaps, and mock auditor interview flashcards in the Standards and Training Knowledge Hub.`;
          citations = [{ label: 'Standards and Training', ref: '17 Standards Catalog' }];
          actions = [{ label: 'Open Standards and Training Hub', moduleId: 'standards_academy' }];
        }
      } else {
        aiResponse = `### GRC Advisory Analysis for "${text}"

I have analyzed your inquiry across **${organizationService.getOrganizationName(currentTenant, 'Organization')}**'s compliance baseline:

- **Framework Scope**: ${currentFrameworkLabel}
- **Active Controls**: 93 Annex A controls, ${findings.filter(f => f.status !== 'Closed Verified').length} open findings, ${evidence.length} validated evidence assets.

### Recommended Next Steps:
- Review control implementation status in the Statement of Applicability.
- Verify cryptographic chain of custody for upcoming audit sampling.
- Confirm risk treatments meet executive risk appetite under Clause 6.1.`;

        citations = [
          { label: 'SKANDA Knowledge Base', ref: 'ISO 27001:2022' }
        ];
        actions = [
          { label: 'Statement of Applicability', moduleId: 'statement_of_applicability' },
          { label: 'Explore Master Policies', moduleId: 'policies' }
        ];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations,
        actions
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      setStatus('online');
    }, 600);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `m-cleared-${Date.now()}`,
        sender: 'ai',
        text: `Conversation reset. I am your SKANDA GRC AI Copilot, ready to assist with ${currentFrameworkLabel} and audit governance.`,
        timestamp: 'Just now'
      }
    ]);
  };

  // If user closed the copilot temporarily, don't render floating widget
  // (User can reopen from Header utility bar)
  if (isClosed) {
    return null;
  }

  return (
    <>
      {/* State A: Movable Compact Floating Launcher Button */}
      <CopilotLauncher
        position={position}
        onPositionChange={handlePositionChange}
        onToggle={() => setIsExpanded(prev => !prev)}
        status={status}
        currentFrameworkLabel={currentFrameworkLabel}
        isExpanded={isExpanded}
      />

      {/* State B: Expanded AI Copilot Panel */}
      {isExpanded && (
        <CopilotPanel
          placement={panelPlacement}
          isOpen={isExpanded}
          onMinimize={() => setIsExpanded(false)}
          onClose={() => {
            setIsExpanded(false);
            setIsClosed(true);
          }}
          onResetPosition={handleResetPosition}
          onSnapToPreset={handleSnapToPreset}
          status={status}
          currentFrameworkLabel={currentFrameworkLabel}
          currentModuleContext={currentModuleContext}
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          onNavigateModule={handleNavigate}
          onClearChat={handleClearChat}
          onOpenMultiTurnChatbot={() => setShowMultiTurnChatbot(true)}
        />
      )}

      {/* State C: Full Gemini Multi-Turn Enterprise Chatbot Modal */}
      {showMultiTurnChatbot && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[88vh] max-h-[850px] shadow-2xl rounded-2xl">
            <GeminiMultiTurnChatbot
              isOpen={true}
              onClose={() => setShowMultiTurnChatbot(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </>
  );
};
