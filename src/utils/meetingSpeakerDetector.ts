import {
  LiveTranscriptSegment,
  MeetingInterviewSession,
  DetectedSpeakerLabel,
  SpeakerAffiliation
} from '../types/meetingScheduler';

export interface MeetingSpeakerSummary {
  speakerId: string;
  speakerName: string;
  role: string;
  department?: string;
  affiliation: SpeakerAffiliation;
  badgeLabel: string;
  avatarColor: string;
  utteranceCount: number;
  wordCount: number;
  percentageShare: number; // e.g. 52%
  detectedVia: string;
}

export interface MeetingSpeakerDetectionResult {
  segmentsWithSpeakers: LiveTranscriptSegment[];
  detectedSpeakers: MeetingSpeakerSummary[];
  totalTurns: number;
  speakerSwitchCount: number;
  diarizationCoveragePercent: number; // e.g. 100%
}

/**
 * Known participant templates for fallback recognition
 */
const KNOWN_ROLE_KEYWORDS = {
  AUDITOR: [
    'clause', 'iso', 'annex', 'walkthrough', 'verify', 'inquire', 'confirm',
    'evidence', 'documentation', 'sampling', 'finding', 'non-conformity',
    'objective', 'confidentiality', 'shall we', 'could you explain', 'please show'
  ],
  AUDITEE: [
    'we deploy', 'our architecture', 'terraform', 'github', 'aws', 'vpc',
    'hashicorp', 'vault', 's3', 'postgres', 'aurora', 'pipeline', 'pr merge',
    'branch protection', 'sast', 'sla', 'incident', 'remediation', 'we ensure'
  ]
};

/**
 * Standardizes color palettes for detected speakers
 */
export function getSpeakerColorTheme(affiliation: SpeakerAffiliation, index: number = 0): {
  colorKey: string;
  borderClass: string;
  leftRailClass: string;
  badgeClass: string;
  avatarClass: string;
  tagClass: string;
  bgLightClass: string;
} {
  switch (affiliation) {
    case 'AUDIT_TEAM':
      return {
        colorKey: 'indigo',
        borderClass: 'border-indigo-500/60',
        leftRailClass: 'border-l-indigo-500',
        badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
        avatarClass: 'bg-indigo-900/90 text-indigo-200 border-indigo-600 ring-indigo-500/40',
        tagClass: 'text-indigo-400 bg-indigo-950/50 border-indigo-800/40',
        bgLightClass: 'bg-indigo-950/20'
      };
    case 'AUDITEE_STAKEHOLDER':
      return {
        colorKey: 'emerald',
        borderClass: 'border-emerald-500/60',
        leftRailClass: 'border-l-emerald-500',
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
        avatarClass: 'bg-emerald-900/90 text-emerald-200 border-emerald-600 ring-emerald-500/40',
        tagClass: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40',
        bgLightClass: 'bg-emerald-950/20'
      };
    case 'TECHNICAL_SME':
      return {
        colorKey: 'sky',
        borderClass: 'border-sky-500/60',
        leftRailClass: 'border-l-sky-500',
        badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
        avatarClass: 'bg-sky-900/90 text-sky-200 border-sky-600 ring-sky-500/40',
        tagClass: 'text-sky-400 bg-sky-950/50 border-sky-800/40',
        bgLightClass: 'bg-sky-950/20'
      };
    case 'GOVERNANCE_OFFICER':
      return {
        colorKey: 'purple',
        borderClass: 'border-purple-500/60',
        leftRailClass: 'border-l-purple-500',
        badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
        avatarClass: 'bg-purple-900/90 text-purple-200 border-purple-600 ring-purple-500/40',
        tagClass: 'text-purple-400 bg-purple-950/50 border-purple-800/40',
        bgLightClass: 'bg-purple-950/20'
      };
    case 'OBSERVER':
    default:
      return {
        colorKey: 'amber',
        borderClass: 'border-amber-500/60',
        leftRailClass: 'border-l-amber-500',
        badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
        avatarClass: 'bg-amber-900/90 text-amber-200 border-amber-600 ring-amber-500/40',
        tagClass: 'text-amber-400 bg-amber-950/50 border-amber-800/40',
        bgLightClass: 'bg-amber-950/20'
      };
  }
}

/**
 * Automatically inspects segments and session participants,
 * extracting and assigning structured speaker labels to every segment.
 */
export function detectAndAssignSpeakerLabels(
  segments: LiveTranscriptSegment[],
  session: MeetingInterviewSession,
  overrides?: Record<string, Partial<DetectedSpeakerLabel>>
): MeetingSpeakerDetectionResult {
  const interviewerName = session.interviewer?.name || 'Alexander Ward';
  const interviewerRole = session.interviewer?.role || 'Lead ISO 27001 Auditor';
  const stakeholderName = session.stakeholder?.name || 'Michael Chen';
  const stakeholderRole = session.stakeholder?.title || session.stakeholderRole || 'DevSecOps Lead';

  let prevSpeakerName = '';
  let turnCounter = 0;
  let speakerSwitchCount = 0;

  const speakerStatsMap: Record<
    string,
    {
      label: DetectedSpeakerLabel;
      utteranceCount: number;
      wordCount: number;
    }
  > = {};

  const processedSegments: LiveTranscriptSegment[] = segments.map((seg, idx) => {
    let cleanText = seg.text;
    let detectedName = seg.speaker || '';
    let detectedRole = seg.speakerRole || '';
    let affiliation: SpeakerAffiliation = 'AUDITEE_STAKEHOLDER';
    let confidence = 0.95;
    let detectedVia: DetectedSpeakerLabel['detectedVia'] = 'SESSION_METADATA';
    let detectedReason = 'Correlated from meeting schedule registry';

    // 1. Check for leading text prefix e.g. "Alexander Ward: ..." or "[Michael Chen]: ..."
    const prefixMatch = cleanText.match(/^\[?([A-Za-z\s.-]+)\]?:\s*(.+)$/s);
    if (prefixMatch) {
      const candidateName = prefixMatch[1].trim();
      const afterPrefixText = prefixMatch[2].trim();

      if (candidateName.length >= 2 && candidateName.length <= 40) {
        cleanText = afterPrefixText;
        detectedVia = 'PREFIX_PARSING';
        detectedReason = `Extracted from dialogue prefix tag "${candidateName}:"`;

        // Match against known participants
        if (
          candidateName.toLowerCase().includes('auditor') ||
          candidateName.toLowerCase().includes(interviewerName.toLowerCase().split(' ')[0]) ||
          candidateName.toLowerCase() === interviewerName.toLowerCase()
        ) {
          detectedName = interviewerName;
          detectedRole = interviewerRole;
          affiliation = 'AUDIT_TEAM';
          confidence = 0.99;
        } else if (
          candidateName.toLowerCase().includes('auditee') ||
          candidateName.toLowerCase().includes(stakeholderName.toLowerCase().split(' ')[0]) ||
          candidateName.toLowerCase() === stakeholderName.toLowerCase()
        ) {
          detectedName = stakeholderName;
          detectedRole = stakeholderRole;
          affiliation = 'AUDITEE_STAKEHOLDER';
          confidence = 0.99;
        } else {
          detectedName = candidateName;
          detectedRole = 'Technical Specialist';
          affiliation = 'TECHNICAL_SME';
          confidence = 0.92;
        }
      }
    }

    // 2. If no prefix, check existing segment metadata
    if (detectedVia !== 'PREFIX_PARSING') {
      const lowerSpeaker = detectedName.toLowerCase();
      const lowerInterviewer = interviewerName.toLowerCase();
      const lowerStakeholder = stakeholderName.toLowerCase();

      if (
        lowerSpeaker === lowerInterviewer ||
        lowerSpeaker.includes('auditor') ||
        seg.speakerRole?.toLowerCase().includes('auditor') ||
        seg.speakerRole?.toLowerCase().includes('interviewer')
      ) {
        detectedName = interviewerName;
        detectedRole = interviewerRole;
        affiliation = 'AUDIT_TEAM';
        confidence = 0.98;
        detectedReason = 'Matched with assigned Lead Auditor in session metadata';
      } else if (
        lowerSpeaker === lowerStakeholder ||
        lowerSpeaker.includes('auditee') ||
        lowerSpeaker.includes('stakeholder') ||
        seg.speakerRole?.toLowerCase().includes('auditee')
      ) {
        detectedName = stakeholderName;
        detectedRole = stakeholderRole;
        affiliation = 'AUDITEE_STAKEHOLDER';
        confidence = 0.98;
        detectedReason = 'Matched with designated Auditee in session metadata';
      } else {
        // Fallback: heuristic linguistic analysis
        const lowerText = cleanText.toLowerCase();
        let auditorPoints = 0;
        let auditeePoints = 0;

        KNOWN_ROLE_KEYWORDS.AUDITOR.forEach(kw => {
          if (lowerText.includes(kw)) auditorPoints++;
        });
        KNOWN_ROLE_KEYWORDS.AUDITEE.forEach(kw => {
          if (lowerText.includes(kw)) auditeePoints++;
        });

        if (auditorPoints > auditeePoints) {
          detectedName = interviewerName;
          detectedRole = interviewerRole;
          affiliation = 'AUDIT_TEAM';
          confidence = 0.88;
          detectedVia = 'AUTO_DIARIZATION';
          detectedReason = 'Linguistic inquiry markers align with Lead Auditor questioning pattern';
        } else {
          detectedName = stakeholderName;
          detectedRole = stakeholderRole;
          affiliation = 'AUDITEE_STAKEHOLDER';
          confidence = 0.88;
          detectedVia = 'AUTO_DIARIZATION';
          detectedReason = 'Operational architecture response pattern aligns with Auditee role';
        }
      }
    }

    // Check for user-specified manual overrides
    if (overrides && overrides[seg.id]) {
      const ov = overrides[seg.id];
      if (ov.speakerName) detectedName = ov.speakerName;
      if (ov.role) detectedRole = ov.role;
      if (ov.affiliation) affiliation = ov.affiliation;
      detectedVia = 'AUDITOR_OVERRIDE';
      detectedReason = 'Manually confirmed and assigned by Lead Auditor';
      confidence = 1.0;
    }

    // Determine speaker turn switch
    const isSpeakerSwitch = idx === 0 || detectedName !== prevSpeakerName;
    if (isSpeakerSwitch) {
      turnCounter++;
      if (idx > 0) speakerSwitchCount++;
    }
    prevSpeakerName = detectedName;

    // Build badge label
    const badgeLabel =
      affiliation === 'AUDIT_TEAM'
        ? 'Lead Auditor'
        : affiliation === 'AUDITEE_STAKEHOLDER'
        ? `Auditee (${detectedRole})`
        : affiliation === 'TECHNICAL_SME'
        ? 'Technical SME'
        : affiliation === 'GOVERNANCE_OFFICER'
        ? 'Governance Lead'
        : 'Meeting Observer';

    const speakerId =
      affiliation === 'AUDIT_TEAM'
        ? 'spk_auditor'
        : affiliation === 'AUDITEE_STAKEHOLDER'
        ? 'spk_auditee'
        : `spk_${detectedName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const avatarColor =
      affiliation === 'AUDIT_TEAM'
        ? 'indigo'
        : affiliation === 'AUDITEE_STAKEHOLDER'
        ? 'emerald'
        : affiliation === 'TECHNICAL_SME'
        ? 'sky'
        : affiliation === 'GOVERNANCE_OFFICER'
        ? 'purple'
        : 'amber';

    const speakerLabel: DetectedSpeakerLabel = {
      speakerId,
      speakerName: detectedName,
      role: detectedRole,
      department:
        affiliation === 'AUDIT_TEAM'
          ? 'GRC Assurance Directorate'
          : session.department || 'Cloud Engineering',
      affiliation,
      badgeLabel,
      avatarColor,
      confidence,
      detectedVia,
      detectedReason,
      turnNumber: turnCounter,
      isSpeakerSwitch
    };

    // Track statistics
    const wordCount = cleanText.trim().split(/\s+/).length;
    if (!speakerStatsMap[speakerId]) {
      speakerStatsMap[speakerId] = {
        label: speakerLabel,
        utteranceCount: 0,
        wordCount: 0
      };
    }
    speakerStatsMap[speakerId].utteranceCount += 1;
    speakerStatsMap[speakerId].wordCount += wordCount;

    return {
      ...seg,
      text: cleanText,
      speaker: detectedName,
      speakerRole: detectedRole,
      speakerLabel
    };
  });

  const totalWords = Object.values(speakerStatsMap).reduce((acc, s) => acc + s.wordCount, 0);

  const detectedSpeakers: MeetingSpeakerSummary[] = Object.values(speakerStatsMap).map(s => ({
    speakerId: s.label.speakerId,
    speakerName: s.label.speakerName,
    role: s.label.role,
    department: s.label.department,
    affiliation: s.label.affiliation,
    badgeLabel: s.label.badgeLabel,
    avatarColor: s.label.avatarColor,
    utteranceCount: s.utteranceCount,
    wordCount: s.wordCount,
    percentageShare: totalWords > 0 ? Math.round((s.wordCount / totalWords) * 100) : 50,
    detectedVia: s.label.detectedVia
  }));

  // Sort by utterance count descending
  detectedSpeakers.sort((a, b) => b.utteranceCount - a.utteranceCount);

  return {
    segmentsWithSpeakers: processedSegments,
    detectedSpeakers,
    totalTurns: turnCounter,
    speakerSwitchCount,
    diarizationCoveragePercent: 100
  };
}

/**
 * Parses inline text input for speaker prefixes (e.g. "Alexander: ..." or "[Michael]: ...")
 */
export function parseInlineSpeakerFromText(
  inputText: string,
  currentDefaultSpeaker: 'auditor' | 'auditee',
  session: MeetingInterviewSession
): {
  parsedSpeakerName: string;
  parsedSpeakerRole: string;
  cleanText: string;
  detectedAffiliation: SpeakerAffiliation;
} {
  const trimmed = inputText.trim();
  const match = trimmed.match(/^\[?([A-Za-z\s.-]+)\]?:\s*(.+)$/s);

  if (match) {
    const rawName = match[1].trim();
    const cleanText = match[2].trim();
    const lowerName = rawName.toLowerCase();

    if (
      lowerName.includes('auditor') ||
      lowerName.includes('alexander') ||
      lowerName === session.interviewer.name.toLowerCase()
    ) {
      return {
        parsedSpeakerName: session.interviewer.name,
        parsedSpeakerRole: session.interviewer.role,
        cleanText,
        detectedAffiliation: 'AUDIT_TEAM'
      };
    } else if (
      lowerName.includes('auditee') ||
      lowerName.includes('michael') ||
      lowerName === session.stakeholder.name.toLowerCase()
    ) {
      return {
        parsedSpeakerName: session.stakeholder.name,
        parsedSpeakerRole: session.stakeholder.title || 'DevSecOps Lead',
        cleanText,
        detectedAffiliation: 'AUDITEE_STAKEHOLDER'
      };
    } else {
      return {
        parsedSpeakerName: rawName,
        parsedSpeakerRole: 'Participant',
        cleanText,
        detectedAffiliation: 'TECHNICAL_SME'
      };
    }
  }

  // Fallback to active selector
  if (currentDefaultSpeaker === 'auditor') {
    return {
      parsedSpeakerName: session.interviewer.name,
      parsedSpeakerRole: session.interviewer.role,
      cleanText: trimmed,
      detectedAffiliation: 'AUDIT_TEAM'
    };
  }

  return {
    parsedSpeakerName: session.stakeholder.name,
    parsedSpeakerRole: session.stakeholder.title || 'DevSecOps Lead',
    cleanText: trimmed,
    detectedAffiliation: 'AUDITEE_STAKEHOLDER'
  };
}
