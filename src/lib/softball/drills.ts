// Softball-specific drill library
// Organized by skill category for the softball module

export interface Drill {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const softballDrills: Record<string, Drill[]> = {
  pitching: [
    {
      id: "fp-drill-1",
      name: "K Position Snaps",
      category: "pitching",
      description: "Start at the K position (arm at 9 o'clock) and snap through to develop wrist snap strength.",
      duration: "5 min",
      equipment: ["Softball", "Pitching Target"],
      difficulty: "beginner",
    },
    {
      id: "fp-drill-2",
      name: "Walk-Through Pitching",
      category: "pitching",
      description: "Full windmill motion with a walking approach to develop timing and rhythm.",
      duration: "10 min",
      equipment: ["Softball", "Open Space"],
      difficulty: "beginner",
    },
    {
      id: "fp-drill-3",
      name: "Resistance Band Windmill",
      category: "pitching",
      description: "Perform the windmill motion against band resistance for arm speed and power development.",
      duration: "8 min",
      equipment: ["Resistance Band", "Anchor Point"],
      difficulty: "intermediate",
    },
    {
      id: "fp-drill-4",
      name: "Spin Rate Focus Throws",
      category: "pitching",
      description: "Focused throwing with emphasis on maximizing spin on rise balls, drop balls, and curves.",
      duration: "15 min",
      equipment: ["Softball", "Catcher/Net", "Spin Rate Tracker (optional)"],
      difficulty: "advanced",
    },
  ],
  hitting: [
    {
      id: "sh-drill-1",
      name: "Tee Work: Contact Points",
      category: "hitting",
      description: "Hit off a tee at inside, middle, and outside contact points. Focus on barrel path.",
      duration: "10 min",
      equipment: ["Bat", "Tee", "Softballs"],
      difficulty: "beginner",
    },
    {
      id: "sh-drill-2",
      name: "Slap Hitting Progressions",
      category: "hitting",
      description: "Three-step slap progression: soft slap, power slap, and drag bunt.",
      duration: "15 min",
      equipment: ["Bat", "Softballs", "Pitching Machine or Partner"],
      difficulty: "intermediate",
    },
    {
      id: "sh-drill-3",
      name: "Rise Ball Timing Drill",
      category: "hitting",
      description: "Front toss with rising trajectories to practice staying back and adjusting swing plane.",
      duration: "10 min",
      equipment: ["Bat", "Softballs", "Partner"],
      difficulty: "advanced",
    },
  ],
  fielding: [
    {
      id: "sf-drill-1",
      name: "Rapid Fire Ground Balls",
      category: "fielding",
      description: "Quick-paced ground balls from short distance to develop soft hands and quick transfers.",
      duration: "8 min",
      equipment: ["Glove", "Softballs", "Partner"],
      difficulty: "beginner",
    },
    {
      id: "sf-drill-2",
      name: "Triangle Drill",
      category: "fielding",
      description: "Move to three points of a triangle fielding balls to develop range and footwork.",
      duration: "10 min",
      equipment: ["Glove", "Softballs", "Cones"],
      difficulty: "intermediate",
    },
    {
      id: "sf-drill-3",
      name: "Pop Fly Communication",
      category: "fielding",
      description: "Practice calling and tracking pop flies in the infield and outfield with teammates.",
      duration: "12 min",
      equipment: ["Gloves", "Softballs", "Multiple Players"],
      difficulty: "beginner",
    },
  ],
  baserunning: [
    {
      id: "sb-drill-1",
      name: "Leadoff Explosion",
      category: "baserunning",
      description: "Practice timing the pitcher's release and exploding off the base with maximum acceleration.",
      duration: "8 min",
      equipment: ["Base", "Stopwatch"],
      difficulty: "beginner",
    },
    {
      id: "sb-drill-2",
      name: "Sliding Circuit",
      category: "baserunning",
      description: "Practice pop-up slides, hook slides, and headfirst slides in a circuit format.",
      duration: "12 min",
      equipment: ["Bases", "Sliding Mat (optional)"],
      difficulty: "intermediate",
    },
  ],
};
