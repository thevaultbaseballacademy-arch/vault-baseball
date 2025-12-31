// Course content data structure
// In production, this would come from your database

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl?: string;
  isFree: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface CourseContent {
  courseId: string;
  modules: Module[];
}

// Sample course content with real training videos
// Replace these URLs with your actual training video URLs
export const courseContent: Record<string, CourseContent> = {
  "velocity-system": {
    courseId: "velocity-system",
    modules: [
      {
        id: "vs-week-1",
        title: "Week 1: Foundation",
        description: "Building the foundation for arm health and velocity",
        lessons: [
          {
            id: "vs-1-1",
            title: "Program Overview & Assessment",
            description: "Learn how to assess your current throwing mechanics and set baseline measurements.",
            duration: "12 min",
            videoUrl: "https://www.youtube.com/watch?v=example1",
            isFree: true,
          },
          {
            id: "vs-1-2",
            title: "Arm Care Routine",
            description: "Daily arm care exercises to prevent injury and promote recovery.",
            duration: "15 min",
            videoUrl: "https://www.youtube.com/watch?v=example2",
            isFree: true,
          },
          {
            id: "vs-1-3",
            title: "Long Toss Protocol",
            description: "Proper long toss technique and progressive distance training.",
            duration: "18 min",
            videoUrl: "https://www.youtube.com/watch?v=example3",
            isFree: false,
          },
          {
            id: "vs-1-4",
            title: "Weighted Ball Introduction",
            description: "Safe introduction to weighted ball training.",
            duration: "14 min",
            videoUrl: "https://www.youtube.com/watch?v=example4",
            isFree: false,
          },
        ],
      },
      {
        id: "vs-week-2",
        title: "Week 2: Mechanics",
        description: "Developing efficient throwing mechanics",
        lessons: [
          {
            id: "vs-2-1",
            title: "Hip-Shoulder Separation",
            description: "Maximizing rotational power through proper sequencing.",
            duration: "16 min",
            videoUrl: "https://www.youtube.com/watch?v=example5",
            isFree: false,
          },
          {
            id: "vs-2-2",
            title: "Arm Path Optimization",
            description: "Creating an efficient arm path for velocity and health.",
            duration: "14 min",
            videoUrl: "https://www.youtube.com/watch?v=example6",
            isFree: false,
          },
          {
            id: "vs-2-3",
            title: "Lead Leg Block",
            description: "Using the lead leg to transfer energy up the chain.",
            duration: "12 min",
            videoUrl: "https://www.youtube.com/watch?v=example7",
            isFree: false,
          },
          {
            id: "vs-2-4",
            title: "Drill Combinations",
            description: "Putting it all together with compound drills.",
            duration: "20 min",
            videoUrl: "https://www.youtube.com/watch?v=example8",
            isFree: false,
          },
        ],
      },
      {
        id: "vs-week-3",
        title: "Week 3: Intensity",
        description: "Building arm strength and throwing intensity",
        lessons: [
          {
            id: "vs-3-1",
            title: "Pulldown Training",
            description: "Max effort throwing for velocity development.",
            duration: "15 min",
            videoUrl: "https://www.youtube.com/watch?v=example9",
            isFree: false,
          },
          {
            id: "vs-3-2",
            title: "Plyo Ball Routines",
            description: "Advanced weighted ball drills for power development.",
            duration: "18 min",
            videoUrl: "https://www.youtube.com/watch?v=example10",
            isFree: false,
          },
          {
            id: "vs-3-3",
            title: "Recovery Protocols",
            description: "Managing workload and optimizing recovery.",
            duration: "10 min",
            videoUrl: "https://www.youtube.com/watch?v=example11",
            isFree: false,
          },
          {
            id: "vs-3-4",
            title: "Progress Assessment",
            description: "Measuring gains and planning next phase.",
            duration: "12 min",
            videoUrl: "https://www.youtube.com/watch?v=example12",
            isFree: false,
          },
        ],
      },
    ],
  },
  "strength-conditioning": {
    courseId: "strength-conditioning",
    modules: [
      {
        id: "sc-week-1",
        title: "Week 1: Assessment & Movement",
        description: "Establishing baseline strength and movement patterns",
        lessons: [
          {
            id: "sc-1-1",
            title: "Strength Assessment",
            description: "Testing your current strength levels across key lifts.",
            duration: "20 min",
            videoUrl: "https://www.youtube.com/watch?v=sc1",
            isFree: true,
          },
          {
            id: "sc-1-2",
            title: "Movement Screening",
            description: "Identifying mobility limitations and imbalances.",
            duration: "15 min",
            videoUrl: "https://www.youtube.com/watch?v=sc2",
            isFree: true,
          },
          {
            id: "sc-1-3",
            title: "Squat Fundamentals",
            description: "Building a strong squat pattern from the ground up.",
            duration: "18 min",
            videoUrl: "https://www.youtube.com/watch?v=sc3",
            isFree: false,
          },
          {
            id: "sc-1-4",
            title: "Hinge Mechanics",
            description: "Deadlift and RDL technique for power development.",
            duration: "16 min",
            videoUrl: "https://www.youtube.com/watch?v=sc4",
            isFree: false,
          },
        ],
      },
      {
        id: "sc-week-2",
        title: "Week 2: Power Development",
        description: "Building explosive power for the diamond",
        lessons: [
          {
            id: "sc-2-1",
            title: "Olympic Lift Progressions",
            description: "Clean and snatch variations for baseball athletes.",
            duration: "22 min",
            videoUrl: "https://www.youtube.com/watch?v=sc5",
            isFree: false,
          },
          {
            id: "sc-2-2",
            title: "Medicine Ball Training",
            description: "Rotational power development with med balls.",
            duration: "14 min",
            videoUrl: "https://www.youtube.com/watch?v=sc6",
            isFree: false,
          },
          {
            id: "sc-2-3",
            title: "Plyometric Foundations",
            description: "Jump training for explosive lower body power.",
            duration: "16 min",
            videoUrl: "https://www.youtube.com/watch?v=sc7",
            isFree: false,
          },
        ],
      },
    ],
  },
  "speed-agility": {
    courseId: "speed-agility",
    modules: [
      {
        id: "sa-week-1",
        title: "Week 1: Sprint Mechanics",
        description: "Developing elite linear speed",
        lessons: [
          {
            id: "sa-1-1",
            title: "Sprint Posture & Arm Action",
            description: "The fundamentals of efficient sprinting.",
            duration: "14 min",
            videoUrl: "https://www.youtube.com/watch?v=sa1",
            isFree: true,
          },
          {
            id: "sa-1-2",
            title: "First Step Quickness",
            description: "Explosive starts and acceleration mechanics.",
            duration: "12 min",
            videoUrl: "https://www.youtube.com/watch?v=sa2",
            isFree: true,
          },
          {
            id: "sa-1-3",
            title: "Base Running Speed",
            description: "Applying sprint mechanics to the bases.",
            duration: "16 min",
            videoUrl: "https://www.youtube.com/watch?v=sa3",
            isFree: false,
          },
        ],
      },
      {
        id: "sa-week-2",
        title: "Week 2: Change of Direction",
        description: "Multi-directional speed for defensive excellence",
        lessons: [
          {
            id: "sa-2-1",
            title: "Lateral Movement Patterns",
            description: "Efficient side-to-side movement for infielders.",
            duration: "15 min",
            videoUrl: "https://www.youtube.com/watch?v=sa4",
            isFree: false,
          },
          {
            id: "sa-2-2",
            title: "Drop Step & Crossover",
            description: "Outfield-specific movement skills.",
            duration: "14 min",
            videoUrl: "https://www.youtube.com/watch?v=sa5",
            isFree: false,
          },
        ],
      },
    ],
  },
  // NEW COURSES FROM VAULT PDFs
  "arm-health-workload": {
    courseId: "arm-health-workload",
    modules: [
      {
        id: "ah-intro",
        title: "Executive Overview",
        description: "Understanding arm health as a performance system, not a medical reaction",
        lessons: [
          {
            id: "ah-1-1",
            title: "Arm Health Philosophy",
            description: "VAULT™ manages total throwing stress by controlling volume, intent, and recovery.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "ah-1-2",
            title: "Key Performance Indicators",
            description: "Learn about Availability %, High-Intent Days, Recovery Compliance, and Velocity Stability.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "ah-mobility",
        title: "Mobility & Activation",
        description: "Restore range of motion and prep stabilizers",
        lessons: [
          {
            id: "ah-2-1",
            title: "T-Spine Rotations & Shoulder CARs",
            description: "Mobility exercises to restore range of motion.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ah-2-2",
            title: "Band ER & Serratus Wall Slides",
            description: "Activation exercises to prep stabilizers.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ah-strength",
        title: "Arm Strength & Tissue Resilience",
        description: "Build tissue resilience through targeted strength work",
        lessons: [
          {
            id: "ah-3-1",
            title: "DB ER, Rows & Landmine Press",
            description: "Strength exercises for tissue resilience.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ah-3-2",
            title: "Eccentric Band ER & Reverse Throws",
            description: "Deceleration training to protect arm post-release.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ah-recovery",
        title: "Recovery Protocols",
        description: "Restore the nervous system and optimize recovery",
        lessons: [
          {
            id: "ah-4-1",
            title: "Breathing & Light Band Work",
            description: "Recovery techniques to restore the nervous system.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ah-4-2",
            title: "Sleep Optimization for Athletes",
            description: "How sleep impacts arm health and performance.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "strength-power-system": {
    courseId: "strength-power-system",
    modules: [
      {
        id: "sp-foundation",
        title: "Force Category Foundations",
        description: "Understanding the key force categories for baseball performance",
        lessons: [
          {
            id: "sp-1-1",
            title: "Lower-Body Force Production",
            description: "Trap-bar deadlift, split squat, box squat for ground force production.",
            duration: "20 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "sp-1-2",
            title: "Rotational Power Transfer",
            description: "Med-ball scoop toss, shot-put throw for hip-to-torso power.",
            duration: "18 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "sp-decel",
        title: "Deceleration & Stability",
        description: "Braking, tissue protection, and force transfer",
        lessons: [
          {
            id: "sp-2-1",
            title: "Depth Drops & Eccentric Split Squats",
            description: "Deceleration training for braking and tissue protection.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "sp-2-2",
            title: "Pallof Press & Suitcase Carry",
            description: "Anti-rotation work for stability and force transfer.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "sp-inseason",
        title: "In-Season Training Model",
        description: "Maintain force output while managing fatigue during the season",
        lessons: [
          {
            id: "sp-3-1",
            title: "In-Season Programming Principles",
            description: "1-2 lifts per week with submaximal, high intent loading.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "sp-3-2",
            title: "Priority: Deceleration & Recovery",
            description: "Maintaining durability while avoiding max effort lifting.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "sp-offseason",
        title: "Off-Season Training Model",
        description: "Build force capacity, power output, and structural resilience",
        lessons: [
          {
            id: "sp-4-1",
            title: "Off-Season Programming Principles",
            description: "3-4 lifts per week with progressive strength to power.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "sp-4-2",
            title: "Rotational & Acceleration Work",
            description: "Building force production and movement quality.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "organizational-development": {
    courseId: "organizational-development",
    modules: [
      {
        id: "od-intro",
        title: "Executive Introduction",
        description: "Understanding organizational alignment in baseball development",
        lessons: [
          {
            id: "od-1-1",
            title: "The Core Problem: Misalignment",
            description: "Why standards that vary by coach or team make development fragile.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "od-1-2",
            title: "The VAULT™ Five Pillars",
            description: "Velocity, Athleticism, Utility, Longevity, Transfer - the foundation of development.",
            duration: "15 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "od-alignment",
        title: "Organizational Alignment Model",
        description: "Creating consistency from leadership to athletes",
        lessons: [
          {
            id: "od-2-1",
            title: "The Alignment Hierarchy",
            description: "Ownership → Director of Player Development → Coaches → Athletes.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "od-2-2",
            title: "Consistent Development Standards",
            description: "Ensuring athletes receive the same development regardless of team or age group.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "od-decisions",
        title: "Decision-Making Framework",
        description: "The VAULT™ decision-making filter for organizational choices",
        lessons: [
          {
            id: "od-3-1",
            title: "The Three Filter Questions",
            description: "Does it align with the 5 pillars? Protect long-term development? Preserve system integrity?",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "od-3-2",
            title: "Applying the Filter in Practice",
            description: "Real-world examples of using the decision-making framework.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "pitcher-catcher-overlap": {
    courseId: "pitcher-catcher-overlap",
    modules: [
      {
        id: "pco-overview",
        title: "Policy Overview",
        description: "Managing dual-role athletes who pitch and catch",
        lessons: [
          {
            id: "pco-1-1",
            title: "Understanding Overlap Stress",
            description: "Why athletes who pitch and catch experience significantly higher throwing stress.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "pco-1-2",
            title: "Monitoring & Limiting Overlap",
            description: "How overlap is monitored, limited, and adjusted throughout the season.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "pco-rules",
        title: "Non-Negotiable Rules",
        description: "The essential policies for protecting dual-role athletes",
        lessons: [
          {
            id: "pco-2-1",
            title: "Same-Game & Recovery Rules",
            description: "No pitching and catching in the same game. Mandatory recovery after catching → pitching.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "pco-2-2",
            title: "Weekly Limits & Director Approval",
            description: "High-intent days capped per week. Director approval required for overlap.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "winning-athlete-mindset": {
    courseId: "winning-athlete-mindset",
    modules: [
      {
        id: "wam-intro",
        title: "Introduction & Program Goals",
        description: "Building elite confidence, mental toughness, and competitive resilience",
        lessons: [
          {
            id: "wam-1-1",
            title: "Program Overview",
            description: "A 10-week mental performance training system for elite competitors.",
            duration: "10 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "wam-1-2",
            title: "Weekly Structure",
            description: "Mental lessons, daily tasks, journal prompts, and weekly challenges.",
            duration: "8 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "wam-week1",
        title: "Week 1: Identity & Purpose",
        description: "Athletes perform best when they understand who they are",
        lessons: [
          {
            id: "wam-2-1",
            title: "Define Who You Are",
            description: "Creating your Athlete Identity Statement and long-term vision.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "wam-2-2",
            title: "Champion Discipline Challenge",
            description: "Complete 1 full day of 'no excuses' discipline checklist.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "wam-week2",
        title: "Week 2: Confidence & Self-Talk",
        description: "True confidence comes from preparation, repetition, and intentional self-talk",
        lessons: [
          {
            id: "wam-3-1",
            title: "The Confidence Equation",
            description: "Confidence = Reps + Preparation + Belief. Self-talk controls performance.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "wam-3-2",
            title: "Reframing Negative Thoughts",
            description: "Techniques for shifting internal language to elite patterns.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "wam-weeks3-10",
        title: "Weeks 3-10: Advanced Mindset Training",
        description: "Focus, pressure, resilience, leadership, and championship habits",
        lessons: [
          {
            id: "wam-4-1",
            title: "Focus & Emotional Control",
            description: "Developing focus and emotional control under pressure.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "wam-4-2",
            title: "Leadership & Champion Mindset",
            description: "Building leadership habits and a champion mindset.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "wam-4-3",
            title: "Performance Consistency",
            description: "Improve performance consistency and pre-game readiness.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "elite-mental-performance": {
    courseId: "elite-mental-performance",
    modules: [
      {
        id: "emp-pillars",
        title: "Mental Performance Pillars",
        description: "The five core pillars of championship-level mental strength",
        lessons: [
          {
            id: "emp-1-1",
            title: "The Five Pillars Overview",
            description: "Confidence, Focus, Emotional Speed, Self-Talk, and Competitive Identity.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "emp-1-2",
            title: "Building Each Pillar",
            description: "How each pillar is built through repetition and proof.",
            duration: "15 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "emp-visualization",
        title: "Visualization & Self-Talk System",
        description: "5-minute daily routines and identity-based affirmations",
        lessons: [
          {
            id: "emp-2-1",
            title: "5-Minute Visualization Routine",
            description: "Daily visualization practice for pre-game mental preparation.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "emp-2-2",
            title: "Identity-Based Affirmations",
            description: "Creating and using competitive self-talk: 'I attack, I compete, I finish.'",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "emp-2-3",
            title: "Confidence Anchors & Reset Words",
            description: "Pre-game visualization scripts and mental triggers.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "emp-emotional",
        title: "Emotional Speed & Reset System",
        description: "Recovering fast from mistakes with structured routines",
        lessons: [
          {
            id: "emp-3-1",
            title: "The 6-Second Reset Routine",
            description: "Mistake → Breath → Reset → Refocus pattern for quick recovery.",
            duration: "10 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "emp-3-2",
            title: "Performance Breathing",
            description: "Box breath, 4-2-6 breath, and emotional neutrality training.",
            duration: "12 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "emp-10week",
        title: "10-Week Mindset Calendar",
        description: "Progressive mental performance training program",
        lessons: [
          {
            id: "emp-4-1",
            title: "Weeks 1-5: Foundation Building",
            description: "Confidence base, emotional speed, focus training, visualization, pressure work.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "emp-4-2",
            title: "Weeks 6-10: Championship Performance",
            description: "Self-talk upgrade, competitive identity, mental toughness, consistency, testing.",
            duration: "22 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "elite-speed-agility": {
    courseId: "elite-speed-agility",
    modules: [
      {
        id: "esa-warmup",
        title: "Warmup & Activation System",
        description: "Preparing the body for high-level speed work",
        lessons: [
          {
            id: "esa-1-1",
            title: "Dynamic Warmup Protocol",
            description: "A-Skips, B-Skips, linear mobility drills.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "esa-1-2",
            title: "Acceleration & Plyometric Prep",
            description: "Wall drive series, lean-fall sprints, pogo jumps, mini-hurdles.",
            duration: "15 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "esa-mechanics",
        title: "Sprint Mechanics",
        description: "Acceleration position and top-speed mechanics",
        lessons: [
          {
            id: "esa-2-1",
            title: "Acceleration Position",
            description: "45° forward lean, powerful knee punch technique.",
            duration: "14 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "esa-2-2",
            title: "Top-Speed Position",
            description: "Tall posture, front-side mechanics, relaxed upper body.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "esa-12week",
        title: "12-Week Speed & Agility Calendar",
        description: "Progressive training from foundation to peak performance",
        lessons: [
          {
            id: "esa-3-1",
            title: "Weeks 1-4: Foundation Phase",
            description: "Acceleration foundation, stride projection, stride frequency, COD foundation.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "esa-3-2",
            title: "Weeks 5-8: Development Phase",
            description: "Agility angles, reactive speed, sprint efficiency, explosive power.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "esa-3-3",
            title: "Weeks 9-12: Peak Phase",
            description: "Sport-speed application, peak speed, max COD ability, testing week.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "esa-drills",
        title: "Elite Drill Library",
        description: "Advanced drills for acceleration, agility, and reactive speed",
        lessons: [
          {
            id: "esa-4-1",
            title: "Acceleration Drills",
            description: "Wall drills, linear starts, hip projection techniques.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "esa-4-2",
            title: "Agility & Reactive Drills",
            description: "Crossover steps, lateral transitions, mirror drills, reaction starts.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
  "elite-hitting-exit-velocity": {
    courseId: "elite-hitting-exit-velocity",
    modules: [
      {
        id: "ehev-warmup",
        title: "Warmup & Activation System",
        description: "Preparing for high-intent hitting work",
        lessons: [
          {
            id: "ehev-1-1",
            title: "Dynamic Warmup for Hitters",
            description: "Skips, hip mobility, med ball warmups.",
            duration: "12 min",
            videoUrl: "",
            isFree: true,
          },
          {
            id: "ehev-1-2",
            title: "Bat Speed & Rotational Prep",
            description: "Top-hand/bottom-hand work, bat path drills, mini-band rotations.",
            duration: "14 min",
            videoUrl: "",
            isFree: true,
          },
        ],
      },
      {
        id: "ehev-mechanics",
        title: "Advanced Swing Mechanics",
        description: "Hip-rotation sequence and elite barrel path",
        lessons: [
          {
            id: "ehev-2-1",
            title: "Hip-Rotation Sequence",
            description: "Lead hip fires first, torso and shoulders follow for maximum power.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ehev-2-2",
            title: "Elite Barrel Path",
            description: "Smooth on-plane entry with slight upward attack angle.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ehev-12week",
        title: "12-Week Exit Velocity Calendar",
        description: "Progressive training from foundation to max EV",
        lessons: [
          {
            id: "ehev-3-1",
            title: "Weeks 1-4: Foundation Phase",
            description: "Posture & base, sequencing, barrel path, bat speed intro.",
            duration: "20 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ehev-3-2",
            title: "Weeks 5-8: Power Development Phase",
            description: "Rotation power, intent training, game-speed approach, gap-to-gap power.",
            duration: "22 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ehev-3-3",
            title: "Weeks 9-12: Peak Performance Phase",
            description: "Advanced barrel control, bat speed peak, max EV training, testing week.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
      {
        id: "ehev-drills",
        title: "Elite Hitting Drill Library",
        description: "Advanced drills for bat speed and exit velocity",
        lessons: [
          {
            id: "ehev-4-1",
            title: "Coil Load & Launch Sequence",
            description: "Building the foundation for explosive swings.",
            duration: "15 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ehev-4-2",
            title: "Overspeed & Overload Training",
            description: "Using bat speed tools to increase exit velocity.",
            duration: "18 min",
            videoUrl: "",
            isFree: false,
          },
          {
            id: "ehev-4-3",
            title: "Intent Training Sessions",
            description: "High intent tee and front toss for maximum power output.",
            duration: "16 min",
            videoUrl: "",
            isFree: false,
          },
        ],
      },
    ],
  },
};

export const getCourseContent = (courseId: string): CourseContent | undefined => {
  return courseContent[courseId];
};
