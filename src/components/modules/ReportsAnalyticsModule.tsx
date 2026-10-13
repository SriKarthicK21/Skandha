import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  BarChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  Download,
  Sparkles,
  Filter,
  ShieldCheck,
  Award,
  FileText,
  Layers,
  Compass,
  Users,
  Target,
  ChevronRight,
  Info,
  SlidersHorizontal,
  ArrowUpRight,
  BarChart3,
  Flame,
  Milestone,
  CheckSquare,
  CircleDot,
  Circle,
  Search,
  X,
  Tag,
  Loader2,
  Presentation,
  Activity
} from 'lucide-react';
import { exportRoadmapToPDF } from '../../utils/roadmapPdfExporter';
import { ReadinessScoreWidget } from '../analytics/ReadinessScoreWidget';
import { AIExecutiveBriefingView, type AIExecutiveBriefingData } from '../analytics/AIExecutiveBriefingView';
import { ComplianceMaturityD3Chart } from '../analytics/ComplianceMaturityD3Chart';
import { ComplianceMaturityScorecard } from '../analytics/ComplianceMaturityScorecard';
import { PredictiveMaturityService, type PredictiveMaturityResponse } from '../../services/predictiveMaturityService';
import { DEFAULT_12_MONTH_SNAPSHOTS } from '../analytics/complianceSnapshotData';
import { useToast } from '../common/ToastContainer';

export interface MilestoneContributingTask {
  id: string;
  title: string;
  category: string;
  department: string;
  assignedTo: string;
  status: 'Done' | 'In Progress' | 'Under Review' | 'To Do';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  dueDate: string;
  weight: number; // percentage weight within this milestone, e.g. 35%
  progress: number; // 0-100% completion
  contribution: number; // weighted contribution (weight * progress / 100)
  deliverable?: string;
  linkedControl?: string;
}

export interface RoadmapTrajectoryPoint {
  month: string;
  milestone: string;
  milestoneId: string;
  phase: string;
  clause: string;
  milestoneTitle: string;
  status: 'Completed' | 'In Progress' | 'Upcoming' | 'At Risk';
  readinessContribution: number;
  actualReadiness: number | null;
  targetReadiness: number;
  projectedReadiness?: number;
  evidenceRate?: number;
  controlRate?: number;
  owner: string;
  deliverables: string[];
  notes?: string;
  targetDate: string;
  completedDate?: string;
  milestoneProgressPercentage: number;
  contributingTasks: MilestoneContributingTask[];
}

export interface MilestoneItem {
  id: string;
  phase: string;
  title: string;
  clause: string;
  targetDate: string;
  completedDate?: string;
  status: 'Completed' | 'In Progress' | 'Upcoming' | 'At Risk';
  readinessContribution: number; // percentage
  owner: string;
  deliverables: string[];
  notes: string;
  contributingTasks?: MilestoneContributingTask[];
}

const RoadmapCustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
  searchQuery?: string;
}> = ({ active, payload, searchQuery }) => {
  if (!active || !payload || !payload.length) return null;

  const data: RoadmapTrajectoryPoint = payload[0]?.payload;
  if (!data) return null;

  const completedTasksCount = data.contributingTasks?.filter(t => t.status === 'Done').length || 0;
  const inProgressTasksCount = data.contributingTasks?.filter(t => t.status === 'In Progress').length || 0;
  const totalTasksCount = data.contributingTasks?.length || 0;
  const progressPercent = data.milestoneProgressPercentage ?? 0;
  const q = searchQuery?.trim().toLowerCase();

  return (
    <div className="bg-slate-900/98 backdrop-blur-md border border-slate-700/90 shadow-2xl rounded-2xl p-4 max-w-sm sm:max-w-md w-[360px] sm:w-[430px] text-white space-y-3 z-50 pointer-events-auto select-none transition-all">
      {/* Header bar */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
              {data.month} • {data.phase}
            </span>
            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[170px]">
              {data.clause}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white leading-snug">
            {data.milestoneTitle || data.milestone}
          </h4>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 flex items-center space-x-1 ${
            data.status === 'Completed'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : data.status === 'In Progress'
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {data.status === 'Completed' ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1 inline" />
          ) : data.status === 'In Progress' ? (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse mr-1 inline-block" />
          ) : null}
          <span>{data.status}</span>
        </span>
      </div>

      {/* Milestone Progress & Readiness Impact */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-sky-400" />
            <span>Milestone Contribution Progress</span>
          </span>
          <span className="font-bold font-mono text-sky-400">
            {progressPercent}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              progressPercent === 100
                ? 'bg-emerald-500'
                : progressPercent >= 60
                ? 'bg-sky-500'
                : progressPercent > 0
                ? 'bg-amber-500'
                : 'bg-slate-700'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 3 Micro Stats */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] border-t border-slate-800/60">
          <div>
            <div className="text-[9px] uppercase font-bold text-slate-400">Readiness Impact</div>
            <div className="font-bold text-emerald-400">+{data.readinessContribution}% Weight</div>
          </div>
          <div>
            <div className="text-[9px] uppercase font-bold text-slate-400">Target Baseline</div>
            <div className="font-bold text-slate-200">{data.targetReadiness}% Target</div>
          </div>
          <div>
            <div className="text-[9px] uppercase font-bold text-slate-400">
              {data.actualReadiness !== null ? 'Actual Readiness' : 'Projected Readiness'}
            </div>
            <div className="font-bold text-sky-400">
              {data.actualReadiness !== null ? `${data.actualReadiness}%` : `${data.projectedReadiness || '--'}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Contributing Tasks Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300 flex items-center space-x-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Contributing Tasks ({totalTasksCount})</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {completedTasksCount}/{totalTasksCount} Done {inProgressTasksCount > 0 ? `• ${inProgressTasksCount} Active` : ''}
          </span>
        </div>

        {/* Task Cards List */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {data.contributingTasks && data.contributingTasks.length > 0 ? (
            data.contributingTasks.map((task) => {
              const isTaskDone = task.status === 'Done';
              const isInProgress = task.status === 'In Progress';
              const isUnderReview = task.status === 'Under Review';
              const isMatchedBySearch = Boolean(
                q &&
                (task.title.toLowerCase().includes(q) ||
                 task.assignedTo.toLowerCase().includes(q) ||
                 task.department.toLowerCase().includes(q) ||
                 task.category.toLowerCase().includes(q) ||
                 (task.linkedControl && task.linkedControl.toLowerCase().includes(q)))
              );

              return (
                <div
                  key={task.id}
                  className={`p-2 rounded-xl border transition-colors ${
                    isMatchedBySearch
                      ? 'bg-sky-950/70 border-sky-500 shadow-sm ring-1 ring-sky-500/40 text-white'
                      : isTaskDone
                      ? 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                      : isInProgress
                      ? 'bg-sky-950/40 border-sky-800/60 text-white'
                      : isUnderReview
                      ? 'bg-amber-950/30 border-amber-800/50 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800/50 text-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {isTaskDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : isInProgress ? (
                          <CircleDot className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                        ) : isUnderReview ? (
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-semibold leading-tight ${isMatchedBySearch ? 'text-sky-300 font-bold' : isTaskDone ? 'text-slate-200' : 'text-white'}`}>
                          {task.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
                          <span className="truncate max-w-[120px]">👤 {task.assignedTo}</span>
                          <span>•</span>
                          <span className="truncate max-w-[140px]">{task.department}</span>
                          {task.linkedControl && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-sky-400">{task.linkedControl}</span>
                            </>
                          )}
                          {isMatchedBySearch && (
                            <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-sky-500 text-slate-950 font-bold">
                              Matched
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 space-y-1">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          isTaskDone
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isInProgress
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        +{task.weight}% wt
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {task.progress}% done
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-500 py-2 text-center">No tasks mapped to this milestone yet.</div>
          )}
        </div>
      </div>

      {/* Deliverables / Footer */}
      {data.deliverables && data.deliverables.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
            Key Deliverables & Artifacts
          </div>
          <div className="flex flex-wrap gap-1">
            {data.deliverables.map((item, idx) => (
              <span
                key={idx}
                className="text-[9px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700 flex items-center space-x-1"
              >
                <FileText className="w-2.5 h-2.5 text-sky-400" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Owner & Target Date */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="truncate max-w-[220px]">
          Lead Owner: <strong className="text-slate-200">{data.owner}</strong>
        </span>
        <span className="text-sky-400 font-medium">
          Target: {data.targetDate || data.month}
        </span>
      </div>
    </div>
  );
};

interface RoadmapSvgTimelineProps {
  trajectoryPoints: RoadmapTrajectoryPoint[];
  selectedMilestoneId?: string;
  onSelectMilestone: (point: RoadmapTrajectoryPoint) => void;
  searchQuery?: string;
  statusFilter?: string;
}

const RoadmapSvgTimeline: React.FC<RoadmapSvgTimelineProps> = ({
  trajectoryPoints,
  selectedMilestoneId,
  onSelectMilestone,
  searchQuery = '',
  statusFilter = 'ALL'
}) => {
  if (!trajectoryPoints || trajectoryPoints.length === 0) return null;

  const count = trajectoryPoints.length;
  const svgWidth = 1020;
  const svgHeight = 215;
  const startX = 65;
  const endX = svgWidth - 65;
  const trackY = 82;
  const barY = 132;
  const barHeight = 24;
  const barWidth = 92;

  // Calculate completed index
  const completedCount = trajectoryPoints.filter(p => p.status === 'Completed').length;
  const activeFraction = count > 1 ? Math.min(1, (completedCount + 0.5) / count) : 1;
  const activeTrackLength = startX + (endX - startX) * activeFraction;

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Milestone className="w-4 h-4 text-sky-400" />
            <span>ISMS Compliance Horizon & Stage-Gate Track</span>
          </h3>
          <p className="text-xs text-slate-400">
            Interactive visual stage-gate track with animated milestone progress bars, stage status indicators, and readiness weight contributions.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-300 shrink-0">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
            <span>Completed ({completedCount})</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse inline-block shadow-sm" />
            <span>In Progress ({trajectoryPoints.filter(p => p.status === 'In Progress').length})</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
            <span>Upcoming ({trajectoryPoints.filter(p => p.status === 'Upcoming').length})</span>
          </span>
        </div>
      </div>

      {/* SVG Canvas with Horizontal Scroll on mobile */}
      <div className="w-full overflow-x-auto pb-1">
        <div className="min-w-[820px]">
          <motion.svg
            key={`${statusFilter}-${searchQuery}-${count}`}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="roadmapSpineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="60%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>

              <linearGradient id="barCompletedSvgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              <linearGradient id="barInProgSvgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>

              <linearGradient id="nodeActiveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="svgRoadmapGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Rail Track */}
            <line
              x1={startX}
              y1={trackY}
              x2={endX}
              y2={trackY}
              stroke="#1E293B"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Animated Active Progress Track Line */}
            <motion.line
              x1={startX}
              y1={trackY}
              x2={activeTrackLength}
              y2={trackY}
              stroke="url(#roadmapSpineGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />

            {/* Milestone Elements */}
            {trajectoryPoints.map((point, idx) => {
              const cx = count > 1 ? startX + idx * ((endX - startX) / (count - 1)) : svgWidth / 2;
              const isSelected = selectedMilestoneId === point.milestoneId || selectedMilestoneId === point.phase;
              const isCompleted = point.status === 'Completed';
              const isInProgress = point.status === 'In Progress';
              const progressPercent = Math.min(100, Math.max(0, point.milestoneProgressPercentage ?? (isCompleted ? 100 : isInProgress ? 65 : 0)));

              return (
                <g
                  key={point.milestoneId || idx}
                  className="cursor-pointer group"
                  onClick={() => onSelectMilestone(point)}
                >
                  {/* Top Phase Badge */}
                  <motion.text
                    x={cx}
                    y={28}
                    textAnchor="middle"
                    fill={isSelected ? '#38BDF8' : isCompleted ? '#34D399' : isInProgress ? '#38BDF8' : '#94A3B8'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    letterSpacing="0.5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 28 }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                  >
                    {point.phase}
                  </motion.text>

                  {/* Top Month Label */}
                  <motion.text
                    x={cx}
                    y={44}
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize="10"
                    fontWeight="600"
                    initial={{ opacity: 0, y: 38 }}
                    animate={{ opacity: 1, y: 44 }}
                    transition={{ duration: 0.35, delay: idx * 0.06 + 0.05 }}
                  >
                    {point.month}
                  </motion.text>

                  {/* Target Date Pill text */}
                  <motion.text
                    x={cx}
                    y={58}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="8.5"
                    fontFamily="monospace"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, delay: idx * 0.06 + 0.1 }}
                  >
                    {point.targetDate?.split('-').slice(1).join('/') || point.month}
                  </motion.text>

                  {/* Connector Line from Spine to Milestone Bar */}
                  <motion.line
                    x1={cx}
                    y1={trackY + 16}
                    x2={cx}
                    y2={barY}
                    stroke={isSelected ? '#38BDF8' : isCompleted ? '#10B981' : isInProgress ? '#0EA5E9' : '#334155'}
                    strokeWidth="1.5"
                    strokeDasharray={isCompleted ? 'none' : '3 3'}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 + 0.15 }}
                  />

                  {/* Pulsing Halo for Active Milestone */}
                  {isInProgress && (
                    <motion.circle
                      cx={cx}
                      cy={trackY}
                      r={18}
                      fill="#0EA5E9"
                      fillOpacity={0.25}
                      animate={{
                        r: [16, 23, 16],
                        opacity: [0.3, 0.65, 0.3]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.2,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  {/* Selected Outer Ring */}
                  {isSelected && (
                    <circle
                      cx={cx}
                      cy={trackY}
                      r={19}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Stage Node Circle with Framer Motion entrance */}
                  <motion.circle
                    cx={cx}
                    cy={trackY}
                    r={14}
                    fill={isCompleted ? '#064E3B' : isInProgress ? '#082F49' : '#0F172A'}
                    stroke={isSelected ? '#38BDF8' : isCompleted ? '#10B981' : isInProgress ? '#38BDF8' : '#334155'}
                    strokeWidth={isSelected ? '3' : '2.5'}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 22,
                      delay: idx * 0.07
                    }}
                    whileHover={{ scale: 1.25, filter: 'drop-shadow(0 0 8px rgba(14,165,233,0.8))' }}
                  />

                  {/* Status Indicator inside Node Circle */}
                  {isCompleted ? (
                    <motion.path
                      d={`M ${cx - 4.5} ${trackY} L ${cx - 1.5} ${trackY + 3.5} L ${cx + 5} ${trackY - 3.5}`}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: idx * 0.07 + 0.25 }}
                    />
                  ) : isInProgress ? (
                    <motion.circle
                      cx={cx}
                      cy={trackY}
                      r={4.5}
                      fill="#38BDF8"
                      animate={{ scale: [0.9, 1.25, 0.9] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                    />
                  ) : (
                    <text
                      x={cx}
                      y={trackY + 3.5}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {idx + 1}
                    </text>
                  )}

                  {/* Milestone Horizontal Progress Bar Container */}
                  <g>
                    {/* Background Bar Track */}
                    <rect
                      x={cx - barWidth / 2}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx={6}
                      fill="#0B1120"
                      stroke={isSelected ? '#38BDF8' : '#1E293B'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                    />

                    {/* Animated Milestone Progress Fill Bar */}
                    <motion.rect
                      x={cx - barWidth / 2}
                      y={barY}
                      height={barHeight}
                      rx={6}
                      fill={isCompleted ? 'url(#barCompletedSvgGrad)' : isInProgress ? 'url(#barInProgSvgGrad)' : '#334155'}
                      initial={{ width: 0 }}
                      animate={{ width: (barWidth * progressPercent) / 100 }}
                      transition={{
                        duration: 0.9,
                        delay: idx * 0.07 + 0.2,
                        ease: "easeOut"
                      }}
                    />

                    {/* Progress Percentage Text inside Bar */}
                    <motion.text
                      x={cx}
                      y={barY + 15}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: idx * 0.07 + 0.35 }}
                    >
                      {progressPercent}% Done
                    </motion.text>
                  </g>

                  {/* Readiness Weight Contribution Badge below bar */}
                  <motion.text
                    x={cx}
                    y={barY + barHeight + 16}
                    textAnchor="middle"
                    fill={isCompleted ? '#34D399' : '#38BDF8'}
                    fontSize="9.5"
                    fontWeight="bold"
                    initial={{ opacity: 0, y: barY + barHeight + 10 }}
                    animate={{ opacity: 1, y: barY + barHeight + 16 }}
                    transition={{ duration: 0.35, delay: idx * 0.07 + 0.3 }}
                  >
                    +{point.readinessContribution}% Wt
                  </motion.text>

                  {/* Milestone Title Preview */}
                  <motion.text
                    x={cx}
                    y={barY + barHeight + 28}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="8"
                    className="font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.85 }}
                    transition={{ duration: 0.35, delay: idx * 0.07 + 0.35 }}
                  >
                    {point.milestoneTitle?.length > 15 ? `${point.milestoneTitle.slice(0, 14)}…` : point.milestoneTitle || point.milestone}
                  </motion.text>
                </g>
              );
            })}
          </motion.svg>
        </div>
      </div>
    </div>
  );
};

const DomainCustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
}> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const isAuditReady = data.implemented >= data.benchmark;

  return (
    <div className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl p-4 max-w-xs sm:max-w-sm w-[300px] text-white space-y-2.5 z-50 select-none">
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
        <div>
          <div className="text-[10px] font-mono text-sky-400 uppercase font-bold">Domain Analytics</div>
          <h4 className="text-xs font-bold text-white mt-0.5">{data.domain}</h4>
        </div>
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
            isAuditReady
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          {isAuditReady ? 'Audit Ready' : 'Remediation Req.'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-slate-400 text-[9px] uppercase block">Implemented</span>
          <span className="font-bold text-sky-400 text-sm">{data.implemented}%</span>
        </div>
        <div>
          <span className="text-slate-400 text-[9px] uppercase block">Audit Benchmark</span>
          <span className="font-bold text-emerald-400 text-sm">{data.benchmark}%</span>
        </div>
        <div>
          <span className="text-slate-400 text-[9px] uppercase block">In Progress</span>
          <span className="font-bold text-amber-400 text-sm">{data.inProgress}%</span>
        </div>
        <div>
          <span className="text-slate-400 text-[9px] uppercase block">Controls Scope</span>
          <span className="font-bold text-slate-200 text-sm">{data.totalControls} Controls</span>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
        <span>Verified Evidence: <strong className="text-slate-200">{data.evidenceCount} Files</strong></span>
        <span className={data.implemented >= data.benchmark ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
          {data.implemented >= data.benchmark ? `+${data.implemented - data.benchmark}% Target Ahead` : `${data.implemented - data.benchmark}% Gap`}
        </span>
      </div>
    </div>
  );
};

const DeadlineCustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
}> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl p-3.5 max-w-xs w-[280px] text-white space-y-2 z-50 select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          Horizon: {data.range}
        </span>
        <span className="text-xs font-bold text-rose-400">
          {data.count} Action Items
        </span>
      </div>
      <div className="text-[11px] text-slate-300">
        Urgency window requiring review and task resolution before target external audit milestones.
      </div>
    </div>
  );
};

export const ReportsAnalyticsModule: React.FC = () => {
  const {
    currentTenant,
    controls,
    evidence,
    findings,
    risks,
    internalAudits,
    managementReviews,
    tasks,
    setActiveModule
  } = useGRC();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'roadmap' | 'maturity_scorecard' | 'domain_readiness' | 'maturity_trends' | 'deadlines' | 'executive_pack' | 'ai_briefing'>('roadmap');
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const [deadlineFilter, setDeadlineFilter] = useState<'ALL' | 'AUDIT' | 'CAPA' | 'EVIDENCE' | 'POLICY'>('ALL');
  const [simulatedWeeks, setSimulatedWeeks] = useState<number>(8); // Target weeks to Stage 1 audit
  const [roadmapSearchQuery, setRoadmapSearchQuery] = useState<string>('');
  const [roadmapStatusFilter, setRoadmapStatusFilter] = useState<'ALL' | 'Completed' | 'In Progress' | 'Upcoming'>('ALL');
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [exportSuccessToast, setExportSuccessToast] = useState<boolean>(false);

  const { showToast } = useToast();

  // AI Executive Briefing & Key Risks State (Gemini 3.8 Flash)
  const [aiBriefingData, setAiBriefingData] = useState<AIExecutiveBriefingData | null>(null);
  const [isLoadingAIBriefing, setIsLoadingAIBriefing] = useState<boolean>(false);
  const [aiBriefingError, setAiBriefingError] = useState<string | null>(null);

  // Predictive Maturity Forecasting State (Gemini 3-Month Projection)
  const [isPredictiveMaturityActive, setIsPredictiveMaturityActive] = useState<boolean>(false);
  const [predictiveMaturityData, setPredictiveMaturityData] = useState<PredictiveMaturityResponse | null>(null);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);

  const handleTogglePredictiveMaturity = async (active: boolean) => {
    setIsPredictiveMaturityActive(active);
    if (active && !predictiveMaturityData) {
      setIsLoadingPredictions(true);
      try {
        const projection = await PredictiveMaturityService.get3MonthProjection(
          DEFAULT_12_MONTH_SNAPSHOTS,
          currentTenant?.name || 'Apex Financial Technologies',
          currentReadinessScore,
          domainReadinessData,
          currentTenant?.externalAuditTimeline?.stage1Date || '2026-10-15'
        );
        setPredictiveMaturityData(projection);
        showToast({
          title: 'Predictive Maturity Forecast Generated',
          message: 'Gemini projected compliance scores for Oct, Nov, Dec 2026',
          type: 'success'
        });
      } catch (err) {
        console.error('Failed to load predictive maturity forecast:', err);
      } finally {
        setIsLoadingPredictions(false);
      }
    }
  };

  const activeMaturitySnapshots = useMemo(() => {
    if (isPredictiveMaturityActive && predictiveMaturityData?.projectedSnapshots) {
      return [...DEFAULT_12_MONTH_SNAPSHOTS, ...predictiveMaturityData.projectedSnapshots];
    }
    return DEFAULT_12_MONTH_SNAPSHOTS;
  }, [isPredictiveMaturityActive, predictiveMaturityData]);

  // Calculate live dynamic metrics from context
  const totalControls = currentTenant?.controls?.length || 93;
  const implementedControls = currentTenant?.controls?.filter(c => c.applicable && c.implementationStatus === 'Implemented').length || 0;
  const inProgressControls = currentTenant?.controls?.filter(c => c.applicable && c.implementationStatus === 'In Progress').length || 0;
  const controlCompletionRate = Math.round((implementedControls / (totalControls || 1)) * 100);

  const verifiedEvidence = evidence.filter(e => e.status === 'Verified').length;
  const totalEvidence = evidence.length || 1;
  const evidenceReadinessRate = Math.round((verifiedEvidence / totalEvidence) * 100);

  const openFindings = findings.filter(f => f.status !== 'Closed Verified');
  const closedFindings = findings.filter(f => f.status === 'Closed Verified');
  const capaClosureRate = findings.length > 0 ? Math.round((closedFindings.length / findings.length) * 100) : 100;

  const currentReadinessScore = currentTenant?.readinessScore || Math.round(
    controlCompletionRate * 0.45 + evidenceReadinessRate * 0.35 + capaClosureRate * 0.20
  );

  // Key Milestones List
  const milestones: MilestoneItem[] = useMemo(() => {
    const stage1 = currentTenant?.externalAuditTimeline?.stage1Date || '2026-10-15';
    const stage2 = currentTenant?.externalAuditTimeline?.stage2Date || '2026-11-20';

    return [
      {
        id: 'M1',
        phase: 'Phase 1',
        title: 'Context, Scope & Leadership Charter',
        clause: 'Clauses 4.1-4.3 & 5.1',
        targetDate: '2026-03-15',
        completedDate: '2026-03-12',
        status: 'Completed',
        readinessContribution: 15,
        owner: 'Chief Information Security Officer (CISO)',
        deliverables: ['ISMS Scope Statement', 'Interested Parties Matrix', 'CEO Information Security Policy'],
        notes: 'Signed off by Executive Committee and published to all personnel.'
      },
      {
        id: 'M2',
        phase: 'Phase 2',
        title: 'Statement of Applicability (SoA) Baseline Lock',
        clause: 'Clause 6.1.3 & Annex A',
        targetDate: '2026-04-30',
        completedDate: currentTenant?.soaBaselineLocked ? (currentTenant.soaBaselineTimestamp?.split('T')[0] || '2026-04-28') : undefined,
        status: currentTenant?.soaBaselineLocked ? 'Completed' : 'In Progress',
        readinessContribution: 20,
        owner: 'Lead ISMS Implementer',
        deliverables: ['93 Annex A Control Applicability Matrix', 'SHA-256 Baseline Integrity Seal', 'Exclusion Justifications'],
        notes: currentTenant?.soaBaselineLocked ? 'Cryptographic hash generated and locked.' : 'Pending justification review.'
      },
      {
        id: 'M3',
        phase: 'Phase 3',
        title: 'Core ISMS Governance Policies Synthesis',
        clause: 'Clause 7.5',
        targetDate: '2026-06-01',
        completedDate: '2026-05-25',
        status: 'Completed',
        readinessContribution: 15,
        owner: 'Compliance Officer',
        deliverables: ['Access Control Policy', 'Incident Response Plan', 'Vendor Security Policy', 'BCP / DR Plan'],
        notes: 'All 12 mandatory ISO 27001 policies generated, approved, and version-controlled.'
      },
      {
        id: 'M4',
        phase: 'Phase 4',
        title: 'Digital MoU & Departmental Security Commits',
        clause: 'Clause 5.3 & 7.3',
        targetDate: '2026-06-30',
        completedDate: currentTenant?.mou?.executed ? (currentTenant.mou.timestamp ? currentTenant.mou.timestamp.split('T')[0] : '2026-06-28') : '2026-06-28',
        status: currentTenant?.mou?.executed ? 'Completed' : 'In Progress',
        readinessContribution: 10,
        owner: 'Department Leads & CISO',
        deliverables: ['Digital MoU Signed', 'Security Awareness Rollout', 'Departmental Evidence SLAs'],
        notes: 'Binding compliance commitment signed by all department heads.'
      },
      {
        id: 'M5',
        phase: 'Phase 5',
        title: 'Annex A Technical & Operational Evidence Collection',
        clause: 'Clause 8.1 & Annex A.5-A.8',
        targetDate: '2026-08-31',
        status: evidenceReadinessRate >= 80 ? 'Completed' : 'In Progress',
        readinessContribution: 20,
        owner: 'Security Operations & DevOps',
        deliverables: ['Vulnerability Assessment Reports', 'Access Matrix Spot Checks', 'Cloud Drift Audits', 'Backup Test Records'],
        notes: `${verifiedEvidence} of ${totalEvidence} evidence artifacts formally verified.`
      },
      {
        id: 'M6',
        phase: 'Phase 6',
        title: 'Internal Audit (9.2) & Management Review (9.3)',
        clause: 'Clauses 9.2 & 9.3',
        targetDate: '2026-09-30',
        status: internalAudits.length > 0 && managementReviews.some(m => m.status === 'Signed Off' || m.signoffTimestamp) ? 'Completed' : 'In Progress',
        readinessContribution: 10,
        owner: 'Lead Internal Auditor & Executive Board',
        deliverables: ['Internal Audit Report (Clause 9.2)', 'Management Review Minutes & Action Log (Clause 9.3)'],
        notes: 'Mandatory pre-requisite for Stage 1 external certification.'
      },
      {
        id: 'M7',
        phase: 'Phase 7',
        title: 'Stage 1 Documentation Audit',
        clause: 'External Certification Body',
        targetDate: stage1,
        status: 'Upcoming',
        readinessContribution: 5,
        owner: 'Lead External Auditor (BSI / TÜV / DNV)',
        deliverables: ['Stage 1 Adequacy Audit Report', 'Clarification of Scope & SoA', 'Stage 2 Audit Plan'],
        notes: 'Formal review of documentation, policy architecture, and internal audit evidence.'
      },
      {
        id: 'M8',
        phase: 'Phase 8',
        title: 'Stage 2 Certification Audit & ISO 27001 Award',
        clause: 'Final Certification Issuance',
        targetDate: stage2,
        status: 'Upcoming',
        readinessContribution: 5,
        owner: 'Accredited Certification Registrar',
        deliverables: ['Stage 2 Onsite/Remote Audit Report', 'Audit Finding Closures', 'ISO/IEC 27001:2022 Certificate'],
        notes: 'Validation of operational effectiveness across all 93 controls.'
      }
    ];
  }, [currentTenant, evidenceReadinessRate, verifiedEvidence, totalEvidence, internalAudits, managementReviews]);

  // Historical & Projected Readiness Trajectory Data for Recharts with Granular Contributing Tasks
  const roadmapTrajectoryData: RoadmapTrajectoryPoint[] = useMemo(() => {
    const stage1 = currentTenant?.externalAuditTimeline?.stage1Date || '2026-10-15';
    const stage2 = currentTenant?.externalAuditTimeline?.stage2Date || '2026-11-20';

    // Check specific tasks from context
    const tsk1 = tasks.find(t => t.id === 'tsk_1');
    const tsk2 = tasks.find(t => t.id === 'tsk_2');
    const tsk3 = tasks.find(t => t.id === 'tsk_3');
    const tsk4 = tasks.find(t => t.id === 'tsk_4');

    // M1: Phase 1 Tasks
    const m1Tasks: MilestoneContributingTask[] = [
      {
        id: 'M1-T1',
        title: 'Publish Board-Approved ISMS Scope Statement (Clause 4.3)',
        category: 'Scope & Governance',
        department: 'Information Security & Legal',
        assignedTo: 'SriKarthiK (CISO)',
        status: 'Done',
        priority: 'Critical',
        dueDate: '2026-03-05',
        weight: 35,
        progress: 100,
        contribution: 35,
        deliverable: 'ISMS Scope Statement v1.0',
        linkedControl: 'Clause 4.3'
      },
      {
        id: 'M1-T2',
        title: 'Map Interested Parties & Legal Regulatory Register (Clause 4.2)',
        category: 'Compliance',
        department: 'Legal & Compliance',
        assignedTo: 'Elena Rostova',
        status: 'Done',
        priority: 'High',
        dueDate: '2026-03-08',
        weight: 35,
        progress: 100,
        contribution: 35,
        deliverable: 'Interested Parties Register',
        linkedControl: 'Clause 4.2'
      },
      {
        id: 'M1-T3',
        title: 'Executive Sign-Off on CEO Information Security Charter (Clause 5.1)',
        category: 'Executive Commitment',
        department: 'Executive Board',
        assignedTo: 'Chief Executive Officer',
        status: 'Done',
        priority: 'Critical',
        dueDate: '2026-03-12',
        weight: 30,
        progress: 100,
        contribution: 30,
        deliverable: 'CEO InfoSec Policy Charter',
        linkedControl: 'Clause 5.1'
      }
    ];

    // M2: Phase 2 Tasks
    const soaLocked = !!currentTenant?.soaBaselineLocked;
    const m2Tasks: MilestoneContributingTask[] = [
      {
        id: 'M2-T1',
        title: 'Evaluate Applicability for all 93 ISO 27001 Annex A Controls',
        category: 'Risk & Applicability',
        department: 'Security Engineering',
        assignedTo: 'SriKarthiK',
        status: 'Done',
        priority: 'Critical',
        dueDate: '2026-04-15',
        weight: 40,
        progress: 100,
        contribution: 40,
        deliverable: '93 Annex A Control Matrix',
        linkedControl: 'Clause 6.1.3'
      },
      {
        id: 'M2-T2',
        title: 'Document Formal Justifications for Excluded Organizational Controls',
        category: 'Compliance',
        department: 'Legal & Compliance',
        assignedTo: 'Elena Rostova',
        status: 'Done',
        priority: 'High',
        dueDate: '2026-04-22',
        weight: 30,
        progress: 100,
        contribution: 30,
        deliverable: 'Exclusion Justification Rubric',
        linkedControl: 'Clause 6.1.3'
      },
      {
        id: 'M2-T3',
        title: 'Generate Cryptographic SHA-256 Baseline Integrity Seal & Lock SoA',
        category: 'SecOps',
        department: 'DevOps & SecOps',
        assignedTo: 'Priya Sharma',
        status: soaLocked ? 'Done' : 'In Progress',
        priority: 'High',
        dueDate: '2026-04-28',
        weight: 30,
        progress: soaLocked ? 100 : 60,
        contribution: soaLocked ? 30 : 18,
        deliverable: 'Cryptographic SHA-256 SoA Seal',
        linkedControl: 'Annex A.5.1'
      }
    ];

    // M3: Phase 3 Tasks
    const m3Tasks: MilestoneContributingTask[] = [
      {
        id: 'M3-T1',
        title: 'Synthesize Access Control & Privileged Access Policy (POL-SEC-01)',
        category: 'Policy Synthesis',
        department: 'IT Security',
        assignedTo: 'SriKarthiK',
        status: 'Done',
        priority: 'High',
        dueDate: '2026-05-10',
        weight: 25,
        progress: 100,
        contribution: 25,
        deliverable: 'Access Control Policy',
        linkedControl: 'Annex A.5.15'
      },
      {
        id: 'M3-T2',
        title: 'Publish Incident Management & 24h Regulatory Breach SOP (SOP-INC-01)',
        category: 'Incident Response',
        department: 'SecOps',
        assignedTo: 'Priya Sharma',
        status: 'Done',
        priority: 'Critical',
        dueDate: '2026-05-18',
        weight: 25,
        progress: 100,
        contribution: 25,
        deliverable: 'Incident Response Plan',
        linkedControl: 'Annex A.5.24'
      },
      {
        id: 'M3-T3',
        title: 'Finalize Supplier Security Policy with Vendor Tiering (POL-SUP-04)',
        category: 'Vendor Risk',
        department: 'Procurement & Legal',
        assignedTo: 'James Sterling',
        status: tsk2?.status === 'Done' ? 'Done' : 'Done',
        priority: 'Medium',
        dueDate: '2026-05-22',
        weight: 25,
        progress: 100,
        contribution: 25,
        deliverable: 'Vendor Security Policy',
        linkedControl: 'Annex A.5.19'
      },
      {
        id: 'M3-T4',
        title: 'Formulate Business Continuity & Disaster Recovery Plan (POL-BCP-05)',
        category: 'Resilience',
        department: 'Operations',
        assignedTo: 'CISO & DevOps',
        status: 'Done',
        priority: 'High',
        dueDate: '2026-05-25',
        weight: 25,
        progress: 100,
        contribution: 25,
        deliverable: 'BCP / DR Framework',
        linkedControl: 'Annex A.5.29'
      }
    ];

    // M4: Phase 4 Tasks
    const mouExecuted = !!currentTenant?.mou?.executed;
    const m4Tasks: MilestoneContributingTask[] = [
      {
        id: 'M4-T1',
        title: 'Conduct Departmental Security Briefings with Engineering & HR',
        category: 'Awareness',
        department: 'People Operations',
        assignedTo: 'SriKarthiK',
        status: 'Done',
        priority: 'Medium',
        dueDate: '2026-06-12',
        weight: 30,
        progress: 100,
        contribution: 30,
        deliverable: 'Departmental Training Logs',
        linkedControl: 'Clause 7.3'
      },
      {
        id: 'M4-T2',
        title: 'Legal Counsel Review of Compliance Commitment SLAs',
        category: 'Governance',
        department: 'Legal Counsel',
        assignedTo: 'Alex Rivera',
        status: 'Done',
        priority: 'High',
        dueDate: '2026-06-20',
        weight: 35,
        progress: 100,
        contribution: 35,
        deliverable: 'MoU Compliance Clauses',
        linkedControl: 'Clause 5.3'
      },
      {
        id: 'M4-T3',
        title: 'Cryptographic Digital Signatures on Memorandum of Understanding',
        category: 'Executive Commit',
        department: 'Executive Leadership',
        assignedTo: 'CEO & Department Heads',
        status: mouExecuted ? 'Done' : 'In Progress',
        priority: 'Critical',
        dueDate: '2026-06-28',
        weight: 35,
        progress: mouExecuted ? 100 : 70,
        contribution: mouExecuted ? 35 : 24.5,
        deliverable: 'Signed Digital MoU',
        linkedControl: 'Clause 5.3'
      }
    ];

    // M5: Phase 5 Tasks
    const tsk1Status = (tsk1?.status as 'Done' | 'In Progress' | 'Under Review' | 'To Do') || 'In Progress';
    const m5Tasks: MilestoneContributingTask[] = [
      {
        id: 'M5-T1',
        title: 'Upload Q3 CrowdStrike EDR Agent Coverage Export',
        category: 'Evidence Collection',
        department: 'Software Engineering & DevOps',
        assignedTo: 'Priya Sharma',
        status: tsk1Status,
        priority: 'High',
        dueDate: '2026-09-05',
        weight: 25,
        progress: tsk1Status === 'Done' ? 100 : tsk1Status === 'In Progress' ? 70 : 30,
        contribution: tsk1Status === 'Done' ? 25 : tsk1Status === 'In Progress' ? 17.5 : 7.5,
        deliverable: 'EDR Endpoint Log Report',
        linkedControl: 'Annex A.8.7'
      },
      {
        id: 'M5-T2',
        title: 'Verify Okta User Access & Privileged Account Recertification',
        category: 'Access Review',
        department: 'IT Administration',
        assignedTo: 'James Sterling',
        status: 'Done',
        priority: 'High',
        dueDate: '2026-07-20',
        weight: 25,
        progress: 100,
        contribution: 25,
        deliverable: 'Privileged Access Audit Log',
        linkedControl: 'Annex A.5.15'
      },
      {
        id: 'M5-T3',
        title: 'Execute Automated SAST Code Scanning & Cloud Drift Audits',
        category: 'SecOps',
        department: 'Security Operations',
        assignedTo: 'Priya Sharma',
        status: 'Done',
        priority: 'High',
        dueDate: '2026-07-28',
        weight: 25,
        progress: 100,
        contribution: 25,
        deliverable: 'SAST & Drift Scan Artifacts',
        linkedControl: 'Annex A.8.8'
      },
      {
        id: 'M5-T4',
        title: 'Collect AWS Cross-Region DR Backup & Immutable Log Evidence',
        category: 'Cloud Infrastructure',
        department: 'Operations',
        assignedTo: 'DevOps Team',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2026-08-15',
        weight: 25,
        progress: 60,
        contribution: 15,
        deliverable: 'AWS DR Backup Validation',
        linkedControl: 'Annex A.8.13'
      }
    ];

    // M6: Phase 6 Tasks
    const hasInternalAudit = internalAudits.length > 0;
    const hasMRMSignoff = managementReviews.some(m => m.status === 'Signed Off' || m.signoffTimestamp);
    const m6Tasks: MilestoneContributingTask[] = [
      {
        id: 'M6-T1',
        title: 'Conduct Comprehensive Clause 9.2 Internal Audit Across In-Scope Units',
        category: 'Internal Audit',
        department: 'Internal Audit & GRC',
        assignedTo: 'Lead Internal Auditor',
        status: hasInternalAudit ? 'Done' : 'In Progress',
        priority: 'Critical',
        dueDate: '2026-08-20',
        weight: 40,
        progress: hasInternalAudit ? 100 : 60,
        contribution: hasInternalAudit ? 40 : 24,
        deliverable: 'Clause 9.2 Audit Report',
        linkedControl: 'Clause 9.2'
      },
      {
        id: 'M6-T2',
        title: 'Executive Management Review Meeting (MRM) Sign-Off on ISMS Performance',
        category: 'Executive Review',
        department: 'Executive Board',
        assignedTo: 'CEO & CISO',
        status: hasMRMSignoff ? 'Done' : 'In Progress',
        priority: 'Critical',
        dueDate: '2026-08-26',
        weight: 35,
        progress: hasMRMSignoff ? 100 : 70,
        contribution: hasMRMSignoff ? 35 : 24.5,
        deliverable: 'Signed MRM Minutes (Clause 9.3)',
        linkedControl: 'Clause 9.3'
      },
      {
        id: 'M6-T3',
        title: 'Log and Remediate Internal Audit Minor Non-Conformities (CAPA)',
        category: 'Remediation',
        department: 'Compliance',
        assignedTo: 'SriKarthiK',
        status: openFindings.length === 0 ? 'Done' : 'In Progress',
        priority: 'High',
        dueDate: '2026-08-30',
        weight: 25,
        progress: capaClosureRate,
        contribution: Math.round((25 * capaClosureRate) / 100),
        deliverable: 'CAPA Resolution Register',
        linkedControl: 'Clause 10.1'
      }
    ];

    // Sep 2026: Pre-Stage 1 Refinement Tasks
    const tsk3Status = (tsk3?.status as 'Done' | 'In Progress' | 'Under Review' | 'To Do') || 'To Do';
    const tsk4Status = (tsk4?.status as 'Done' | 'In Progress' | 'Under Review' | 'To Do') || 'In Progress';
    const sepTasks: MilestoneContributingTask[] = [
      {
        id: 'SEP-T1',
        title: 'Complete Stage 1 Audit Document Walkthrough Prep',
        category: 'Audit Prep',
        department: 'Information Security',
        assignedTo: 'SriKarthiK',
        status: tsk3Status,
        priority: 'High',
        dueDate: '2026-09-08',
        weight: 35,
        progress: tsk3Status === 'Done' ? 100 : tsk3Status === 'In Progress' ? 50 : 20,
        contribution: tsk3Status === 'Done' ? 35 : tsk3Status === 'In Progress' ? 17.5 : 7,
        deliverable: 'Pre-Audit Auditor Briefing Pack',
        linkedControl: 'Clause 9.2'
      },
      {
        id: 'SEP-T2',
        title: 'Simulate Annual AWS Disaster Recovery Cross-Region Failover Drill',
        category: 'Resilience Test',
        department: 'Operations',
        assignedTo: 'Priya Sharma',
        status: tsk4Status,
        priority: 'High',
        dueDate: '2026-09-12',
        weight: 35,
        progress: tsk4Status === 'Done' ? 100 : tsk4Status === 'In Progress' ? 65 : 20,
        contribution: tsk4Status === 'Done' ? 35 : tsk4Status === 'In Progress' ? 22.75 : 7,
        deliverable: 'DR Drill Test Minutes',
        linkedControl: 'Annex A.8.14'
      },
      {
        id: 'SEP-T3',
        title: 'Freeze Immutable Evidence Repository & Cross-Standard Crosswalk',
        category: 'Archive',
        department: 'Lead Implementer',
        assignedTo: 'Elena Rostova',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: '2026-09-22',
        weight: 30,
        progress: 40,
        contribution: 12,
        deliverable: 'Evidence Repository Snapshot',
        linkedControl: 'Clause 7.5'
      }
    ];

    // M7: Stage 1 Documentation Audit Tasks
    const m7Tasks: MilestoneContributingTask[] = [
      {
        id: 'M7-T1',
        title: 'Submit Formal Stage 1 Documentation Pack to Accredited Registrar',
        category: 'External Audit',
        department: 'Certification Body',
        assignedTo: 'Lead Auditor (BSI)',
        status: 'To Do',
        priority: 'Critical',
        dueDate: stage1,
        weight: 40,
        progress: 10,
        contribution: 4,
        deliverable: 'Stage 1 Adequacy Report',
        linkedControl: 'External Audit'
      },
      {
        id: 'M7-T2',
        title: 'Conduct Stage 1 Opening Meeting & SoA Adequacy Defense Session',
        category: 'External Audit',
        department: 'Executive Leadership & CISO',
        assignedTo: 'SriKarthiK',
        status: 'To Do',
        priority: 'High',
        dueDate: stage1,
        weight: 35,
        progress: 0,
        contribution: 0,
        deliverable: 'Stage 1 Opening Protocol',
        linkedControl: 'Clauses 4-10'
      },
      {
        id: 'M7-T3',
        title: 'Address Clarification Requests & Finalize Stage 2 Fieldwork Scope',
        category: 'Audit Follow-up',
        department: 'Compliance',
        assignedTo: 'Elena Rostova',
        status: 'To Do',
        priority: 'High',
        dueDate: stage1,
        weight: 25,
        progress: 0,
        contribution: 0,
        deliverable: 'Stage 2 Fieldwork Plan',
        linkedControl: 'ISO 27001'
      }
    ];

    // M8: Stage 2 Certification Audit Tasks
    const m8Tasks: MilestoneContributingTask[] = [
      {
        id: 'M8-T1',
        title: 'Coordinate 3-Day Onsite/Remote Operational Effectiveness Fieldwork',
        category: 'Certification Audit',
        department: 'Accredited Registrar',
        assignedTo: 'Lead Auditor',
        status: 'To Do',
        priority: 'Critical',
        dueDate: stage2,
        weight: 40,
        progress: 0,
        contribution: 0,
        deliverable: 'Stage 2 Audit Findings Report',
        linkedControl: 'Annex A.5 - A.8'
      },
      {
        id: 'M8-T2',
        title: 'Facilitate Live Departmental Evidence Interviews & Control Testing',
        category: 'Operational Testing',
        department: 'All In-Scope Departments',
        assignedTo: 'Department Leads',
        status: 'To Do',
        priority: 'High',
        dueDate: stage2,
        weight: 35,
        progress: 0,
        contribution: 0,
        deliverable: 'Auditor Interview Logs',
        linkedControl: '93 Controls'
      },
      {
        id: 'M8-T3',
        title: 'Independent Review Board Sign-Off & Accredited Certificate Award',
        category: 'Award',
        department: 'Accreditation Board',
        assignedTo: 'UKAS / ANAB Registrar',
        status: 'To Do',
        priority: 'Critical',
        dueDate: stage2,
        weight: 25,
        progress: 0,
        contribution: 0,
        deliverable: 'ISO/IEC 27001:2022 Certificate',
        linkedControl: 'Accreditation'
      }
    ];

    // Calculate total progress percentage for each milestone based on task contribution sum
    const calcMilestoneProgress = (taskList: MilestoneContributingTask[]) => {
      const sum = taskList.reduce((acc, t) => acc + (t.contribution || 0), 0);
      return Math.min(100, Math.round(sum));
    };

    return [
      {
        month: 'Mar 2026',
        milestone: 'Context & Scope',
        milestoneId: 'M1',
        phase: 'Phase 1',
        clause: 'Clauses 4.1-4.3 & 5.1',
        milestoneTitle: 'Context, Scope & Leadership Charter',
        actualReadiness: 15,
        targetReadiness: 15,
        evidenceRate: 10,
        controlRate: 20,
        status: 'Completed',
        readinessContribution: 15,
        targetDate: '2026-03-15',
        completedDate: '2026-03-12',
        owner: 'Chief Information Security Officer (CISO)',
        deliverables: ['ISMS Scope Statement', 'Interested Parties Matrix', 'CEO InfoSec Policy'],
        milestoneProgressPercentage: calcMilestoneProgress(m1Tasks),
        contributingTasks: m1Tasks
      },
      {
        month: 'Apr 2026',
        milestone: 'SoA Baseline Lock',
        milestoneId: 'M2',
        phase: 'Phase 2',
        clause: 'Clause 6.1.3 & Annex A',
        milestoneTitle: 'Statement of Applicability (SoA) Baseline Lock',
        actualReadiness: 35,
        targetReadiness: 35,
        evidenceRate: 25,
        controlRate: 40,
        status: soaLocked ? 'Completed' : 'In Progress',
        readinessContribution: 20,
        targetDate: '2026-04-30',
        completedDate: soaLocked ? '2026-04-28' : undefined,
        owner: 'Lead ISMS Implementer',
        deliverables: ['93 Annex A Control Matrix', 'SHA-256 Baseline Integrity Seal', 'Exclusion Justifications'],
        milestoneProgressPercentage: calcMilestoneProgress(m2Tasks),
        contributingTasks: m2Tasks
      },
      {
        month: 'May 2026',
        milestone: 'Policy Synthesis',
        milestoneId: 'M3',
        phase: 'Phase 3',
        clause: 'Clause 7.5 (Documented Info)',
        milestoneTitle: 'Core ISMS Governance Policies Synthesis',
        actualReadiness: 50,
        targetReadiness: 50,
        evidenceRate: 40,
        controlRate: 60,
        status: 'Completed',
        readinessContribution: 15,
        targetDate: '2026-06-01',
        completedDate: '2026-05-25',
        owner: 'Compliance Officer',
        deliverables: ['Access Control Policy', 'Incident Response SOP', 'Vendor Security Policy', 'BCP / DR Plan'],
        milestoneProgressPercentage: calcMilestoneProgress(m3Tasks),
        contributingTasks: m3Tasks
      },
      {
        month: 'Jun 2026',
        milestone: 'MoU Sign-off',
        milestoneId: 'M4',
        phase: 'Phase 4',
        clause: 'Clauses 5.3 & 7.3',
        milestoneTitle: 'Digital MoU & Departmental Security Commits',
        actualReadiness: 60,
        targetReadiness: 60,
        evidenceRate: 55,
        controlRate: 70,
        status: mouExecuted ? 'Completed' : 'In Progress',
        readinessContribution: 10,
        targetDate: '2026-06-30',
        completedDate: mouExecuted ? '2026-06-28' : undefined,
        owner: 'Department Leads & CISO',
        deliverables: ['Digital MoU Signed', 'Security Awareness Rollout', 'Departmental Evidence SLAs'],
        milestoneProgressPercentage: calcMilestoneProgress(m4Tasks),
        contributingTasks: m4Tasks
      },
      {
        month: 'Jul 2026',
        milestone: 'Evidence Sampling',
        milestoneId: 'M5',
        phase: 'Phase 5',
        clause: 'Clause 8.1 & Annex A.5-A.8',
        milestoneTitle: 'Annex A Technical & Operational Evidence Collection',
        actualReadiness: 72,
        targetReadiness: 70,
        evidenceRate: 68,
        controlRate: 80,
        status: evidenceReadinessRate >= 80 ? 'Completed' : 'In Progress',
        readinessContribution: 20,
        targetDate: '2026-08-31',
        owner: 'Security Operations & DevOps',
        deliverables: ['Vulnerability Reports', 'Access Matrix Spot Checks', 'Cloud Drift Audits', 'Backup Test Records'],
        milestoneProgressPercentage: calcMilestoneProgress(m5Tasks),
        contributingTasks: m5Tasks
      },
      {
        month: 'Aug 2026',
        milestone: 'Internal Audit (9.2)',
        milestoneId: 'M6',
        phase: 'Phase 6',
        clause: 'Clauses 9.2 & 9.3',
        milestoneTitle: 'Internal Audit (9.2) & Management Review (9.3)',
        actualReadiness: currentReadinessScore,
        targetReadiness: 80,
        evidenceRate: evidenceReadinessRate,
        controlRate: controlCompletionRate,
        status: hasInternalAudit && hasMRMSignoff ? 'Completed' : 'In Progress',
        readinessContribution: 10,
        targetDate: '2026-09-30',
        owner: 'Lead Internal Auditor & Executive Board',
        deliverables: ['Clause 9.2 Audit Report', 'MRM Minutes & Action Log (Clause 9.3)', 'CAPA Log'],
        milestoneProgressPercentage: calcMilestoneProgress(m6Tasks),
        contributingTasks: m6Tasks
      },
      {
        month: 'Sep 2026',
        milestone: 'MRM Review (9.3)',
        milestoneId: 'M-PRE',
        phase: 'Phase 6.5',
        clause: 'Pre-Stage 1 Readiness',
        milestoneTitle: 'Pre-Audit Refinement & Failover Simulation',
        actualReadiness: null,
        targetReadiness: 90,
        projectedReadiness: Math.min(100, currentReadinessScore + 10),
        status: 'In Progress',
        readinessContribution: 10,
        targetDate: '2026-09-25',
        owner: 'Lead Implementer & DevOps',
        deliverables: ['Pre-Audit Walkthrough', 'AWS DR Failover Record', 'Evidence Freeze'],
        milestoneProgressPercentage: calcMilestoneProgress(sepTasks),
        contributingTasks: sepTasks
      },
      {
        month: 'Oct 2026',
        milestone: 'Stage 1 Audit',
        milestoneId: 'M7',
        phase: 'Phase 7',
        clause: 'External Certification Body',
        milestoneTitle: 'Stage 1 Documentation Audit',
        actualReadiness: null,
        targetReadiness: 95,
        projectedReadiness: Math.min(100, currentReadinessScore + 18),
        status: 'Upcoming',
        readinessContribution: 5,
        targetDate: stage1,
        owner: 'Lead External Auditor (BSI / TÜV / DNV)',
        deliverables: ['Stage 1 Adequacy Audit Report', 'Scope & SoA Clarification', 'Stage 2 Audit Plan'],
        milestoneProgressPercentage: calcMilestoneProgress(m7Tasks),
        contributingTasks: m7Tasks
      },
      {
        month: 'Nov 2026',
        milestone: 'Stage 2 Certification',
        milestoneId: 'M8',
        phase: 'Phase 8',
        clause: 'Final Certification Issuance',
        milestoneTitle: 'Stage 2 Certification Audit & ISO 27001 Award',
        actualReadiness: null,
        targetReadiness: 100,
        projectedReadiness: 100,
        status: 'Upcoming',
        readinessContribution: 5,
        targetDate: stage2,
        owner: 'Accredited Certification Registrar',
        deliverables: ['Stage 2 Audit Report', 'Audit Finding Closures', 'ISO/IEC 27001:2022 Certificate'],
        milestoneProgressPercentage: calcMilestoneProgress(m8Tasks),
        contributingTasks: m8Tasks
      }
    ];
  }, [currentTenant, tasks, currentReadinessScore, evidenceReadinessRate, controlCompletionRate, internalAudits, managementReviews, openFindings, capaClosureRate]);

  // Filtered trajectory points for the Recharts visualization
  const filteredRoadmapTrajectoryData: RoadmapTrajectoryPoint[] = useMemo(() => {
    const q = roadmapSearchQuery.trim().toLowerCase();

    return roadmapTrajectoryData.filter(point => {
      // Status Filter
      if (roadmapStatusFilter !== 'ALL' && point.status !== roadmapStatusFilter) {
        return false;
      }

      if (!q) return true;

      // Point metadata matches
      const matchesMeta =
        point.milestoneTitle.toLowerCase().includes(q) ||
        point.milestone.toLowerCase().includes(q) ||
        point.phase.toLowerCase().includes(q) ||
        point.clause.toLowerCase().includes(q) ||
        point.owner.toLowerCase().includes(q) ||
        point.month.toLowerCase().includes(q) ||
        point.deliverables.some(d => d.toLowerCase().includes(q));

      if (matchesMeta) return true;

      // Contributing task matches
      const matchesTask = point.contributingTasks.some(t =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.assignedTo.toLowerCase().includes(q) ||
        (t.deliverable && t.deliverable.toLowerCase().includes(q)) ||
        (t.linkedControl && t.linkedControl.toLowerCase().includes(q)) ||
        t.priority.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      );

      return matchesTask;
    });
  }, [roadmapTrajectoryData, roadmapSearchQuery, roadmapStatusFilter]);

  // Aggregate all matching specific tasks across the entire roadmap
  const allMatchingTasks = useMemo(() => {
    const q = roadmapSearchQuery.trim().toLowerCase();
    if (!q) return [];

    const list: Array<{
      task: MilestoneContributingTask;
      milestoneId: string;
      milestoneTitle: string;
      phase: string;
      month: string;
    }> = [];

    roadmapTrajectoryData.forEach(point => {
      point.contributingTasks.forEach(t => {
        const matches =
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.assignedTo.toLowerCase().includes(q) ||
          (t.deliverable && t.deliverable.toLowerCase().includes(q)) ||
          (t.linkedControl && t.linkedControl.toLowerCase().includes(q)) ||
          t.priority.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q) ||
          point.milestoneTitle.toLowerCase().includes(q) ||
          point.phase.toLowerCase().includes(q);

        if (matches) {
          list.push({
            task: t,
            milestoneId: point.milestoneId,
            milestoneTitle: point.milestoneTitle,
            phase: point.phase,
            month: point.month
          });
        }
      });
    });

    return list;
  }, [roadmapTrajectoryData, roadmapSearchQuery]);

  // Filtered milestones stage-gate cards
  const filteredMilestones = useMemo(() => {
    const q = roadmapSearchQuery.trim().toLowerCase();

    return milestones
      .map(m => {
        const trajPoint = roadmapTrajectoryData.find(pt => pt.milestoneId === m.id || pt.phase === m.phase);
        return {
          ...m,
          contributingTasks: trajPoint?.contributingTasks || []
        };
      })
      .filter(m => {
        // Status Filter
        if (roadmapStatusFilter !== 'ALL' && m.status !== roadmapStatusFilter) {
          return false;
        }

        if (!q) return true;

        const matchesMeta =
          m.title.toLowerCase().includes(q) ||
          m.phase.toLowerCase().includes(q) ||
          m.clause.toLowerCase().includes(q) ||
          m.owner.toLowerCase().includes(q) ||
          m.notes.toLowerCase().includes(q) ||
          m.deliverables.some(d => d.toLowerCase().includes(q));

        if (matchesMeta) return true;

        if (m.contributingTasks && m.contributingTasks.length > 0) {
          return m.contributingTasks.some(t =>
            t.title.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.department.toLowerCase().includes(q) ||
            t.assignedTo.toLowerCase().includes(q) ||
            (t.deliverable && t.deliverable.toLowerCase().includes(q)) ||
            (t.linkedControl && t.linkedControl.toLowerCase().includes(q))
          );
        }

        return false;
      });
  }, [milestones, roadmapTrajectoryData, roadmapSearchQuery, roadmapStatusFilter]);

  // Domain Readiness Radar & Bar Chart Data
  const domainReadinessData = useMemo(() => {
    return [
      {
        domain: 'Annex A.5 Organizational',
        short: 'A.5 Org',
        implemented: 88,
        inProgress: 12,
        benchmark: 85,
        totalControls: 37,
        evidenceCount: 42
      },
      {
        domain: 'Annex A.6 People Security',
        short: 'A.6 People',
        implemented: 75,
        inProgress: 25,
        benchmark: 85,
        totalControls: 8,
        evidenceCount: 14
      },
      {
        domain: 'Annex A.7 Physical Security',
        short: 'A.7 Physical',
        implemented: 92,
        inProgress: 8,
        benchmark: 85,
        totalControls: 14,
        evidenceCount: 18
      },
      {
        domain: 'Annex A.8 Technological',
        short: 'A.8 Tech',
        implemented: 78,
        inProgress: 22,
        benchmark: 85,
        totalControls: 34,
        evidenceCount: 56
      },
      {
        domain: 'Clauses 4-10 ISMS Core',
        short: 'Clauses 4-10',
        implemented: 90,
        inProgress: 10,
        benchmark: 85,
        totalControls: 7,
        evidenceCount: 22
      },
      {
        domain: 'Vendor Risk & Third-Party',
        short: 'Vendor Risk',
        implemented: 82,
        inProgress: 18,
        benchmark: 85,
        totalControls: 6,
        evidenceCount: 15
      }
    ];
  }, []);

  // Upcoming Deadlines List
  interface UpcomingDeadline {
    id: string;
    title: string;
    category: 'AUDIT' | 'CAPA' | 'EVIDENCE' | 'POLICY' | 'TASK';
    dueDate: string;
    daysRemaining: number;
    owner: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: string;
  }

  const upcomingDeadlines: UpcomingDeadline[] = useMemo(() => {
    const today = new Date('2026-09-02');

    const list: UpcomingDeadline[] = [
      {
        id: 'D1',
        title: 'Stage 1 Documentation Audit Fieldwork',
        category: 'AUDIT',
        dueDate: currentTenant?.externalAuditTimeline?.stage1Date || '2026-10-15',
        daysRemaining: 43,
        owner: 'Lead External Auditor (BSI)',
        priority: 'Critical',
        status: 'Scheduled'
      },
      {
        id: 'D2',
        title: 'Execute Management Review Meeting (Clause 9.3 Sign-Off)',
        category: 'AUDIT',
        dueDate: '2026-09-18',
        daysRemaining: 16,
        owner: 'CEO & Executive Leadership',
        priority: 'Critical',
        status: 'Pending Sign-Off'
      },
      {
        id: 'D3',
        title: 'Close Internal Audit CAPA: FND-001 (MFA Coverage)',
        category: 'CAPA',
        dueDate: '2026-09-12',
        daysRemaining: 10,
        owner: 'DevOps & IT Admin',
        priority: 'High',
        status: 'In Progress'
      },
      {
        id: 'D4',
        title: 'Quarterly SAST & Cloud Drift Evidence Verification',
        category: 'EVIDENCE',
        dueDate: '2026-09-25',
        daysRemaining: 23,
        owner: 'Lead SecOps Engineer',
        priority: 'High',
        status: 'Collection Active'
      },
      {
        id: 'D5',
        title: 'Annual Information Security Policy Review Cycle',
        category: 'POLICY',
        dueDate: '2026-10-01',
        daysRemaining: 29,
        owner: 'Compliance Officer',
        priority: 'Medium',
        status: 'Drafting Updates'
      },
      {
        id: 'D6',
        title: 'Tier-1 High Risk Vendor Security Re-Assessment',
        category: 'AUDIT',
        dueDate: '2026-10-10',
        daysRemaining: 38,
        owner: 'Procurement & Vendor Risk Lead',
        priority: 'Medium',
        status: 'Questionnaires Sent'
      },
      {
        id: 'D7',
        title: 'Stage 2 Onsite Certification & Control Effectiveness Audit',
        category: 'AUDIT',
        dueDate: currentTenant?.externalAuditTimeline?.stage2Date || '2026-11-20',
        daysRemaining: 79,
        owner: 'Certification Body Registrar',
        priority: 'Critical',
        status: 'Scheduled'
      }
    ];

    // Add real tasks from context if any have due dates
    tasks.filter(t => t.status !== 'Done').forEach((t, i) => {
      const due = t.dueDate || '2026-09-30';
      const target = new Date(due);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      list.push({
        id: `TASK-${t.id}`,
        title: t.title,
        category: 'TASK',
        dueDate: due,
        daysRemaining: diffDays,
        owner: t.assignedTo,
        priority: t.priority === 'High' ? 'High' : 'Medium',
        status: t.status
      });
    });

    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [currentTenant, tasks]);

  const filteredDeadlines = useMemo(() => {
    if (deadlineFilter === 'ALL') return upcomingDeadlines;
    return upcomingDeadlines.filter(d => d.category === deadlineFilter);
  }, [upcomingDeadlines, deadlineFilter]);

  // Deadlines breakdown for chart
  const deadlineChartData = useMemo(() => {
    return [
      { range: '< 14 Days (Urgent)', count: upcomingDeadlines.filter(d => d.daysRemaining <= 14).length, color: '#F43F5E' },
      { range: '15-30 Days (Upcoming)', count: upcomingDeadlines.filter(d => d.daysRemaining > 14 && d.daysRemaining <= 30).length, color: '#F59E0B' },
      { range: '31-60 Days (Planned)', count: upcomingDeadlines.filter(d => d.daysRemaining > 30 && d.daysRemaining <= 60).length, color: '#0EA5E9' },
      { range: '> 60 Days (Scheduled)', count: upcomingDeadlines.filter(d => d.daysRemaining > 60).length, color: '#6366F1' }
    ];
  }, [upcomingDeadlines]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsExportingPDF(true);
      await exportRoadmapToPDF({
        tenantName: currentTenant?.name || 'Skanda Technologies',
        readinessScore: currentReadinessScore,
        milestones: filteredMilestones,
        trajectoryPoints: filteredRoadmapTrajectoryData,
        searchQuery: roadmapSearchQuery,
        statusFilter: roadmapStatusFilter,
        chartElementId: 'roadmap-trajectory-chart'
      });
      setExportSuccessToast(true);
      setTimeout(() => setExportSuccessToast(false), 4500);
    } catch (err) {
      console.error('Failed to export roadmap PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleGenerateAIBriefing = async (customFocus?: string) => {
    setIsLoadingAIBriefing(true);
    setAiBriefingError(null);
    try {
      const payload = {
        tenant: {
          name: currentTenant?.name || 'Skanda Technologies',
          industry: currentTenant?.industryType || (currentTenant as any)?.industry || 'FinTech / Enterprise SaaS',
          readinessScore: currentReadinessScore,
          stage1Date: currentTenant?.externalAuditTimeline?.stage1Date || '2026-10-15',
          stage2Date: currentTenant?.externalAuditTimeline?.stage2Date || '2026-11-20',
          soaBaselineLocked: currentTenant?.soaBaselineLocked ?? true,
          mouExecuted: currentTenant?.mou?.executed ?? true
        },
        metrics: {
          totalControls,
          implementedControls,
          inProgressControls,
          controlCompletionRate,
          totalEvidence,
          verifiedEvidence,
          evidenceReadinessRate,
          totalFindings: findings.length,
          openFindings: openFindings.length,
          closedFindings: closedFindings.length,
          capaClosureRate
        },
        domainReadiness: domainReadinessData,
        milestones: milestones.map(m => ({
          title: m.title,
          phase: m.phase,
          status: m.status,
          targetDate: m.targetDate,
          readinessContribution: m.readinessContribution
        })),
        risks: risks.map(r => ({
          riskCode: r.riskCode,
          title: r.title,
          category: r.category,
          inherentScore: r.inherentScore,
          residualScore: r.residualScore,
          status: r.status,
          treatmentOption: r.treatmentOption,
          mitigationControl: r.mitigationControl,
          treatmentOwner: r.treatmentOwner,
          vulnerabilityDescription: r.vulnerabilityDescription,
          threatDescription: r.threatDescription
        })),
        deadlines: upcomingDeadlines.map(d => ({
          title: d.title,
          category: d.category,
          dueDate: d.dueDate,
          daysRemaining: d.daysRemaining,
          priority: d.priority,
          owner: d.owner
        })),
        customFocusArea: customFocus
      };

      const res = await fetch('/api/ai/reports-analytics-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`AI briefing request failed with status ${res.status}`);
      }

      const result: AIExecutiveBriefingData = await res.json();
      setAiBriefingData(result);
    } catch (err: any) {
      console.error('Failed to generate AI executive briefing:', err);
      setAiBriefingError(err?.message || 'Failed to generate AI Executive Briefing');
    } finally {
      setIsLoadingAIBriefing(false);
    }
  };

  return (
    <PageContainer id="reports-analytics-module" className="relative">
      {/* Toast Notification for PDF Export */}
      {exportSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/80 shadow-2xl rounded-2xl p-4 flex items-center space-x-3 text-white animate-in slide-in-from-bottom duration-300">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Roadmap GRC Report Downloaded</h4>
            <p className="text-[11px] text-slate-300">ISO/IEC 27001:2022 Executive Roadmap PDF saved successfully.</p>
          </div>
          <button
            onClick={() => setExportSuccessToast(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 items-center justify-center text-sky-400 shrink-0">
              <Milestone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800 flex items-center space-x-1">
                  <Milestone className="w-3.5 h-3.5 mr-1" />
                  <span>SKANDA • ISO/IEC 27001:2022 Compliance Roadmap</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Audit Readiness: {currentReadinessScore}%
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Compliance Roadmap & Audit Readiness Trajectory</h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Real-time milestone tracking, predictive audit readiness velocity, domain maturity benchmarking, and time-to-certification horizons.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('ai_briefing');
                if (!aiBriefingData && !isLoadingAIBriefing) {
                  handleGenerateAIBriefing();
                }
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition border border-indigo-400/40 cursor-pointer"
              title="Autonomous Executive Briefing & Key Risk Analysis (Gemini 3.8 Flash)"
            >
              <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
              <span>AI Executive Briefing</span>
            </button>
            <button
              onClick={() => setActiveTab('maturity_trends')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition border cursor-pointer ${
                activeTab === 'maturity_trends'
                  ? 'bg-sky-600 text-white border-sky-400/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700'
              }`}
              title="Interactive D3 12-Month Vector Compliance Maturity Trends"
            >
              <Activity className="w-4 h-4 text-sky-400" />
              <span>12M D3 Trends</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-skanda-presentation'))}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition border border-indigo-500/40 cursor-pointer"
              title="Open Executive Presentation & Client Pitch Deck (PowerPoint PPTX & PDF)"
            >
              <Presentation className="w-4 h-4 text-white" />
              <span>Pitch Deck (PPTX/PDF)</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition border border-sky-500/40"
              title="Download High-Resolution GRC Roadmap Report PDF"
            >
              {isExportingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>{isExportingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Print Executive Roadmap"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setActiveModule('external_audit')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>External Audit Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Readiness Score Telemetry Widget */}
      <ReadinessScoreWidget onNavigateModule={setActiveModule} />

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall Audit Readiness</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{currentReadinessScore}%</div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentReadinessScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          <div className="text-[11px] text-slate-400">Target for Stage 1: &ge; 85%</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Milestones Completed</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">
            {milestones.filter(m => m.status === 'Completed').length} <span className="text-sm font-normal text-slate-400">/ {milestones.length}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((milestones.filter(m => m.status === 'Completed').length / milestones.length) * 100)}%` }}
              transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
              className="h-full bg-sky-500 rounded-full"
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {Math.round((milestones.filter(m => m.status === 'Completed').length / milestones.length) * 100)}% Journey Complete
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Next Major Milestone</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-300 truncate">
            {milestones.find(m => m.status === 'In Progress' || m.status === 'Upcoming')?.title || 'Stage 1 Audit'}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Target: {milestones.find(m => m.status === 'In Progress' || m.status === 'Upcoming')?.targetDate}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Upcoming Deadlines</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {upcomingDeadlines.length} <span className="text-xs font-normal text-rose-400">({upcomingDeadlines.filter(d => d.daysRemaining <= 14).length} urgent)</span>
          </div>
          <div className="text-[11px] text-slate-400">Next due in {upcomingDeadlines[0]?.daysRemaining || 0} days</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'roadmap'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Milestone & Trajectory Roadmap</span>
          </button>

          <button
            onClick={() => setActiveTab('maturity_scorecard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'maturity_scorecard'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm ring-1 ring-sky-400/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Maturity Scorecard (Radar)</span>
            <span className="px-1.5 py-0.5 rounded bg-sky-950 text-[10px] text-sky-300 border border-sky-800 font-mono">
              27001 & 42001
            </span>
          </button>

          <button
            onClick={() => setActiveTab('domain_readiness')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'domain_readiness'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Domain Readiness Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('maturity_trends')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'maturity_trends'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Maturity Trends (12M)</span>
            <span className="px-1.5 py-0.5 rounded bg-sky-950 text-[10px] text-sky-300 border border-sky-800 font-mono">
              D3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'deadlines'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Upcoming Deadlines & Horizon</span>
          </button>

          <button
            onClick={() => setActiveTab('executive_pack')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'executive_pack'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Executive Audit Pack</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ai_briefing');
              if (!aiBriefingData && !isLoadingAIBriefing) {
                handleGenerateAIBriefing();
              }
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ai_briefing'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                : 'bg-slate-900 text-indigo-300 hover:text-white border border-indigo-900/60 hover:border-indigo-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>AI Executive Briefing & Key Risks</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-[10px] text-indigo-300 border border-indigo-800 font-mono">
              Gemini 3.8
            </span>
          </button>

          {/* Predictive Maturity Quick Toggle */}
          <button
            onClick={() => handleTogglePredictiveMaturity(!isPredictiveMaturityActive)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isPredictiveMaturityActive
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-1 ring-purple-400/40'
                : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-900/50 hover:border-purple-700'
            }`}
            title="Toggle Gemini 3-month predictive compliance maturity projection (Oct, Nov, Dec 2026)"
          >
            {isLoadingPredictions ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
            ) : (
              <Sparkles className={`w-3.5 h-3.5 ${isPredictiveMaturityActive ? 'text-amber-300' : 'text-purple-400'}`} />
            )}
            <span>Predictive Maturity: {isPredictiveMaturityActive ? 'ON (+3M AI)' : 'OFF'}</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          Tenant: <strong className="text-slate-200">{currentTenant?.name}</strong>
        </span>
      </div>

      {/* TAB 1: ROADMAP & TRAJECTORY */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {/* Roadmap Search & Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 shadow-sm">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={roadmapSearchQuery}
                  onChange={(e) => setRoadmapSearchQuery(e.target.value)}
                  placeholder="Filter roadmap milestones or specific tasks by name, assignee, clause (e.g. 'CrowdStrike', 'Scope', 'SriKarthiK', 'Internal Audit', 'Okta')..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
                {roadmapSearchQuery && (
                  <button
                    onClick={() => setRoadmapSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
                {(['ALL', 'Completed', 'In Progress', 'Upcoming'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRoadmapStatusFilter(st)}
                    className={`text-xs px-3 py-2 rounded-xl font-medium transition-colors shrink-0 ${
                      roadmapStatusFilter === st
                        ? 'bg-sky-600 text-white shadow-sm font-semibold'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {st === 'ALL' ? 'All Status' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tag Chips & Count Summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1 mr-1">
                  <Tag className="w-3 h-3 text-sky-400" />
                  <span>Quick filters:</span>
                </span>
                {['CrowdStrike', 'Okta MFA', 'Scope Statement', 'SoA Baseline', 'Internal Audit', 'Management Review', 'Failover', 'SriKarthiK'].map((tag) => {
                  const isActive = roadmapSearchQuery.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      onClick={() => setRoadmapSearchQuery(isActive ? '' : tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 font-bold'
                          : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Live Result Count & Download PDF */}
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-sky-400 font-bold">
                  {filteredRoadmapTrajectoryData.length} / {roadmapTrajectoryData.length} Milestones
                </span>
                {roadmapSearchQuery && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                    {allMatchingTasks.length} Tasks Matched
                  </span>
                )}
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExportingPDF}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-600/90 hover:bg-sky-500 active:bg-sky-700 text-white font-sans text-[11px] font-semibold transition disabled:opacity-50 border border-sky-500/50 ml-1"
                  title="Export Current Filtered Roadmap View to PDF"
                >
                  {isExportingPDF ? (
                    <Loader2 className="w-3 h-3 animate-spin text-white" />
                  ) : (
                    <Download className="w-3 h-3 text-white" />
                  )}
                  <span>Export Roadmap PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Matched Tasks Quick Inspection Grid (Visible when searching) */}
          <AnimatePresence>
            {roadmapSearchQuery && allMatchingTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 sm:p-5 rounded-2xl bg-sky-950/20 border border-sky-800/40 space-y-3 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                      Tasks Matching "{roadmapSearchQuery}" ({allMatchingTasks.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Click any card to focus milestone stage-gate
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {allMatchingTasks.map(({ task, milestoneId, phase, month }, idx) => {
                    const isTaskDone = task.status === 'Done';
                    const isInProgress = task.status === 'In Progress';
                    const isUnderReview = task.status === 'Under Review';

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        onClick={() => {
                          const m = filteredMilestones.find(item => item.id === milestoneId || item.phase === phase) ||
                                    milestones.find(item => item.id === milestoneId || item.phase === phase);
                          if (m) setSelectedMilestone(m);
                        }}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/70 hover:bg-slate-850 cursor-pointer transition-all space-y-1.5 group shadow-sm"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-sky-400 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                            {phase} • {month}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold border ${
                              isTaskDone
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : isInProgress
                                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                : isUnderReview
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>

                        <h5 className="text-xs font-semibold text-white group-hover:text-sky-300 line-clamp-2 transition-colors">
                          {task.title}
                        </h5>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span className="truncate max-w-[130px]">👤 {task.assignedTo}</span>
                          <span className="font-mono text-sky-400 font-bold">+{task.weight}% wt ({task.progress}%)</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated SVG Compliance Horizon & Milestone Track */}
          <RoadmapSvgTimeline
            trajectoryPoints={filteredRoadmapTrajectoryData}
            selectedMilestoneId={selectedMilestone?.id || selectedMilestone?.phase}
            onSelectMilestone={(point) => {
              const found = filteredMilestones.find(m => m.id === point.milestoneId || m.phase === point.phase) ||
                            milestones.find(m => m.id === point.milestoneId || m.phase === point.phase);
              if (found) setSelectedMilestone(found);
            }}
            searchQuery={roadmapSearchQuery}
            statusFilter={roadmapStatusFilter}
          />

          {/* Recharts Trajectory Visualizer */}
          <motion.div
            id="roadmap-trajectory-chart"
            key={`chart-${roadmapStatusFilter}-${roadmapSearchQuery}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>Audit Readiness Progression & Target Trajectory</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Historical progress vs required certification baseline trajectory towards Stage 1 & Stage 2 audits. Hover points for contributing tasks breakdown.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-[11px]">
                <button
                  onClick={() => setActiveTab('maturity_trends')}
                  className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-800 hover:bg-sky-900 transition font-mono text-[10px]"
                  title="Switch to D3 Vector Line Chart with 12-Month Snapshots"
                >
                  <Activity className="w-3 h-3 text-sky-400" />
                  <span>Open 12M D3 Vector Chart</span>
                </button>
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" />
                  <span>Actual Readiness (%)</span>
                </span>
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
                  <span>Target Baseline (%)</span>
                </span>
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-400 inline-block" />
                  <span>Projected (%)</span>
                </span>
              </div>
            </div>

            {filteredRoadmapTrajectoryData.length === 0 ? (
              <div className="p-12 text-center space-y-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Matching Milestones or Tasks Found</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No compliance milestone or contributing task matched "{roadmapSearchQuery}". Try clearing your search query or switching your status filter.
                </p>
                <button
                  onClick={() => {
                    setRoadmapSearchQuery('');
                    setRoadmapStatusFilter('ALL');
                  }}
                  className="text-xs px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
                >
                  Reset Search & Filters
                </button>
              </div>
            ) : (
              <div className="w-full h-72 sm:h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={filteredRoadmapTrajectoryData} margin={{ top: 10, right: 20, bottom: 25, left: -10 }}>
                    <defs>
                      <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#64748B"
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      dy={5}
                    />
                    <YAxis
                      stroke="#64748B"
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      domain={[0, 100]}
                      unit="%"
                    />
                    <Tooltip
                      content={<RoadmapCustomTooltip searchQuery={roadmapSearchQuery} />}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <ReferenceLine y={85} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Stage 1 Threshold (85%)', fill: '#10B981', fontSize: 10, position: 'right' }} />
                    
                    <Area
                      type="monotone"
                      dataKey="actualReadiness"
                      name="Actual Readiness"
                      stroke="#0EA5E9"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#readinessGrad)"
                    />
                    <Line
                      type="monotone"
                      dataKey="targetReadiness"
                      name="Target Baseline"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#10B981' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedReadiness"
                      name="Projected Readiness"
                      stroke="#818CF8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#818CF8' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Interactive Milestone Journey Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">ISMS Implementation Stage-Gates & Milestones</h3>
                <p className="text-xs text-slate-400">Click any milestone to inspect contributing tasks, deliverables, and owner sign-offs.</p>
              </div>

              {filteredMilestones.length !== milestones.length && (
                <button
                  onClick={() => {
                    setRoadmapSearchQuery('');
                    setRoadmapStatusFilter('ALL');
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                >
                  Show All ({milestones.length})
                </button>
              )}
            </div>

            {filteredMilestones.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No milestone stage-gates match "{roadmapSearchQuery}".
              </div>
            ) : (
              <motion.div
                key={`milestones-${roadmapStatusFilter}-${roadmapSearchQuery}`}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.06
                    }
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {filteredMilestones.map((m, idx) => {
                  const isSelected = selectedMilestone?.id === m.id;
                  const q = roadmapSearchQuery.trim().toLowerCase();
                  const matchingTaskCount = q && m.contributingTasks ? m.contributingTasks.filter(t =>
                    t.title.toLowerCase().includes(q) ||
                    t.category.toLowerCase().includes(q) ||
                    t.department.toLowerCase().includes(q) ||
                    t.assignedTo.toLowerCase().includes(q) ||
                    (t.deliverable && t.deliverable.toLowerCase().includes(q)) ||
                    (t.linkedControl && t.linkedControl.toLowerCase().includes(q))
                  ).length : 0;

                  const isDone = m.status === 'Completed';
                  const isInProg = m.status === 'In Progress';
                  const progressPercent = isDone ? 100 : isInProg ? 65 : 0;

                  return (
                    <motion.div
                      key={m.id}
                      variants={{
                        hidden: { opacity: 0, y: 16, scale: 0.97 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 320,
                            damping: 24
                          }
                        }
                      }}
                      whileHover={{ y: -3, transition: { duration: 0.15 } }}
                      onClick={() => setSelectedMilestone(m)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-slate-850 border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">
                          {m.phase}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            m.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : m.status === 'In Progress'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{m.title}</h4>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{m.clause}</p>
                      </div>

                      {/* Animated Milestone Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Progress</span>
                          <span className="font-mono font-bold text-sky-400">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.05 + 0.2, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              isDone
                                ? 'bg-emerald-500'
                                : isInProg
                                ? 'bg-sky-500'
                                : 'bg-slate-700'
                            }`}
                          />
                        </div>
                      </div>

                      {matchingTaskCount > 0 && (
                        <div className="text-[10px] font-semibold text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-sky-400" />
                          <span>{matchingTaskCount} matching task{matchingTaskCount > 1 ? 's' : ''}</span>
                        </div>
                      )}

                      <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{m.completedDate || m.targetDate}</span>
                        </span>
                        <span className="text-sky-400 font-bold">+{m.readinessContribution}%</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Selected Milestone Detail Drawer / Card */}
            <AnimatePresence>
              {selectedMilestone && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="p-5 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-4 mt-4 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                        {selectedMilestone.phase}
                      </span>
                      <h4 className="text-sm font-bold text-white">{selectedMilestone.title}</h4>
                      <span className="text-xs text-slate-400">({selectedMilestone.clause})</span>
                    </div>
                    <button
                      onClick={() => setSelectedMilestone(null)}
                      className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800"
                    >
                      Close
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">{selectedMilestone.notes}</p>

                  {/* Contributing Tasks Section in Detail Drawer */}
                  {selectedMilestone.contributingTasks && selectedMilestone.contributingTasks.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] uppercase font-bold text-slate-300 tracking-wider flex items-center space-x-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                          <span>Contributing Tasks & Action Items ({selectedMilestone.contributingTasks.length})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Readiness contribution: +{selectedMilestone.readinessContribution}%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {selectedMilestone.contributingTasks.map((t) => {
                          const q = roadmapSearchQuery.trim().toLowerCase();
                          const isMatch = Boolean(
                            q &&
                            (t.title.toLowerCase().includes(q) ||
                             t.assignedTo.toLowerCase().includes(q) ||
                             t.department.toLowerCase().includes(q) ||
                             t.category.toLowerCase().includes(q) ||
                             (t.linkedControl && t.linkedControl.toLowerCase().includes(q)))
                          );

                          const isDone = t.status === 'Done';
                          const isInProg = t.status === 'In Progress';
                          const isReview = t.status === 'Under Review';

                          return (
                            <div
                              key={t.id}
                              className={`p-3 rounded-xl border transition-all ${
                                isMatch
                                  ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500/40 text-white'
                                  : 'bg-slate-900 border-slate-800/90 text-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start space-x-2 min-w-0">
                                  <div className="mt-0.5 shrink-0">
                                    {isDone ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : isInProg ? (
                                      <CircleDot className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                                    ) : isReview ? (
                                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5 text-slate-600" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className={`text-xs font-semibold ${isMatch ? 'text-sky-300 font-bold' : isDone ? 'text-slate-200' : 'text-white'}`}>
                                      {t.title}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-1">
                                      <span>👤 {t.assignedTo}</span>
                                      <span>•</span>
                                      <span>{t.department}</span>
                                      {t.linkedControl && (
                                        <>
                                          <span>•</span>
                                          <span className="font-mono text-sky-400">{t.linkedControl}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end shrink-0 space-y-1">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                      isDone
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                        : isInProg
                                        ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}
                                  >
                                    {t.status}
                                  </span>
                                  <span className="text-[10px] font-mono text-sky-400 font-bold">
                                    +{t.weight}% wt
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Deliverables */}
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Mandatory Audit Deliverables:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedMilestone.deliverables.map((del, dIdx) => (
                        <span
                          key={dIdx}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{del}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                    <span>Responsible Owner: <strong className="text-slate-200">{selectedMilestone.owner}</strong></span>
                    <span>Target Date: <strong className="text-slate-200">{selectedMilestone.targetDate}</strong></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* TAB: COMPLIANCE MATURITY SCORECARD (DUAL-HARMONIZATION RADAR) */}
      {activeTab === 'maturity_scorecard' && (
        <div className="space-y-6">
          <ComplianceMaturityScorecard
            onNavigateToWorkbench={(fw) => {
              if (fw === 'iso42001') {
                setActiveModule('iso42001_workbench');
              } else {
                setActiveModule('iso27001_workbench');
              }
            }}
          />
        </div>
      )}

      {/* TAB 2: DOMAIN READINESS MATRIX */}
      {activeTab === 'domain_readiness' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recharts Radar Chart */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>ISO 27001 Domain Coverage Radar</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Multiaxial maturity evaluation across Annex A security controls and management system clauses.
                </p>
              </div>

              <div className="w-full h-72 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={domainReadinessData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="short" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748B" />
                    <Radar
                      name="Current Readiness"
                      dataKey="implemented"
                      stroke="#0EA5E9"
                      fill="#0EA5E9"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Audit Benchmark"
                      dataKey="benchmark"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.1}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#F8FAFC',
                        fontSize: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts Horizontal Bar Chart */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Domain Readiness Comparison</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Implemented controls vs in-progress controls across all 6 key compliance domains.
                </p>
              </div>

              <div className="w-full h-72 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={domainReadinessData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#64748B" unit="%" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <YAxis dataKey="short" type="category" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <Tooltip
                      content={<DomainCustomTooltip />}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="implemented" name="Implemented (%)" fill="#0EA5E9" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="inProgress" name="In Progress (%)" fill="#F59E0B" stackId="a" radius={[0, 4, 4, 0]} />
                    <ReferenceLine x={85} stroke="#10B981" strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Domain Breakdown Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Domain Breakdown Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                    <th className="py-2.5 px-3">Security Domain</th>
                    <th className="py-2.5 px-3">Total Controls</th>
                    <th className="py-2.5 px-3">Evidence Files</th>
                    <th className="py-2.5 px-3">Implemented</th>
                    <th className="py-2.5 px-3">Audit Benchmark</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {domainReadinessData.map(d => (
                    <tr key={d.domain} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-semibold text-white">{d.domain}</td>
                      <td className="py-3 px-3 text-slate-300">{d.totalControls} Controls</td>
                      <td className="py-3 px-3 text-slate-300">{d.evidenceCount} Artifacts</td>
                      <td className="py-3 px-3 font-bold text-sky-400">{d.implemented}%</td>
                      <td className="py-3 px-3 text-slate-400">{d.benchmark}%</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            d.implemented >= d.benchmark
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {d.implemented >= d.benchmark ? 'Audit Ready' : 'Remediation Required'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 12-MONTH COMPLIANCE MATURITY TRENDS (D3 VECTOR ENGINE) */}
      {activeTab === 'maturity_trends' && (
        <div className="space-y-6">
          {/* Predictive Maturity Banner when active */}
          {isPredictiveMaturityActive && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/50 to-slate-900 border border-purple-700/50 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">Gemini Predictive Maturity Horizon Activated</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {predictiveMaturityData?.aiAnalysis?.modelUsed || 'Gemini 3.8 Flash'}
                      </span>
                    </div>
                    <p className="text-xs text-purple-200/90 mt-0.5">
                      Projecting 3-month forward compliance trajectories (Oct, Nov, Dec 2026) based on 12-month historical audit velocity, control implementation, and evidence readiness.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleTogglePredictiveMaturity(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
                  >
                    Reset to 12M Historical
                  </button>
                </div>
              </div>

              {/* 3 Projected Months Quick KPI Strip */}
              {predictiveMaturityData?.projectedSnapshots && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {predictiveMaturityData.projectedSnapshots.map((pSnap) => (
                    <div key={pSnap.id} className="p-3 rounded-xl bg-slate-950/70 border border-purple-800/40 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>{pSnap.monthLabel}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {pSnap.overallMaturity}% Target
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-1">
                        {pSnap.milestoneTitle}
                      </p>
                      <div className="text-[10px] text-purple-300/80 font-mono">
                        Stage 1 Readiness: {pSnap.auditReadinessVerdict.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <ComplianceMaturityD3Chart
            snapshots={activeMaturitySnapshots}
            tenantName={currentTenant?.name}
            currentScore={currentReadinessScore}
            isPredictiveMode={isPredictiveMaturityActive}
            predictiveAiAnalysis={predictiveMaturityData?.aiAnalysis}
            isLoadingPredictions={isLoadingPredictions}
            onTogglePredictiveMode={handleTogglePredictiveMaturity}
          />

          {/* AI Predictive Intelligence Deep-Dive Card */}
          {isPredictiveMaturityActive && predictiveMaturityData?.aiAnalysis && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-purple-800/40 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>Executive Predictive Compliance Intelligence</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        Confidence: {predictiveMaturityData.aiAnalysis.confidenceScore}%
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Calculated trajectory velocity: <strong className="text-emerald-400">{predictiveMaturityData.aiAnalysis.projectedVelocity}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Executive Forecast Statement */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                &ldquo;{predictiveMaturityData.aiAnalysis.executiveForecast}&rdquo;
              </div>

              {/* Trajectory Drivers & Risk Headwinds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Drivers */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                    <TrendingUp className="w-4 h-4" />
                    <span>Key Trajectory Acceleration Drivers</span>
                  </div>
                  <div className="space-y-2">
                    {predictiveMaturityData.aiAnalysis.trajectoryDrivers.map((d, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-white font-semibold text-xs">{d.driver}</div>
                          <div className="text-[10px] text-slate-400">{d.domain}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 text-xs shrink-0">
                          {d.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Headwinds */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Projected Risk Headwinds &amp; Mitigations</span>
                  </div>
                  <div className="space-y-2">
                    {predictiveMaturityData.aiAnalysis.riskHeadwinds.map((r, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold text-xs">{r.risk}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border ${
                            r.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {r.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          <strong className="text-slate-300">Mitigation:</strong> {r.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: UPCOMING DEADLINES & HORIZON */}
      {activeTab === 'deadlines' && (
        <div className="space-y-6">
          {/* Recharts Urgency Bar Chart & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Deadlines by Urgency Horizon</span>
                </h3>
                <p className="text-xs text-slate-400">Distribution of upcoming compliance items by time window.</p>
              </div>

              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deadlineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="range" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <YAxis stroke="#64748B" allowDecimals={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <Tooltip
                      content={<DeadlineCustomTooltip />}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Bar dataKey="count" name="Action Items" radius={[4, 4, 0, 0]}>
                      {deadlineChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target Date Simulator */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Target className="w-4 h-4 text-sky-400" />
                    <span>Time-to-Audit Velocity Simulator</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculate required closure rate of tasks and evidence uploads to reach 100% readiness.
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-400 px-2.5 py-1 rounded bg-sky-950 border border-sky-800">
                  {simulatedWeeks} Weeks Remaining
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Simulate Weeks to External Stage 1 Audit:</span>
                  <strong className="text-white">{simulatedWeeks} Weeks ({simulatedWeeks * 7} Days)</strong>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={simulatedWeeks}
                  onChange={e => setSimulatedWeeks(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Required Weekly Evidence</div>
                  <div className="text-lg font-black text-sky-400">
                    {Math.ceil((totalEvidence - verifiedEvidence) / simulatedWeeks)} Artifacts/wk
                  </div>
                  <div className="text-[10px] text-slate-400">To clear evidence queue</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Required CAPA Closure</div>
                  <div className="text-lg font-black text-emerald-400">
                    {Math.ceil(openFindings.length / simulatedWeeks) || 1} Closures/wk
                  </div>
                  <div className="text-[10px] text-slate-400">To resolve all open findings</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Audit Readiness Velocity</div>
                  <div className="text-lg font-black text-indigo-400">
                    +{((100 - currentReadinessScore) / simulatedWeeks).toFixed(1)}% /wk
                  </div>
                  <div className="text-[10px] text-slate-400">Targeting 100% readiness</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filterable Upcoming Deadlines List */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Upcoming Compliance Milestones & Deadlines</h3>
                <p className="text-xs text-slate-400">Prioritized by chronological urgency.</p>
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                {(['ALL', 'AUDIT', 'CAPA', 'EVIDENCE', 'POLICY'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setDeadlineFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      deadlineFilter === f
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredDeadlines.map(d => {
                const isUrgent = d.daysRemaining <= 14;
                const isWarning = d.daysRemaining > 14 && d.daysRemaining <= 30;

                return (
                  <div
                    key={d.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      isUrgent
                        ? 'bg-slate-950 border-rose-500/40'
                        : isWarning
                        ? 'bg-slate-950 border-amber-500/30'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            d.category === 'AUDIT'
                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                              : d.category === 'CAPA'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : d.category === 'EVIDENCE'
                              ? 'bg-sky-950 text-sky-300 border border-sky-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {d.category}
                        </span>
                        <h4 className="text-xs font-bold text-white">{d.title}</h4>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                        <span>Owner: <strong className="text-slate-300">{d.owner}</strong></span>
                        <span>•</span>
                        <span>Due: <strong className="text-slate-300">{d.dueDate}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center space-x-1 ${
                          isUrgent
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{d.daysRemaining > 0 ? `${d.daysRemaining} Days Left` : 'Due Today'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXECUTIVE AUDIT PACK */}
      {activeTab === 'executive_pack' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Board & External Auditor Deliverables Pack</h3>
            <p className="text-xs text-slate-400">
              Pre-packaged compliance extracts prepared for formal Clause 9.3 Management Review and Stage 1 certification submissions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                    EXECUTIVE-01
                  </span>
                  <Award className="w-4 h-4 text-sky-400" />
                </div>
                <h4 className="text-xs font-bold text-white">Clause 9.3 Management Review Pack</h4>
                <p className="text-[11px] text-slate-400">
                  Comprehensive leadership governance summary including risk changes, internal audit results, and resource commitments.
                </p>
                <button
                  onClick={handlePrint}
                  className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-sm"
                >
                  Generate PDF Pack
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    SOA-BASELINE
                  </span>
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <h4 className="text-xs font-bold text-white">Statement of Applicability (SoA)</h4>
                <p className="text-[11px] text-slate-400">
                  Formal 93 Annex A control baseline with locked SHA-256 cryptographic signature and exclusion rationales.
                </p>
                <button
                  onClick={() => setActiveModule('statement_of_applicability')}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-sm"
                >
                  View SoA Matrix
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    AUDIT-TRAIL
                  </span>
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-xs font-bold text-white">Cryptographic Audit Ledger</h4>
                <p className="text-[11px] text-slate-400">
                  Non-repudiation event ledger recording all policy modifications, evidence uploads, and digital sign-offs.
                </p>
                <button
                  onClick={() => setActiveModule('audit_trail')}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                >
                  Open Audit Ledger
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/50 border border-indigo-900/60 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-indigo-400 mr-1 animate-pulse" />
                    <span>AI-BRIEFING</span>
                  </span>
                  <Award className="w-4 h-4 text-indigo-400" />
                </div>
                <h4 className="text-xs font-bold text-white">Gemini 3.8 AI Executive Briefing & Key Risks</h4>
                <p className="text-[11px] text-slate-400">
                  Autonomous lead auditor evaluation synthesized from live controls, telemetry, evidence decay, and CAPAs for Clause 9.3 reviews.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('ai_briefing');
                    if (!aiBriefingData && !isLoadingAIBriefing) {
                      handleGenerateAIBriefing();
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Executive Intelligence</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI EXECUTIVE BRIEFING & KEY RISKS */}
      {activeTab === 'ai_briefing' && (
        <AIExecutiveBriefingView
          data={aiBriefingData}
          isLoading={isLoadingAIBriefing}
          error={aiBriefingError}
          onGenerate={handleGenerateAIBriefing}
          tenantName={currentTenant?.name || 'Skanda Technologies'}
          readinessScore={currentReadinessScore}
          metrics={{
            controlCompletionRate,
            evidenceReadinessRate,
            capaClosureRate,
            implementedControls,
            totalControls,
            verifiedEvidence,
            totalEvidence
          }}
        />
      )}
    </PageContainer>
  );
};
