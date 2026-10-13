import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MeetingInterviewSession,
  TranscriptEntity,
  LiveTranscriptSegment,
  IdentifiedEntityType,
  MeetingSegmentAiSummary,
  SegmentSentimentPosture,
  SegmentSentimentAnalysis
} from '../../types/meetingScheduler';
import {
  DEFAULT_TRANSCRIPT_PACKS,
  extractEntitiesFromTranscriptText
} from '../../data/liveTranscriptData';
import { MeetingAudioPlaybackPlayer } from './MeetingAudioPlaybackPlayer';
import { MeetingSegmentSummaryModal } from './MeetingSegmentSummaryModal';
import { MeetingSentimentOverlayBar } from './MeetingSentimentOverlayBar';
import { MeetingSpeakerDiarizationBar } from './MeetingSpeakerDiarizationBar';
import { TranscriptSpeakerBadge } from './TranscriptSpeakerBadge';
import {
  analyzeSegmentSentiment,
  calculateMeetingSentimentMetrics,
  MeetingSentimentMetrics
} from '../../utils/meetingSentimentAnalyzer';
import {
  detectAndAssignSpeakerLabels,
  parseInlineSpeakerFromText,
  MeetingSpeakerDetectionResult
} from '../../utils/meetingSpeakerDetector';
import { AudioTranscriptionInput } from '../ai/AudioTranscriptionInput';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Copy,
  Download,
  ShieldAlert,
  Server,
  Cpu,
  FileText,
  Tag,
  Radio,
  Volume2,
  PanelRightClose,
  PanelRightOpen,
  ArrowUpRight,
  Database,
  Activity,
  Check,
  Zap,
  Info,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Users,
  ArrowRightLeft,
  UserCheck,
  FileDown
} from 'lucide-react';
import { exportMeetingReportPDF } from '../../utils/meetingReportPdfExporter';

interface LiveMeetingTranscriptViewProps {
  session: MeetingInterviewSession;
  onUpdateSession?: (updated: Partial<MeetingInterviewSession>) => void;
  onCloseLiveView?: () => void;
  isEmbeddedInModal?: boolean;
}

export const LiveMeetingTranscriptView: React.FC<LiveMeetingTranscriptViewProps> = ({
  session,
  onUpdateSession,
  onCloseLiveView,
  isEmbeddedInModal = false
}) => {
  // Load initial pack or fallback
  const pack = useMemo(() => {
    return DEFAULT_TRANSCRIPT_PACKS[session.id] || DEFAULT_TRANSCRIPT_PACKS.mtg_001;
  }, [session.id]);

  // Transcript segments and identified entities state
  const [segments, setSegments] = useState<LiveTranscriptSegment[]>(() => {
    return pack.initialSegments.map(s => ({ ...s }));
  });

  const [entities, setEntities] = useState<TranscriptEntity[]>(() => {
    return pack.initialEntities.map(e => ({ ...e }));
  });

  // Queued segments for live streaming
  const [queuedStreamIndex, setQueuedStreamIndex] = useState(0);

  // Recording & simulation states
  const [isRecording, setIsRecording] = useState(false);
  const [isAutoStreaming, setIsAutoStreaming] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(420); // 07:00 default
  const [activeSpeechInput, setActiveSpeechInput] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState<'auditor' | 'auditee'>('auditee');

  // Collapsible sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [entityFilter, setEntityFilter] = useState<'All' | IdentifiedEntityType>('All');
  const [entitySearch, setEntitySearch] = useState('');
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<string | null>(null);
  const [highlightedEntityId, setHighlightedEntityId] = useState<string | null>(null);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [transcriptSearch, setTranscriptSearch] = useState('');

  // HTML5 Audio Playback Player State
  const [currentPlayingSeconds, setCurrentPlayingSeconds] = useState<number>(15);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [autoScrollAudio, setAutoScrollAudio] = useState<boolean>(true);

  // AI Segment Summary State
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [segmentSummary, setSegmentSummary] = useState<MeetingSegmentAiSummary | null>(null);

  // Sentiment Analysis Overlay State
  const [isSentimentOverlayActive, setIsSentimentOverlayActive] = useState<boolean>(true);
  const [sentimentPostureFilter, setSentimentPostureFilter] = useState<SegmentSentimentPosture | 'ALL'>('ALL');
  const [isScanningSentimentAi, setIsScanningSentimentAi] = useState<boolean>(false);
  const [sentimentAiSource, setSentimentAiSource] = useState<string | undefined>(undefined);
  const [segmentSentimentsOverride, setSegmentSentimentsOverride] = useState<Record<string, SegmentSentimentAnalysis>>({});

  // Speaker Diarization & Detection State
  const [isSpeakerBarOpen, setIsSpeakerBarOpen] = useState<boolean>(true);
  const [isSpeakerBarExpanded, setIsSpeakerBarExpanded] = useState<boolean>(true);
  const [selectedSpeakerFilter, setSelectedSpeakerFilter] = useState<string>('ALL');
  const [speakerOverrides, setSpeakerOverrides] = useState<Record<string, any>>({});
  const [isDiarizingAi, setIsDiarizingAi] = useState<boolean>(false);
  const [diarizationSource, setDiarizationSource] = useState<string>('autonomous');

  // Deep AI Speaker Diarization across transcript segments
  const handleRunAiDiarization = async () => {
    if (segments.length === 0) {
      showToast('No transcript segments available for speaker diarization.');
      return;
    }

    setIsDiarizingAi(true);
    try {
      const response = await fetch('/api/v1/meetings/detect-speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session,
          segments: segments.map(s => ({
            id: s.id,
            speaker: s.speaker,
            speakerRole: s.speakerRole,
            timestamp: s.timestamp,
            text: s.text
          }))
        })
      });

      const data = await response.json();
      if (data.success && data.diarizedMap) {
        setSpeakerOverrides(prev => ({ ...prev, ...data.diarizedMap }));
        setDiarizationSource(data.source === 'gemini-ai' ? 'gemini-ai' : 'autonomous');
        showToast(
          `AI Speaker Diarization complete across ${Object.keys(data.diarizedMap).length} segments (${data.source || 'gemini-3.8-flash'})`
        );
      } else {
        showToast('Speaker diarization evaluated using autonomous audit engine.');
      }
    } catch (err: any) {
      console.error('Speaker diarization error:', err);
      showToast('AI Diarization unreachable; using autonomous audit rules.');
    } finally {
      setIsDiarizingAi(false);
    }
  };

  // Deep AI Sentiment Scan across transcript segments
  const handleRunAiSentimentScan = async () => {
    if (segments.length === 0) {
      showToast('No transcript segments available for sentiment scan.');
      return;
    }

    setIsScanningSentimentAi(true);
    try {
      const response = await fetch('/api/v1/meetings/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: session.isoProjectMapping.projectName || session.department,
          framework: session.primaryFramework,
          segments: segments.map(s => ({
            id: s.id,
            speaker: s.speaker,
            speakerRole: s.speakerRole,
            timestamp: s.timestamp,
            text: s.text
          }))
        })
      });

      const data = await response.json();
      if (data.success && data.segmentSentiments) {
        setSegmentSentimentsOverride(data.segmentSentiments);
        setSentimentAiSource(data.source || 'gemini-3.8-flash');
        showToast(`AI Sentiment Scan complete across ${Object.keys(data.segmentSentiments).length} utterances (${data.source || 'gemini-3.8-flash'})`);
      } else {
        showToast('Sentiment scan evaluated using local audit heuristics.');
      }
    } catch (err: any) {
      console.error('Sentiment AI scan error:', err);
      showToast('AI scan unreachable; using local audit compliance rules.');
    } finally {
      setIsScanningSentimentAi(false);
    }
  };

  // AI Meeting Segment Summary Generation Handler
  const handleGenerateSummary = async () => {
    if (segments.length === 0) {
      showToast('No transcript segments available to summarize.');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/v1/meetings/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingTitle: session.stakeholder.title || 'Audit & Interview Walkthrough',
          department: session.isoProjectMapping.projectName || 'Information Security',
          role: session.stakeholderRole || 'TECHNICAL_LEAD',
          framework: session.primaryFramework || 'ISO/IEC 27001:2022',
          segments: segments.map(s => ({
            speaker: s.speaker,
            speakerRole: s.speakerRole,
            timestamp: s.timestamp,
            text: s.text
          }))
        })
      });

      const data = await response.json();
      if (data.success && data.summary) {
        setSegmentSummary(data.summary);
        setIsSummaryModalOpen(true);
        showToast(`AI Summary generated successfully (${data.source || 'gemini-3.8-flash'})`);
      } else {
        showToast(data.error || 'Failed to generate summary.');
      }
    } catch (err: any) {
      console.error('Error generating summary:', err);
      showToast('Network error while generating AI summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Export Meeting Report to PDF for audit compliance
  const handleExportPdfMeetingReport = () => {
    if (segments.length === 0) {
      showToast('No transcript segments available to export.');
      return;
    }
    try {
      exportMeetingReportPDF({
        session,
        summary: segmentSummary,
        segments,
        entities,
        tenantName: 'SKANDA Enterprise Organization',
        leadAuditorName: session.interviewer?.name || 'Dr. Sarah Chen',
        leadAuditorRole: session.interviewer?.role || 'Lead ISO Auditor & GRC Evaluator',
        leadAuditorEmail: session.interviewer?.email || 'audit.lead@skanda-grc.internal'
      });
      showToast('Meeting Report PDF generated & downloaded for audit compliance.');
    } catch (err: any) {
      console.error('Failed to export PDF meeting report:', err);
      showToast('Error exporting PDF meeting report.');
    }
  };

  // Refs
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Compute active playing segment based on current audio playback position
  const activePlayingSegment = useMemo(() => {
    if (segments.length === 0) return null;
    const sorted = [...segments].sort((a, b) => a.seconds - b.seconds);
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (currentPlayingSeconds >= sorted[i].seconds) {
        return sorted[i];
      }
    }
    return sorted[0];
  }, [segments, currentPlayingSeconds]);

  // Jump and play handler when a user clicks on any transcript line
  const handleJumpAndPlaySegment = (segment: LiveTranscriptSegment) => {
    setCurrentPlayingSeconds(segment.seconds);
    setIsPlayingAudio(true);
    setHighlightedSegmentId(segment.id);
    showToast(`Playing audio from [${segment.timestamp}] • ${segment.speaker}`);

    const el = segmentRefs.current[segment.id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Synchronized auto-scroll as audio plays through segments
  useEffect(() => {
    if (autoScrollAudio && isPlayingAudio && activePlayingSegment) {
      const el = segmentRefs.current[activePlayingSegment.id];
      if (el && transcriptContainerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activePlayingSegment?.id, autoScrollAudio, isPlayingAudio]);

  // Global Keyboard listener for audio playback (Spacebar toggles play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlayingAudio(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Elapsed timer tick
  useEffect(() => {
    let interval: any = null;
    if (isRecording || isAutoStreaming) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isAutoStreaming]);

  // Auto-stream queued speech utterances
  useEffect(() => {
    let timer: any = null;
    if (isAutoStreaming) {
      timer = setInterval(() => {
        handleStreamNextUtterance();
      }, 5500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoStreaming, queuedStreamIndex, pack]);

  // Clear toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to stream next utterance from queue or generate
  const handleStreamNextUtterance = () => {
    const currentQueue = pack.queuedLiveStreamSegments;
    const item = currentQueue[queuedStreamIndex % currentQueue.length];
    setQueuedStreamIndex(prev => prev + 1);

    const newTimestamp = formatTime(elapsedSeconds);
    const newSegId = `seg_${session.id}_stream_${Date.now()}`;

    // Extract entities from queue item or heuristic
    const newExtractedEntities: TranscriptEntity[] = [];
    const newEntityIds: string[] = [];

    if (item.extractedEntities && item.extractedEntities.length > 0) {
      item.extractedEntities.forEach((ent, idx) => {
        const entId = `ent_${newSegId}_${idx}`;
        newEntityIds.push(entId);
        newExtractedEntities.push({
          id: entId,
          name: ent.name,
          type: ent.type,
          mentionCount: 1,
          firstMentionTimestamp: newTimestamp,
          segmentId: newSegId,
          contextSnippet: ent.contextSnippet || item.text.slice(0, 110) + '...',
          confidence: ent.confidence || 0.98,
          associatedControlOrClause: ent.associatedControlOrClause,
          riskSeverity: ent.riskSeverity,
          status: ent.type === 'Risk' ? 'Mapped to Risk Register' : ent.type === 'Asset' ? 'Mapped to Asset Inventory' : 'Extracted'
        });
      });
    } else {
      // Run heuristic fallback
      const heuristics = extractEntitiesFromTranscriptText(item.text, newSegId, newTimestamp);
      heuristics.forEach(h => {
        newEntityIds.push(h.id);
        newExtractedEntities.push(h);
      });
    }

    const newSegment: LiveTranscriptSegment = {
      id: newSegId,
      timestamp: newTimestamp,
      seconds: elapsedSeconds,
      speaker: item.speaker,
      speakerRole: item.speakerRole,
      text: item.text,
      entityIds: newEntityIds,
      isNew: true
    };

    setSegments(prev => [...prev, newSegment]);

    if (newExtractedEntities.length > 0) {
      setEntities(prev => {
        // Merge or increment
        const existingNames = new Set(prev.map(e => e.name.toLowerCase()));
        const toAdd: TranscriptEntity[] = [];
        const updated = prev.map(e => {
          const match = newExtractedEntities.find(ne => ne.name.toLowerCase() === e.name.toLowerCase());
          if (match) {
            return { ...e, mentionCount: e.mentionCount + 1 };
          }
          return e;
        });

        newExtractedEntities.forEach(ne => {
          if (!existingNames.has(ne.name.toLowerCase())) {
            toAdd.push(ne);
          }
        });

        return [...toAdd, ...updated];
      });

      showToast(`AI Extracted ${newExtractedEntities.length} new entity: ${newExtractedEntities[0].name}`);
    }

    // Scroll to bottom of transcript
    setTimeout(() => {
      if (transcriptContainerRef.current) {
        transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Submit manual live speech input
  const handleIngestCustomSpeech = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeSpeechInput.trim()) return;

    // Detect inline speaker prefix or use selected toggle
    const parsedSpeaker = parseInlineSpeakerFromText(activeSpeechInput, activeSpeaker, session);
    const newTimestamp = formatTime(elapsedSeconds);
    const newSegId = `seg_${session.id}_manual_${Date.now()}`;
    const speakerName = parsedSpeaker.parsedSpeakerName;
    const speakerRole = parsedSpeaker.parsedSpeakerRole;
    const cleanText = parsedSpeaker.cleanText;

    // Extract entities dynamically using heuristic NER
    const extracted = extractEntitiesFromTranscriptText(cleanText, newSegId, newTimestamp);
    const entityIds = extracted.map(e => e.id);

    const newSegment: LiveTranscriptSegment = {
      id: newSegId,
      timestamp: newTimestamp,
      seconds: elapsedSeconds,
      speaker: speakerName,
      speakerRole,
      text: cleanText,
      entityIds,
      isNew: true
    };

    setSegments(prev => [...prev, newSegment]);

    if (extracted.length > 0) {
      setEntities(prev => {
        const existingNames = new Set(prev.map(e => e.name.toLowerCase()));
        const toAdd: TranscriptEntity[] = [];
        const updated = prev.map(e => {
          const match = extracted.find(ne => ne.name.toLowerCase() === e.name.toLowerCase());
          if (match) {
            return { ...e, mentionCount: e.mentionCount + 1 };
          }
          return e;
        });

        extracted.forEach(ne => {
          if (!existingNames.has(ne.name.toLowerCase())) {
            toAdd.push(ne);
          }
        });

        return [...toAdd, ...updated];
      });

      showToast(`Ingested speech & identified ${extracted.length} entities: ${extracted.map(x => x.name).join(', ')}`);
    } else {
      showToast('Live utterance ingested into transcript stream.');
    }

    setActiveSpeechInput('');

    setTimeout(() => {
      if (transcriptContainerRef.current) {
        transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Quick jump to transcript segment from entity
  const handleJumpToSegment = (segmentId: string, entityId?: string) => {
    setHighlightedSegmentId(segmentId);
    if (entityId) setHighlightedEntityId(entityId);

    const targetEl = segmentRefs.current[segmentId];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Reset highlight pulse after 3 seconds
    setTimeout(() => {
      setHighlightedSegmentId(null);
      setHighlightedEntityId(null);
    }, 3500);
  };

  // Update entity status (e.g. Map to Asset, Risk, or Verify)
  const handleUpdateEntityStatus = (
    entityId: string,
    newStatus: 'Mapped to Asset Inventory' | 'Mapped to Risk Register' | 'Verified'
  ) => {
    setEntities(prev =>
      prev.map(ent => (ent.id === entityId ? { ...ent, status: newStatus } : ent))
    );
    showToast(`Entity updated: ${newStatus}`);
  };

  // Filtered entities for the sidebar
  const filteredEntities = useMemo(() => {
    return entities.filter(ent => {
      const matchesCategory = entityFilter === 'All' || ent.type === entityFilter;
      const matchesSearch =
        !entitySearch.trim() ||
        ent.name.toLowerCase().includes(entitySearch.toLowerCase()) ||
        ent.contextSnippet.toLowerCase().includes(entitySearch.toLowerCase()) ||
        (ent.associatedControlOrClause &&
          ent.associatedControlOrClause.toLowerCase().includes(entitySearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [entities, entityFilter, entitySearch]);

  // Counts by category
  const entityCounts = useMemo(() => {
    const counts = {
      All: entities.length,
      Application: 0,
      Asset: 0,
      Risk: 0,
      Control: 0,
      Policy: 0
    };
    entities.forEach(e => {
      if (counts[e.type] !== undefined) {
        counts[e.type]++;
      }
    });
    return counts;
  }, [entities]);

  // Automated Speaker Detection & Diarization Engine
  const diarizationResult = useMemo(() => {
    return detectAndAssignSpeakerLabels(segments, session, speakerOverrides);
  }, [segments, session, speakerOverrides]);

  // Enrich segments with both speaker labels & sentiment analysis (AI override or local audit heuristics)
  const segmentsEnriched = useMemo(() => {
    return diarizationResult.segmentsWithSpeakers.map(seg => {
      const override = segmentSentimentsOverride[seg.id];
      const sentiment = override || seg.sentiment || analyzeSegmentSentiment(seg, entities);
      return {
        ...seg,
        sentiment
      };
    });
  }, [diarizationResult.segmentsWithSpeakers, segmentSentimentsOverride, entities]);

  // Aggregate Sentiment Metrics for the session
  const meetingSentimentMetrics = useMemo(() => {
    return calculateMeetingSentimentMetrics(segmentsEnriched, entities);
  }, [segmentsEnriched, entities]);

  // Filtered transcript segments (accounting for text search, speaker filter & sentiment posture filter)
  const filteredSegments = useMemo(() => {
    let result = segmentsEnriched;

    // Apply speaker filter
    if (selectedSpeakerFilter !== 'ALL') {
      result = result.filter(
        seg =>
          seg.speakerLabel?.speakerId === selectedSpeakerFilter ||
          seg.speaker === selectedSpeakerFilter ||
          seg.speakerLabel?.speakerName === selectedSpeakerFilter
      );
    }

    // Apply sentiment posture filter if overlay is active
    if (isSentimentOverlayActive && sentimentPostureFilter !== 'ALL') {
      result = result.filter(seg => seg.sentiment?.posture === sentimentPostureFilter);
    }

    if (!transcriptSearch.trim()) return result;
    const q = transcriptSearch.toLowerCase();
    return result.filter(
      seg =>
        seg.text.toLowerCase().includes(q) ||
        seg.speaker.toLowerCase().includes(q) ||
        (seg.speakerLabel?.role && seg.speakerLabel.role.toLowerCase().includes(q)) ||
        (seg.speakerLabel?.badgeLabel && seg.speakerLabel.badgeLabel.toLowerCase().includes(q)) ||
        seg.timestamp.includes(q) ||
        (seg.sentiment?.toneLabel && seg.sentiment.toneLabel.toLowerCase().includes(q)) ||
        (seg.sentiment?.triggerKeywords && seg.sentiment.triggerKeywords.some(k => k.toLowerCase().includes(q)))
    );
  }, [segmentsEnriched, transcriptSearch, isSentimentOverlayActive, sentimentPostureFilter, selectedSpeakerFilter]);

  // Export full transcript & entities report
  const handleExportTranscript = () => {
    const header = `# SKANDA Enterprise Live Audit Interview Transcript\n` +
      `Meeting: ${session.title} (${session.meetingCode})\n` +
      `Department: ${session.department}\n` +
      `Framework: ${session.primaryFramework}\n` +
      `Lead Auditor: ${session.interviewer.name}\n` +
      `Stakeholder: ${session.stakeholder.name} (${session.stakeholder.title})\n` +
      `Total Elapsed: ${formatTime(elapsedSeconds)}\n` +
      `Extracted Entities Count: ${entities.length}\n\n` +
      `## Identified Entities Summary\n` +
      entities.map(e => `- [${e.type}] ${e.name} (Mentioned ${e.mentionCount}x, first at ${e.firstMentionTimestamp}) - Confidence: ${Math.round(e.confidence * 100)}% - Status: ${e.status || 'Extracted'}`).join('\n') +
      `\n\n## Real-Time Transcript Stream\n\n` +
      segments.map(s => `[${s.timestamp}] **${s.speaker}** (${s.speakerRole}):\n${s.text}\n`).join('\n');

    const blob = new Blob([header], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SKANDA_Transcript_${session.meetingCode}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Transcript and Entity Dossier exported as Markdown');
  };

  // Helper colors for entity types
  const getEntityTypeBadgeStyle = (type: IdentifiedEntityType) => {
    switch (type) {
      case 'Application':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'Asset':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Risk':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'Control':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Policy':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const getEntityTypeIcon = (type: IdentifiedEntityType) => {
    switch (type) {
      case 'Application':
        return <Cpu className="w-3.5 h-3.5 text-sky-400" />;
      case 'Asset':
        return <Server className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Risk':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'Control':
        return <Check className="w-3.5 h-3.5 text-purple-400" />;
      case 'Policy':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className={`flex flex-col bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl overflow-hidden ${isEmbeddedInModal ? 'h-[750px]' : 'h-[calc(100vh-170px)] min-h-[650px]'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 flex items-center gap-2 bg-slate-900 border border-sky-500/50 text-sky-200 px-4 py-2.5 rounded-lg shadow-xl shadow-sky-950/50 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <Zap className="w-4 h-4 text-sky-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Live Telemetry Controls */}
      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Meeting Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-700/40 text-sky-400">
            <Radio className="w-5 h-5 animate-pulse text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400">
                {session.meetingCode}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Ingestion Active
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                {session.primaryFramework}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-100 truncate max-w-lg mt-0.5">
              {session.title}
            </h2>
          </div>
        </div>

        {/* Center: Live Recording & Audio Visualizer Status */}
        <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsRecording(prev => !prev);
                showToast(isRecording ? 'Audio ingestion paused' : 'Live audio ingestion started');
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                isRecording
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {isRecording ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-rose-400" />
                  <span>REC Active</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-slate-400" />
                  <span>Start Audio</span>
                </>
              )}
            </button>

            {/* Audio waveform simulator */}
            <div className="flex items-center gap-0.5 h-4 px-1.5">
              {[60, 100, 40, 80, 50, 90, 30].map((h, i) => (
                <span
                  key={i}
                  className={`w-0.5 rounded-full ${
                    isRecording || isAutoStreaming ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'
                  }`}
                  style={{
                    height: isRecording || isAutoStreaming ? `${h}%` : '20%',
                    animationDelay: `${i * 120}ms`
                  }}
                />
              ))}
            </div>

            <span className="text-xs font-mono text-slate-300 font-bold ml-1">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Auto-stream simulation toggle */}
          <button
            onClick={() => {
              setIsAutoStreaming(prev => !prev);
              showToast(isAutoStreaming ? 'Live diarization stream stopped' : 'Live streaming diarization enabled');
            }}
            className={`text-xs px-2.5 py-1 rounded border font-medium flex items-center gap-1.5 transition-colors ${
              isAutoStreaming
                ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border-slate-700'
            }`}
            title="Automatically streams dialogue turns every 5s"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="hidden md:inline">Auto-Stream Dialogue</span>
            <span className="md:hidden">Auto</span>
            {isAutoStreaming && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
          </button>

          {/* Next utterance step trigger */}
          <button
            onClick={handleStreamNextUtterance}
            className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 flex items-center gap-1"
            title="Manually simulate next incoming auditee utterance"
          >
            <Play className="w-3 h-3" />
            <span className="hidden sm:inline">Stream Next</span>
          </button>
        </div>

        {/* Right Actions: Generate Summary, Export & Sidebar Toggle */}
        <div className="flex items-center gap-2">
          {/* AI Generate Summary Button */}
          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-950/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Use AI to generate a concise, structured bullet-point summary of the completed meeting segment"
          >
            {isGeneratingSummary ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-violet-200" />
                <span>Generate Summary</span>
              </>
            )}
          </button>

          {/* Sentiment Analysis Overlay Toggle */}
          <button
            onClick={() => setIsSentimentOverlayActive(prev => !prev)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isSentimentOverlayActive
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-sm ring-1 ring-emerald-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
            }`}
            title={
              isSentimentOverlayActive
                ? 'Hide Sentiment Analysis Overlay'
                : 'Show Sentiment Analysis Overlay (color-codes compliance vs risks)'
            }
          >
            <Activity className={`w-3.5 h-3.5 ${isSentimentOverlayActive ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Sentiment Overlay</span>
            <span className="md:hidden">Tone</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSentimentOverlayActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
          </button>

          {/* Speaker Diarization Bar Toggle */}
          <button
            onClick={() => setIsSpeakerBarOpen(prev => !prev)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeakerBarOpen
                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/60 shadow-sm ring-1 ring-indigo-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
            }`}
            title="Toggle Speaker Diarization Roster & Dialogue Share Overview"
          >
            <Users className={`w-3.5 h-3.5 ${isSpeakerBarOpen ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Speakers ({diarizationResult.detectedSpeakers.length})</span>
            <span className="md:hidden">Speakers</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeakerBarOpen ? 'bg-indigo-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
          </button>

          {segmentSummary && (
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="text-xs px-2.5 py-1.5 rounded bg-violet-950/60 hover:bg-violet-900/60 text-violet-300 border border-violet-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View the generated structured bullet-point meeting summary"
            >
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden lg:inline">View Summary</span>
            </button>
          )}

          <button
            onClick={handleExportTranscript}
            className="text-xs px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Export Working Paper Dossier with extracted entity register"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export Dossier</span>
          </button>

          {/* Export Meeting Report Button */}
          <button
            onClick={handleExportPdfMeetingReport}
            className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-teal-950/40 transition-all active:scale-95 cursor-pointer"
            title="Convert meeting summary and transcript into an official PDF document for audit compliance"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-100" />
            <span className="hidden sm:inline">Export Meeting Report</span>
            <span className="sm:hidden">Report</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/20 text-white font-bold">PDF</span>
          </button>

          {/* Sidebar Expand / Collapse Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-2 transition-all ${
              isSidebarOpen
                ? 'bg-sky-950/60 text-sky-300 border-sky-600/40 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
            }`}
            title={isSidebarOpen ? 'Collapse Identified Entities sidebar' : 'Open Identified Entities sidebar'}
          >
            {isSidebarOpen ? (
              <>
                <PanelRightClose className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Hide Entities</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-4 h-4 text-sky-400" />
                <span>Identified Entities ({entities.length})</span>
              </>
            )}
          </button>

          {onCloseLiveView && (
            <button
              onClick={onCloseLiveView}
              className="text-xs px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
            >
              Exit Live
            </button>
          )}
        </div>
      </div>

      {/* Main Body: Real-Time Transcript Stream (Left/Center) + Collapsible Entities Sidebar (Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* CENTER PANE: Real-time Transcript Stream */}
        <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
          {/* Integrated HTML5 Audio Playback Player */}
          <MeetingAudioPlaybackPlayer
            session={session}
            segments={segments}
            currentPlayingSeconds={currentPlayingSeconds}
            isPlaying={isPlayingAudio}
            onPlay={() => setIsPlayingAudio(true)}
            onPause={() => setIsPlayingAudio(false)}
            onSeek={secs => setCurrentPlayingSeconds(secs)}
            autoScrollEnabled={autoScrollAudio}
            onToggleAutoScroll={val => setAutoScrollAudio(val)}
            onSegmentSelect={seg => handleJumpAndPlaySegment(seg)}
            activeSegment={activePlayingSegment}
          />

          {/* Sentiment Analysis Overlay Bar (Interactive Legend, Proportional Tone Meter & Filters) */}
          <MeetingSentimentOverlayBar
            metrics={meetingSentimentMetrics}
            selectedPostureFilter={sentimentPostureFilter}
            onSelectPostureFilter={posture => setSentimentPostureFilter(posture)}
            isOverlayActive={isSentimentOverlayActive}
            onToggleOverlay={() => setIsSentimentOverlayActive(false)}
            onRunAiSentimentScan={handleRunAiSentimentScan}
            isScanningAi={isScanningSentimentAi}
            aiSource={sentimentAiSource}
            totalSegmentsCount={segments.length}
          />

          {/* Automated Speaker Diarization & Dialogue Share Overview Bar */}
          {isSpeakerBarOpen && (
            <MeetingSpeakerDiarizationBar
              detectedSpeakers={diarizationResult.detectedSpeakers}
              totalTurns={diarizationResult.totalTurns}
              speakerSwitchCount={diarizationResult.speakerSwitchCount}
              diarizationCoveragePercent={diarizationResult.diarizationCoveragePercent}
              selectedSpeakerFilter={selectedSpeakerFilter}
              onSelectSpeakerFilter={spkId => setSelectedSpeakerFilter(spkId)}
              onRunAiDiarization={handleRunAiDiarization}
              isDiarizing={isDiarizingAi}
              diarizationSource={diarizationSource}
              isExpanded={isSpeakerBarExpanded}
              onToggleExpand={() => setIsSpeakerBarExpanded(prev => !prev)}
            />
          )}

          {/* Transcript Sub-Header with search & stats */}
          <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{segments.length} Utterances</span>
              <span>•</span>
              <span className="text-slate-400">
                Auditor: <strong className="text-slate-300">{session.interviewer.name}</strong>
              </span>
              <span>•</span>
              <span className="text-slate-400">
                Auditee: <strong className="text-slate-300">{session.stakeholder.name}</strong>
              </span>

              {/* Active Speaker Filter Badge in Sub-header */}
              {selectedSpeakerFilter !== 'ALL' && (
                <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-600/60 text-indigo-300">
                  <Users className="w-3 h-3 text-indigo-400" />
                  <span>Speaker:</span>
                  <strong className="font-semibold">
                    {diarizationResult.detectedSpeakers.find(s => s.speakerId === selectedSpeakerFilter)?.speakerName || selectedSpeakerFilter}
                  </strong>
                  <button
                    onClick={() => setSelectedSpeakerFilter('ALL')}
                    className="ml-1 text-indigo-400 hover:text-white"
                    title="Clear speaker filter"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Active Sentiment Filter Badge in Sub-header */}
              {isSentimentOverlayActive && sentimentPostureFilter !== 'ALL' && (
                <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-600/60 text-sky-300">
                  <Filter className="w-3 h-3 text-sky-400" />
                  <span>Filtered:</span>
                  <strong className="font-semibold">{sentimentPostureFilter.replace('_', ' ')}</strong>
                  <button
                    onClick={() => setSentimentPostureFilter('ALL')}
                    className="ml-1 text-sky-400 hover:text-white"
                    title="Clear filter"
                  >
                    ×
                  </button>
                </div>
              )}

              {!isSentimentOverlayActive && (
                <button
                  onClick={() => setIsSentimentOverlayActive(true)}
                  className="ml-2 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800/40 flex items-center gap-1 cursor-pointer"
                  title="Show Auditor Sentiment Analysis Overlay"
                >
                  <Activity className="w-3 h-3" />
                  <span>Show Sentiment Overlay</span>
                </button>
              )}
            </div>

            {/* Quick search inside transcript */}
            <div className="relative w-56 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={transcriptSearch}
                onChange={e => setTranscriptSearch(e.target.value)}
                placeholder="Search dialogue text..."
                className="w-full bg-slate-900 border border-slate-800 rounded text-xs pl-8 pr-3 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Transcript Dialogue Scrollable Container */}
          <div
            ref={transcriptContainerRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 scroll-smooth"
          >
            {filteredSegments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                <FileText className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-medium">No dialogue matches search or sentiment filter.</p>
                <div className="flex items-center gap-3 mt-3">
                  {transcriptSearch && (
                    <button
                      onClick={() => setTranscriptSearch('')}
                      className="text-xs text-sky-400 hover:underline cursor-pointer"
                    >
                      Clear text search
                    </button>
                  )}
                  {sentimentPostureFilter !== 'ALL' && (
                    <button
                      onClick={() => setSentimentPostureFilter('ALL')}
                      className="text-xs text-sky-400 hover:underline cursor-pointer"
                    >
                      Reset sentiment filter
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredSegments.map((segment, idx) => {
                const isAuditor = segment.speakerRole.includes('Auditor') || segment.speakerLabel?.affiliation === 'AUDIT_TEAM';
                const isTargetHighlighted = highlightedSegmentId === segment.id;
                const isAudioActive = activePlayingSegment?.id === segment.id;
                const isAudioPlayingThis = isAudioActive && isPlayingAudio;

                // Sentiment posture extraction
                const sentiment = segment.sentiment;
                const isPositive = sentiment?.posture === 'POSITIVE_COMPLIANCE';
                const isRisk = sentiment?.posture === 'IDENTIFIED_RISK';
                const isCaution = sentiment?.posture === 'CAUTION_UNCERTAINTY';
                const isNeutral = sentiment?.posture === 'NEUTRAL_PROCEDURAL';

                // Find entities mentioned in this segment
                const segmentEntities = entities.filter(
                  e => segment.entityIds.includes(e.id) || e.segmentId === segment.id
                );

                const isSpeakerSwitch = segment.speakerLabel?.isSpeakerSwitch && idx > 0;

                return (
                  <React.Fragment key={segment.id}>
                    {/* Speaker Transition Divider */}
                    {isSpeakerSwitch && segment.speakerLabel && (
                      <div className="flex items-center gap-3 py-1.5 px-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-slate-800" />
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 shadow-sm">
                          <ArrowRightLeft className="w-3 h-3 text-sky-400" />
                          <span>
                            Speaker Switch → <strong className="text-slate-100">{segment.speakerLabel.speakerName}</strong>{' '}
                            <span className="text-slate-400">({segment.speakerLabel.role})</span>
                          </span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-800 to-slate-800" />
                      </div>
                    )}

                    <div
                      ref={el => {
                        segmentRefs.current[segment.id] = el;
                      }}
                      id={segment.id}
                      onClick={() => handleJumpAndPlaySegment(segment)}
                      className={`group relative rounded-xl p-4 transition-all duration-300 border cursor-pointer ${
                        isAudioPlayingThis
                          ? 'bg-sky-950/70 border-sky-400 ring-2 ring-sky-400/60 shadow-xl shadow-sky-950/60'
                          : isAudioActive
                          ? 'bg-sky-950/40 border-sky-500/80 ring-1 ring-sky-500/40 shadow-md'
                          : isTargetHighlighted
                          ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-400/50 shadow-lg'
                          : isSentimentOverlayActive && isRisk
                          ? 'bg-rose-950/25 border-rose-600/70 hover:bg-rose-950/40 hover:border-rose-500 border-l-4 border-l-rose-500 shadow-md shadow-rose-950/30 ring-1 ring-rose-500/30'
                          : isSentimentOverlayActive && isPositive
                          ? 'bg-emerald-950/20 border-emerald-600/60 hover:bg-emerald-950/35 hover:border-emerald-500 border-l-4 border-l-emerald-400 ring-1 ring-emerald-500/20 shadow-sm shadow-emerald-950/20'
                          : isSentimentOverlayActive && isCaution
                          ? 'bg-amber-950/20 border-amber-600/60 hover:bg-amber-950/35 hover:border-amber-500 border-l-4 border-l-amber-400 ring-1 ring-amber-500/20'
                          : isSentimentOverlayActive && isNeutral
                          ? isAuditor
                            ? 'bg-slate-900/60 border-slate-800 border-l-4 border-l-indigo-500 hover:border-slate-700'
                            : 'bg-slate-900/40 border-slate-800/80 border-l-4 border-l-emerald-500 hover:border-slate-700'
                          : isAuditor
                          ? 'bg-slate-900/60 border-slate-800 border-l-4 border-l-indigo-500/80 hover:border-slate-700 hover:bg-slate-900/80'
                          : 'bg-slate-900/40 border-slate-800/80 border-l-4 border-l-emerald-500/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                      title={`Click to jump audio to [${segment.timestamp}]`}
                    >
                      {/* Utterance Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Rich Speaker Badge with detected affiliation & reattribution support */}
                          {segment.speakerLabel ? (
                            <TranscriptSpeakerBadge
                              speakerLabel={segment.speakerLabel}
                              session={session}
                              timestamp={segment.timestamp}
                              onReassignSpeaker={(newName, newRole, newAffiliation) => {
                                setSpeakerOverrides(prev => ({
                                  ...prev,
                                  [segment.id]: {
                                    speakerName: newName,
                                    role: newRole,
                                    affiliation: newAffiliation,
                                    confidence: 1.0,
                                    detectedReason: 'Auditor Manual Attribution'
                                  }
                                }));
                                showToast(`Attributed utterance to ${newName} (${newRole})`);
                              }}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isAuditor
                                    ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-700/60'
                                    : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/60'
                                }`}
                              >
                                {segment.speaker.charAt(0)}
                              </div>
                              <span className="text-xs font-semibold text-slate-200">
                                {segment.speaker}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                                  isAuditor
                                    ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50'
                                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                                }`}
                              >
                                {isAuditor ? 'Lead Auditor' : 'Auditee / Stakeholder'}
                              </span>
                            </div>
                          )}

                          {/* Sentiment Posture Badge */}
                          {isSentimentOverlayActive && sentiment && (
                          <div
                            className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all ${
                              isPositive
                                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70 shadow-sm'
                                : isRisk
                                ? 'bg-rose-950/95 text-rose-200 border-rose-500/80 shadow-sm ring-1 ring-rose-500/40 animate-pulse'
                                : isCaution
                                ? 'bg-amber-950/90 text-amber-300 border-amber-500/70 shadow-sm'
                                : 'bg-slate-800/90 text-slate-400 border-slate-700'
                            }`}
                            title={`Compliance Tone: ${sentiment.toneLabel} • Confidence: ${Math.round(
                              (sentiment.confidence || 0.9) * 100
                            )}% • ${sentiment.reasoning}`}
                          >
                            {isPositive ? (
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            ) : isRisk ? (
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                            ) : isCaution ? (
                              <AlertCircle className="w-3 h-3 text-amber-400" />
                            ) : (
                              <Info className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{sentiment.toneLabel}</span>
                            <span className="text-[9px] opacity-80 font-mono">
                              ({sentiment.score > 0 ? `+${sentiment.score}` : sentiment.score})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Audio Jump & Play Button */}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (isAudioPlayingThis) {
                              setIsPlayingAudio(false);
                            } else {
                              handleJumpAndPlaySegment(segment);
                            }
                          }}
                          className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                            isAudioPlayingThis
                              ? 'bg-rose-600 text-white border-rose-500 font-bold shadow-md ring-2 ring-rose-400/50'
                              : isAudioActive
                              ? 'bg-sky-600 text-white border-sky-500 font-bold'
                              : 'text-slate-300 bg-slate-800/90 hover:bg-sky-950 hover:text-sky-300 hover:border-sky-600/60 border-slate-700/70'
                          }`}
                          title={isAudioPlayingThis ? 'Pause audio' : `Jump audio to ${segment.timestamp} & play`}
                        >
                          {isAudioPlayingThis ? (
                            <>
                              <div className="flex items-center gap-0.5 mr-0.5">
                                <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                                <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-75" />
                                <span className="w-1 h-3 bg-white rounded-full animate-pulse delay-150" />
                              </div>
                              <span>Playing {segment.timestamp}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current text-sky-400 group-hover:scale-110 transition-transform" />
                              <span>{segment.timestamp}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`[${segment.timestamp}] ${segment.speaker}: ${segment.text}`);
                            showToast('Utterance copied to clipboard');
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-200 transition-opacity p-1"
                          title="Copy statement quotation"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Utterance Body */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-8">
                      {segment.text}
                    </p>

                    {/* Sentiment Posture Justification & Trigger Callout Box */}
                    {isSentimentOverlayActive && sentiment && (isPositive || isRisk || isCaution) && (
                      <div
                        className={`mt-2.5 ml-8 p-2 rounded-lg text-xs border flex flex-wrap items-start justify-between gap-2.5 ${
                          isRisk
                            ? 'bg-rose-950/35 border-rose-800/70 text-rose-200'
                            : isPositive
                            ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                            : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                        }`}
                      >
                        <div className="flex items-start gap-2 max-w-xl">
                          {isRisk ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                          ) : isPositive ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <p className="text-[11px] leading-snug">
                              <strong className="font-semibold mr-1.5">
                                {isRisk ? 'Risk Indicator:' : isPositive ? 'Control Verification:' : 'Audit Note:'}
                              </strong>
                              {sentiment.reasoning}
                            </p>
                            {sentiment.triggerKeywords && sentiment.triggerKeywords.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <span className="text-[9px] uppercase font-mono tracking-wider opacity-60">
                                  Triggers:
                                </span>
                                {sentiment.triggerKeywords.map((kw, kwIdx) => (
                                  <span
                                    key={kwIdx}
                                    className="px-1.5 py-0.2 rounded text-[10px] font-mono border border-current opacity-85 bg-slate-950/40"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono opacity-80 shrink-0">
                          <span>Confidence: {Math.round((sentiment.confidence || 0.9) * 100)}%</span>
                        </div>
                      </div>
                    )}

                    {/* Mentioned Entities Chips in Segment Footer */}
                    {segmentEntities.length > 0 && (
                      <div className="mt-3 pl-8 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1 mr-1">
                          <Tag className="w-3 h-3 text-sky-400" />
                          Extracted:
                        </span>
                        {segmentEntities.map(ent => {
                          const isSelected = highlightedEntityId === ent.id;
                          return (
                            <button
                              key={ent.id}
                              onClick={e => {
                                e.stopPropagation();
                                setIsSidebarOpen(true);
                                setHighlightedEntityId(ent.id);
                                setEntitySearch(ent.name);
                              }}
                              className={`text-xs px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${getEntityTypeBadgeStyle(
                                ent.type
                              )} ${
                                isSelected ? 'ring-2 ring-sky-400 shadow-md font-bold' : 'hover:brightness-125'
                              }`}
                              title={`View ${ent.type} in Entities Sidebar`}
                            >
                              {getEntityTypeIcon(ent.type)}
                              <span>{ent.name}</span>
                              {ent.riskSeverity && (
                                <span className="text-[10px] font-mono font-bold px-1 rounded bg-rose-950 text-rose-300">
                                  {ent.riskSeverity}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })
            )}
          </div>

          {/* Bottom Interactive Speech & Diarization Input Bar */}
          <form
            onSubmit={handleIngestCustomSpeech}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            {/* Speaker Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveSpeaker('auditee')}
                className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                  activeSpeaker === 'auditee'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Auditee
              </button>
              <button
                type="button"
                onClick={() => setActiveSpeaker('auditor')}
                className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                  activeSpeaker === 'auditor'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Auditor
              </button>
            </div>

            {/* Input field */}
            <input
              type="text"
              value={activeSpeechInput}
              onChange={e => setActiveSpeechInput(e.target.value)}
              placeholder={`Type or speak speech response (e.g. "We run GitHub Enterprise and AWS PostgreSQL Aurora with KMS encryption...")`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />

            {/* Microphone Audio Dictation powered by gemini-3.5-transcribe */}
            <AudioTranscriptionInput
              onTranscriptionComplete={text => {
                if (text) {
                  setActiveSpeechInput(prev => (prev ? `${prev} ${text}` : text));
                }
              }}
              promptHint="Transcribe the spoken meeting statement into verbatim text, maintaining cybersecurity and regulatory terms."
              size="sm"
            />

            <button
              type="submit"
              disabled={!activeSpeechInput.trim()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span>Ingest & Extract</span>
            </button>
          </form>
        </div>

        {/* RIGHT PANE: Collapsible Identified Entities Sidebar */}
        <aside
          className={`border-l border-slate-800 bg-slate-900/95 flex flex-col transition-all duration-300 ease-in-out z-20 ${
            isSidebarOpen ? 'w-80 sm:w-96' : 'w-14'
          }`}
        >
          {/* Collapsed Strip View */}
          {!isSidebarOpen ? (
            <div className="h-full flex flex-col items-center py-4 justify-between">
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-600/40 text-sky-400 flex items-center justify-center hover:bg-sky-900 transition-colors"
                  title="Expand Identified Entities"
                >
                  <PanelRightOpen className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center gap-3">
                  <div
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      setIsSidebarOpen(true);
                      setEntityFilter('Application');
                    }}
                    title={`${entityCounts.Application} Applications`}
                  >
                    <Cpu className="w-4 h-4 text-sky-400" />
                    <span className="text-[10px] font-bold text-sky-400 mt-0.5">
                      {entityCounts.Application}
                    </span>
                  </div>

                  <div
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      setIsSidebarOpen(true);
                      setEntityFilter('Asset');
                    }}
                    title={`${entityCounts.Asset} Assets`}
                  >
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400 mt-0.5">
                      {entityCounts.Asset}
                    </span>
                  </div>

                  <div
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      setIsSidebarOpen(true);
                      setEntityFilter('Risk');
                    }}
                    title={`${entityCounts.Risk} Risks`}
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="text-[10px] font-bold text-rose-400 mt-0.5">
                      {entityCounts.Risk}
                    </span>
                  </div>

                  <div
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      setIsSidebarOpen(true);
                      setEntityFilter('Control');
                    }}
                    title={`${entityCounts.Control} Controls`}
                  >
                    <Check className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-400 mt-0.5">
                      {entityCounts.Control}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rotate-90 origin-center whitespace-nowrap text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Entities ({entities.length})
              </div>
            </div>
          ) : (
            /* Expanded Full Sidebar View */
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-sky-950/80 border border-sky-600/40 flex items-center justify-center text-sky-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        Identified Entities
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 font-bold">
                        {entities.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Real-time AI entity discovery & linking
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                  title="Collapse sidebar"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>

              {/* Entity Search Bar */}
              <div className="px-4 pt-3 pb-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={entitySearch}
                    onChange={e => setEntitySearch(e.target.value)}
                    placeholder="Search identified entities..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  {entitySearch && (
                    <button
                      onClick={() => setEntitySearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="px-4 py-1.5 flex flex-wrap gap-1 border-b border-slate-800/80">
                {(['All', 'Application', 'Asset', 'Risk', 'Control'] as const).map(tab => {
                  const count = entityCounts[tab] || 0;
                  const isActive = entityFilter === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setEntityFilter(tab)}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                      }`}
                    >
                      <span>{tab === 'All' ? 'All' : `${tab}s`}</span>
                      <span
                        className={`text-[9px] font-mono px-1 rounded ${
                          isActive
                            ? 'bg-sky-950 text-sky-300 font-bold'
                            : 'bg-slate-800/80 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Entities List Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredEntities.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">No entities match filter criteria.</p>
                  </div>
                ) : (
                  filteredEntities.map(ent => {
                    const isSelected = highlightedEntityId === ent.id;
                    return (
                      <div
                        key={ent.id}
                        className={`rounded-xl border p-3.5 transition-all duration-200 ${
                          isSelected
                            ? 'bg-slate-800/90 border-sky-400 ring-2 ring-sky-500/30 shadow-lg'
                            : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        {/* Entity Header */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span
                            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${getEntityTypeBadgeStyle(
                              ent.type
                            )}`}
                          >
                            {getEntityTypeIcon(ent.type)}
                            <span>{ent.type}</span>
                          </span>

                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                            <span>{Math.round(ent.confidence * 100)}% Conf</span>
                            <span>•</span>
                            <span className="text-slate-400">{ent.mentionCount}x</span>
                          </div>
                        </div>

                        {/* Entity Name */}
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                          {ent.name}
                        </h4>

                        {/* Context Snippet */}
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          "{ent.contextSnippet}"
                        </p>

                        {/* Mapped Control or Risk Severity pill */}
                        {(ent.associatedControlOrClause || ent.riskSeverity) && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {ent.associatedControlOrClause && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 font-medium">
                                {ent.associatedControlOrClause}
                              </span>
                            )}
                            {ent.riskSeverity && (
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  ent.riskSeverity === 'CRITICAL'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                    : ent.riskSeverity === 'HIGH'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                    : 'bg-yellow-950 text-yellow-300 border border-yellow-800/60'
                                }`}
                              >
                                Severity: {ent.riskSeverity}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Quick Action Buttons & Jump Link */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          {/* PRIMARY FEATURE: Jump to Transcript Segment */}
                          <button
                            onClick={() => handleJumpToSegment(ent.segmentId, ent.id)}
                            className="text-xs font-semibold px-2.5 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-700/50 flex items-center gap-1 transition-colors shadow-sm"
                            title={`Jump to utterance where ${ent.name} was mentioned`}
                          >
                            <ArrowUpRight className="w-3 h-3 text-sky-400" />
                            <span>Jump to [{ent.firstMentionTimestamp}]</span>
                          </button>

                          {/* Quick GRC Mapping Actions */}
                          {ent.type === 'Risk' ? (
                            <button
                              onClick={() => handleUpdateEntityStatus(ent.id, 'Mapped to Risk Register')}
                              className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-rose-950 text-rose-300 border border-slate-800 hover:border-rose-700/60 transition-colors"
                              title="Promote directly to GRC Risk Register"
                            >
                              {ent.status === 'Mapped to Risk Register' ? '✓ In Risk DB' : '+ Log Risk'}
                            </button>
                          ) : ent.type === 'Asset' || ent.type === 'Application' ? (
                            <button
                              onClick={() => handleUpdateEntityStatus(ent.id, 'Mapped to Asset Inventory')}
                              className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-emerald-950 text-emerald-300 border border-slate-800 hover:border-emerald-700/60 transition-colors"
                              title="Promote to Enterprise CMDB / Asset Inventory"
                            >
                              {ent.status === 'Mapped to Asset Inventory' ? '✓ In Asset DB' : '+ Add Asset'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateEntityStatus(ent.id, 'Verified')}
                              className="text-[10px] px-2 py-1 rounded bg-slate-900 hover:bg-purple-950 text-purple-300 border border-slate-800 hover:border-purple-700/60 transition-colors"
                            >
                              {ent.status === 'Verified' ? '✓ Verified' : 'Verify'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer with summary metrics */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total Entities: <strong className="text-slate-200">{entities.length}</strong></span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  NLP Sync Active
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* AI Meeting Segment Summary Modal */}
      <MeetingSegmentSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={segmentSummary}
        session={session}
        onRegenerate={handleGenerateSummary}
        isRegenerating={isGeneratingSummary}
        segmentCount={segments.length}
        segments={segments}
        entities={entities}
      />
    </div>
  );
};
