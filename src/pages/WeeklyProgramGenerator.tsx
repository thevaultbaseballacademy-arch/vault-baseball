import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell, Zap, ChevronRight, ChevronLeft, Check, Clock,
  Flame, Snowflake, Sun, Target, Shield, RotateCcw, Save,
  Play, Calendar, BarChart3, Users, Trophy, Heart, Wind,
  ArrowRight, Loader2, CheckCircle2, Circle, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/contexts/SportContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Types ──────────────────────────────────────────────
type SeasonPhase = "offseason" | "preseason" | "inseason" | "postseason";
type Equipment = "gym" | "home" | "field" | "minimal";
type Position = string;

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  category: string;
  notes?: string;
}

interface DayProgram {
  name: string;
  type: "training" | "skill" | "recovery" | "game" | "off";
  duration: number;
  intensity: "high" | "moderate" | "low" | "recovery";
  exercises: Exercise[];
  throwingProgram?: { type: string; count: number; distance: string; intensity: string };
}

interface ProgramInputs {
  position: Position;
  phase: SeasonPhase;
  availableDays: number;
  equipment: Equipment;
  age: string;
  experience: string;
  weaknesses: string[];
}

// ─── Exercise Database ──────────────────────────────────
const EXERCISES: Record<string, Record<string, Exercise[]>> = {
  strength: {
    gym: [
      { name: "Barbell Back Squat", sets: 4, reps: "5", rest: "3 min", category: "Lower Body" },
      { name: "Romanian Deadlift", sets: 3, reps: "8", rest: "2 min", category: "Posterior Chain" },
      { name: "Bench Press", sets: 4, reps: "6", rest: "2.5 min", category: "Upper Body" },
      { name: "Weighted Pull-Ups", sets: 4, reps: "6", rest: "2 min", category: "Back" },
      { name: "Barbell Hip Thrust", sets: 3, reps: "10", rest: "2 min", category: "Glutes" },
      { name: "DB Shoulder Press", sets: 3, reps: "8", rest: "90 sec", category: "Shoulders" },
    ],
    home: [
      { name: "Bulgarian Split Squat", sets: 3, reps: "10/leg", rest: "90 sec", category: "Lower Body" },
      { name: "Push-Up Variations", sets: 4, reps: "15", rest: "60 sec", category: "Upper Body" },
      { name: "Bodyweight Rows", sets: 3, reps: "12", rest: "60 sec", category: "Back" },
      { name: "Single Leg RDL", sets: 3, reps: "10/leg", rest: "60 sec", category: "Posterior Chain" },
      { name: "Plank Variations", sets: 3, reps: "45 sec", rest: "45 sec", category: "Core" },
    ],
    field: [
      { name: "Sprint Intervals", sets: 6, reps: "60 yd", rest: "2 min", category: "Speed" },
      { name: "Broad Jumps", sets: 4, reps: "5", rest: "90 sec", category: "Power" },
      { name: "Lateral Shuffle", sets: 4, reps: "30 sec", rest: "60 sec", category: "Agility" },
      { name: "Bear Crawls", sets: 3, reps: "30 yd", rest: "60 sec", category: "Full Body" },
    ],
    minimal: [
      { name: "Air Squat", sets: 4, reps: "20", rest: "60 sec", category: "Lower Body" },
      { name: "Push-Ups", sets: 4, reps: "Max", rest: "60 sec", category: "Upper Body" },
      { name: "Lunges", sets: 3, reps: "12/leg", rest: "60 sec", category: "Lower Body" },
      { name: "Plank Hold", sets: 3, reps: "60 sec", rest: "45 sec", category: "Core" },
    ],
  },
  power: {
    gym: [
      { name: "Hang Clean", sets: 4, reps: "3", rest: "3 min", category: "Olympic Lift" },
      { name: "Med Ball Rotational Throw", sets: 4, reps: "8/side", rest: "90 sec", category: "Rotational Power" },
      { name: "Box Jumps", sets: 4, reps: "5", rest: "2 min", category: "Plyometric" },
      { name: "Trap Bar Deadlift", sets: 4, reps: "4", rest: "3 min", category: "Power" },
    ],
    home: [
      { name: "Med Ball Slam", sets: 4, reps: "8", rest: "90 sec", category: "Power" },
      { name: "Jump Squat", sets: 4, reps: "6", rest: "90 sec", category: "Plyometric" },
      { name: "Rotational Med Ball Throw", sets: 3, reps: "8/side", rest: "90 sec", category: "Rotational" },
    ],
    field: [
      { name: "Sprint Starts (10 yd)", sets: 6, reps: "1", rest: "2 min", category: "Acceleration" },
      { name: "Bounding", sets: 4, reps: "30 yd", rest: "2 min", category: "Plyometric" },
      { name: "Lateral Bounds", sets: 4, reps: "6/side", rest: "90 sec", category: "Lateral Power" },
    ],
    minimal: [
      { name: "Clap Push-Ups", sets: 3, reps: "8", rest: "90 sec", category: "Upper Power" },
      { name: "Tuck Jumps", sets: 4, reps: "6", rest: "90 sec", category: "Plyometric" },
      { name: "Squat Jumps", sets: 4, reps: "6", rest: "90 sec", category: "Lower Power" },
    ],
  },
  armCare: {
    gym: [
      { name: "Band Pull-Aparts", sets: 3, reps: "15", rest: "30 sec", category: "Shoulder Health" },
      { name: "External Rotation (cable)", sets: 3, reps: "12", rest: "45 sec", category: "Rotator Cuff" },
      { name: "Scapular Push-Ups", sets: 3, reps: "12", rest: "30 sec", category: "Scapular Stability" },
      { name: "Prone Y-T-W Raises", sets: 2, reps: "10 each", rest: "30 sec", category: "Shoulder" },
    ],
    home: [
      { name: "Band External Rotation", sets: 3, reps: "15", rest: "30 sec", category: "Rotator Cuff" },
      { name: "Band Pull-Aparts", sets: 3, reps: "15", rest: "30 sec", category: "Shoulder Health" },
      { name: "Wrist Flexion/Extension", sets: 2, reps: "15 each", rest: "30 sec", category: "Forearm" },
    ],
    field: [
      { name: "Band Pull-Aparts", sets: 3, reps: "15", rest: "30 sec", category: "Shoulder Health" },
      { name: "Arm Circles", sets: 2, reps: "15 each", rest: "20 sec", category: "Warm-Up" },
    ],
    minimal: [
      { name: "Wall Angels", sets: 3, reps: "10", rest: "30 sec", category: "Mobility" },
      { name: "Arm Circles", sets: 2, reps: "15 each dir", rest: "20 sec", category: "Warm-Up" },
    ],
  },
  recovery: {
    gym: [
      { name: "Foam Rolling (Full Body)", sets: 1, reps: "10 min", rest: "—", category: "Soft Tissue" },
      { name: "Hip 90/90 Stretch", sets: 2, reps: "60 sec/side", rest: "—", category: "Mobility" },
      { name: "Cat-Cow Stretch", sets: 2, reps: "10", rest: "—", category: "Spine Mobility" },
      { name: "Couch Stretch", sets: 2, reps: "60 sec/side", rest: "—", category: "Hip Flexor" },
    ],
    home: [
      { name: "Foam Rolling", sets: 1, reps: "10 min", rest: "—", category: "Soft Tissue" },
      { name: "Pigeon Stretch", sets: 2, reps: "60 sec/side", rest: "—", category: "Hip" },
      { name: "Thoracic Spine Rotation", sets: 2, reps: "10/side", rest: "—", category: "Mobility" },
    ],
    field: [
      { name: "Light Jog + Dynamic Stretch", sets: 1, reps: "10 min", rest: "—", category: "Warm Down" },
      { name: "Walking Lunges w/ Twist", sets: 2, reps: "10/side", rest: "—", category: "Mobility" },
    ],
    minimal: [
      { name: "Deep Breathing", sets: 1, reps: "5 min", rest: "—", category: "Recovery" },
      { name: "Static Stretching Routine", sets: 1, reps: "15 min", rest: "—", category: "Flexibility" },
    ],
  },
};

const POSITION_SKILL_WORK: Record<string, Exercise[]> = {
  pitcher: [
    { name: "Towel Drill (Mechanics)", sets: 3, reps: "10", rest: "60 sec", category: "Pitching Mechanics" },
    { name: "Flat Ground Throws", sets: 1, reps: "25 pitches", rest: "—", category: "Pitching" },
    { name: "Changeup Development", sets: 1, reps: "15 pitches", rest: "—", category: "Pitch Arsenal" },
    { name: "PFP (Pitcher Fielding Practice)", sets: 1, reps: "10 min", rest: "—", category: "Defense" },
  ],
  catcher: [
    { name: "Blocking Drill (Knees)", sets: 3, reps: "10", rest: "45 sec", category: "Blocking" },
    { name: "Framing Drill", sets: 3, reps: "10/zone", rest: "30 sec", category: "Receiving" },
    { name: "Pop-Time Throws", sets: 1, reps: "10", rest: "—", category: "Throwing" },
    { name: "Hip Mobility Series", sets: 1, reps: "5 min", rest: "—", category: "Mobility" },
  ],
  infield: [
    { name: "Short Hop Drill", sets: 3, reps: "10", rest: "30 sec", category: "Hands" },
    { name: "Backhand/Forehand Feeds", sets: 2, reps: "10 each", rest: "45 sec", category: "Fielding" },
    { name: "Double Play Turns", sets: 2, reps: "10", rest: "45 sec", category: "Footwork" },
    { name: "Bare-Hand Drill", sets: 2, reps: "10", rest: "30 sec", category: "Soft Hands" },
  ],
  outfield: [
    { name: "Drop Step + Sprint", sets: 4, reps: "1", rest: "90 sec", category: "Routes" },
    { name: "Crow Hop Throws", sets: 2, reps: "10", rest: "60 sec", category: "Arm Strength" },
    { name: "Fly Ball Reads", sets: 1, reps: "15 min", rest: "—", category: "Tracking" },
    { name: "Wall Ball Drill", sets: 2, reps: "10", rest: "30 sec", category: "Reactions" },
  ],
  hitter: [
    { name: "Tee Work (3 Zones)", sets: 3, reps: "15", rest: "60 sec", category: "Contact" },
    { name: "Soft Toss", sets: 3, reps: "15", rest: "60 sec", category: "Timing" },
    { name: "Front Toss (Velo Ramp)", sets: 2, reps: "15", rest: "90 sec", category: "Bat Speed" },
    { name: "Overload/Underload Swings", sets: 3, reps: "10", rest: "60 sec", category: "Bat Speed Dev" },
  ],
  utility: [
    { name: "Tee Work", sets: 3, reps: "15", rest: "60 sec", category: "Hitting" },
    { name: "Ground Ball Reps", sets: 2, reps: "15", rest: "45 sec", category: "Fielding" },
    { name: "Position Transition Drill", sets: 2, reps: "10", rest: "60 sec", category: "Versatility" },
  ],
};

const THROWING_PROGRAMS: Record<SeasonPhase, (dayIndex: number, position: string) => DayProgram["throwingProgram"] | undefined> = {
  offseason: (d, pos) => {
    if (pos === "pitcher") {
      const plans = [
        { type: "Long Toss", count: 0, distance: "—", intensity: "Arm Care Only" },
        { type: "Long Toss Build", count: 25, distance: "90-150 ft", intensity: "Moderate" },
        undefined,
        { type: "Flat Ground", count: 30, distance: "60 ft", intensity: "75%" },
        undefined,
        { type: "Bullpen", count: 35, distance: "60.5 ft", intensity: "85%" },
        undefined,
      ];
      return plans[d % 7];
    }
    if (d % 3 === 1) return { type: "Catch Play", count: 30, distance: "90-120 ft", intensity: "Moderate" };
    return undefined;
  },
  preseason: (d, pos) => {
    if (pos === "pitcher" && d % 7 === 1) return { type: "Bullpen", count: 45, distance: "60.5 ft", intensity: "90%" };
    if (pos === "pitcher" && d % 7 === 4) return { type: "Live BP", count: 50, distance: "60.5 ft", intensity: "Game-Like" };
    if (d % 2 === 0) return { type: "Catch Play", count: 25, distance: "120 ft", intensity: "Moderate" };
    return undefined;
  },
  inseason: (d, pos) => {
    if (pos === "pitcher" && d % 7 === 2) return { type: "Bullpen", count: 30, distance: "60.5 ft", intensity: "80%" };
    return undefined;
  },
  postseason: () => undefined,
};

// ─── Program Generator Logic ────────────────────────────
function generateProgram(inputs: ProgramInputs, sport: string): DayProgram[] {
  const { position, phase, availableDays, equipment, weaknesses } = inputs;
  const days: DayProgram[] = [];
  const posKey = position.toLowerCase().includes("pitch") ? "pitcher"
    : position.toLowerCase().includes("catch") ? "catcher"
    : position.toLowerCase().includes("infield") || ["ss", "2b", "3b", "1b", "shortstop", "second", "third", "first"].some(p => position.toLowerCase().includes(p)) ? "infield"
    : position.toLowerCase().includes("outfield") || ["lf", "cf", "rf", "left", "center", "right"].some(p => position.toLowerCase().includes(p)) ? "outfield"
    : position.toLowerCase().includes("utility") || position.toLowerCase().includes("dp") || position.toLowerCase().includes("flex") ? "utility"
    : "hitter";

  const phaseConfig: Record<SeasonPhase, { strengthDays: number; skillDays: number; recoveryDays: number; intensity: "high" | "moderate" | "low" }> = {
    offseason: { strengthDays: 3, skillDays: 2, recoveryDays: 1, intensity: "high" },
    preseason: { strengthDays: 2, skillDays: 3, recoveryDays: 1, intensity: "moderate" },
    inseason: { strengthDays: 1, skillDays: 2, recoveryDays: 2, intensity: "moderate" },
    postseason: { strengthDays: 1, skillDays: 1, recoveryDays: 3, intensity: "low" },
  };

  const config = phaseConfig[phase];
  const offDays = 7 - availableDays;

  // Build 7-day template
  const dayTypes: DayProgram["type"][] = [];
  let s = 0, sk = 0, r = 0, o = 0;

  for (let i = 0; i < 7; i++) {
    if (o < offDays && (i === 6 || (i === 3 && offDays >= 2))) { dayTypes.push("off"); o++; }
    else if (s < config.strengthDays) { dayTypes.push("training"); s++; }
    else if (sk < config.skillDays) { dayTypes.push("skill"); sk++; }
    else if (r < config.recoveryDays) { dayTypes.push("recovery"); r++; }
    else dayTypes.push("training");
  }

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  for (let i = 0; i < 7; i++) {
    const type = dayTypes[i];
    const throwProg = THROWING_PROGRAMS[phase](i, posKey);

    if (type === "off") {
      days.push({ name: dayNames[i], type: "off", duration: 0, intensity: "recovery", exercises: [] });
      continue;
    }

    if (type === "recovery") {
      const recoveryExercises = [...(EXERCISES.recovery[equipment] || EXERCISES.recovery.home)];
      if (posKey === "pitcher") recoveryExercises.push(...(EXERCISES.armCare[equipment] || EXERCISES.armCare.home).slice(0, 2));
      days.push({
        name: dayNames[i], type: "recovery", duration: 30, intensity: "recovery",
        exercises: recoveryExercises, throwingProgram: throwProg,
      });
      continue;
    }

    const exercises: Exercise[] = [];
    let duration = 0;

    if (type === "training") {
      // Warm-up
      exercises.push({ name: "Dynamic Warm-Up", sets: 1, reps: "8 min", rest: "—", category: "Warm-Up" });
      // Arm care (always for throwers)
      const armCare = EXERCISES.armCare[equipment] || EXERCISES.armCare.home;
      exercises.push(...armCare.slice(0, 3));

      if (phase === "offseason") {
        const strength = EXERCISES.strength[equipment] || EXERCISES.strength.home;
        const power = EXERCISES.power[equipment] || EXERCISES.power.home;
        exercises.push(...strength.slice(0, 4));
        exercises.push(...power.slice(0, 2));
        duration = 75;
      } else if (phase === "preseason") {
        const power = EXERCISES.power[equipment] || EXERCISES.power.home;
        const strength = EXERCISES.strength[equipment] || EXERCISES.strength.home;
        exercises.push(...power.slice(0, 3));
        exercises.push(...strength.slice(0, 2));
        duration = 60;
      } else {
        const strength = EXERCISES.strength[equipment] || EXERCISES.strength.home;
        exercises.push(...strength.slice(0, 3));
        duration = 45;
      }

      // Core
      exercises.push({ name: "Anti-Rotation Press", sets: 3, reps: "10/side", rest: "45 sec", category: "Core" });
      exercises.push({ name: "Dead Bug", sets: 3, reps: "10", rest: "30 sec", category: "Core" });

      days.push({
        name: dayNames[i], type: "training", duration,
        intensity: phase === "offseason" ? "high" : phase === "inseason" ? "moderate" : "moderate",
        exercises, throwingProgram: throwProg,
      });
    } else {
      // Skill day
      exercises.push({ name: "Dynamic Warm-Up", sets: 1, reps: "8 min", rest: "—", category: "Warm-Up" });
      const armCare = EXERCISES.armCare[equipment] || EXERCISES.armCare.home;
      exercises.push(...armCare.slice(0, 2));
      const skillWork = POSITION_SKILL_WORK[posKey] || POSITION_SKILL_WORK.hitter;
      exercises.push(...skillWork);

      // Add weakness-targeted work
      if (weaknesses.includes("speed")) {
        exercises.push({ name: "Sprint Ladder (10/20/30)", sets: 3, reps: "1", rest: "2 min", category: "Speed Dev", notes: "Targeted weakness" });
      }
      if (weaknesses.includes("arm")) {
        exercises.push({ name: "Long Toss Progression", sets: 1, reps: "15 min", rest: "—", category: "Arm Strength", notes: "Targeted weakness" });
      }
      if (weaknesses.includes("power")) {
        exercises.push({ name: "Heavy Bat Swings", sets: 3, reps: "10", rest: "60 sec", category: "Power Dev", notes: "Targeted weakness" });
      }

      duration = phase === "offseason" ? 60 : phase === "preseason" ? 75 : 45;
      days.push({
        name: dayNames[i], type: "skill", duration,
        intensity: phase === "preseason" ? "high" : "moderate",
        exercises, throwingProgram: throwProg,
      });
    }
  }

  return days;
}

// ─── Constants ──────────────────────────────────────────
const POSITIONS_BASEBALL = ["Pitcher", "Catcher", "Shortstop", "2nd Base", "3rd Base", "1st Base", "Left Field", "Center Field", "Right Field", "Utility"];
const POSITIONS_SOFTBALL = ["Pitcher", "Catcher", "Shortstop", "2nd Base", "3rd Base", "1st Base", "Left Field", "Center Field", "Right Field", "DP/Flex", "Utility"];
const PHASES: { key: SeasonPhase; label: string; icon: any; desc: string }[] = [
  { key: "offseason", label: "Off-Season", icon: Snowflake, desc: "Max strength & velocity dev" },
  { key: "preseason", label: "Pre-Season", icon: Sun, desc: "Power conversion & prep" },
  { key: "inseason", label: "In-Season", icon: Flame, desc: "Maintenance & recovery" },
  { key: "postseason", label: "Post-Season", icon: RotateCcw, desc: "Deload & assessment" },
];
const EQUIPMENT_OPTIONS: { key: Equipment; label: string; icon: any }[] = [
  { key: "gym", label: "Full Gym", icon: Dumbbell },
  { key: "home", label: "Home Gym", icon: Shield },
  { key: "field", label: "Field Only", icon: Target },
  { key: "minimal", label: "Minimal", icon: Wind },
];
const WEAKNESS_OPTIONS = [
  { key: "speed", label: "Speed" }, { key: "power", label: "Power" },
  { key: "arm", label: "Arm Strength" }, { key: "defense", label: "Defense" },
  { key: "contact", label: "Contact/Hitting" }, { key: "conditioning", label: "Conditioning" },
];

// ─── Component ──────────────────────────────────────────
const WeeklyProgramGenerator = () => {
  const { sport } = useSport();
  const navigate = useNavigate();
  const isSoftball = sport === "softball";
  const accent = isSoftball ? "text-purple-400" : "text-primary";
  const accentBg = isSoftball ? "bg-purple-500/10" : "bg-primary/10";
  const accentBorder = isSoftball ? "border-purple-500/20" : "border-primary/20";

  // Wizard state
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<ProgramInputs>({
    position: "", phase: "offseason", availableDays: 5, equipment: "gym",
    age: "16-18", experience: "intermediate", weaknesses: [],
  });
  const [program, setProgram] = useState<DayProgram[] | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  const positions = isSoftball ? POSITIONS_SOFTBALL : POSITIONS_BASEBALL;

  const handleGenerate = useCallback(() => {
    const generated = generateProgram(inputs, sport);
    setProgram(generated);
    setStep(5);
    setSelectedDay(0);
    setCompletedExercises(new Set());
  }, [inputs, sport]);

  const toggleExercise = useCallback((dayIdx: number, exIdx: number) => {
    const key = `${dayIdx}-${exIdx}`;
    setCompletedExercises(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const compliancePct = useMemo(() => {
    if (!program) return 0;
    const totalExercises = program.reduce((acc, d) => acc + d.exercises.length, 0);
    if (totalExercises === 0) return 0;
    return Math.round((completedExercises.size / totalExercises) * 100);
  }, [program, completedExercises]);

  const dayCompliancePct = useMemo(() => {
    if (!program) return 0;
    const day = program[selectedDay];
    if (!day || day.exercises.length === 0) return 0;
    const completed = day.exercises.filter((_, i) => completedExercises.has(`${selectedDay}-${i}`)).length;
    return Math.round((completed / day.exercises.length) * 100);
  }, [program, selectedDay, completedExercises]);

  const handleSave = async () => {
    if (!userId || !program) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("training_programs").insert({
        user_id: userId,
        athlete_user_id: userId,
        title: `${inputs.phase.charAt(0).toUpperCase() + inputs.phase.slice(1)} ${inputs.position} Program`,
        sport,
        position: inputs.position,
        season_phase: inputs.phase,
        available_days: inputs.availableDays,
        equipment: inputs.equipment,
        age_group: inputs.age,
        experience_level: inputs.experience,
        program_data: program as any,
        compliance_pct: compliancePct,
      });
      if (error) throw error;
      toast.success("Program saved!", { description: "Track your compliance week over week." });
    } catch (e: any) {
      toast.error("Failed to save program", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const intensityColor = (i: DayProgram["intensity"]) =>
    i === "high" ? "text-red-400" : i === "moderate" ? "text-amber-400" : i === "low" ? "text-blue-400" : "text-green-400";
  const intensityBg = (i: DayProgram["intensity"]) =>
    i === "high" ? "bg-red-500/10" : i === "moderate" ? "bg-amber-500/10" : i === "low" ? "bg-blue-500/10" : "bg-green-500/10";
  const typeIcon = (t: DayProgram["type"]) =>
    t === "training" ? Dumbbell : t === "skill" ? Target : t === "recovery" ? Heart : t === "off" ? Snowflake : Calendar;

  // ─── Wizard Steps ─────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 0: // Position
        return (
          <div className="space-y-4">
            <h3 className="font-display text-lg text-foreground">Select Your Position</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {positions.map(p => (
                <button key={p} onClick={() => { setInputs(prev => ({ ...prev, position: p })); setStep(1); }}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    inputs.position === p ? `${accentBorder} ${accentBg} text-foreground` : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        );

      case 1: // Season Phase
        return (
          <div className="space-y-4">
            <h3 className="font-display text-lg text-foreground">Season Phase</h3>
            <div className="grid grid-cols-2 gap-3">
              {PHASES.map(p => (
                <button key={p.key} onClick={() => { setInputs(prev => ({ ...prev, phase: p.key })); setStep(2); }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    inputs.phase === p.key ? `${accentBorder} ${accentBg}` : "border-border bg-secondary hover:border-primary/30"
                  }`}>
                  <p.icon className={`w-5 h-5 mb-2 ${accent}`} />
                  <p className="text-sm font-medium text-foreground">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2: // Days + Equipment
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg text-foreground mb-3">Training Days Per Week</h3>
              <div className="flex gap-2">
                {[3, 4, 5, 6].map(d => (
                  <button key={d} onClick={() => setInputs(prev => ({ ...prev, availableDays: d }))}
                    className={`flex-1 py-3 rounded-xl border text-center font-display text-lg transition-all ${
                      inputs.availableDays === d ? `${accentBorder} ${accentBg} text-foreground` : "border-border bg-secondary text-muted-foreground"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground mb-3">Available Equipment</h3>
              <div className="grid grid-cols-2 gap-3">
                {EQUIPMENT_OPTIONS.map(eq => (
                  <button key={eq.key} onClick={() => setInputs(prev => ({ ...prev, equipment: eq.key }))}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      inputs.equipment === eq.key ? `${accentBorder} ${accentBg}` : "border-border bg-secondary hover:border-primary/30"
                    }`}>
                    <eq.icon className={`w-4 h-4 ${accent}`} />
                    <span className="text-sm font-medium text-foreground">{eq.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep(3)}>
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        );

      case 3: // Age + Experience
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg text-foreground mb-3">Age Group</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["12-14", "14-16", "16-18", "18+"].map(a => (
                  <button key={a} onClick={() => setInputs(prev => ({ ...prev, age: a }))}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      inputs.age === a ? `${accentBorder} ${accentBg} text-foreground` : "border-border bg-secondary text-muted-foreground"
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground mb-3">Experience Level</h3>
              <div className="grid grid-cols-3 gap-2">
                {["beginner", "intermediate", "advanced"].map(e => (
                  <button key={e} onClick={() => setInputs(prev => ({ ...prev, experience: e }))}
                    className={`py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                      inputs.experience === e ? `${accentBorder} ${accentBg} text-foreground` : "border-border bg-secondary text-muted-foreground"
                    }`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep(4)}>
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        );

      case 4: // Weaknesses + Generate
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg text-foreground mb-2">Target Weaknesses</h3>
              <p className="text-xs text-muted-foreground mb-3">Select areas that need extra work (optional)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WEAKNESS_OPTIONS.map(w => {
                  const selected = inputs.weaknesses.includes(w.key);
                  return (
                    <button key={w.key} onClick={() => setInputs(prev => ({
                      ...prev, weaknesses: selected ? prev.weaknesses.filter(x => x !== w.key) : [...prev.weaknesses, w.key]
                    }))}
                      className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                        selected ? `${accentBorder} ${accentBg} text-foreground` : "border-border bg-secondary text-muted-foreground"
                      }`}>
                      {selected && <Check className="w-3 h-3 inline mr-1.5" />}
                      {w.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className={`p-4 rounded-xl border ${accentBorder} ${isSoftball ? "bg-purple-500/5" : "bg-primary/5"}`}>
              <p className={`text-xs font-bold ${accent} mb-2`}>PROGRAM SUMMARY</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Position:</span> <span className="text-foreground font-medium">{inputs.position}</span></div>
                <div><span className="text-muted-foreground">Phase:</span> <span className="text-foreground font-medium capitalize">{inputs.phase}</span></div>
                <div><span className="text-muted-foreground">Days/Week:</span> <span className="text-foreground font-medium">{inputs.availableDays}</span></div>
                <div><span className="text-muted-foreground">Equipment:</span> <span className="text-foreground font-medium capitalize">{inputs.equipment}</span></div>
                <div><span className="text-muted-foreground">Age:</span> <span className="text-foreground font-medium">{inputs.age}</span></div>
                <div><span className="text-muted-foreground">Level:</span> <span className="text-foreground font-medium capitalize">{inputs.experience}</span></div>
              </div>
            </div>

            <Button className="w-full h-12 text-base" onClick={handleGenerate}>
              <Zap className="w-5 h-5 mr-2" /> Generate My Program
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Program View ─────────────────────────────────────
  const renderProgram = () => {
    if (!program) return null;
    const currentDay = program[selectedDay];
    const DayIcon = typeIcon(currentDay.type);

    return (
      <div className="space-y-5">
        {/* Program Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display text-foreground">
              {inputs.phase.charAt(0).toUpperCase() + inputs.phase.slice(1)} {inputs.position} Program
            </h2>
            <p className="text-xs text-muted-foreground">{isSoftball ? "🥎 Softball" : "⚾ Baseball"} • Week 1</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setProgram(null); setStep(0); }}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> New
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
              Save
            </Button>
          </div>
        </div>

        {/* Weekly Compliance */}
        <div className={`p-4 rounded-xl border ${accentBorder} ${isSoftball ? "bg-purple-500/5" : "bg-primary/5"}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs font-bold ${accent}`}>WEEKLY COMPLIANCE</p>
            <p className="text-sm font-display text-foreground">{compliancePct}%</p>
          </div>
          <Progress value={compliancePct} className="h-2" />
        </div>

        {/* Day Selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {program.map((day, i) => {
            const Icon = typeIcon(day.type);
            const dayCompleted = day.exercises.length > 0 && day.exercises.every((_, ei) => completedExercises.has(`${i}-${ei}`));
            return (
              <button key={i} onClick={() => setSelectedDay(i)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border text-xs transition-all ${
                  selectedDay === i
                    ? `${accentBorder} ${accentBg} text-foreground`
                    : dayCompleted
                    ? "border-green-500/30 bg-green-500/5 text-green-500"
                    : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                }`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="font-medium">{day.name.slice(0, 3)}</span>
                {day.type === "off" && <span className="text-[9px]">OFF</span>}
              </button>
            );
          })}
        </div>

        {/* Selected Day Detail */}
        <AnimatePresence mode="wait">
          <motion.div key={selectedDay} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-card border border-border rounded-2xl overflow-hidden">

            {/* Day Header */}
            <div className={`p-4 border-b border-border flex items-center justify-between ${intensityBg(currentDay.intensity)}`}>
              <div className="flex items-center gap-3">
                <DayIcon className={`w-5 h-5 ${intensityColor(currentDay.intensity)}`} />
                <div>
                  <p className="text-sm font-display text-foreground">{currentDay.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {currentDay.type} • {currentDay.duration > 0 ? `${currentDay.duration} min` : "Rest Day"} •{" "}
                    <span className={intensityColor(currentDay.intensity)}>{currentDay.intensity} intensity</span>
                  </p>
                </div>
              </div>
              {currentDay.exercises.length > 0 && (
                <span className="text-xs font-display text-foreground">{dayCompliancePct}%</span>
              )}
            </div>

            {/* Throwing Program */}
            {currentDay.throwingProgram && (
              <div className={`mx-4 mt-4 p-3 rounded-xl border ${accentBorder} ${isSoftball ? "bg-purple-500/5" : "bg-primary/5"}`}>
                <p className={`text-[10px] font-bold ${accent} mb-1`}>🎯 THROWING PROGRAM</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground font-medium">{currentDay.throwingProgram.type}</span></div>
                  <div><span className="text-muted-foreground">Count:</span> <span className="text-foreground font-medium">{currentDay.throwingProgram.count || "—"}</span></div>
                  <div><span className="text-muted-foreground">Dist:</span> <span className="text-foreground font-medium">{currentDay.throwingProgram.distance}</span></div>
                  <div><span className="text-muted-foreground">Int:</span> <span className={`font-medium ${accent}`}>{currentDay.throwingProgram.intensity}</span></div>
                </div>
              </div>
            )}

            {/* Exercise List */}
            {currentDay.type === "off" ? (
              <div className="p-8 text-center">
                <Snowflake className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Rest Day</p>
                <p className="text-xs text-muted-foreground mt-1">Prioritize sleep, nutrition, and mental recovery.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {currentDay.exercises.map((ex, exIdx) => {
                  const isCompleted = completedExercises.has(`${selectedDay}-${exIdx}`);
                  return (
                    <button
                      key={exIdx}
                      onClick={() => toggleExercise(selectedDay, exIdx)}
                      className={`w-full flex items-center gap-3 p-3.5 text-left transition-all hover:bg-secondary/50 ${
                        isCompleted ? "bg-green-500/5" : ""
                      }`}
                    >
                      {isCompleted
                        ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isCompleted ? "text-green-500 line-through" : "text-foreground"}`}>{ex.name}</p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                          <span>{ex.sets}×{ex.reps}</span>
                          <span>Rest: {ex.rest}</span>
                          <span className={`px-1.5 py-0.5 rounded ${accentBg} ${accent}`}>{ex.category}</span>
                        </div>
                        {ex.notes && <p className="text-[10px] text-amber-400 mt-0.5">⚡ {ex.notes}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Phase Info */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className={`text-[10px] font-bold ${accent} mb-2`}>
            {inputs.phase.toUpperCase()} PHASE FOCUS
          </p>
          <p className="text-xs text-muted-foreground">
            {inputs.phase === "offseason" && "Maximize strength gains, build velocity foundation, and acquire new skills. This is the time to push hard — no games to manage fatigue around."}
            {inputs.phase === "preseason" && "Convert strength to power, sharpen competition skills, and prepare for game intensity. Reduce volume, increase sport-specific work."}
            {inputs.phase === "inseason" && "Maintain strength with reduced volume. Recovery is priority — every rep should have purpose. Monitor workload closely."}
            {inputs.phase === "postseason" && "Active recovery and deload. Address nagging issues, assess progress, and set goals for the next cycle."}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accentBg}`}>
            <Dumbbell className={`w-6 h-6 ${accent}`} />
          </div>
          <div>
            <h1 className="text-2xl font-display text-foreground">PROGRAM GENERATOR</h1>
            <p className="text-xs text-muted-foreground">Your personalized {isSoftball ? "softball" : "baseball"} training program</p>
          </div>
        </div>

        {/* Wizard Progress */}
        {step < 5 && (
          <div className="mb-6">
            <div className="flex items-center gap-1 mb-2">
              {[0, 1, 2, 3, 4].map(s => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? (isSoftball ? "bg-purple-400" : "bg-primary") : "bg-border"}`} />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Position</span>
              <span>Phase</span>
              <span>Setup</span>
              <span>Details</span>
              <span>Generate</span>
            </div>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {step < 5 ? renderStep() : renderProgram()}
          </motion.div>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default WeeklyProgramGenerator;
