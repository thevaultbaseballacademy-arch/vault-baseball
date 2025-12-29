import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, PlayCircle, Star, Zap, Target, Dumbbell, Wind, Brain, CheckCircle, Lock, Users, Calendar, Shield, Crosshair, TrendingUp, Sparkles, BookOpen, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useCourseEnrollments, useEnrollInCourse } from "@/hooks/useCourseEnrollment";
import { Link } from "react-router-dom";
import courseHitting from "@/assets/course-hitting.jpg";
import coursePitching from "@/assets/course-pitching.jpg";
import courseFielding from "@/assets/course-fielding.jpg";

export const allCourses = [
  // PITCHING PROGRAMS
  {
    id: "pitching-velocity-8week",
    title: "8-Week Pitching Velocity Program",
    description: "Develop safe, effective throwing mechanics, increase functional strength, improve arm-speed patterns, and build confidence on the mound. Learn sequencing, posture, timing, and intent.",
    image: coursePitching,
    duration: "8 Weeks",
    modules: 7,
    lessons: 36,
    icon: Zap,
    tag: "Velocity",
    category: "pitching",
    level: "Intermediate",
    metrics: ["Posture & Balance", "Hip Lead", "Arm Speed"],
    features: [
      "Pivot picks & rocker throws",
      "Step-behind throws for momentum",
      "Connection ball work",
      "Weekly velocity tracking",
      "Parent training guide included",
    ],
    instructor: "Vault Performance",
    students: 1240,
  },
  {
    id: "elite-pitching-12week",
    title: "Elite 12-Week Pitching Velocity",
    description: "Advanced arm speed + mechanics system for high-performance athletes seeking major velocity increases, improved command, advanced biomechanics, and rotational power.",
    image: coursePitching,
    duration: "12 Weeks",
    modules: 9,
    lessons: 52,
    icon: TrendingUp,
    tag: "Elite",
    category: "pitching",
    level: "Advanced",
    metrics: ["Hip-Shoulder Separation", "Arm Path", "Peak Velocity"],
    features: [
      "Advanced plyo ball progressions",
      "Heavy med ball rotational throws",
      "Competitive bullpen structure",
      "Strength & power add-on",
      "Recovery & arm care system",
    ],
    instructor: "Vault Performance",
    students: 890,
  },

  // CATCHING PROGRAMS
  {
    id: "youth-catcher-8week",
    title: "Youth Catcher Development",
    description: "Build foundational receiving, blocking, footwork, and throwing movements for ages 9-13. Learn proper body position, glove angles, soft hands, and safe throwing mechanics.",
    image: courseFielding,
    duration: "8 Weeks",
    modules: 7,
    lessons: 32,
    icon: Shield,
    tag: "Youth",
    category: "catching",
    level: "Beginner",
    metrics: ["Receiving", "Blocking", "Footwork"],
    features: [
      "Tennis ball soft-hand work",
      "Knee-replace drill progression",
      "Step-replace footwork",
      "Parent training guide",
      "Athlete tracking sheets",
    ],
    instructor: "Vault Performance",
    students: 654,
  },
  {
    id: "elite-catcher-12week",
    title: "Elite Catcher Development",
    description: "12-week receiving, blocking, and pop-time system for competitive athletes. Develop advanced receiving, throwing mechanics, footwork patterns, and professional-level durability.",
    image: courseFielding,
    duration: "12 Weeks",
    modules: 8,
    lessons: 48,
    icon: Crosshair,
    tag: "Elite",
    category: "catching",
    level: "Advanced",
    metrics: ["Pop-Time", "Framing", "Transfer Speed"],
    features: [
      "Elite framing patterns",
      "Reaction blocking drills",
      "Pop-time velocity footwork",
      "Throwing & arm care system",
      "Strength, mobility & durability",
    ],
    instructor: "Vault Performance",
    students: 480,
  },

  // VERTICAL JUMP / SPEED PROGRAMS
  {
    id: "youth-vertical-6week",
    title: "Youth Vertical Jump Program",
    description: "6-week age-appropriate plyometric training for ages 9-13. Develop explosive power, landing mechanics, and confidence with safe, progressive overload.",
    image: courseHitting,
    duration: "6 Weeks",
    modules: 6,
    lessons: 24,
    icon: Wind,
    tag: "Youth",
    category: "speed",
    level: "Beginner",
    metrics: ["Landing Mechanics", "Explosiveness", "Reactive Ability"],
    features: [
      "Snap downs & stick landings",
      "Pogo jumps & mini-hurdles",
      "Box jumps (safe introductory)",
      "Arm swing loaders",
      "Parent training guide",
    ],
    instructor: "Vault Performance",
    students: 560,
  },
  {
    id: "elite-vertical-12week",
    title: "Elite Vertical Jump Program",
    description: "12-week explosive power system engineered to maximize vertical output through plyometric progressions, strength phases, and movement efficiency training.",
    image: courseHitting,
    duration: "12 Weeks",
    modules: 8,
    lessons: 42,
    icon: TrendingUp,
    tag: "Elite",
    category: "speed",
    level: "Advanced",
    metrics: ["Depth Jumps", "Peak Power", "Approach Jump"],
    features: [
      "Elite plyometric library",
      "Strength & power components",
      "Depth jump progressions",
      "Mobility & recovery protocols",
      "Testing & tracking system",
    ],
    instructor: "Vault Performance",
    students: 720,
  },

  // STRENGTH & CONDITIONING
  {
    id: "strength-conditioning-12week",
    title: "Vault Strength & Conditioning",
    description: "12-week baseball performance program focusing on explosive movement, rotational power, acceleration, deceleration control, and full body stability for the complete athlete.",
    image: coursePitching,
    duration: "12 Weeks",
    modules: 12,
    lessons: 60,
    icon: Dumbbell,
    tag: "Complete",
    category: "strength",
    level: "All Levels",
    metrics: ["Lower Body Power", "Rotational Speed", "Durability"],
    features: [
      "Foundation phase (weeks 1-4)",
      "Power phase (weeks 5-8)",
      "Peak phase (weeks 9-12)",
      "Arm care & mobility routines",
      "Nutrition & recovery guidelines",
    ],
    instructor: "Eddie Mejia",
    students: 1540,
  },

  // MINDSET PROGRAMS
  {
    id: "elite-mindset-10week",
    title: "Elite Athlete Mindset Program",
    description: "10-week championship mental performance system building confidence, resilience, emotional control, focus, discipline, and competitive consistency through performance psychology.",
    image: courseHitting,
    duration: "10 Weeks",
    modules: 9,
    lessons: 45,
    icon: Brain,
    tag: "Mental Game",
    category: "mindset",
    level: "All Levels",
    metrics: ["Emotional Speed", "Focus", "Competitive Identity"],
    features: [
      "Visualization & self-talk system",
      "6-second reset routine",
      "Pressure work simulations",
      "Championship habits",
      "Parent/coach support guide",
    ],
    instructor: "Vault Performance",
    students: 980,
  },
  {
    id: "winning-mindset-10week",
    title: "Winning Athlete Mindset",
    description: "10-week mental performance training system to improve confidence, focus, resilience, discipline, leadership, and on-field consistency. Think, act, and perform like elite competitors.",
    image: courseHitting,
    duration: "10 Weeks",
    modules: 10,
    lessons: 50,
    icon: Sparkles,
    tag: "Leadership",
    category: "mindset",
    level: "All Levels",
    metrics: ["Identity", "Confidence", "Leadership"],
    features: [
      "Weekly mental lessons",
      "Daily action tasks",
      "Athlete journal prompts",
      "Weekly challenges",
      "Pre-game routines",
    ],
    instructor: "Vault Performance",
    students: 860,
  },
];

const categories = [
  { id: "all", name: "All Programs" },
  { id: "enrolled", name: "My Programs" },
  { id: "pitching", name: "Pitching" },
  { id: "catching", name: "Catching" },
  { id: "speed", name: "Speed & Power" },
  { id: "strength", name: "Strength" },
  { id: "mindset", name: "Mindset" },
];

interface CourseCardProps {
  course: typeof allCourses[0];
  index: number;
  isEnrolled: boolean;
  enrollment?: { id: string; progress_percent: number; status: string } | null;
  onEnroll: () => void;
  isEnrolling: boolean;
  isLoggedIn: boolean;
}

const CourseCard = ({ course, index, isEnrolled, enrollment, onEnroll, isEnrolling, isLoggedIn }: CourseCardProps) => {
  const Icon = course.icon;
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl"
    >
      {/* Enrolled Badge */}
      {isEnrolled && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
            {enrollment?.status === "completed" ? "Completed" : "Enrolled"}
          </div>
        </div>
      )}

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
        {/* Progress Bar for Enrolled */}
        {isEnrolled && enrollment && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">{enrollment.progress_percent}%</span>
            </div>
            <Progress value={enrollment.progress_percent} className="h-2" />
          </div>
        )}

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
            {course.students.toLocaleString()} athletes
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
          {!isLoggedIn ? (
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/auth">
                <LogIn className="w-4 h-4 mr-2" />
                Sign in to Enroll
              </Link>
            </Button>
          ) : isEnrolled ? (
            <Button variant="default" className="flex-1" asChild>
              <Link to={`/course/${course.id}`}>
                <BookOpen className="w-4 h-4 mr-2" />
                Continue Training
              </Link>
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="flex-1"
              onClick={onEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling ? "Enrolling..." : "Enroll Now"}
            </Button>
          )}
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
  const [userId, setUserId] = useState<string | undefined>();
  
  const { data: enrollments = [] } = useCourseEnrollments(userId);
  const enrollMutation = useEnrollInCourse();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  const getEnrollment = (courseId: string) => {
    return enrollments.find(e => e.course_id === courseId);
  };

  const handleEnroll = (courseId: string) => {
    if (!userId) return;
    enrollMutation.mutate({ userId, courseId });
  };

  const filteredCourses = activeCategory === "all" 
    ? allCourses 
    : activeCategory === "enrolled"
    ? allCourses.filter(course => enrollments.some(e => e.course_id === course.id))
    : allCourses.filter(course => course.category === activeCategory);

  const enrolledCount = enrollments.length;

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
              Vault Sports Performance
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
              TRAINING PROGRAMS
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Data-driven programs designed to develop elite baseball athletes through proven, measurable methodologies. From youth foundations to elite performance systems.
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
              {userId && enrolledCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <BookOpen className="w-4 h-4" />
                  <span>{enrolledCount} Enrolled</span>
                </div>
              )}
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
                className="relative"
              >
                {category.name}
                {category.id === "enrolled" && enrolledCount > 0 && (
                  <span className="ml-1.5 bg-primary-foreground text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {enrolledCount}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </section>

        {/* Courses Grid */}
        <section className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const enrollment = getEnrollment(course.id);
              return (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  index={index}
                  isEnrolled={!!enrollment}
                  enrollment={enrollment}
                  onEnroll={() => handleEnroll(course.id)}
                  isEnrolling={enrollMutation.isPending}
                  isLoggedIn={!!userId}
                />
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              {activeCategory === "enrolled" ? (
                <div>
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't enrolled in any programs yet.</p>
                  <Button onClick={() => setActiveCategory("all")}>Browse Programs</Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No programs found in this category.</p>
              )}
            </div>
          )}
        </section>

        {/* Program Tiers Explanation */}
        <section className="container mx-auto px-4 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-display text-foreground mb-2">Program Levels</h2>
            <p className="text-muted-foreground">Choose the right program for your development stage</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { 
                title: "Youth Programs", 
                description: "Ages 9-13: Safe, age-appropriate training building foundational skills", 
                icon: Star,
                duration: "6-8 Weeks"
              },
              { 
                title: "Intermediate", 
                description: "Standard programs for athletes ready to develop specific skills", 
                icon: Target,
                duration: "8-10 Weeks"
              },
              { 
                title: "Elite Programs", 
                description: "Advanced systems for competitive athletes seeking peak performance", 
                icon: TrendingUp,
                duration: "10-12 Weeks"
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                <Badge variant="secondary">{item.duration}</Badge>
              </motion.div>
            ))}
          </div>
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
              { title: "Hitting Velocity System", description: "Exit velocity and bat speed development", icon: Zap },
              { title: "Fielding Excellence", description: "Position-specific defensive training", icon: Shield },
              { title: "Recruiting Blueprint", description: "Navigate the college recruiting process", icon: Calendar },
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
                  Coming Soon
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
