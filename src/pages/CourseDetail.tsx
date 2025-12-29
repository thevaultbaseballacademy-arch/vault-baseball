import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Clock, CheckCircle, Users, ArrowLeft, BookOpen, 
  PlayCircle, Lock, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { 
  useCourseEnrollments, 
  useCourseProgress, 
  useEnrollInCourse,
  useUpdateProgress,
  useUpdateEnrollmentProgress
} from "@/hooks/useCourseEnrollment";
import { allCourses } from "./Courses";
import { useToast } from "@/hooks/use-toast";

// Generate mock lessons for each module
const generateModuleLessons = (moduleIndex: number, lessonsPerModule: number) => {
  const lessonTitles = [
    "Introduction & Overview",
    "Core Concepts",
    "Drill Breakdown",
    "Technique Focus",
    "Practice Session",
    "Progress Check",
    "Advanced Techniques",
    "Recovery & Rest",
  ];
  
  return Array.from({ length: lessonsPerModule }, (_, i) => ({
    index: i,
    title: lessonTitles[i % lessonTitles.length],
    duration: `${Math.floor(Math.random() * 15) + 5} min`,
  }));
};

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>();
  const [openModules, setOpenModules] = useState<number[]>([0]);
  
  const { data: enrollments = [] } = useCourseEnrollments(userId);
  const { data: progressData = [] } = useCourseProgress(userId, courseId || "");
  const enrollMutation = useEnrollInCourse();
  const updateProgressMutation = useUpdateProgress();
  const updateEnrollmentMutation = useUpdateEnrollmentProgress();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

  const course = allCourses.find(c => c.id === courseId);
  const enrollment = enrollments.find(e => e.course_id === courseId);
  const isEnrolled = !!enrollment;

  // Generate module structure
  const modules = useMemo(() => {
    if (!course) return [];
    const lessonsPerModule = Math.ceil(course.lessons / course.modules);
    return Array.from({ length: course.modules }, (_, i) => ({
      index: i,
      title: `Week ${i + 1}`,
      lessons: generateModuleLessons(i, Math.min(lessonsPerModule, course.lessons - i * lessonsPerModule)),
    }));
  }, [course]);

  // Calculate progress
  const completedLessons = progressData.filter(p => p.completed).length;
  const totalLessons = course?.lessons || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Update enrollment progress when lesson progress changes
  useEffect(() => {
    if (enrollment && progressPercent !== enrollment.progress_percent) {
      updateEnrollmentMutation.mutate({
        enrollmentId: enrollment.id,
        progressPercent,
        completed: progressPercent === 100,
      });
    }
  }, [progressPercent, enrollment]);

  const isLessonCompleted = (moduleIndex: number, lessonIndex: number) => {
    return progressData.some(
      p => p.module_index === moduleIndex && p.lesson_index === lessonIndex && p.completed
    );
  };

  const handleToggleLesson = (moduleIndex: number, lessonIndex: number) => {
    if (!userId || !courseId || !isEnrolled) return;
    
    const isCompleted = isLessonCompleted(moduleIndex, lessonIndex);
    updateProgressMutation.mutate({
      userId,
      courseId,
      moduleIndex,
      lessonIndex,
      completed: !isCompleted,
    });
  };

  const handleEnroll = () => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    if (!courseId) return;
    enrollMutation.mutate({ userId, courseId });
  };

  const toggleModule = (index: number) => {
    setOpenModules(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-2xl font-display text-foreground mb-4">Course Not Found</h1>
            <Button asChild>
              <Link to="/courses">Back to Courses</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = course.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Back Button */}
        <div className="container mx-auto px-4 mb-6">
          <Button variant="ghost" asChild>
            <Link to="/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Link>
          </Button>
        </div>

        {/* Course Header */}
        <section className="container mx-auto px-4 mb-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge>{course.tag}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
                  <Badge variant="secondary">{course.category}</Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-display text-foreground mb-4">
                  {course.title}
                </h1>

                <p className="text-muted-foreground text-lg mb-6">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {course.modules} Modules • {course.lessons} Lessons
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {course.students.toLocaleString()} athletes
                  </span>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {course.metrics.map((metric) => (
                    <span 
                      key={metric}
                      className="px-3 py-1.5 rounded-full bg-secondary text-sm text-muted-foreground"
                    >
                      {metric}
                    </span>
                  ))}
                </div>

                {/* Features */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl border border-border p-6 sticky top-28"
              >
                <div className="relative h-40 rounded-xl overflow-hidden mb-6">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                {isEnrolled ? (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Your Progress</span>
                        <span className="font-semibold text-primary">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-3" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {completedLessons} of {totalLessons} lessons completed
                      </p>
                    </div>
                    
                    {progressPercent === 100 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 text-center">
                        <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="font-semibold text-foreground">Program Completed!</p>
                        <p className="text-sm text-muted-foreground">Congratulations on finishing this program.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Enroll to track your progress through all {course.lessons} lessons.
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={isEnrolled ? undefined : handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {isEnrolled ? (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Continue Training
                    </>
                  ) : (
                    enrollMutation.isPending ? "Enrolling..." : "Enroll Now - Free"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By {course.instructor}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-display text-foreground mb-6">Program Content</h2>
            
            <div className="space-y-3">
              {modules.map((module) => {
                const moduleLessonsCompleted = module.lessons.filter(
                  l => isLessonCompleted(module.index, l.index)
                ).length;
                const moduleProgress = module.lessons.length > 0 
                  ? Math.round((moduleLessonsCompleted / module.lessons.length) * 100)
                  : 0;

                return (
                  <Collapsible
                    key={module.index}
                    open={openModules.includes(module.index)}
                    onOpenChange={() => toggleModule(module.index)}
                  >
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="font-display text-primary">{module.index + 1}</span>
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-foreground">{module.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {module.lessons.length} lessons • {moduleLessonsCompleted} completed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {isEnrolled && (
                            <div className="hidden sm:flex items-center gap-2">
                              <Progress value={moduleProgress} className="w-20 h-2" />
                              <span className="text-xs text-muted-foreground w-8">{moduleProgress}%</span>
                            </div>
                          )}
                          {openModules.includes(module.index) ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="border-t border-border">
                          {module.lessons.map((lesson) => {
                            const completed = isLessonCompleted(module.index, lesson.index);
                            
                            return (
                              <div 
                                key={lesson.index}
                                className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors border-b border-border last:border-0"
                              >
                                {isEnrolled ? (
                                  <Checkbox
                                    checked={completed}
                                    onCheckedChange={() => handleToggleLesson(module.index, lesson.index)}
                                    className="data-[state=checked]:bg-primary"
                                  />
                                ) : (
                                  <Lock className="w-4 h-4 text-muted-foreground" />
                                )}
                                <div className="flex-1">
                                  <p className={`text-sm ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                    {lesson.title}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetailPage;
