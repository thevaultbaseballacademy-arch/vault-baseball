import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, PlayCircle, Star, Zap, Target, Dumbbell, Wind, Brain, CheckCircle, Lock, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import courseHitting from "@/assets/course-hitting.jpg";
import coursePitching from "@/assets/course-pitching.jpg";
import courseFielding from "@/assets/course-fielding.jpg";

const allCourses = [
  {
    id: 1,
    title: "Velocity System",
    description: "Increase bat speed, exit velocity, and throwing power with kinetic chain training. This comprehensive program focuses on developing rotational power, hip-shoulder separation, and explosive movements.",
    image: courseHitting,
    duration: "12 Weeks",
    modules: 6,
    lessons: 48,
    icon: Zap,
    tag: "Most Popular",
    category: "hitting",
    level: "Intermediate",
    metrics: ["Exit Velocity", "Bat Speed", "Throwing Velo"],
    features: [
      "Video analysis of swing mechanics",
      "Weekly drills and exercises",
      "Progress tracking dashboard",
      "1-on-1 coach feedback",
      "Access to private community",
    ],
    instructor: "Coach Mike Johnson",
    students: 1240,
  },
  {
    id: 2,
    title: "Strength & Conditioning",
    description: "Build total-body strength, durability, and athletic foundation for peak performance. Designed specifically for baseball players to maximize power while maintaining mobility.",
    image: coursePitching,
    duration: "12 Weeks",
    modules: 4,
    lessons: 36,
    icon: Dumbbell,
    tag: "Foundation",
    category: "strength",
    level: "All Levels",
    metrics: ["Squat", "Deadlift", "Power Output"],
    features: [
      "Periodized training blocks",
      "Mobility and recovery protocols",
      "Nutrition guidelines",
      "Exercise video library",
      "Weekly check-ins",
    ],
    instructor: "Coach Sarah Williams",
    students: 890,
  },
  {
    id: 3,
    title: "Speed & Agility",
    description: "Improve sprint speed, base stealing, and first step quickness on the field. Learn proper running mechanics and explosive movement patterns.",
    image: courseFielding,
    duration: "8 Weeks",
    modules: 5,
    lessons: 32,
    icon: Wind,
    tag: "New",
    category: "speed",
    level: "All Levels",
    metrics: ["10-Yard Sprint", "Home-to-First", "Reaction Time"],
    features: [
      "Sprint technique breakdown",
      "Base running strategies",
      "Agility ladder drills",
      "Reaction training",
      "Speed testing protocols",
    ],
    instructor: "Coach David Chen",
    students: 654,
  },
  {
    id: 4,
    title: "Throwing & Arm Care",
    description: "Improve throwing velocity while reducing injury risk through proper mechanics and arm care protocols. Essential for pitchers and position players alike.",
    image: coursePitching,
    duration: "10 Weeks",
    modules: 6,
    lessons: 42,
    icon: Target,
    tag: "Essential",
    category: "pitching",
    level: "All Levels",
    metrics: ["Throwing Velo", "Arm Health", "Accuracy"],
    features: [
      "Throwing program templates",
      "Arm care exercises",
      "Mechanics video analysis",
      "Recovery protocols",
      "Injury prevention tips",
    ],
    instructor: "Coach Mike Johnson",
    students: 1120,
  },
  {
    id: 5,
    title: "Mindset & Psychology",
    description: "Mental toughness, confidence, and emotional regulation for peak performance. Learn techniques used by elite athletes to perform under pressure.",
    image: courseHitting,
    duration: "6 Weeks",
    modules: 4,
    lessons: 24,
    icon: Brain,
    tag: "Mental Game",
    category: "mindset",
    level: "All Levels",
    metrics: ["Focus", "Confidence", "Resilience"],
    features: [
      "Visualization techniques",
      "Pre-game routines",
      "Pressure handling",
      "Goal setting framework",
      "Journaling exercises",
    ],
    instructor: "Dr. Emily Roberts",
    students: 780,
  },
  {
    id: 6,
    title: "Elite Hitting Mechanics",
    description: "Master the fundamentals and advanced techniques of elite-level hitting. Detailed breakdown of swing mechanics, approach, and timing.",
    image: courseHitting,
    duration: "10 Weeks",
    modules: 8,
    lessons: 56,
    icon: Zap,
    tag: "Advanced",
    category: "hitting",
    level: "Advanced",
    metrics: ["Swing Path", "Timing", "Barrel Control"],
    features: [
      "Slow-motion analysis",
      "Hitting drills library",
      "Pitch recognition training",
      "Approach strategies",
      "Live at-bat breakdowns",
    ],
    instructor: "Coach Mike Johnson",
    students: 560,
  },
  {
    id: 7,
    title: "Pitching Development",
    description: "Comprehensive pitching program covering mechanics, pitch development, and game strategy. Build your arsenal and learn to dominate hitters.",
    image: coursePitching,
    duration: "12 Weeks",
    modules: 7,
    lessons: 52,
    icon: Target,
    tag: "Complete",
    category: "pitching",
    level: "Intermediate",
    metrics: ["Velocity", "Command", "Movement"],
    features: [
      "Pitch grip library",
      "Mechanics breakdown",
      "Game planning",
      "Bullpen structure",
      "Recovery protocols",
    ],
    instructor: "Coach Jake Martinez",
    students: 920,
  },
  {
    id: 8,
    title: "Defensive Excellence",
    description: "Master fielding fundamentals, footwork, and game awareness to become a complete defender at any position.",
    image: courseFielding,
    duration: "8 Weeks",
    modules: 5,
    lessons: 35,
    icon: Wind,
    tag: "Fundamentals",
    category: "fielding",
    level: "All Levels",
    metrics: ["Fielding %", "Range", "Arm Accuracy"],
    features: [
      "Position-specific drills",
      "Footwork patterns",
      "Pre-pitch positioning",
      "Communication tips",
      "Situational defense",
    ],
    instructor: "Coach David Chen",
    students: 480,
  },
];

const categories = [
  { id: "all", name: "All Courses" },
  { id: "hitting", name: "Hitting" },
  { id: "pitching", name: "Pitching" },
  { id: "fielding", name: "Fielding" },
  { id: "strength", name: "Strength" },
  { id: "speed", name: "Speed" },
  { id: "mindset", name: "Mindset" },
];

const CourseCard = ({ course, index }: { course: typeof allCourses[0]; index: number }) => {
  const Icon = course.icon;
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
        {/* Tag */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {course.tag}
          </span>
          <span className="px-3 py-1 rounded-full bg-background/90 text-foreground text-xs font-medium border border-border">
            {course.level}
          </span>
        </div>

        {/* Icon */}
        <div className="absolute bottom-4 right-4">
          <div className="w-12 h-12 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center border border-border">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.duration}
          </span>
          <span>{course.modules} Modules</span>
          <span>{course.lessons} Lessons</span>
        </div>

        <h3 className="text-xl font-display text-foreground mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Metrics */}
        <div className="flex flex-wrap gap-2 mb-4">
          {course.metrics.map((metric) => (
            <span 
              key={metric}
              className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
            >
              {metric}
            </span>
          ))}
        </div>

        {/* Instructor & Students */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
          <span>{course.instructor}</span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {course.students.toLocaleString()} students
          </span>
        </div>

        {/* Features (expandable) */}
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-48' : 'max-h-0'}`}>
          <ul className="space-y-2 mb-4">
            {course.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-primary hover:underline mb-4"
        >
          {expanded ? 'Show less' : 'Show features'}
        </button>

        <div className="flex gap-2">
          <Button variant="default" className="flex-1">
            Enroll Now
          </Button>
          <Button variant="outline" size="icon">
            <PlayCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const CoursesPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCourses = activeCategory === "all" 
    ? allCourses 
    : allCourses.filter(course => course.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-4">
              <Calendar className="w-3 h-3 mr-1" />
              New courses added monthly
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
              TRAINING SYSTEMS
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Data-driven programs designed to develop elite baseball athletes through proven, measurable methodologies.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>{allCourses.length} Complete Programs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>{allCourses.reduce((sum, c) => sum + c.students, 0).toLocaleString()}+ Athletes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-primary" />
                <span>4.9 Average Rating</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Category Tabs */}
        <section className="container mx-auto px-4 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </section>

        {/* Courses Grid */}
        <section className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No courses found in this category.</p>
            </div>
          )}
        </section>

        {/* Coming Soon Section */}
        <section className="container mx-auto px-4 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-display text-foreground mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">New programs in development</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Catching Mastery", description: "Complete catching development program", icon: Target },
              { title: "Recruiting Blueprint", description: "Navigate the college recruiting process", icon: Calendar },
              { title: "Youth Foundations", description: "Ages 8-12 fundamental development", icon: Star },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-dashed border-border bg-card/50 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-display text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <Badge variant="outline" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Coming Q1 2026
                </Badge>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
