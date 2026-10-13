import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  FolderCheck,
  UserCheck,
  Zap,
  Filter,
  Search
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export interface BusinessGapQuestion {
  id: string;
  category: string;
  plainQuestion: string;
  contextWhy: string;
  answer?: 'YES' | 'PARTIALLY' | 'NO' | 'NOT_APPLICABLE';
  mappedControl: string;
  frameworks: string[];
  gapIfNo: string;
  riskIfNo: string;
  requiredEvidence: string;
  remediationAction: string;
  defaultOwner: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

const DEFAULT_QUESTIONS: BusinessGapQuestion[] = [
  {
    id: 'q-1',
    category: 'Access & Authentication',
    plainQuestion: 'Does your organization formally control who can access business systems and databases?',
    contextWhy: 'Controls access permissions based on business need-to-know to prevent unauthorized access and data exfiltration.',
    answer: 'PARTIALLY',
    mappedControl: 'A.5.15 Access Control & A.5.18 Access Rights',
    frameworks: ['ISO 27001:2022', 'SOC 2 CC6.1', 'MAS TRM 8.1', 'DPDP Sec 8'],
    gapIfNo: 'Absence of formalized, documented access control procedure and discretionary permission granting.',
    riskIfNo: 'High risk of privilege creep, insider threat data exfiltration, and unauthorized data modification.',
    requiredEvidence: 'Access Control Policy (POL-01), User Access Review sign-offs, and RBAC matrix export.',
    remediationAction: 'Draft and enforce Role-Based Access Control (RBAC) policy and automate quarterly access reviews.',
    defaultOwner: 'Head of IT / Infrastructure',
    priority: 'CRITICAL'
  },
  {
    id: 'q-2',
    category: 'Multi-Factor Authentication',
    plainQuestion: 'Is Multi-Factor Authentication (MFA) strictly required for all employees accessing corporate systems, email, and cloud environments?',
    contextWhy: 'Eliminates 99% of automated credential stuffing and phishing attacks across corporate identities.',
    answer: 'YES',
    mappedControl: 'A.8.5 Secure Authentication & Notice 655 Cl. 4',
    frameworks: ['ISO 27001:2022', 'MAS Notice 655', 'PCI DSS 8.3', 'SOC 2 CC6.1'],
    gapIfNo: 'Single-factor authentication allows compromised passwords to breach corporate boundaries.',
    riskIfNo: 'High risk of credential theft, business email compromise (BEC), and ransomware deployment.',
    requiredEvidence: 'IdP (Okta/Google Workspace/Entra ID) MFA enforcement policy screenshot and compliance report.',
    remediationAction: 'Enforce conditional access MFA policy across all user tiers without exception.',
    defaultOwner: 'DevOps / SecOps Lead',
    priority: 'CRITICAL'
  },
  {
    id: 'q-3',
    category: 'Quarterly Access Reviews',
    plainQuestion: 'Do managers review user access rights at least once every 90 days and revoke access for departed employees immediately?',
    contextWhy: 'Prevents orphaned accounts and ghost permissions from lingering after role changes or terminations.',
    answer: 'NO',
    mappedControl: 'A.5.18 Access Rights & SOC 2 CC6.2',
    frameworks: ['ISO 27001:2022', 'SOC 2 CC6.2', 'MAS TRM 8.2'],
    gapIfNo: 'No formal quarterly access review cadence or offboarding checklist sign-off.',
    riskIfNo: 'Critical risk of former employees maintaining production and financial system access.',
    requiredEvidence: 'Quarterly access review tickets, HR offboarding checklist, and revoked account logs.',
    remediationAction: 'Schedule recurring 90-day access review calendar and integrate HRIS webhook with IdP.',
    defaultOwner: 'Chief Information Security Officer (CISO)',
    priority: 'CRITICAL'
  },
  {
    id: 'q-4',
    category: 'Data Protection & Encryption',
    plainQuestion: 'Is sensitive customer data encrypted both when stored on servers and when traveling over public networks?',
    contextWhy: 'Protects personal data from eavesdropping and renders stolen storage volumes unreadable.',
    answer: 'PARTIALLY',
    mappedControl: 'A.8.24 Use of Cryptography & DPDPA Sec 8',
    frameworks: ['ISO 27001:2022', 'DPDPA 2023', 'PCI DSS 3.4', 'MAS TRM 11.1'],
    gapIfNo: 'Staging databases and internal microservice communication utilize unencrypted HTTP or plaintext storage.',
    riskIfNo: 'Severe regulatory penalties under DPDPA/GDPR and data breach liabilities.',
    requiredEvidence: 'Database encryption configuration, TLS 1.3 certificates, and Key Management (KMS) policy.',
    remediationAction: 'Enable AWS KMS / Cloud SQL AES-256 volume encryption and enforce strict TLS 1.3 in transit.',
    defaultOwner: 'Lead Cloud Architect',
    priority: 'HIGH'
  },
  {
    id: 'q-5',
    category: 'Backups & Disaster Recovery',
    plainQuestion: 'Are critical systems backed up regularly and tested periodically to ensure they can be restored in a disaster?',
    contextWhy: 'Ensures business continuity and resilience against catastrophic outages or ransomware attacks.',
    answer: 'YES',
    mappedControl: 'A.8.13 Information Backup & MAS Notice 644',
    frameworks: ['ISO 27001:2022', 'MAS TRM 12.1', 'ISO 22301', 'SOC 2 CC7.5'],
    gapIfNo: 'Untested backups may fail during actual recovery, leading to total data loss.',
    riskIfNo: 'Business cessation, catastrophic downtime exceeding MAS 4-hour RTO statutory mandate.',
    requiredEvidence: 'Immutable backup schedule, quarterly restore test report, and Business Continuity Plan (BCP).',
    remediationAction: 'Conduct formal automated backup restoration test on production staging snapshot.',
    defaultOwner: 'Site Reliability Engineering (SRE)',
    priority: 'HIGH'
  },
  {
    id: 'q-6',
    category: 'Third-Party & Vendor Risk',
    plainQuestion: 'Do you evaluate the security posture of third-party vendors and cloud providers before sharing data with them?',
    contextWhy: 'Supply chain vulnerabilities are the leading vector for modern corporate data breaches.',
    answer: 'NO',
    mappedControl: 'A.5.19 Supplier Relationships & MAS Notice 658',
    frameworks: ['ISO 27001:2022', 'MAS TRM 6.1', 'SOC 2 CC9.2'],
    gapIfNo: 'Vendors onboarded without standard security review questionnaires or SOC 2 verifications.',
    riskIfNo: 'Supply chain data exfiltration, unvetted sub-processor non-compliance with data privacy laws.',
    requiredEvidence: 'Vendor Risk Assessment Matrix, signed Data Processing Agreements (DPA), and vendor SOC 2 reports.',
    remediationAction: 'Deploy Skanda Vendor Risk Assessment workflow and collect certifications for top 5 critical vendors.',
    defaultOwner: 'Procurement & Legal Lead',
    priority: 'HIGH'
  },
  {
    id: 'q-7',
    category: 'Vulnerability Management',
    plainQuestion: 'Do you perform regular automated vulnerability scanning and timely patching of security flaws?',
    contextWhy: 'Prevents exploitation of known software CVEs before threat actors can target public endpoints.',
    answer: 'PARTIALLY',
    mappedControl: 'A.8.8 Management of Technical Vulnerabilities',
    frameworks: ['ISO 27001:2022', 'CIS Controls 7', 'MAS TRM 10.3', 'PCI DSS 11.2'],
    gapIfNo: 'Vulnerability scans executed ad-hoc without formal SLA for applying critical patches.',
    riskIfNo: 'Exploitation of zero-day or known unpatched vulnerabilities resulting in system compromise.',
    requiredEvidence: 'Monthly vulnerability scan executive reports, patching SLA logs, and annual penetration test.',
    remediationAction: 'Set up automated CI/CD dependency vulnerability alerts and enforce 14-day patching SLA for Critical CVEs.',
    defaultOwner: 'Head of Cyber Security',
    priority: 'HIGH'
  },
  {
    id: 'q-8',
    category: 'Employee Security Awareness',
    plainQuestion: 'Do all employees receive security awareness and anti-phishing training upon hire and at least annually?',
    contextWhy: 'Educates personnel to identify social engineering, phishing, and physical security threats.',
    answer: 'YES',
    mappedControl: 'A.6.3 Information Security Awareness, Education & Training',
    frameworks: ['ISO 27001:2022', 'SOC 2 CC2.2', 'MAS TRM 4.2'],
    gapIfNo: 'Employees lack training on phishing identification, clean desk rules, and incident reporting.',
    riskIfNo: 'Susceptibility to spear-phishing, credential disclosure, and accidental data sharing.',
    requiredEvidence: 'LMS completion logs, annual training slides, and simulated phishing test statistics.',
    remediationAction: 'Schedule bi-annual simulated phishing campaign and track employee completion in Skanda.',
    defaultOwner: 'HR & People Operations',
    priority: 'MEDIUM'
  }
];

export const SmartBusinessGapAssessment: React.FC = () => {
  const { theme, setActiveModule } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const [questions, setQuestions] = useState<BusinessGapQuestion[]>(DEFAULT_QUESTIONS);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['ALL', ...Array.from(new Set(questions.map(q => q.category)))];

  const handleAnswerChange = (questionId: string, answer: BusinessGapQuestion['answer']) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, answer } : q))
    );
    showToast({
      title: 'Assessment Updated',
      message: 'Control posture and gap analysis recalculated in real time.',
      type: 'info'
    });
  };

  const answeredCount = questions.filter(q => q.answer !== undefined).length;
  const compliantCount = questions.filter(q => q.answer === 'YES').length;
  const partialCount = questions.filter(q => q.answer === 'PARTIALLY').length;
  const gapCount = questions.filter(q => q.answer === 'NO').length;

  const scorePct = Math.round(
    ((compliantCount * 1.0 + partialCount * 0.5) / (questions.length || 1)) * 100
  );

  const filteredQuestions = questions.filter(q => {
    const matchesCat = filterCategory === 'ALL' || q.category === filterCategory;
    const matchesSearch =
      q.plainQuestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.mappedControl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.frameworks.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-2xl border ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-800'
            : 'bg-slate-900 border-slate-800 shadow-xl text-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Non-Expert Business Assessment
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Plain-English Questions → Auto-Mapped GRC Controls
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Smart Business Gap Assessment
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Answer simple operational questions about your business. Skanda automatically determines your compliance gaps, control requirements, risk severities, and remediation tasks across ISO 27001, SOC 2, and MAS TRM.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Calculated Maturity
              </div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {scorePct}%
              </div>
            </div>
            <div className="h-8 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="text-xs space-y-0.5 text-slate-600 dark:text-slate-300">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{compliantCount} Fully Met</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{partialCount} Partial Gaps</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{gapCount} Critical Gaps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions or controls..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isGap = q.answer === 'NO';
          const isPartial = q.answer === 'PARTIALLY';
          const isYes = q.answer === 'YES';

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                isLight
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-slate-900/90 border-slate-800 shadow-md'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      [{q.category}]
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        q.priority === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {q.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#0F172A] dark:text-white leading-snug">
                    {q.plainQuestion}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    💡 <strong>Consultant Context:</strong> {q.contextWhy}
                  </p>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                    <span>Mapped Controls: <strong className="text-slate-800 dark:text-slate-200">{q.mappedControl}</strong></span>
                    <span>•</span>
                    <span>Frameworks: {q.frameworks.join(', ')}</span>
                  </div>
                </div>

                {/* 4 Interactive Answer Choices (Yes / Partially / No / NA) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAnswerChange(q.id, 'YES')}
                    className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      isYes
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Yes (Fully Met)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnswerChange(q.id, 'PARTIALLY')}
                    className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      isPartial
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Partially Met</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnswerChange(q.id, 'NO')}
                    className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      isGap
                        ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>No (Gap)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnswerChange(q.id, 'NOT_APPLICABLE')}
                    className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      q.answer === 'NOT_APPLICABLE'
                        ? 'bg-slate-600 text-white border-slate-700 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>N/A</span>
                  </button>
                </div>
              </div>

              {/* Automatic Intelligent GRC Determination (Section 10 Output) */}
              {(isGap || isPartial) && (
                <div
                  className={`mt-4 p-4 rounded-xl border ${
                    isLight ? 'bg-rose-50/70 border-rose-200' : 'bg-rose-950/20 border-rose-900/40'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Skanda Automated Impact Analysis & Remediation</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Identified Gap</div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {q.gapIfNo}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Associated Risk</div>
                      <div className="font-medium text-rose-600 dark:text-rose-400 mt-0.5">
                        {q.riskIfNo}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Required Evidence</div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {q.requiredEvidence}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Remediation Action & Owner</div>
                      <div className="font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                        {q.remediationAction}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Owner: {q.defaultOwner}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      This will automatically generate a CAPA ticket and assign it to <strong>{q.defaultOwner}</strong>.
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveModule('findings_capa')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      <span>Create CAPA Ticket</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
