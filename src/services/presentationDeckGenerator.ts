import PptxGenJS from 'pptxgenjs';
import jsPDF from 'jspdf';

export interface PresentationMetadata {
  organizationName: string;
  leadPresenter: string;
  presenterTitle: string;
  audience: 'Executive Board / C-Level' | 'Enterprise Clients / Prospective Buyers' | 'Audit Committee' | 'Internal Stakeholders';
  dateStr: string;
  complianceScore?: number;
}

export interface PresentationSlideContent {
  slideNumber: number;
  category: string;
  title: string;
  subtitle: string;
  keyTakeaways: string[];
  metrics: { label: string; value: string; detail: string }[];
  bulletPoints: { header: string; text: string }[];
  speakerNotes: string;
}

export const PRESENTATION_SLIDES: PresentationSlideContent[] = [
  {
    slideNumber: 1,
    category: 'EXECUTIVE BRIEFING',
    title: 'Skanda 5 High-Level GRC SaaS Platform',
    subtitle: 'Autonomous Multi-Framework Governance, Risk & Continuous Compliance Architecture',
    keyTakeaways: [
      'Next-generation GRC engine uniting ISO 27001, ISO 42001 (AI), MAS TRM & DPDP',
      'Automated cryptographic evidence harvesting with SHA-256 integrity verification',
      'Continuous audit readiness with predictive Bayesian recertification likelihood forecasting'
    ],
    metrics: [
      { label: 'Supported Frameworks', value: '5 Global', detail: 'ISO 27001, 42001, MAS TRM, DPDP, SOC 2' },
      { label: 'Audit Prep Reduction', value: '70%', detail: 'Automated continuous evidence collection' },
      { label: 'Historical Pass Rate', value: '100%', detail: 'Zero major non-conformities across accredited cycles' }
    ],
    bulletPoints: [
      { header: 'Enterprise Mission', text: 'Eliminate compliance fatigue, prevent regulatory penalties, and establish verifiable zero-trust digital assurance.' },
      { header: 'Accreditation Alignment', text: 'Calibrated directly against UKAS, BSI Assurance, TÜV SÜD, and DNV accredited registrar standards.' }
    ],
    speakerNotes: 'Good morning/afternoon, esteemed leadership and partners. Today, I am proud to present the Skanda 5 High-Level GRC Platform—an enterprise-grade SaaS architecture designed to transform regulatory compliance from a chaotic annual scramble into an autonomous, continuous operational advantage.'
  },
  {
    slideNumber: 2,
    category: 'MARKET CONTEXT & PROBLEM',
    title: 'The Modern GRC Dilemma & Cost of Non-Compliance',
    subtitle: 'Why Legacy Spreadsheets & Siloed GRC Tools Fail in the AI & Cloud Era',
    keyTakeaways: [
      'Fragmented tools create massive blind spots between cybersecurity and AI safety',
      'Duplicate control testing across overlapping standards wastes hundreds of engineering hours',
      'Surprise audit non-conformities lead to lost customer contracts and regulatory fines'
    ],
    metrics: [
      { label: 'Manual Audit Prep Cost', value: '$350K+', detail: 'Average annual external advisory & audit fees' },
      { label: 'Control Redundancy', value: '68%', detail: 'Identical control requirements tested multiple times' },
      { label: 'Stale Evidence Rate', value: '43%', detail: 'Manual screenshots expired before auditor arrival' }
    ],
    bulletPoints: [
      { header: 'The Multi-Framework Sprawl', text: 'Organizations today must simultaneously satisfy ISO 27001 for cloud security, ISO 42001 for AI models, MAS TRM for financial compliance, and India DPDP Act for privacy.' },
      { header: 'The Snapshot Fallacy', text: 'Traditional annual audits capture a single moment in time. The instant the auditor leaves, systems drift out of compliance without any warning.' }
    ],
    speakerNotes: 'Enterprises today face unprecedented regulatory pressure. When a company uses cloud services and AI pipelines, they are forced to juggle multiple standards. Without an intelligent, unified crosswalk engine, teams waste 68% of their time proving the exact same control to three different auditors.'
  },
  {
    slideNumber: 3,
    category: 'SOLUTION ARCHITECTURE',
    title: 'The 5 Architectural Pillars of Skanda GRC',
    subtitle: 'Engineered for Zero-Trust Isolation, Real-Time Telemetry & Predictive Governance',
    keyTakeaways: [
      'Pillar 1: Multi-Tenant Zero-Trust Scoping with Cryptographic Separation',
      'Pillar 2: Tri-Harmonization Crosswalk Engine (Test Once, Comply Globally)',
      'Pillar 3: Real-Time Telemetry Stream & Continuous Evidence Vault',
      'Pillar 4: Predictive Bayesian Recertification Likelihood Engine',
      'Pillar 5: Skanda BrandGuard™ External Threat & Dark Web Attack Surface Tracking'
    ],
    metrics: [
      { label: 'Time-to-Readiness', value: '30 Days', detail: 'From kickoff to Stage 1 external audit readiness' },
      { label: 'Unified Controls', value: '180+ Mapped', detail: 'Harmonized across ISO 27001, 42001 & MAS TRM' },
      { label: 'Telemetry Checks', value: 'Continuous', detail: 'Automated drift monitoring across cloud infrastructure' }
    ],
    bulletPoints: [
      { header: 'Continuous Autonomous Verification', text: 'Replaces annual audit panic with continuous control verification and automated policy synchronization.' },
      { header: 'Executive Real-Time Visibility', text: 'Command Center dashboards provide C-level leaders and board members with instant compliance health scores.' }
    ],
    speakerNotes: 'Skanda is architected around 5 core pillars. By separating tenants with cryptographic hashing, mapping controls into a single unified taxonomy, and streaming live cloud telemetry, we give leadership total operational confidence.'
  },
  {
    slideNumber: 4,
    category: 'CORE GOVERNANCE ENGINE',
    title: 'End-to-End Business Discovery & Automated ISMS/AIMS Scoping',
    subtitle: 'Guided Onboarding, Digital MoU Execution & Automated Statement of Applicability',
    keyTakeaways: [
      'Interactive Discovery Wizard captures business context, cloud assets, and risk posture',
      'Digital MoU execution legally binds multi-tenant roles, confidentiality, and data handling',
      'Automated Statement of Applicability (SoA) generator with one-click audit packaging'
    ],
    metrics: [
      { label: 'Onboarding Velocity', value: '< 2 Hours', detail: 'Full enterprise scoping and baseline establishment' },
      { label: 'Mandatory Clauses', value: '100% Covered', detail: 'Clauses 4 through 10 ISO governance requirements' },
      { label: 'SoA Automation', value: 'Instant', detail: 'Justification and exclusion rationale auto-compiled' }
    ],
    bulletPoints: [
      { header: 'Clause 4 to 10 Governance', text: 'Automated generation of Context of Organization, Leadership Policies, Risk Management Framework, and Internal Audit Charters.' },
      { header: 'Audit-Ready Statement of Applicability', text: 'Dynamic SoA matrix covering all 93 ISO 27001:2022 controls and 38 ISO 42001:2023 AI controls with real-time status and evidence linkages.' }
    ],
    speakerNotes: 'Our onboarding wizard takes what used to take months of consultant interviews and compresses it into hours. It auto-generates your Statement of Applicability, populates clauses 4 through 10, and establishes enforceable digital MoUs between departments and external suppliers.'
  },
  {
    slideNumber: 5,
    category: 'AI GOVERNANCE & SAFETY',
    title: 'ISO/IEC 42001:2023 AIMS Suite & AI-SIA Impact Assessments',
    subtitle: 'Comprehensive Governance for Large Language Models, Agentic Workflows & ML Pipelines',
    keyTakeaways: [
      'First-in-class operational platform for the newly ratified ISO/IEC 42001:2023 standard',
      'Interactive AI System Impact Assessment (AI-SIA) evaluating safety, bias, transparency, and toxicity',
      'Automated Third-Party AI Supplier Zero-Data-Retention (ZDR) verification engine'
    ],
    metrics: [
      { label: 'AI Controls', value: '38 Annex A', detail: 'Full coverage of A.2 through A.10 AI controls' },
      { label: 'Model Risk Profiler', value: 'Real-Time', detail: 'Automated evaluation of training data & prompt injection' },
      { label: 'AI Supply Chain', value: 'ZDR Verified', detail: 'Enterprise LLM supplier contract compliance' }
    ],
    bulletPoints: [
      { header: 'AI Lifecycle Governance', text: 'Governs every phase of AI systems—from data acquisition and algorithm training to autonomous agent deployment and user feedback.' },
      { header: 'Model Safety Cards & Bias Auditing', text: 'Generates standardized AI model safety declarations, human-in-the-loop oversight gates, and hallucination monitoring logs.' }
    ],
    speakerNotes: 'As every enterprise integrates generative AI and autonomous agents, ISO 42001 is becoming the global standard for AI trust. Skanda provides an end-to-end AI Management System workbench, complete with AI-SIA impact evaluations and third-party AI supplier verification.'
  },
  {
    slideNumber: 6,
    category: 'FINANCIAL & PRIVACY STANDARDS',
    title: 'MAS TRM Regulatory Engine & India DPDP Act Compliance',
    subtitle: 'Dual High-Stakes Compliance for Financial Institutions & Global Data Privacy Regimes',
    keyTakeaways: [
      'Full alignment with Monetary Authority of Singapore (MAS) Technology Risk Management guidelines',
      'Automated DPDP Act 2023 framework with Data Principal consent management and DPO reporting',
      'Cross-border data flow mapping and cryptographic breach notification workflows'
    ],
    metrics: [
      { label: 'MAS TRM Controls', value: '11 Domains', detail: 'Cyber hygiene, dual-control validation, API security' },
      { label: 'DPDP Privacy Rights', value: 'Automated', detail: 'Data access, correction & erasure fulfillment' },
      { label: 'Breach Notification', value: '< 6 Hours', detail: 'Rapid regulatory response dossier generation' }
    ],
    bulletPoints: [
      { header: 'Monetary Authority of Singapore (MAS) TRM', text: 'Equipped with formal Applicability Surveys, Cybersecurity Hygiene verification, and Automated Policy Generation for financial institutions.' },
      { header: 'Digital Personal Data Protection (DPDP) Act', text: 'Protects personal data assets with automated Data Fiduciary consent logs, Data Protection Officer oversight, and cross-border transfer tracking.' }
    ],
    speakerNotes: 'For financial services and international organizations, Skanda embeds the stringent Monetary Authority of Singapore Technology Risk Management guidelines, alongside full compliance with India DPDP Act 2023, ensuring global privacy and cybersecurity harmonization.'
  },
  {
    slideNumber: 7,
    category: 'THREAT INTELLIGENCE & ATTACK SURFACE',
    title: 'Skanda BrandGuard™ & Digital Brand Protection',
    subtitle: 'Autonomous Threat Actor Campaign Tracking, Dark Web Leaks & Attack Surface Intelligence',
    keyTakeaways: [
      'Continuous discovery of brand abuse, phishing domains, and rogue corporate assets',
      'Real-time dark web credential leak alerting and source code repository exposure detection',
      'Executive Brand Exposure Index (BEI) directly correlated with ISO 27001 threat risk registers'
    ],
    metrics: [
      { label: 'Threat Actor Clusters', value: '4 Monitored', detail: 'Targeted APT campaign tracking' },
      { label: 'Credential Alerting', value: '< 15 Mins', detail: 'Instant dark web leak identification' },
      { label: 'Brand Exposure Index', value: 'Live Radar', detail: 'Composite 5-dimension brand defense metric' }
    ],
    bulletPoints: [
      { header: 'Proactive External Defense', text: 'Compliance without threat intelligence is blind. BrandGuard™ monitors the global attack surface to catch threats before auditors or adversaries do.' },
      { header: 'Board-Level Brand Reports', text: 'Generates specialized Executive Board Decks detailing corporate brand exposure, rogue domain takedowns, and digital identity integrity.' }
    ],
    speakerNotes: 'Unlike traditional GRC tools that only look inward, Skanda includes BrandGuard™—our digital brand protection module that constantly sweeps external surfaces, dark web forums, and phishing domains to protect our clients reputation and digital assets.'
  },
  {
    slideNumber: 8,
    category: 'CRYPTOGRAPHIC EVIDENCE & TELEMETRY',
    title: 'Automated Evidence Vault & SHA-256 Integrity Verification',
    subtitle: 'Immutable Audit Trail, 90-Day Freshness SLAs & Continuous Cloud Telemetry',
    keyTakeaways: [
      'Cryptographic SHA-256 hashing guarantees tamper-evident artifact provenance',
      'Automated freshness monitoring flags evidence lapsing past the 90-day pre-audit window',
      'Live cloud configuration telemetry eliminates manual screenshot capture'
    ],
    metrics: [
      { label: 'Vault Integrity', value: 'SHA-256', detail: 'Tamper-evident cryptographic ledger' },
      { label: 'Freshness Threshold', value: '90 Days', detail: 'Continuous recertification SLA tracking' },
      { label: 'Auditor Pass Rate', value: '98.5%', detail: 'Sample testing acceptance rate by accredited registrars' }
    ],
    bulletPoints: [
      { header: 'Continuous Evidence Harvesting', text: 'Direct integrations ingest configuration logs, IAM roles, MFA enforcement, and vulnerability scans automatically.' },
      { header: 'External Auditor Dossier Mode', text: 'Provides external auditors with a secure, read-only dossier room containing cryptographically verified evidence packets and direct control mappings.' }
    ],
    speakerNotes: 'Auditors reject stale or unverified screenshots. Skanda calculates cryptographic SHA-256 hashes for every uploaded or harvested piece of evidence and enforces strict 90-day freshness windows, ensuring your audit dossier is always pristine.'
  },
  {
    slideNumber: 9,
    category: 'PREDICTIVE AUDIT INTELLIGENCE',
    title: 'Bayesian Compliance Projection & Recertification Forecasting',
    subtitle: 'Statistical Probability Modeling Calibrated Against Historical Accredited Audit Cycles',
    keyTakeaways: [
      'Deterministic Bayesian engine predicts exact probability of passing upcoming recertifications',
      'Accredited registrar qualification benchmark requiring zero blocking Major Non-Conformities',
      'Interactive "What-If" sensitivity simulator tests auditor rigor and evidence freshness deltas'
    ],
    metrics: [
      { label: 'Pass Likelihood', value: '96.8%', detail: 'Statistical forecast with 95% confidence interval' },
      { label: 'Major Non-Conformities', value: '< 0.05', detail: 'Zero blocking major findings expected' },
      { label: 'Historical Benchmarks', value: '4 Cycles', detail: 'Calibrated against 2024–2026 external audit history' }
    ],
    bulletPoints: [
      { header: 'Five Weighted Predictive Drivers', text: 'Evaluates Zero Major NCs & CAPA Velocity (25%), Controls Effectiveness (25%), Evidence Freshness (22%), Historical Reliability (18%), and Governance (10%).' },
      { header: 'Pre-Audit Scrutiny Watchlist', text: 'Identifies high-scrutiny controls (such as staging patch SLAs or AI model risk assessments) with estimated remediation timelines before auditors arrive.' }
    ],
    speakerNotes: 'Our newest breakthrough is the Bayesian Compliance Projection Engine. Instead of guessing whether you will pass your audit, Skanda uses your live telemetry, evidence freshness, and past audit track record to project your exact pass probability, confidence interval, and finding breakdown.'
  },
  {
    slideNumber: 10,
    category: 'ENTERPRISE ARCHITECTURE & SECURITY',
    title: 'Enterprise-Grade Security, RBAC & Multi-Tenant Isolation',
    subtitle: 'Zero-Trust Architecture Designed for Global Enterprises & Financial Institutions',
    keyTakeaways: [
      'Strict tenant data separation ensuring absolute isolation between enterprise subsidiaries',
      'Granular Role-Based Access Control (Super Admin, CISO, Auditor, Risk Lead, Stakeholder)',
      'Enterprise SSO, cryptographic session management, and immutable audit trails'
    ],
    metrics: [
      { label: 'Isolation Level', value: 'Zero-Trust', detail: 'Logical & cryptographic tenant separation' },
      { label: 'Built-in Roles', value: '6 Pre-Built', detail: 'RBAC with custom departmental permissions' },
      { label: 'Data Encryption', value: 'AES-256 / TLS 1.3', detail: 'End-to-end encryption at rest and in transit' }
    ],
    bulletPoints: [
      { header: 'Auditor & External Stakeholder Views', text: 'Auditor views provide read-only access to scoped evidence packets without exposing internal communications or unrelated tenant data.' },
      { header: 'Comprehensive Audit Log', text: 'Every action, approval, policy revision, and evidence upload is recorded in an immutable, searchable audit log.' }
    ],
    speakerNotes: 'Security is at the heart of Skanda. Our multi-tenant architecture enforces zero-trust data segregation. Whether you manage ten subsidiaries or present to an external registrar, our granular RBAC ensures users only see what they are authorized to access.'
  },
  {
    slideNumber: 11,
    category: 'BUSINESS VALUE & ROI',
    title: 'Tangible Business Value & Competitive Advantage',
    subtitle: 'Why Leading Enterprises Choose Skanda Over Legacy and Point Solutions',
    keyTakeaways: [
      '70% reduction in audit preparation overhead and internal engineering distraction',
      '68% reduction in duplicate control testing via Tri-Harmonization crosswalks',
      'Unlocks enterprise sales by satisfying Fortune 500 vendor security assessments instantly'
    ],
    metrics: [
      { label: 'Annual Cost Savings', value: '$350,000+', detail: 'Eliminated consultant fees & manual audit hours' },
      { label: 'Fast-Track Certification', value: '30 Days', detail: 'Accelerated time-to-market for enterprise deals' },
      { label: 'Customer Trust Boost', value: 'Instant', detail: 'Verified public-facing security posture' }
    ],
    bulletPoints: [
      { header: 'Sales Acceleration', text: 'Having continuous, verifiable ISO 27001, ISO 42001, and MAS TRM compliance shortens enterprise sales cycles from 9 months to weeks.' },
      { header: 'Guaranteed Audit Predictability', text: 'Eliminates unexpected audit failure penalties, conditional certifications, and costly remediation dry runs.' }
    ],
    speakerNotes: 'For leadership and clients, the business case is crystal clear. Skanda saves over $350,000 annually in external advisory fees, cuts internal engineering disruption by 70%, and turns security compliance from a cost center into a competitive sales weapon.'
  },
  {
    slideNumber: 12,
    category: 'NEXT STEPS & ROADMAP',
    title: 'Implementation Roadmap & Commercial Next Steps',
    subtitle: '30-Day Fast-Track Path to Accredited ISO 27001 & ISO 42001 Certification Readiness',
    keyTakeaways: [
      'Week 1: Automated Discovery, Cloud Integrations & Baseline Evidence Import',
      'Week 2: AI-SIA Impact Assessments, Risk Register & SoA Formalization',
      'Week 3: Evidence Vault Hashing, Policy Review & Pre-Audit Dry Run',
      'Week 4: External Auditor Dossier Generation & Formal Stage 1 Audit Sign-Off'
    ],
    metrics: [
      { label: 'Week 1', value: 'Discovery & Sync', detail: 'Cloud integrations & tenant onboarding' },
      { label: 'Week 2', value: 'Risk & SoA Lock', detail: 'Policies & AI impact assessments' },
      { label: 'Weeks 3-4', value: 'Dry Run & Audit', detail: 'Dossier packaging & registrar verification' }
    ],
    bulletPoints: [
      { header: 'Ready for Immediate Deployment', text: 'Skanda is fully operational and ready for your enterprise environment today.' },
      { header: 'Contact & Executive Access', text: 'Schedule a tailored enterprise pilot or request access to the live External Auditor Dossier Room.' }
    ],
    speakerNotes: 'Our 30-day implementation roadmap ensures rapid time-to-value. We invite you to test Skanda in your own environment, experience the power of autonomous GRC, and accelerate your certification journey. Thank you, and I welcome your questions.'
  }
];

export class PresentationDeckGenerator {
  /**
   * Generates and downloads a modern 16:9 PowerPoint (.pptx) presentation deck
   */
  public static async generatePowerPointDeck(metadata: PresentationMetadata): Promise<void> {
    const pptx = new PptxGenJS();

    // Set Presentation Properties
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = metadata.leadPresenter;
    pptx.company = metadata.organizationName;
    pptx.title = 'Skanda 5 High-Level GRC Platform - Executive Presentation';
    pptx.subject = 'Autonomous Multi-Framework Governance, Risk & Continuous Compliance Architecture';

    // Global Theme Colors
    const NAVY_BG = '0F172A'; // slate-900
    const DARK_CARD = '1E293B'; // slate-800
    const INDIGO_ACCENT = '6366F1'; // indigo-500
    const SKY_BLUE = '38BDF8'; // sky-400
    const TEXT_WHITE = 'FFFFFF';
    const TEXT_MUTED = '94A3B8'; // slate-400
    const EMERALD = '10B981'; // emerald-500

    PRESENTATION_SLIDES.forEach(slideData => {
      const slide = pptx.addSlide();
      slide.background = { color: NAVY_BG };

      // Top Accent Line
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 0.08,
        fill: { color: INDIGO_ACCENT }
      });

      // Category / Eyebrow Pill
      slide.addText(slideData.category, {
        x: 0.8,
        y: 0.4,
        w: 4.0,
        h: 0.35,
        fontSize: 10,
        bold: true,
        color: SKY_BLUE,
        fontFace: 'Arial',
        charSpacing: 2
      });

      // Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 0.75,
        w: 11.5,
        h: 0.65,
        fontSize: 22,
        bold: true,
        color: TEXT_WHITE,
        fontFace: 'Arial'
      });

      // Subtitle
      slide.addText(slideData.subtitle, {
        x: 0.8,
        y: 1.35,
        w: 11.5,
        h: 0.45,
        fontSize: 12,
        color: TEXT_MUTED,
        fontFace: 'Arial'
      });

      // Slide divider line
      slide.addShape(pptx.ShapeType.line, {
        x: 0.8,
        y: 1.85,
        w: 11.7,
        h: 0,
        line: { color: '334155', width: 1 }
      });

      // Left Column: Key Takeaways & Bullet Points (Width: 6.8")
      // Key Takeaways Header
      slide.addText('STRATEGIC EXECUTIVE TAKEAWAYS', {
        x: 0.8,
        y: 2.05,
        w: 6.8,
        h: 0.3,
        fontSize: 10,
        bold: true,
        color: SKY_BLUE,
        fontFace: 'Arial'
      });

      // Takeaways List
      const takeawayItems: PptxGenJS.TextProps[] = slideData.keyTakeaways.map(t => ({
        text: t,
        options: {
          bullet: { type: 'bullet', color: INDIGO_ACCENT },
          fontSize: 11,
          color: TEXT_WHITE,
          spaceAfter: 8
        }
      }));
      slide.addText(takeawayItems, {
        x: 0.8,
        y: 2.4,
        w: 6.8,
        h: 1.9,
        fontFace: 'Arial'
      });

      // Core Bullet Pillars
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8,
        y: 4.4,
        w: 6.8,
        h: 2.2,
        fill: { color: DARK_CARD },
        line: { color: '334155', width: 1 }
      });

      const pillarTexts: any[] = [];
      slideData.bulletPoints.forEach((bp, index) => {
        pillarTexts.push({
          text: bp.header + ': ',
          options: { bold: true, color: SKY_BLUE, fontSize: 10.5 }
        });
        pillarTexts.push({
          text: bp.text + (index < slideData.bulletPoints.length - 1 ? '\n\n' : ''),
          options: { bold: false, color: TEXT_WHITE, fontSize: 10.5 }
        });
      });

      slide.addText(pillarTexts, {
        x: 1.0,
        y: 4.55,
        w: 6.4,
        h: 1.9,
        fontFace: 'Arial'
      });

      // Right Column: Key KPI Stat Cards (Width: 4.5")
      slide.addText('VERIFIED IMPACT METRICS', {
        x: 8.0,
        y: 2.05,
        w: 4.5,
        h: 0.3,
        fontSize: 10,
        bold: true,
        color: EMERALD,
        fontFace: 'Arial'
      });

      // 3 Stat Cards
      slideData.metrics.forEach((metric, idx) => {
        const cardY = 2.4 + idx * 1.4;

        slide.addShape(pptx.ShapeType.rect, {
          x: 8.0,
          y: cardY,
          w: 4.5,
          h: 1.25,
          fill: { color: DARK_CARD },
          line: { color: '334155', width: 1 }
        });

        // Value
        slide.addText(metric.value, {
          x: 8.2,
          y: cardY + 0.12,
          w: 4.1,
          h: 0.45,
          fontSize: 20,
          bold: true,
          color: idx === 0 ? SKY_BLUE : idx === 1 ? EMERALD : INDIGO_ACCENT,
          fontFace: 'Arial'
        });

        // Label
        slide.addText(metric.label, {
          x: 8.2,
          y: cardY + 0.55,
          w: 4.1,
          h: 0.25,
          fontSize: 10,
          bold: true,
          color: TEXT_WHITE,
          fontFace: 'Arial'
        });

        // Detail
        slide.addText(metric.detail, {
          x: 8.2,
          y: cardY + 0.8,
          w: 4.1,
          h: 0.35,
          fontSize: 8.5,
          color: TEXT_MUTED,
          fontFace: 'Arial'
        });
      });

      // Footer bar
      slide.addShape(pptx.ShapeType.line, {
        x: 0.8,
        y: 6.85,
        w: 11.7,
        h: 0,
        line: { color: '1E293B', width: 1 }
      });

      slide.addText(`Skanda GRC • ${metadata.organizationName} • Presentation Deck | Slide ${slideData.slideNumber} of ${PRESENTATION_SLIDES.length}`, {
        x: 0.8,
        y: 6.95,
        w: 9.0,
        h: 0.3,
        fontSize: 8.5,
        color: TEXT_MUTED,
        fontFace: 'Arial'
      });

      slide.addText('CONFIDENTIAL • EXECUTIVE & CLIENT BRIEFING', {
        x: 9.5,
        y: 6.95,
        w: 3.0,
        h: 0.3,
        fontSize: 8.5,
        bold: true,
        align: 'right',
        color: INDIGO_ACCENT,
        fontFace: 'Arial'
      });

      // Speaker Notes
      slide.addNotes(
        `SPEAKER TALKING SCRIPT (Slide ${slideData.slideNumber}):\n${slideData.speakerNotes}\n\nTARGET AUDIENCE: ${metadata.audience}\nPRESENTED BY: ${metadata.leadPresenter}, ${metadata.presenterTitle}`
      );
    });

    // Save PPTX File
    const fileName = `Skanda_GRC_Executive_Presentation_${metadata.organizationName.replace(/\s+/g, '_')}.pptx`;
    await pptx.writeFile({ fileName });
  }

  /**
   * Generates and downloads a multi-page executive landscape PDF presentation deck
   */
  public static exportPdfPresentationDeck(metadata: PresentationMetadata): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    PRESENTATION_SLIDES.forEach((slide, index) => {
      if (index > 0) {
        doc.addPage('a4', 'landscape');
      }

      // Background
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Top Indigo Accent Bar
      doc.setFillColor(99, 102, 241); // indigo-500
      doc.rect(0, 0, pageWidth, 4, 'F');

      // Header Zone
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(56, 189, 248); // sky-400
      doc.text(slide.category.toUpperCase(), margin, 14);

      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(slide.title, margin, 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(slide.subtitle, margin, 28);

      // Divider line
      doc.setDrawColor(51, 65, 85); // slate-700
      doc.setLineWidth(0.5);
      doc.line(margin, 32, pageWidth - margin, 32);

      // Left Column: Key Takeaways & Pillars (Width: ~165mm)
      const leftColWidth = 165;
      let curY = 40;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(56, 189, 248);
      doc.text('EXECUTIVE HIGHLIGHTS & STRATEGIC TAKEAWAYS', margin, curY);
      curY += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(241, 245, 249); // slate-100

      slide.keyTakeaways.forEach(t => {
        doc.setFillColor(99, 102, 241);
        doc.circle(margin + 1.5, curY - 1, 1.2, 'F');
        const splitText = doc.splitTextToSize(t, leftColWidth - 8);
        doc.text(splitText, margin + 6, curY);
        curY += splitText.length * 5 + 3;
      });

      curY += 4;

      // Pillars Box
      doc.setFillColor(30, 41, 59); // slate-800
      doc.roundedRect(margin, curY, leftColWidth, 68, 3, 3, 'F');
      doc.setDrawColor(51, 65, 85);
      doc.roundedRect(margin, curY, leftColWidth, 68, 3, 3, 'S');

      let boxY = curY + 7;
      slide.bulletPoints.forEach(bp => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(56, 189, 248);
        doc.text(bp.header, margin + 5, boxY);
        boxY += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(226, 232, 240);
        const descLines = doc.splitTextToSize(bp.text, leftColWidth - 10);
        doc.text(descLines, margin + 5, boxY);
        boxY += descLines.length * 4.5 + 4;
      });

      // Right Column: Stat Metric Cards (Width: ~95mm)
      const rightColX = margin + leftColWidth + 8;
      const rightColWidth = pageWidth - margin - rightColX;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text('KEY VERIFIED METRICS', rightColX, 40);

      let cardY = 46;
      slide.metrics.forEach((metric, mIdx) => {
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(rightColX, cardY, rightColWidth, 34, 3, 3, 'F');
        doc.setDrawColor(51, 65, 85);
        doc.roundedRect(rightColX, cardY, rightColWidth, 34, 3, 3, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        if (mIdx === 0) doc.setTextColor(56, 189, 248);
        else if (mIdx === 1) doc.setTextColor(16, 185, 129);
        else doc.setTextColor(129, 140, 248);

        doc.text(metric.value, rightColX + 5, cardY + 10);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(metric.label, rightColX + 5, cardY + 18);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        const detLines = doc.splitTextToSize(metric.detail, rightColWidth - 10);
        doc.text(detLines, rightColX + 5, cardY + 24);

        cardY += 38;
      });

      // Speaker Notes Box at the bottom right
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(rightColX, cardY, rightColWidth, 26, 2, 2, 'F');
      doc.setDrawColor(79, 70, 229);
      doc.roundedRect(rightColX, cardY, rightColWidth, 26, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(129, 140, 248);
      doc.text('PRESENTER TALKING POINT', rightColX + 3, cardY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(203, 213, 225);
      const noteLines = doc.splitTextToSize(slide.speakerNotes, rightColWidth - 6);
      doc.text(noteLines.slice(0, 4), rightColX + 3, cardY + 10);

      // Footer
      doc.setDrawColor(30, 41, 59);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Skanda GRC Platform • ${metadata.organizationName} • Slide ${slide.slideNumber} of ${PRESENTATION_SLIDES.length}`, margin, pageHeight - 6);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text('STRICTLY CONFIDENTIAL • EXECUTIVE & CLIENT PRESENTATION', pageWidth - margin, pageHeight - 6, { align: 'right' });
    });

    const pdfFileName = `Skanda_GRC_Executive_Presentation_${metadata.organizationName.replace(/\s+/g, '_')}.pdf`;
    doc.save(pdfFileName);
  }
}
