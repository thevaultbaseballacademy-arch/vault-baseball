import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Save, Trash2, ExternalLink, ChevronDown, ChevronRight, CheckCircle, Circle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { allCourses } from "@/pages/Courses";
import { courseContent } from "@/lib/courseData";
import { useCourseVideos, useUpsertCourseVideo, useDeleteCourseVideo } from "@/hooks/useCourseVideos";

interface LessonVideoFormProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  existingUrl?: string;
  existingPlatform?: string;
}

const LessonVideoForm = ({ 
  courseId, 
  moduleId, 
  lessonId, 
  lessonTitle, 
  existingUrl, 
  existingPlatform 
}: LessonVideoFormProps) => {
  const [url, setUrl] = useState(existingUrl || "");
  const [platform, setPlatform] = useState(existingPlatform || "youtube");
  const upsertVideo = useUpsertCourseVideo();
  const deleteVideo = useDeleteCourseVideo();

  const handleSave = () => {
    if (!url.trim()) return;
    upsertVideo.mutate({
      course_id: courseId,
      module_id: moduleId,
      lesson_id: lessonId,
      video_url: url.trim(),
      video_platform: platform,
    });
  };

  const handleDelete = () => {
    deleteVideo.mutate(lessonId);
    setUrl("");
  };

  const hasVideo = !!existingUrl;

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0">
        {hasVideo ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground/40" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{lessonTitle}</p>
        <p className="text-xs text-muted-foreground">{lessonId}</p>
      </div>

      <Select value={platform} onValueChange={setPlatform}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="youtube">YouTube</SelectItem>
          <SelectItem value="vimeo">Vimeo</SelectItem>
          <SelectItem value="wistia">Wistia</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Enter video URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 max-w-md h-8 text-sm"
      />

      <div className="flex gap-1">
        {url && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => window.open(url, "_blank")}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!url.trim() || upsertVideo.isPending}
          className="h-8"
        >
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>

        {hasVideo && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteVideo.isPending}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const CourseVideoManager = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
  const { data: videos = [], isLoading } = useCourseVideos(selectedCourse || undefined);

  const videoMap = new Map(videos.map(v => [v.lesson_id, v]));

  const selectedCourseData = selectedCourse ? courseContent[selectedCourse] : null;
  const selectedCourseInfo = allCourses.find(c => c.id === selectedCourse);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const expandAll = () => {
    if (selectedCourseData) {
      setExpandedModules(new Set(selectedCourseData.modules.map(m => m.id)));
    }
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };

  // Filter courses by search
  const filteredCourses = allCourses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count videos for selected course
  const totalLessons = selectedCourseData?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
  const videosAdded = videos.length;
  const completionPercent = totalLessons > 0 ? Math.round((videosAdded / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            Course Video Manager
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Add and manage video URLs for all course lessons
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Course List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Select Course</CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-[600px] overflow-y-auto">
              <div className="space-y-1">
                {filteredCourses.map(course => {
                  const content = courseContent[course.id];
                  const lessonCount = content?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
                  
                  return (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id)}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        selectedCourse === course.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <p className="text-sm font-medium truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {course.category}
                        </Badge>
                        <span className="text-xs opacity-70">{lessonCount} lessons</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lesson Video Editor */}
        <div className="lg:col-span-3">
          {!selectedCourse ? (
            <Card className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a course to manage its video content</p>
              </div>
            </Card>
          ) : !selectedCourseData ? (
            <Card className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>No lesson content found for this course</p>
                <p className="text-sm mt-1">Add modules and lessons in courseData.ts first</p>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader className="py-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedCourseInfo?.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {videosAdded} of {totalLessons} videos added ({completionPercent}%)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={expandAll}>
                      Expand All
                    </Button>
                    <Button variant="outline" size="sm" onClick={collapseAll}>
                      Collapse All
                    </Button>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-4 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : (
                  <div className="space-y-3">
                    {selectedCourseData.modules.map((module, idx) => (
                      <Collapsible 
                        key={module.id} 
                        open={expandedModules.has(module.id)}
                        onOpenChange={() => toggleModule(module.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-3 bg-card border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            {expandedModules.has(module.id) ? (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{module.title}</p>
                              <p className="text-sm text-muted-foreground">{module.lessons.length} lessons</p>
                            </div>
                            <Badge variant="outline">
                              {module.lessons.filter(l => videoMap.has(l.id)).length}/{module.lessons.length}
                            </Badge>
                          </motion.div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="ml-8 mt-2 space-y-2 pb-2">
                            {module.lessons.map(lesson => {
                              const existingVideo = videoMap.get(lesson.id);
                              return (
                                <LessonVideoForm
                                  key={lesson.id}
                                  courseId={selectedCourse}
                                  moduleId={module.id}
                                  lessonId={lesson.id}
                                  lessonTitle={lesson.title}
                                  existingUrl={existingVideo?.video_url}
                                  existingPlatform={existingVideo?.video_platform}
                                />
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseVideoManager;
