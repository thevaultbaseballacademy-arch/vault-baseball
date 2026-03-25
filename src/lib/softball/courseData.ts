// Softball-specific course data
// This module mirrors the baseball course structure but with softball-specific content

import { CourseContent } from "@/lib/courseData";

export const softballCourseContent: Record<string, CourseContent> = {
  // ═══════════════════════════════════════════════════════════════
  // 1️⃣ SOFTBALL ORGANIZATIONAL MANUAL
  // ═══════════════════════════════════════════════════════════════
  "softball-org-manual": {
    courseId: "softball-org-manual",
    modules: [
      // SECTION 1 — THE VAULT™ SOFTBALL PHILOSOPHY
      {
        id: "som-exec",
        title: "Executive Introduction",
        description: "Why softball organizations struggle — and how VAULT™ corrects it",
        lessons: [
          { id: "som-0-1", title: "The Alignment Problem", description: "Softball orgs don't struggle from lack of effort — they struggle from misalignment and misunderstanding of the game's demands.", duration: "10 min", videoUrl: "", isFree: true },
          { id: "som-0-2", title: "What VAULT™ Softball Solves", description: "How VAULT™ aligns coaches, protects athletes, builds sustainable performance, and scales without losing identity.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "som-0-3", title: "The Pitcher-Dominated Reality", description: "Softball is a high-speed, pitcher-dominated game. Your system must reflect that reality.", duration: "8 min", videoUrl: "", isFree: true },
        ],
      },
      {
        id: "som-philosophy",
        title: "Section 1: The VAULT™ Softball Philosophy",
        description: "Development must be intentional, measurable, and sustainable",
        lessons: [
          { id: "som-1-1", title: "The Core Principle", description: "Development must be intentional, measurable, and sustainable. Every decision reflects this.", duration: "10 min", videoUrl: "", isFree: true },
          { id: "som-1-2", title: "What Makes Softball Different", description: "Pitching controls outcomes more heavily, reaction windows are shorter, offensive strategy includes short game and slapping, and pitchers throw more frequently.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "som-1-3", title: "Faster Decisions, Higher Repetition", description: "Softball requires faster decisions, higher repetition, greater workload management, and more emphasis on skill transfer.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 2 — THE VAULT™ 5 PILLARS (SOFTBALL APPLICATION)
      {
        id: "som-pillars",
        title: "Section 2: The VAULT™ 5 Pillars — Softball Application",
        description: "The language of your organization: Velocity, Athleticism, Utility, Longevity, Transfer",
        lessons: [
          { id: "som-2-1", title: "Velocity Pillar", description: "Exit velocity (hitting), pitch velocity + spin (pitching), and throwing efficiency.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-2-2", title: "Athleticism Pillar", description: "Speed, first-step reaction, agility and deceleration.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "som-2-3", title: "Utility Pillar", description: "Multi-position development, role adaptability, and defensive versatility.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "som-2-4", title: "Longevity Pillar (CRITICAL)", description: "Pitch workload management, arm care systems, and recovery compliance — the most important pillar in softball.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-2-5", title: "Transfer Pillar", description: "Decision-making speed, game IQ, and pressure execution.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 3 — ORGANIZATIONAL STRUCTURE
      {
        id: "som-org-structure",
        title: "Section 3: Organizational Structure",
        description: "Roles, responsibilities, and non-negotiable rules",
        lessons: [
          { id: "som-3-1", title: "Ownership & Leadership", description: "Adopt VAULT™ as standard, enforce long-term development, protect athletes over outcomes.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "som-3-2", title: "Director of Softball Development", description: "Manage pitcher workload across all teams, ensure system alignment, monitor KPIs and injury risk, oversee certifications.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-3-3", title: "Coach Responsibilities", description: "Execute VAULT™ daily, track workload and performance, follow system rules. NON-NEGOTIABLE: No coach overrides pitcher workload rules.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 4 — DEVELOPMENT PATHWAYS
      {
        id: "som-pathways",
        title: "Section 4: Development Pathways",
        description: "Youth → Academy → Elite progression with age-appropriate focus",
        lessons: [
          { id: "som-4-1", title: "Youth Pathway (Ages 8–12)", description: "Movement quality, basic mechanics, FUN + confidence. No heavy pitching volume, no specialization pressure.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-4-2", title: "Academy Pathway (Ages 13–17)", description: "Pitching mechanics, strength & power, skill refinement. Monitor pitcher usage closely, introduce structured workloads.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "som-4-3", title: "Elite Pathway (18+)", description: "Performance optimization, role clarity, recovery dominance. Elite softball is about availability + execution.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 5 — PITCHER-CENTRIC MODEL
      {
        id: "som-pitcher-model",
        title: "Section 5: Pitcher-Centric Model",
        description: "Softball organizations must be built around pitching — the core difference",
        lessons: [
          { id: "som-5-1", title: "Why Pitching Controls Everything", description: "Pitchers control pace, outcomes, and face the highest injury risk. Your org must reflect this.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-5-2", title: "Pitching Management Rules", description: "No consecutive high-intent days. Pitch count ≠ workload — track ALL throws. Tournament play must be monitored.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "som-5-3", title: "Organizational Pitching Requirements", description: "Every team must log pitching workload, follow VAULT™ Arm Health system, and report recovery status.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 6 — OFFENSIVE PHILOSOPHY
      {
        id: "som-offense",
        title: "Section 6: Offensive Philosophy",
        description: "Speed-driven, pressure-driven, situational. The goal is pressure and advancement.",
        lessons: [
          { id: "som-6-1", title: "Softball Offensive Identity", description: "Softball offense is speed-driven, pressure-driven, and situational. The goal is not hits — the goal is pressure and advancement.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-6-2", title: "Core Offensive Components", description: "Power hitting, slap hitting, bunting system, and situational execution working together.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 7 — DEFENSIVE PHILOSOPHY
      {
        id: "som-defense",
        title: "Section 7: Defensive Philosophy",
        description: "Fast, efficient, reliable defense with softball-specific adjustments",
        lessons: [
          { id: "som-7-1", title: "Infield Defensive Principles", description: "Quick release, decision speed, and accuracy. Softball infielders face shorter reaction windows.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-7-2", title: "Outfield Defensive Principles", description: "First-step reads, route efficiency, and throw alignment for softball outfielders.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 8 — STRENGTH & CONDITIONING
      {
        id: "som-strength",
        title: "Section 8: Strength & Conditioning",
        description: "Strength must enhance performance, not fatigue athletes",
        lessons: [
          { id: "som-8-1", title: "Strength for Softball", description: "Lower body force, rotational power, deceleration, and core stability — what matters for softball athletes.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-8-2", title: "The Performance Rule", description: "Strength must enhance performance, not fatigue athletes. Programming with purpose.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 9 — ARM HEALTH & WORKLOAD
      {
        id: "som-armhealth",
        title: "Section 9: Arm Health & Workload System",
        description: "NON-NEGOTIABLE: If recovery declines → workload decreases",
        lessons: [
          { id: "som-9-1", title: "Required Tracking Standards", description: "Throw volume, intent level, and recovery compliance — every throw counts.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-9-2", title: "Red Flags & Response Protocol", description: "Loss of command, soreness, decreased velocity, fatigue patterns — how to identify and respond.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-9-3", title: "The Recovery Rule", description: "If recovery declines → workload decreases. No exceptions, no overrides.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 10 — KPIs
      {
        id: "som-kpis",
        title: "Section 10: KPIs — Organizational Health",
        description: "Availability %, workload compliance, velocity stability, decision-making, injury incidence",
        lessons: [
          { id: "som-10-1", title: "Primary Softball KPIs", description: "Availability %, pitcher workload compliance, velocity stability, decision-making success, and injury incidence.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-10-2", title: "Tracking & Reporting Standards", description: "How to measure, track, and report organizational health metrics consistently.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 11 — COACH ALIGNMENT & CERTIFICATION
      {
        id: "som-certification",
        title: "Section 11: Coach Alignment & Certification",
        description: "Expired certification = restricted access. Non-compliance = removal.",
        lessons: [
          { id: "som-11-1", title: "Certification Requirements", description: "All coaches must complete VAULT™ Certification — Foundations, Performance, and position-specific levels.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-11-2", title: "Enforcement & Accountability", description: "Expired certification = restricted access. Non-compliance = removal from system. No exceptions.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 12 — PARENT COMMUNICATION
      {
        id: "som-parents",
        title: "Section 12: Parent Communication",
        description: "Clear communication reduces conflict",
        lessons: [
          { id: "som-12-1", title: "Parent Education Framework", description: "Parents must understand: long-term development > short-term wins. Pitcher protection is critical. Workload rules are enforced.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "som-12-2", title: "Communication Systems", description: "Clear, consistent communication protocols that reduce conflict and build trust.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 13 — SCALABILITY & GROWTH
      {
        id: "som-scale",
        title: "Section 13: Scalability & Growth",
        description: "Growth without systems creates failure. VAULT™ ensures controlled growth.",
        lessons: [
          { id: "som-13-1", title: "Multi-Team & Multi-Location Alignment", description: "VAULT™ allows multi-team alignment, multi-location growth, and consistent standards across your organization.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "som-13-2", title: "Controlled Growth Model", description: "Growth without systems creates failure. VAULT™ ensures controlled, sustainable growth.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      // SECTION 14 — DECISION-MAKING MODEL + FINAL STATEMENT
      {
        id: "som-decisions",
        title: "Section 14: Decision-Making Model",
        description: "Every decision must align with the 5 pillars, protect athlete health, and maintain system integrity",
        lessons: [
          { id: "som-14-1", title: "The 3-Question Decision Filter", description: "Does it align with the 5 pillars? Does it protect long-term athlete health? Does it maintain system integrity? If not → it is rejected.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "som-14-2", title: "Building Elite Softball Organizations", description: "Elite softball organizations are built on structure, discipline, and protection of athletes. VAULT™ delivers alignment, accountability, and sustainability.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 2️⃣ SOFTBALL HITTING SYSTEM (COMPLETE)
  // ═══════════════════════════════════════════════════════════════
  "softball-hitting-complete": {
    courseId: "softball-hitting-complete",
    modules: [
      {
        id: "shc-stance",
        title: "Stance & Balance",
        description: "Building the foundation for a repeatable, powerful swing",
        lessons: [
          { id: "shc-1-1", title: "Athletic Stance Setup", description: "Proper stance width, weight distribution, and foot alignment for power and balance.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "shc-1-2", title: "Balance & Stability Drills", description: "One-leg drills, balance board work, and stability exercises for swing consistency.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "shc-1-3", title: "Hand Position & Grip", description: "Optimal grip pressure, hand position, and pre-swing hand path.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "shc-load",
        title: "Load & Timing",
        description: "Generating power through proper load mechanics",
        lessons: [
          { id: "shc-2-1", title: "Load Mechanics", description: "Weight shift, stride timing, and creating separation for power.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-2-2", title: "Timing the Windmill Pitcher", description: "Adapting timing mechanisms to the windmill delivery and pitch speed differences.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-2-3", title: "Rhythm & Tempo Drills", description: "Building consistent pre-swing rhythm for repeatable at-bats.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "shc-rotation",
        title: "Hip Rotation Engine",
        description: "Hip-driven swing = power. The engine of the softball swing.",
        lessons: [
          { id: "shc-3-1", title: "Hip-Driven Power Mechanics", description: "How hip rotation generates bat speed and exit velocity in the softball swing.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-3-2", title: "Rotational Sequencing", description: "Hips → torso → hands → bat. The kinetic chain for maximum output.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-3-3", title: "Power Drills & Med Ball Work", description: "Rotational med ball throws and resistance drills for hip speed development.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "shc-contact",
        title: "Bat Path & Contact",
        description: "Optimal swing plane and contact point training",
        lessons: [
          { id: "shc-4-1", title: "Swing Plane Optimization", description: "Matching bat path to the pitch plane for consistent hard contact.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-4-2", title: "Contact Zones: Inside, Middle, Outside", description: "Adjusting contact points for pitch location with game-situation application.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-4-3", title: "Early Mechanics for Injury Prevention", description: "Building swing mechanics that prevent elbow and wrist strain.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "shc-slap",
        title: "Slap Hitting System",
        description: "CRITICAL for softball — the complete slap hitting development system",
        lessons: [
          { id: "shc-5-1", title: "Slap Hitting Fundamentals", description: "Footwork, timing, and contact point for the left-side slap.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-5-2", title: "Soft Slap & Hard Slap Variations", description: "Developing both soft and hard slap options based on defensive alignment.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-5-3", title: "Slap Bunting Combinations", description: "Using the slap-bunt threat to keep defenses guessing.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "shc-5-4", title: "Game-Speed Slap Drills", description: "Live-speed practice and scrimmage reps for slap confidence.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "shc-recognition",
        title: "Pitch Recognition & Decision Training",
        description: "Reading the windmill delivery and making swing decisions",
        lessons: [
          { id: "shc-6-1", title: "Reading the Windmill Release", description: "Identifying pitch type and location from the windmill release point.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-6-2", title: "Rise Ball vs. Drop Ball Reads", description: "Distinguishing rise ball from drop ball early in the pitch flight.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "shc-6-3", title: "Swing/Take Decision Framework", description: "Building a consistent decision tree for every at-bat.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "shc-transfer",
        title: "Game Transfer",
        description: "Converting practice performance into game production",
        lessons: [
          { id: "shc-7-1", title: "Live At-Bat Execution", description: "Applying mechanics and decision-making under game pressure.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "shc-7-2", title: "Situational Hitting Plan", description: "Approach adjustments based on count, runners, and game context.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "shc-7-3", title: "Two-Strike Approach", description: "Shortening up and maximizing contact with two strikes.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 3️⃣ SOFTBALL PITCHING SYSTEM (ELITE — MOST IMPORTANT)
  // ═══════════════════════════════════════════════════════════════
  "softball-pitching-elite": {
    courseId: "softball-pitching-elite",
    modules: [
      {
        id: "spe-windup",
        title: "Phase 1: Wind-Up Mechanics",
        description: "The first phase — establishing rhythm, posture, and power position",
        lessons: [
          { id: "spe-1-1", title: "Wind-Up Posture & Alignment", description: "Setting up on the pitcher's circle with proper posture and foot alignment.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "spe-1-2", title: "Weight Shift & Balance Point", description: "Creating a stable balance point to initiate the arm circle.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "spe-1-3", title: "Pre-Pitch Routine Development", description: "Building a consistent pre-pitch routine for focus and timing.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "spe-stride",
        title: "Phase 2: Stride Mechanics",
        description: "Power comes from the stride — landing, direction, and force",
        lessons: [
          { id: "spe-2-1", title: "Stride Length & Direction", description: "Optimal stride length and directional accuracy toward the target.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-2-2", title: "Drive Leg Power", description: "Generating force through the back leg push for velocity.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-2-3", title: "Landing Mechanics", description: "Front foot landing position, angle, and stability for power transfer.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "spe-accel",
        title: "Phase 3: Acceleration",
        description: "The arm circle — where velocity and spin are created",
        lessons: [
          { id: "spe-3-1", title: "Arm Circle Path & Timing", description: "Efficient arm circle that stays close to the body for maximum speed.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-3-2", title: "Hip-to-Hand Connection", description: "Transferring lower-body force through the core into the arm circle.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-3-3", title: "Wrist Snap & Release Point", description: "Maximizing velocity through wrist snap timing and release consistency.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "spe-3-4", title: "Elbow Extension at Release", description: "Proper elbow mechanics to prevent hyperextension and injury.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "spe-follow",
        title: "Phase 4: Follow-Through",
        description: "Deceleration, fielding position, and arm health",
        lessons: [
          { id: "spe-4-1", title: "Follow-Through Mechanics", description: "Proper deceleration patterns to reduce shoulder stress.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "spe-4-2", title: "Fielding Position Recovery", description: "Getting into fielding-ready position immediately after release.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "spe-spin",
        title: "Spin Creation & Pitch Arsenal",
        description: "Developing rise ball, drop ball, curve, and change-up",
        lessons: [
          { id: "spe-5-1", title: "Rise Ball Mechanics & Spin", description: "Creating backspin for the rise ball with proper wrist position and release angle.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "spe-5-2", title: "Drop Ball Development", description: "Topspin mechanics for the drop ball — the most reliable out pitch.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-5-3", title: "Curveball & Screwball", description: "Lateral spin pitches for expanding the arsenal.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-5-4", title: "Change-Up Deception", description: "Arm speed deception with reduced velocity for timing disruption.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-5-5", title: "Pitch Sequencing Strategy", description: "Setting up hitters with pitch combinations and count leverage.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "spe-command",
        title: "Command Training",
        description: "Locating pitches consistently to all zones",
        lessons: [
          { id: "spe-6-1", title: "Fastball Location Work", description: "Command drills for fastball placement to all 4 quadrants.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-6-2", title: "Breaking Ball Command", description: "Locating rise, drop, and curve to specific zones.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-6-3", title: "Game-Situation Command", description: "Pitching with intent in game-realistic scenarios.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "spe-velocity",
        title: "Velocity Progression",
        description: "Safe, systematic velocity development for windmill pitchers",
        lessons: [
          { id: "spe-7-1", title: "Velocity Assessment & Baseline", description: "Establishing current velocity baseline and setting realistic goals.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "spe-7-2", title: "Overload/Underload Training", description: "Weighted ball protocols adapted for windmill mechanics.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-7-3", title: "Power Development Exercises", description: "Lower-body and core exercises that directly transfer to pitch velocity.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "spe-workload",
        title: "Workload & Recovery",
        description: "Underhand ≠ safe — shoulder stress is near bodyweight force",
        lessons: [
          { id: "spe-8-1", title: "Pitch Count Protocols", description: "Age-based and season-based pitch count limits for windmill pitchers.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-8-2", title: "Tournament Workload Management", description: "Multi-game weekend protocols when pitchers throw at high frequency.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "spe-8-3", title: "Recovery Protocols", description: "Post-game and between-start recovery routines for pitchers.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "spe-8-4", title: "Shoulder Health & Maintenance", description: "Daily maintenance routines to protect the throwing shoulder.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 4️⃣ SOFTBALL DEFENSIVE SYSTEM
  // ═══════════════════════════════════════════════════════════════
  "softball-defense-complete": {
    courseId: "softball-defense-complete",
    modules: [
      {
        id: "sdc-infield",
        title: "Infield Play (Softball Adjustments)",
        description: "Faster reaction windows, shorter arm paths, more quick-release throws",
        lessons: [
          { id: "sdc-1-1", title: "Ready Position & Anticipation", description: "Athletic ready position adapted for shorter softball reaction windows.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "sdc-1-2", title: "Short-Arm Throwing Mechanics", description: "Quick-release throws from all infield positions with accuracy.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sdc-1-3", title: "Backhand & Forehand Plays", description: "Ranging left and right with clean transfers and accurate throws.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sdc-1-4", title: "Double Play Turns", description: "Footwork and feeds for double plays from SS, 2B, and 3B.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sdc-1-5", title: "Bunt Defense", description: "Reacting to bunts and slaps with aggressive defensive positioning.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sdc-outfield",
        title: "Outfield Play",
        description: "Shorter reads, more aggressive play, faster decision-making",
        lessons: [
          { id: "sdc-2-1", title: "Ball-Off-Bat Reads", description: "First-step reactions for softball-specific fly balls and line drives.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sdc-2-2", title: "Route Efficiency", description: "Taking efficient routes with shorter distances and faster decisions.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sdc-2-3", title: "Aggressive Cutoff Play", description: "Strong, accurate throws to cutoff targets and relay positioning.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sdc-catching",
        title: "Catching (Softball-Specific)",
        description: "Framing rise balls, blocking drop balls, and quick throws",
        lessons: [
          { id: "sdc-3-1", title: "Receiving & Framing Rise Balls", description: "Technique for receiving rise balls and maintaining strike calls.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sdc-3-2", title: "Blocking Drop Balls & Low Pitches", description: "Keeping balls in front on drop curves and low-zone pitches.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sdc-3-3", title: "Throwing to Bases", description: "Pop time, footwork, and accuracy on steal attempts.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sdc-positions",
        title: "Position-Specific Development",
        description: "Detailed work for each defensive position",
        lessons: [
          { id: "sdc-4-1", title: "Pitcher Fielding (PFP)", description: "Pitcher fielding practice — comebackers, bunts, and covering first.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sdc-4-2", title: "First Base Play", description: "Scooping throws, footwork, and holding runners.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sdc-4-3", title: "Third Base: The Hot Corner", description: "Reaction time, bunt coverage, and strong throws across the diamond.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sdc-team",
        title: "Team Defense & Communication",
        description: "Coordinating defensive plays as a unit",
        lessons: [
          { id: "sdc-5-1", title: "Communication Systems", description: "Verbal and non-verbal communication protocols for the defense.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "sdc-5-2", title: "Defensive Alignments & Shifts", description: "Positioning adjustments based on hitter tendencies and game situations.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 5️⃣ SOFTBALL SPEED & BASERUNNING
  // ═══════════════════════════════════════════════════════════════
  "softball-speed-baserunning": {
    courseId: "softball-speed-baserunning",
    modules: [
      {
        id: "ssb-speed",
        title: "First-Step Explosion",
        description: "Building explosive starts from batter's box and bases",
        lessons: [
          { id: "ssb-1-1", title: "First-Step Mechanics", description: "Explosive start techniques from the batter's box and the base.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "ssb-1-2", title: "Acceleration Drills", description: "Building speed through the first 10-20 feet for home-to-first improvement.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ssb-1-3", title: "Speed Training for Softball", description: "Sprint mechanics adapted for the softball field distances.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssb-turns",
        title: "Aggressive Turns",
        description: "Rounding bases with speed and efficiency",
        lessons: [
          { id: "ssb-2-1", title: "Rounding First Base", description: "Efficient turn mechanics for extra-base hit opportunities.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ssb-2-2", title: "Second-to-Third Aggression", description: "Reading outfielders and making aggressive decisions on the basepaths.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssb-sliding",
        title: "Slide Variations",
        description: "Pop-up slides, hook slides, and headfirst technique",
        lessons: [
          { id: "ssb-3-1", title: "Pop-Up Slide Technique", description: "Clean pop-up slide execution for advancing on plays at the bag.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ssb-3-2", title: "Hook Slide & Avoidance", description: "Using the hook slide to avoid tags and reach the base.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssb-3-3", title: "Headfirst vs. Feet-First Decisions", description: "When to use each slide type based on the play situation.", duration: "10 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssb-reads",
        title: "Read-Based Baserunning",
        description: "Making smart decisions on the bases",
        lessons: [
          { id: "ssb-4-1", title: "Reading the Pitcher & Catcher", description: "Timing pitcher delivery and reading catcher intent for steals.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssb-4-2", title: "Tag-Up Decisions", description: "Reading fly ball depth and outfielder arm strength for tag-ups.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ssb-4-3", title: "Wild Pitch & Passed Ball Reads", description: "Advancing on misplayed pitches with smart aggression.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "ssb-4-4", title: "Delayed Steal & Trick Plays", description: "Advanced baserunning tactics for experienced runners.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 6️⃣ SHORT GAME SYSTEM (SIGNATURE DIFFERENTIATOR)
  // ═══════════════════════════════════════════════════════════════
  "softball-short-game": {
    courseId: "softball-short-game",
    modules: [
      {
        id: "ssg-bunting",
        title: "Bunting System",
        description: "Sacrifice bunts, drag bunts, and squeeze play execution",
        lessons: [
          { id: "ssg-1-1", title: "Sacrifice Bunt Mechanics", description: "Proper stance, bat angle, and ball placement for sacrifice bunts.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "ssg-1-2", title: "Drag Bunt Technique", description: "Running while bunting — timing, footwork, and bat control.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssg-1-3", title: "Squeeze Play Execution", description: "Timing the squeeze bunt with the runner from third.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ssg-1-4", title: "Bunt Defense Recognition", description: "Reading defensive alignment and adjusting bunt placement.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssg-push",
        title: "Push Bunts",
        description: "The aggressive bunt — pushing the ball past the pitcher",
        lessons: [
          { id: "ssg-2-1", title: "Push Bunt Mechanics", description: "Firm hands and directional push for placing bunts past charging fielders.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssg-2-2", title: "Push Bunt Target Zones", description: "Identifying optimal target zones based on defensive positioning.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ssg-2-3", title: "Speed-Based Push Bunt", description: "Using speed advantage to turn push bunts into base hits.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssg-slap",
        title: "Slap Hitting Integration",
        description: "Combining the slap with the short game for maximum pressure",
        lessons: [
          { id: "ssg-3-1", title: "Slap-Bunt Combo Reads", description: "Reading the defense and choosing between slap, bunt, or swing.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ssg-3-2", title: "Hard Slap Through the Infield", description: "Driving the ball past drawn-in infielders with force.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssg-3-3", title: "Chop Slap Over the Pitcher", description: "Using a downward chop to create high bounces for infield hits.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "ssg-situational",
        title: "Situational Offense",
        description: "When to deploy each short-game weapon based on the game situation",
        lessons: [
          { id: "ssg-4-1", title: "Runner on First — Move Her Over", description: "Sacrifice bunt vs. slap bunt vs. hit-and-run decision tree.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "ssg-4-2", title: "Runner on Third — Score Her", description: "Squeeze, safety squeeze, and contact play options.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ssg-4-3", title: "Rally Situations", description: "When to abandon the short game and go for big hits.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "ssg-4-4", title: "Short Game Practice Plans", description: "Structured practice templates for short game repetition.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 7️⃣ SOFTBALL ARM HEALTH
  // ═══════════════════════════════════════════════════════════════
  "softball-arm-health": {
    courseId: "softball-arm-health",
    modules: [
      {
        id: "sah-volume",
        title: "Pitch Volume Tracking (CRITICAL)",
        description: "Monitoring pitch volume is the #1 injury prevention tool for softball pitchers",
        lessons: [
          { id: "sah-1-1", title: "Why Pitch Volume Matters", description: "Softball pitchers throw WAY more frequently than baseball pitchers. Understanding cumulative stress.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "sah-1-2", title: "Daily & Weekly Pitch Limits", description: "Age-based pitch count guidelines: 50/day (10U-12U), 75/day (14U), 100/day (16U+).", duration: "14 min", videoUrl: "", isFree: true },
          { id: "sah-1-3", title: "Season-Long Volume Planning", description: "Mapping pitch volume across an entire season for sustainable performance.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sah-overlap",
        title: "Pitcher + Position Overlap Rules",
        description: "Managing athletes who pitch AND play other throwing positions",
        lessons: [
          { id: "sah-2-1", title: "Pitcher-Catcher Overlap Policy", description: "When pitchers also catch — mandatory rules and restrictions.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sah-2-2", title: "Pitching + Shortstop/Third Base", description: "Managing total throw volume when pitchers play throwing-intensive positions.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sah-2-3", title: "Multi-Position Athlete Plans", description: "Creating individualized workload plans for dual-role athletes.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sah-tournament",
        title: "Tournament Workload Control",
        description: "Multi-game weekends are where most softball injuries happen",
        lessons: [
          { id: "sah-3-1", title: "Tournament Pitch Count Protocols", description: "Managing pitch volume across 3-5 games in a weekend.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sah-3-2", title: "Between-Game Recovery", description: "Active recovery protocols between tournament games.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sah-3-3", title: "Safe to Pitch Flag System", description: "Real-time pitcher availability tracking for coaches.", duration: "12 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sah-recovery",
        title: "Recovery Cycles",
        description: "Structured recovery for windmill pitchers",
        lessons: [
          { id: "sah-4-1", title: "Post-Game Arm Care Routine", description: "Immediate post-game recovery: ice, bands, stretching protocol.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sah-4-2", title: "Between-Start Recovery", description: "What to do in the days between pitching appearances.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sah-4-3", title: "Off-Season Arm Recovery Phase", description: "Structured rest and rebuilding phase after the season.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sah-shoulder",
        title: "Shoulder Health Maintenance",
        description: "Underhand ≠ safe — shoulder stress is near bodyweight force",
        lessons: [
          { id: "sah-5-1", title: "Windmill Shoulder Anatomy", description: "Understanding the forces on the shoulder during windmill pitching.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sah-5-2", title: "Daily Shoulder Maintenance", description: "Band work, CARs, and mobility for daily shoulder health.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sah-5-3", title: "Warning Signs & Red Flags", description: "Recognizing early signs of shoulder stress before injury occurs.", duration: "10 min", videoUrl: "", isFree: false },
          { id: "sah-5-4", title: "Injury Risk Flags", description: "Elbow bend at release, closed hip finish, hyperextended stride — automated detection.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },

  // Keep original courses for backward compatibility
  "fastpitch-pitching-system": {
    courseId: "fastpitch-pitching-system",
    modules: [
      {
        id: "fp-week-1",
        title: "Week 1: Fastpitch Foundations",
        description: "Building the foundation for windmill pitching mechanics",
        lessons: [
          { id: "fp-1-1", title: "Windmill Mechanics Overview", description: "Understanding the biomechanics of the windmill pitch and proper body alignment.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "fp-1-2", title: "Stride & Drive Mechanics", description: "Developing a powerful stride with proper push-off and landing mechanics.", duration: "16 min", videoUrl: "", isFree: true },
          { id: "fp-1-3", title: "Wrist Snap & Release Point", description: "Mastering the wrist snap for maximum velocity and spin.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "fp-1-4", title: "Arm Circle Timing", description: "Coordinating the arm circle with lower body mechanics for power transfer.", duration: "15 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "fp-week-2",
        title: "Week 2: Pitch Arsenal Development",
        description: "Building a complete pitch repertoire",
        lessons: [
          { id: "fp-2-1", title: "Fastball Command", description: "Locating the fastball to all quadrants of the strike zone.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "fp-2-2", title: "Change-Up Development", description: "Developing an effective change-up with proper arm speed deception.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "fp-2-3", title: "Rise Ball Mechanics", description: "Mastering the rise ball with proper backspin and release angle.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "fp-2-4", title: "Drop Ball & Curve", description: "Developing breaking pitches with consistent spin and movement.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "fp-week-3",
        title: "Week 3: Velocity & Durability",
        description: "Increasing pitch speed while maintaining arm health",
        lessons: [
          { id: "fp-3-1", title: "Velocity Development Drills", description: "Targeted drills to increase fastpitch velocity safely.", duration: "20 min", videoUrl: "", isFree: false },
          { id: "fp-3-2", title: "Arm Care for Pitchers", description: "Softball-specific arm care routine for windmill pitchers.", duration: "15 min", videoUrl: "", isFree: false },
          { id: "fp-3-3", title: "Game Situation Pitching", description: "Pitch sequencing and strategy for different counts and situations.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "softball-hitting-system": {
    courseId: "softball-hitting-system",
    modules: [
      {
        id: "sh-week-1",
        title: "Week 1: Hitting Foundations",
        description: "Building a repeatable, powerful softball swing",
        lessons: [
          { id: "sh-1-1", title: "Stance & Load Mechanics", description: "Setting up for success with proper stance width, weight distribution, and load timing.", duration: "14 min", videoUrl: "", isFree: true },
          { id: "sh-1-2", title: "Rotational vs. Linear Hitting", description: "Understanding swing plane options and when to use each approach.", duration: "16 min", videoUrl: "", isFree: true },
          { id: "sh-1-3", title: "Contact Point Zones", description: "Identifying optimal contact points for inside, middle, and outside pitches.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sh-week-2",
        title: "Week 2: Advanced Hitting",
        description: "Developing power and situational hitting skills",
        lessons: [
          { id: "sh-2-1", title: "Slap Hitting Fundamentals", description: "Mastering the slap hit for speed-based offense and bunting for base hits.", duration: "18 min", videoUrl: "", isFree: false },
          { id: "sh-2-2", title: "Power Hitting Development", description: "Generating backspin and lift for extra-base hits.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sh-2-3", title: "Timing the Rise Ball", description: "Adjustments for handling rise balls, drop balls, and off-speed pitches.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "softball-fielding-system": {
    courseId: "softball-fielding-system",
    modules: [
      {
        id: "sf-week-1",
        title: "Week 1: Infield Play",
        description: "Developing elite infield skills for softball",
        lessons: [
          { id: "sf-1-1", title: "Ready Position & First Step", description: "Athletic stance and explosive first-step reactions for infielders.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "sf-1-2", title: "Backhand & Forehand Plays", description: "Technique for fielding balls to both sides with clean transfers.", duration: "15 min", videoUrl: "", isFree: false },
          { id: "sf-1-3", title: "Double Play Turns", description: "Footwork and feeds for turning double plays from all infield positions.", duration: "14 min", videoUrl: "", isFree: false },
        ],
      },
      {
        id: "sf-week-2",
        title: "Week 2: Outfield & Catching",
        description: "Position-specific defensive development",
        lessons: [
          { id: "sf-2-1", title: "Outfield Routes & Jumps", description: "Reading the ball off the bat and taking efficient routes.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sf-2-2", title: "Catching: Framing & Blocking", description: "Softball-specific catching techniques including framing rise balls.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "sf-2-3", title: "Throwing from Position", description: "Quick transfers and accurate throws from every defensive position.", duration: "15 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "softball-baserunning": {
    courseId: "softball-baserunning",
    modules: [
      {
        id: "sb-week-1",
        title: "Week 1: Speed & Stealing",
        description: "Developing elite baserunning skills for softball",
        lessons: [
          { id: "sb-1-1", title: "Leadoff & Timing", description: "Understanding softball leadoff rules and timing the pitcher's release.", duration: "12 min", videoUrl: "", isFree: true },
          { id: "sb-1-2", title: "Stealing Mechanics", description: "First step explosion and running form for stealing bases.", duration: "14 min", videoUrl: "", isFree: false },
          { id: "sb-1-3", title: "Sliding Techniques", description: "Pop-up slides, hook slides, and headfirst decisions.", duration: "12 min", videoUrl: "", isFree: false },
          { id: "sb-1-4", title: "Situational Baserunning", description: "Reading the defense, tagging up, and advancing on wild pitches.", duration: "16 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
  "softball-strength-conditioning": {
    courseId: "softball-strength-conditioning",
    modules: [
      {
        id: "ssc-week-1",
        title: "Week 1: Softball-Specific Strength",
        description: "Building functional strength for softball athletes",
        lessons: [
          { id: "ssc-1-1", title: "Lower Body Power", description: "Squats, lunges, and plyometrics designed for softball movements.", duration: "20 min", videoUrl: "", isFree: true },
          { id: "ssc-1-2", title: "Rotational Power for Hitters", description: "Med ball and cable work for generating bat speed and exit velocity.", duration: "16 min", videoUrl: "", isFree: false },
          { id: "ssc-1-3", title: "Pitching-Specific Conditioning", description: "Shoulder stability and core endurance for pitchers.", duration: "18 min", videoUrl: "", isFree: false },
        ],
      },
    ],
  },
};

// Softball course catalog for the Courses page
export const softballTrainingSystems = [
  {
    id: "fastpitch-pitching",
    pillar: "V",
    title: "Fastpitch Pitching System",
    description: "Master windmill mechanics, develop a complete pitch arsenal, and increase velocity through softball-specific training.",
    duration: "10 Weeks",
    modules: 3,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500",
    metrics: ["Pitch Speed", "Spin Rate", "Rise Ball Velo", "Command %"],
    isNew: true,
    courseId: "fastpitch-pitching-system",
  },
  {
    id: "softball-hitting",
    pillar: "A",
    title: "Softball Hitting System",
    description: "Build a powerful, repeatable swing with slap hitting, power hitting, and timing adjustments for softball pitching.",
    duration: "8 Weeks",
    modules: 2,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-500",
    metrics: ["Exit Velocity", "Bat Speed", "Slap Speed", "Contact Rate"],
    isNew: true,
    courseId: "softball-hitting-system",
  },
  {
    id: "softball-fielding",
    pillar: "U",
    title: "Softball Fielding System",
    description: "Elite defensive skills for every position including infield play, outfield routes, and catching techniques.",
    duration: "6 Weeks",
    modules: 2,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    metrics: ["Throw Velocity", "Reaction Time", "Range Factor", "Fielding %"],
    isNew: true,
    courseId: "softball-fielding-system",
  },
];

export const softballAdditionalSystems = [
  {
    pillar: "L",
    title: "Softball Arm Health",
    description: "Windmill pitcher-specific arm care and shoulder stability",
    color: "text-purple-400",
  },
  {
    pillar: "T",
    title: "Baserunning System",
    description: "Speed, stealing, and situational baserunning for softball",
    color: "text-amber-400",
  },
  {
    pillar: "S",
    title: "Strength & Conditioning",
    description: "Softball-specific strength, power, and conditioning programs",
    color: "text-green-400",
  },
];
