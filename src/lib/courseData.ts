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
};

export const getCourseContent = (courseId: string): CourseContent | undefined => {
  return courseContent[courseId];
};
