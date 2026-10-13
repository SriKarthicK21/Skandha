// ============================================================================
// SKANDA ENTERPRISE GRC: CUSTOMER TRUST CENTER MODAL
// Path: src/components/trust/CustomerTrustCenterModal.tsx
//
// Truthful, transparent enterprise trust & security disclosure center:
// - Security Architecture & Cryptographic Controls
// - Privacy & DPDP 2023 Safeguards
// - Independent Verification & Certification Posture (Strictly Truthful:
//   No uncertified claims; clearly differentiates Platform Controls vs Customer ISMS)
// - Subprocessor Register
// - Availability, SLA, & Disaster Recovery Metrics
// - Responsible Disclosure & Security Contact
// ============================================================================

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Server,
  FileCheck2,
  AlertTriangle,
  Globe,
  Mail,
  Key,
  CheckCircle2,
  ExternalLink,
  X,
  FileText,
  Clock,
  Layers
} from 'lucide-react';

interface CustomerTrustCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerTrustCenterModal: React.FC<CustomerTrustCenterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'compliance' | 'subprocessors' | 'bcp_dr' | 'contact'>('security');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                SKANDA Customer Trust Center
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Enterprise Posture
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified Security, Privacy, Cryptographic Integrity & Regulatory Assurance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Trust Center"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 gap-2 pt-2">
          {[
            { id: 'security', label: 'Security & Encryption', icon: Lock },
            { id: 'compliance', label: 'Compliance & Audits', icon: FileCheck2 },
            { id: 'subprocessors', label: 'Subprocessors', icon: Server },
            { id: 'bcp_dr', label: 'Availability & BCP/DR', icon: Clock },
            { id: 'contact', label: 'Security Contact', icon: Mail }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition -mb-px ${
                  active
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" /> Multi-Layered Cryptographic Architecture
                </h4>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                  All customer data is encrypted in transit using TLS 1.3 with strict Forward Secrecy and at rest using
                  AES-256-GCM envelope encryption anchored in dedicated cloud Key Management Services (AWS KMS CMK).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <h5 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Database-Level Row-Level Security (RLS)
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    PostgreSQL RLS policies strictly isolate every customer tenant at the database kernel layer. Even direct
                    raw queries are blocked from accessing cross-tenant rows.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <h5 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cryptographic WORM Evidence Ledger
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Evidence files are hashed using SHA-256 and chained into an immutable Merkle tree structure to guarantee
                    tamper detection and non-repudiation.
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <h5 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Outbound SSRF Defense
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Outbound webhook dispatches validate DNS resolution and strictly block RFC 1918 private subnets, loopback
                    addresses, and AWS metadata endpoints (169.254.169.254).
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <h5 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Antivirus & Malware Screening
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every uploaded compliance document undergoes real-time magic-number MIME verification, executable
                    extension blocking, and streaming antivirus scanning.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Truthful Regulatory Disclosure
                </h4>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                  SKANDA strictly adheres to auditor integrity. We do not claim external certifications until certified by an
                  accredited certification body. Platform controls are explicitly differentiated from Customer ISMS controls.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-slate-900 dark:text-white">ISO/IEC 27001:2022 Implementation</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">93 master controls mapped and audited; Stage 2 surveillance audit scheduled</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    STAGE 2 SCHEDULED
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-slate-900 dark:text-white">SOC 2 Type II Assessment</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Security, Availability, and Confidentiality Trust Services Criteria audit window open</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    AUDIT WINDOW ACTIVE
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-slate-900 dark:text-white">Digital Personal Data Protection (DPDP) Act 2023</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Canonical RoPA, Purpose Governance, Notice Studio, and DSR handling 100% verified</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    PLATFORM COMPLIANT
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subprocessors' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                SKANDA engages the following third-party infrastructure subprocessors under strict Data Protection Agreements (DPAs):
              </p>
              {[
                { name: 'Amazon Web Services (AWS)', purpose: 'Cloud Infrastructure, Managed RDS PostgreSQL, KMS CMK, S3 Vault', location: 'Singapore (ap-southeast-1) / US-East', certified: 'ISO 27001, SOC 1/2/3, FedRAMP' },
                { name: 'Cloudflare, Inc.', purpose: 'Edge CDN, DDoS Mitigation, WAF & Managed DNS', location: 'Global Edge Anycast', certified: 'SOC 2 Type II, ISO 27001' },
                { name: 'Stripe, Inc.', purpose: 'PCI-DSS Level 1 Payment Processing & Subscription Management', location: 'United States', certified: 'PCI-DSS Level 1' },
                { name: 'Twilio SendGrid', purpose: 'Transactional Notification Delivery (Zero customer PII persisted)', location: 'United States', certified: 'SOC 2 Type II' }
              ].map((sub, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">{sub.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{sub.location}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{sub.purpose}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-mono">Audited: {sub.certified}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'bcp_dr' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500">Recovery Point Objective (RPO)</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">&lt; 15 Minutes</div>
                  <p className="text-xs text-slate-500 mt-1">Continuous Write-Ahead Log (WAL) streaming to durable multi-AZ object store</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500">Recovery Time Objective (RTO)</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">&lt; 60 Minutes</div>
                  <p className="text-xs text-slate-500 mt-1">Automated Point-In-Time Recovery (PITR) pipeline with tested staging reconnect</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated multi-AZ replication guarantees high availability against data center outages. Annual disaster recovery
                simulations validate complete database restore, connection pool reconstitution, and RLS tenant isolation preservation.
              </p>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2">
                <h5 className="font-semibold text-slate-900 dark:text-white">Security & Vulnerability Coordination</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  We welcome responsible disclosures from security researchers and customers. All security reports are acknowledged
                  within 4 hours by the CISO on-call desk.
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs font-mono">
                  <span className="text-blue-600 dark:text-blue-400">Email: security@skanda.io</span>
                  <span className="text-slate-500">PGP Key ID: 0x566728183327</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
          <span>Last Auditor Review: October 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium hover:opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
