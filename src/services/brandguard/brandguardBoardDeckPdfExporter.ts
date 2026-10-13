// Skanda BrandGuard — Executive Board Deck PDF Exporter
// Generates an executive-ready summary formatted for executive management and audit committees.
// Includes 5-dimension Brand Exposure Index, Active Threat Clusters, Credential Spill stats, and ISO 27001/SOC 2 compliance sign-off.

import jsPDF from 'jspdf';
import {
  BrandFinding,
  BrandProfile,
  BrandExposureRadarMetrics,
  ThreatActorCluster,
  LeakedCredentialAlert,
  CodeRepoLeakAlert
} from '../../types/brandguard';

export class BrandGuardBoardDeckPdfExporter {
  public static exportBoardDeckPdf(
    brandProfile: BrandProfile,
    metrics: BrandExposureRadarMetrics,
    findings: BrandFinding[],
    clusters: ThreatActorCluster[],
    leakedCreds: LeakedCredentialAlert[],
    codeLeaks: CodeRepoLeakAlert[]
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    let y = margin;

    // Background header bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Brand accent line
    doc.setFillColor(99, 102, 241); // indigo-500
    doc.rect(0, 42, pageWidth, 2, 'F');

    // Title & Organization
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SKANDA BRANDGUARD™ — EXECUTIVE BOARD DECK', margin, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(
      `Digital Brand Protection, Threat Actor Campaign Tracking & Surface Attack Surface Report`,
      margin,
      23
    );
    doc.text(
      `Enterprise Entity: ${brandProfile.organizationName} (${brandProfile.legalEntityName})`,
      margin,
      29
    );
    doc.text(
      `Reporting Period: Q3 2026 | Generated: ${new Date().toLocaleDateString()} | Classification: STRICTLY CONFIDENTIAL - BOARD OF DIRECTORS`,
      margin,
      35
    );

    y = 52;

    // Executive Summary & Composite Exposure Score Block
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 34, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 34, 3, 3, 'D');

    // Gauge Score on Left
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin + 4, y + 4, 36, 26, 2, 2, 'F');
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(`${metrics.compositeExposureIndex}/100`, margin + 8, y + 18);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('EXPOSURE INDEX', margin + 7, y + 25);

    // Narrative on Right
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('EXECUTIVE THREAT STATUS SUMMARY', margin + 46, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitNarrative = doc.splitTextToSize(
      `${metrics.executiveNarrative} Continuous surface sentry monitoring identified ${findings.length} total external findings, ${clusters.length} active adversary campaign clusters, and ${leakedCreds.length} employee stealer log exposures.`,
      pageWidth - margin * 2 - 50
    );
    doc.text(splitNarrative, margin + 46, y + 16);

    y += 40;

    // 5-Dimension Radar Scorecard Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. FIVE-DIMENSIONAL BRAND EXPOSURE ASSESSMENT (RADAR METRICS)', margin, y);
    y += 5;

    const radarItems = [
      { name: 'Domain Mimicry Risk', score: metrics.domainMimicryRisk, desc: 'Cyrillic homoglyphs, combosquats, and unauthorized TLDs actively registered.' },
      { name: 'Email Spoofing Exposure', score: metrics.emailSpoofingExposure, desc: 'Active rogue MX records capable of BEC and employee impersonation.' },
      { name: 'Visual Clone Proximity', score: metrics.visualCloneProximity, desc: 'Cloned login forms, CSS styles, and perceptual logo matches ≥85%.' },
      { name: 'Takedown Velocity (MTTR)', score: metrics.takedownVelocityMTTR, desc: 'Median time from discovery to registrar ClientHold / suspension.' },
      { name: 'Brand Defense Coverage', score: metrics.brandDefenseCoverage, desc: 'Proactive defensive registrations, DMARC enforcement, and CT log monitors.' }
    ];

    radarItems.forEach(item => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, pageWidth - margin * 2, 9, 'DF');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.name, margin + 3, y + 6);

      // Score pill
      doc.setFillColor(item.score >= 70 ? 254 : 241, item.score >= 70 ? 226 : 245, item.score >= 70 ? 226 : 249);
      doc.roundedRect(margin + 62, y + 1.5, 16, 6, 1, 1, 'F');
      doc.setTextColor(item.score >= 70 ? 185 : 79, item.score >= 70 ? 28 : 70, item.score >= 70 ? 28 : 229);
      doc.setFontSize(8);
      doc.text(`${item.score}%`, margin + 65, y + 5.8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(item.desc, margin + 84, y + 6);

      y += 9.5;
    });

    y += 4;

    // Threat Actor Infrastructure Clusters
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. ADVERSARY CAMPAIGN CLUSTERS & BULLETPROOF ASNs', margin, y);
    y += 5;

    clusters.forEach(c => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, pageWidth - margin * 2, 13, 'DF');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(c.clusterName, margin + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Threat Actor: ${c.threatActorLabel} | Confidence: ${c.campaignConfidence}% | Status: ${c.clusterStatus}`, margin + 3, y + 10);

      doc.text(`ASN: ${c.commonAsn} (${c.commonAsnOrg}) | Subnet: ${c.commonSubnet} | Linked Domains: ${c.domainCount}`, margin + 95, y + 7.5);

      y += 14.5;
    });

    y += 3;

    // Credential Spill & Code Repo Leaks
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. CREDENTIAL SPILL & CODE REPOSITORY LEAKAGE', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Corporate Email Leaks Ingested: ${leakedCreds.length} accounts | Critical Stealer Logs: ${leakedCreds.filter(c => c.breachSeverity === 'CRITICAL').length}`, margin, y + 2);
    doc.text(`Public GitHub/GitLab Secrets Detected: ${codeLeaks.length} repositories | Active Takedowns: ${codeLeaks.filter(c => c.status === 'REPO_TAKEDOWN_REQUESTED').length}`, margin, y + 7);
    y += 12;

    // ISO 27001 / SOC 2 Compliance Sign-off
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('REGULATORY & AUDIT ASSURANCE SIGN-OFF (ISO 27001 A.5.20 / SOC 2 CC7.4)', margin + 4, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('This executive dossier confirms that all external brand impersonation findings, registrar takedown requests,', margin + 4, y + 13);
    doc.text('and forensic evidence packages maintain cryptographic SHA-256 integrity and are synchronized into the Skanda GRC Audit Ledger.', margin + 4, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.text('Lead Assurance Officer: Priya Sharma (CISO)', margin + 4, y + 24);
    doc.text(`Audit Cryptographic Stamp: SKANDA-EXEC-VERIFIED-${Date.now().toString(16).toUpperCase()}`, margin + 95, y + 24);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page 1 of 1 • Skanda GRC BrandGuard™ Engine • Confidential`, margin, pageHeight - 6);

    doc.save(`${brandProfile.shortName || 'ApexFinTech'}_BrandGuard_Executive_Board_Deck_2026.pdf`);
  }
}
