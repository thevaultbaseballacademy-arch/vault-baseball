// Development Intelligence Engine
// Rules-based recommendation system that analyzes athlete data and generates
// personalized development recommendations for baseball and softball.

import { SportType } from '@/lib/sportTypes';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DevelopmentStatus = 'improving' | 'stable' | 'stalled' | 'regressing';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type AlertType = 'stalled' | 'regression' | 'missing_sessions' | 'ready_to_progress' | 'needs_review' | 'compliance_low';

export interface KPIDataPoint {
  name: string;
  category: string;
  value: number;
  unit: string;
  recordedAt: string;
}

export interface AssessmentScore {
  category: string;
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore: number;
}

export interface TrainingHistory {
  totalSessions: number;
  completedSessions: number;
  missedSessions: number;
  currentStreak: number;
  weeklyCompliancePct: number;
  trainingTypes: string[];
}

export interface CoachFeedbackInput {
  strengths: string[];
  weaknesses: string[];
  priorities: string[];
  mechanicalFocus: string[];
}

export interface AthleteProfile {
  age?: number;
  position?: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  sportType: SportType;
}

export interface IntelligenceInput {
  profile: AthleteProfile;
  assessments: AssessmentScore[];
  kpis: KPIDataPoint[];
  kpiHistory: KPIDataPoint[][]; // last N weeks of KPI snapshots
  training: TrainingHistory;
  coachFeedback?: CoachFeedbackInput;
}

export interface StrengthItem {
  area: string;
  detail: string;
  score?: number;
}

export interface GapItem {
  area: string;
  detail: string;
  score?: number;
  priority: PriorityLevel;
}

export interface DrillRecommendation {
  drillId: string;
  reason: string;
  priority: PriorityLevel;
}

export interface ProgramRecommendation {
  programId: string;
  reason: string;
}

export interface WeeklyPlan {
  focusAreas: string[];
  drillAssignments: { drillId: string; sessionsPerWeek: number }[];
  kpiRetests: { name: string; targetDay: string }[];
  strengthSessions: number;
  notes: string;
}

export interface IntelligenceAlert {
  type: AlertType;
  title: string;
  message: string;
  severity: PriorityLevel;
  athleteId?: string;
  createdAt: string;
}

export interface IntelligenceOutput {
  status: DevelopmentStatus;
  overallScore: number;
  strengths: StrengthItem[];
  gaps: GapItem[];
  priorities: string[];
  recommendedDrills: DrillRecommendation[];
  recommendedPrograms: ProgramRecommendation[];
  weeklyPlan: WeeklyPlan;
  alerts: IntelligenceAlert[];
}

// ─── Sport-Specific Thresholds ───────────────────────────────────────────────

interface KPIThreshold {
  name: string;
  category: string;
  beginner: { low: number; avg: number; good: number };
  intermediate: { low: number; avg: number; good: number };
  advanced: { low: number; avg: number; good: number };
}

const baseballThresholds: KPIThreshold[] = [
  { name: 'exit_velocity', category: 'hitting', beginner: { low: 55, avg: 65, good: 75 }, intermediate: { low: 70, avg: 78, good: 85 }, advanced: { low: 80, avg: 88, good: 95 } },
  { name: 'bat_speed', category: 'hitting', beginner: { low: 45, avg: 55, good: 62 }, intermediate: { low: 58, avg: 65, good: 72 }, advanced: { low: 68, avg: 74, good: 80 } },
  { name: 'pitch_velocity', category: 'pitching', beginner: { low: 50, avg: 60, good: 70 }, intermediate: { low: 65, avg: 75, good: 82 }, advanced: { low: 78, avg: 85, good: 92 } },
  { name: 'spin_rate', category: 'pitching', beginner: { low: 1400, avg: 1800, good: 2100 }, intermediate: { low: 1800, avg: 2100, good: 2400 }, advanced: { low: 2100, avg: 2400, good: 2700 } },
  { name: 'command_pct', category: 'pitching', beginner: { low: 40, avg: 50, good: 60 }, intermediate: { low: 50, avg: 60, good: 70 }, advanced: { low: 60, avg: 70, good: 80 } },
  { name: 'sixty_yard', category: 'speed', beginner: { low: 8.5, avg: 7.8, good: 7.2 }, intermediate: { low: 7.8, avg: 7.2, good: 6.8 }, advanced: { low: 7.2, avg: 6.8, good: 6.4 } },
  { name: 'pop_time', category: 'speed', beginner: { low: 2.5, avg: 2.2, good: 2.0 }, intermediate: { low: 2.2, avg: 2.0, good: 1.9 }, advanced: { low: 2.0, avg: 1.9, good: 1.8 } },
];

const softballThresholds: KPIThreshold[] = [
  { name: 'exit_velocity', category: 'hitting', beginner: { low: 40, avg: 50, good: 58 }, intermediate: { low: 52, avg: 60, good: 68 }, advanced: { low: 62, avg: 70, good: 78 } },
  { name: 'bat_speed', category: 'hitting', beginner: { low: 40, avg: 50, good: 58 }, intermediate: { low: 52, avg: 60, good: 66 }, advanced: { low: 60, avg: 68, good: 74 } },
  { name: 'pitch_speed', category: 'pitching', beginner: { low: 35, avg: 42, good: 50 }, intermediate: { low: 45, avg: 52, good: 58 }, advanced: { low: 55, avg: 62, good: 68 } },
  { name: 'spin_rate', category: 'pitching', beginner: { low: 800, avg: 1100, good: 1400 }, intermediate: { low: 1100, avg: 1400, good: 1700 }, advanced: { low: 1400, avg: 1700, good: 2000 } },
  { name: 'home_to_first', category: 'speed', beginner: { low: 3.8, avg: 3.4, good: 3.0 }, intermediate: { low: 3.4, avg: 3.0, good: 2.8 }, advanced: { low: 3.0, avg: 2.8, good: 2.6 } },
  { name: 'throw_velocity', category: 'fielding', beginner: { low: 38, avg: 45, good: 52 }, intermediate: { low: 45, avg: 52, good: 58 }, advanced: { low: 52, avg: 58, good: 65 } },
  { name: 'steal_time', category: 'speed', beginner: { low: 3.5, avg: 3.0, good: 2.7 }, intermediate: { low: 3.0, avg: 2.7, good: 2.4 }, advanced: { low: 2.7, avg: 2.4, good: 2.2 } },
];

// ─── Drill Mapping (sport-specific) ──────────────────────────────────────────

interface DrillMap {
  [kpiOrCategory: string]: string[];
}

const baseballDrillMap: DrillMap = {
  'bat_speed': ['bat-speed-overload', 'bat-speed-underload', 'dry-swing-velo'],
  'exit_velocity': ['tee-exit-velo', 'front-toss-power', 'bp-game-velo'],
  'pitch_velocity': ['long-toss-progression', 'weighted-ball', 'mound-velo-work'],
  'command_pct': ['bullpen-command', 'target-work', 'pitch-location-drill'],
  'spin_rate': ['wrist-snap-drill', 'spin-efficiency-work'],
  'sixty_yard': ['sprint-mechanics', 'block-starts', 'acceleration-ladders'],
  'pop_time': ['receiving-transfer', 'footwork-throws', 'quick-release'],
  'hitting_general': ['tee-work', 'soft-toss', 'live-bp'],
  'fielding_general': ['ground-ball-work', 'fly-ball-reads', 'double-play-turns'],
};

const softballDrillMap: DrillMap = {
  'bat_speed': ['h-002', 'h-004', 'h-006'],
  'exit_velocity': ['h-001', 'h-006', 'h-003'],
  'pitch_speed': ['p-001', 'p-010', 'p-003'],
  'spin_rate': ['p-006', 'p-007', 'p-008'],
  'home_to_first': ['b-001', 'b-002'],
  'throw_velocity': ['f-003', 'f-006'],
  'steal_time': ['b-001', 'b-004'],
  'hitting_general': ['h-001', 'h-003', 'h-005'],
  'fielding_general': ['f-001', 'f-002', 'f-004'],
  'baserunning_general': ['b-001', 'b-002', 'b-003'],
  'pitching_general': ['p-001', 'p-004', 'p-005'],
};

// ─── Program Mapping ─────────────────────────────────────────────────────────

interface ProgramMap {
  [gap: string]: string;
}

const baseballProgramMap: ProgramMap = {
  'hitting': 'hitting-power-program',
  'pitching': 'velocity-program',
  'speed': 'speed-agility-program',
  'fielding': 'defensive-development',
  'general': 'complete-player-program',
};

const softballProgramMap: ProgramMap = {
  'hitting': 'prog-hitting',
  'pitching': 'prog-pitching',
  'fielding': 'prog-defensive',
  'baserunning': 'prog-beginner',
  'general': 'prog-offseason',
};

// ─── Core Engine ─────────────────────────────────────────────────────────────

export function analyzeAthlete(input: IntelligenceInput): IntelligenceOutput {
  const { profile, assessments, kpis, kpiHistory, training, coachFeedback } = input;
  const thresholds = profile.sportType === 'softball' ? softballThresholds : baseballThresholds;
  const drillMap = profile.sportType === 'softball' ? softballDrillMap : baseballDrillMap;
  const programMap = profile.sportType === 'softball' ? softballProgramMap : baseballProgramMap;

  // 1. Analyze assessments
  const strengths: StrengthItem[] = [];
  const gaps: GapItem[] = [];

  for (const a of assessments) {
    const pct = (a.score / a.maxScore) * 100;
    if (pct >= 75) {
      strengths.push({ area: a.criteriaName, detail: `${a.category} — ${Math.round(pct)}%`, score: pct });
    } else if (pct < 50) {
      gaps.push({ area: a.criteriaName, detail: `${a.category} — ${Math.round(pct)}%`, score: pct, priority: pct < 30 ? 'critical' : 'high' });
    } else {
      gaps.push({ area: a.criteriaName, detail: `${a.category} — ${Math.round(pct)}%`, score: pct, priority: 'medium' });
    }
  }

  // 2. Analyze KPIs against thresholds
  for (const kpi of kpis) {
    const threshold = thresholds.find(t => t.name === kpi.name);
    if (!threshold) continue;
    const levelThresh = threshold[profile.experienceLevel];
    const isLowerBetter = ['sixty_yard', 'pop_time', 'home_to_first', 'steal_time'].includes(kpi.name);
    
    if (isLowerBetter) {
      if (kpi.value <= levelThresh.good) {
        strengths.push({ area: kpi.name.replace(/_/g, ' '), detail: `${kpi.value} ${kpi.unit} — above average`, score: 85 });
      } else if (kpi.value >= levelThresh.low) {
        gaps.push({ area: kpi.name.replace(/_/g, ' '), detail: `${kpi.value} ${kpi.unit} — below threshold`, score: 30, priority: 'high' });
      }
    } else {
      if (kpi.value >= levelThresh.good) {
        strengths.push({ area: kpi.name.replace(/_/g, ' '), detail: `${kpi.value} ${kpi.unit} — above average`, score: 85 });
      } else if (kpi.value <= levelThresh.low) {
        gaps.push({ area: kpi.name.replace(/_/g, ' '), detail: `${kpi.value} ${kpi.unit} — below threshold`, score: 30, priority: 'high' });
      }
    }
  }

  // 3. Training consistency analysis
  if (training.weeklyCompliancePct < 50) {
    gaps.push({ area: 'Training Consistency', detail: `${training.weeklyCompliancePct}% weekly compliance`, score: training.weeklyCompliancePct, priority: 'critical' });
  } else if (training.weeklyCompliancePct >= 80) {
    strengths.push({ area: 'Training Consistency', detail: `${training.weeklyCompliancePct}% weekly compliance`, score: training.weeklyCompliancePct });
  }

  // 4. Coach feedback influence
  if (coachFeedback) {
    for (const s of coachFeedback.strengths) {
      if (!strengths.find(x => x.area.toLowerCase().includes(s.toLowerCase()))) {
        strengths.push({ area: s, detail: 'Identified by coach' });
      }
    }
    for (const w of coachFeedback.weaknesses) {
      if (!gaps.find(x => x.area.toLowerCase().includes(w.toLowerCase()))) {
        gaps.push({ area: w, detail: 'Flagged by coach', priority: 'high' });
      }
    }
  }

  // Sort gaps by priority
  const priorityOrder: Record<PriorityLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // 5. Top priorities (top 3 gaps, with coach override)
  const coachPriorities = coachFeedback?.priorities || [];
  const autoPriorities = gaps.slice(0, 3).map(g => g.area);
  const priorities = coachPriorities.length > 0
    ? [...coachPriorities.slice(0, 2), ...autoPriorities.filter(p => !coachPriorities.includes(p)).slice(0, 1)]
    : autoPriorities;

  // 6. Drill recommendations
  const recommendedDrills: DrillRecommendation[] = [];
  for (const gap of gaps.slice(0, 5)) {
    const category = gap.detail.split(' — ')[0]?.toLowerCase() || '';
    const kpiKey = gap.area.replace(/\s/g, '_').toLowerCase();
    const categoryKey = `${category}_general`;
    const drills = drillMap[kpiKey] || drillMap[categoryKey] || [];
    for (const drillId of drills.slice(0, 2)) {
      if (!recommendedDrills.find(d => d.drillId === drillId)) {
        recommendedDrills.push({ drillId, reason: `Improve ${gap.area}`, priority: gap.priority });
      }
    }
  }

  // Adjust for compliance — if low, reduce drill count
  const maxDrills = training.weeklyCompliancePct < 50 ? 3 : training.weeklyCompliancePct < 70 ? 5 : 8;
  const finalDrills = recommendedDrills.slice(0, maxDrills);

  // 7. Program recommendations
  const recommendedPrograms: ProgramRecommendation[] = [];
  const gapCategories = [...new Set(gaps.slice(0, 3).map(g => {
    const cat = g.detail.split(' — ')[0]?.toLowerCase();
    return cat || 'general';
  }))];
  for (const cat of gapCategories) {
    const progId = programMap[cat] || programMap['general'];
    if (progId && !recommendedPrograms.find(p => p.programId === progId)) {
      recommendedPrograms.push({ programId: progId, reason: `Address ${cat} development gaps` });
    }
  }

  // 8. Development status
  const status = determineDevelopmentStatus(kpiHistory, training);

  // 9. Overall score
  const assessmentAvg = assessments.length > 0
    ? assessments.reduce((s, a) => s + (a.score / a.maxScore) * 100, 0) / assessments.length
    : 50;
  const consistencyBonus = training.weeklyCompliancePct * 0.2;
  const overallScore = Math.round(Math.min(100, assessmentAvg * 0.7 + consistencyBonus + (status === 'improving' ? 10 : status === 'regressing' ? -5 : 0)));

  // 10. Weekly plan
  const weeklyPlan = generateWeeklyPlan(priorities, finalDrills, training, profile);

  // 11. Alerts
  const alerts = generateAlerts(status, training, gaps, kpiHistory);

  return {
    status,
    overallScore,
    strengths: strengths.slice(0, 5),
    gaps: gaps.slice(0, 5),
    priorities,
    recommendedDrills: finalDrills,
    recommendedPrograms: recommendedPrograms.slice(0, 3),
    weeklyPlan,
    alerts,
  };
}

// ─── Development Status ──────────────────────────────────────────────────────

function determineDevelopmentStatus(kpiHistory: KPIDataPoint[][], training: TrainingHistory): DevelopmentStatus {
  if (kpiHistory.length < 2) return 'stable';

  // Compare latest to earliest
  const recent = kpiHistory[kpiHistory.length - 1] || [];
  const older = kpiHistory[0] || [];
  let improvements = 0;
  let regressions = 0;

  for (const recentKpi of recent) {
    const matchingOld = older.find(o => o.name === recentKpi.name);
    if (!matchingOld) continue;
    const isLowerBetter = ['sixty_yard', 'pop_time', 'home_to_first', 'steal_time'].includes(recentKpi.name);
    const improved = isLowerBetter ? recentKpi.value < matchingOld.value : recentKpi.value > matchingOld.value;
    const regressed = isLowerBetter ? recentKpi.value > matchingOld.value : recentKpi.value < matchingOld.value;
    if (improved) improvements++;
    if (regressed) regressions++;
  }

  if (training.weeklyCompliancePct < 30) return 'stalled';
  if (regressions > improvements && regressions >= 2) return 'regressing';
  if (improvements > regressions && improvements >= 2) return 'improving';
  if (improvements === 0 && regressions === 0 && kpiHistory.length >= 4) return 'stalled';
  return 'stable';
}

// ─── Weekly Plan Generator ───────────────────────────────────────────────────

function generateWeeklyPlan(
  priorities: string[],
  drills: DrillRecommendation[],
  training: TrainingHistory,
  profile: AthleteProfile
): WeeklyPlan {
  const sessionsTarget = training.weeklyCompliancePct < 50 ? 2 : training.weeklyCompliancePct < 70 ? 3 : 4;

  return {
    focusAreas: priorities.slice(0, 3),
    drillAssignments: drills.slice(0, sessionsTarget + 1).map(d => ({
      drillId: d.drillId,
      sessionsPerWeek: d.priority === 'critical' ? 3 : 2,
    })),
    kpiRetests: priorities.slice(0, 2).map((p, i) => ({
      name: p,
      targetDay: i === 0 ? 'Friday' : 'Saturday',
    })),
    strengthSessions: sessionsTarget >= 3 ? 2 : 1,
    notes: training.weeklyCompliancePct < 50
      ? 'Focus on showing up consistently this week. Keep workouts short and achievable.'
      : profile.experienceLevel === 'beginner'
      ? 'Stay patient with the process. Fundamental mechanics are more important than results right now.'
      : 'Push intensity on primary drills. Track KPI improvements at end of week.',
  };
}

// ─── Alert Generator ─────────────────────────────────────────────────────────

function generateAlerts(
  status: DevelopmentStatus,
  training: TrainingHistory,
  gaps: GapItem[],
  kpiHistory: KPIDataPoint[][]
): IntelligenceAlert[] {
  const alerts: IntelligenceAlert[] = [];
  const now = new Date().toISOString();

  if (status === 'stalled') {
    alerts.push({ type: 'stalled', title: 'Development Stalled', message: 'No KPI improvement detected in recent weeks. Coach review recommended.', severity: 'high', createdAt: now });
  }

  if (status === 'regressing') {
    alerts.push({ type: 'regression', title: 'Regression Detected', message: 'Key performance metrics are declining. Immediate coach review needed.', severity: 'critical', createdAt: now });
  }

  if (training.weeklyCompliancePct < 50) {
    alerts.push({ type: 'compliance_low', title: 'Low Training Compliance', message: `Only ${training.weeklyCompliancePct}% weekly compliance. Consider simplifying the training plan.`, severity: 'high', createdAt: now });
  }

  if (training.missedSessions >= 3) {
    alerts.push({ type: 'missing_sessions', title: 'Missed Sessions', message: `${training.missedSessions} sessions missed recently. Follow up with the athlete.`, severity: 'medium', createdAt: now });
  }

  const criticalGaps = gaps.filter(g => g.priority === 'critical');
  if (criticalGaps.length >= 2) {
    alerts.push({ type: 'needs_review', title: 'Multiple Critical Gaps', message: `${criticalGaps.length} critical development areas identified. Manual coach review recommended.`, severity: 'high', createdAt: now });
  }

  // Check for ready to progress (all gaps are medium or lower)
  if (gaps.length > 0 && gaps.every(g => g.priority === 'medium' || g.priority === 'low') && status === 'improving') {
    alerts.push({ type: 'ready_to_progress', title: 'Ready to Progress', message: 'Athlete is showing consistent improvement and may be ready for advanced drills.', severity: 'low', createdAt: now });
  }

  return alerts;
}

// ─── Helper: Build input from Supabase data ──────────────────────────────────

export function buildIntelligenceInput(
  sportType: SportType,
  checkins: any[],
  kpiRecords: any[],
  assessmentScores: AssessmentScore[],
  coachFeedback?: CoachFeedbackInput,
  profileData?: { age?: number; position?: string }
): IntelligenceInput {
  // Determine experience level from data volume
  const experienceLevel: AthleteProfile['experienceLevel'] =
    checkins.length > 60 ? 'advanced' : checkins.length > 20 ? 'intermediate' : 'beginner';

  // Build KPI data points
  const kpis: KPIDataPoint[] = kpiRecords
    .sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
    .slice(0, 20)
    .map((k: any) => ({
      name: k.kpi_name,
      category: k.kpi_category,
      value: k.kpi_value,
      unit: k.kpi_unit || '',
      recordedAt: k.recorded_at,
    }));

  // Build KPI history (group by week)
  const weekGroups: Record<string, KPIDataPoint[]> = {};
  for (const k of kpiRecords) {
    const week = k.recorded_at?.substring(0, 10) || 'unknown';
    if (!weekGroups[week]) weekGroups[week] = [];
    weekGroups[week].push({ name: k.kpi_name, category: k.kpi_category, value: k.kpi_value, unit: k.kpi_unit || '', recordedAt: k.recorded_at });
  }
  const kpiHistory = Object.values(weekGroups).slice(-4);

  // Training history from checkins
  const last30 = checkins.slice(-30);
  const completed = last30.filter((c: any) => c.training_completed);
  let streak = 0;
  for (let i = last30.length - 1; i >= 0; i--) {
    if (last30[i].training_completed) streak++;
    else break;
  }

  const training: TrainingHistory = {
    totalSessions: last30.length,
    completedSessions: completed.length,
    missedSessions: last30.length - completed.length,
    currentStreak: streak,
    weeklyCompliancePct: last30.length > 0 ? Math.round((completed.length / last30.length) * 100) : 0,
    trainingTypes: [...new Set(last30.map((c: any) => c.training_type).filter(Boolean))],
  };

  return {
    profile: {
      age: profileData?.age,
      position: profileData?.position,
      experienceLevel,
      sportType,
    },
    assessments: assessmentScores,
    kpis,
    kpiHistory,
    training,
    coachFeedback,
  };
}
