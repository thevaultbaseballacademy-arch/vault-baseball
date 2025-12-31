import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CourseVideo {
  id: string;
  course_id: string;
  module_id: string;
  lesson_id: string;
  video_url: string;
  video_platform: string;
  created_at: string;
  updated_at: string;
}

export const useCourseVideos = (courseId?: string) => {
  return useQuery({
    queryKey: ["course-videos", courseId],
    queryFn: async () => {
      let query = supabase.from("course_videos").select("*");
      
      if (courseId) {
        query = query.eq("course_id", courseId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as CourseVideo[];
    },
  });
};

export const useVideoForLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ["course-video", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_videos")
        .select("*")
        .eq("lesson_id", lessonId)
        .maybeSingle();
      
      if (error) throw error;
      return data as CourseVideo | null;
    },
    enabled: !!lessonId,
  });
};

export const useUpsertCourseVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (video: {
      course_id: string;
      module_id: string;
      lesson_id: string;
      video_url: string;
      video_platform?: string;
    }) => {
      // Check if video already exists for this lesson
      const { data: existing } = await supabase
        .from("course_videos")
        .select("id")
        .eq("lesson_id", video.lesson_id)
        .maybeSingle();
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("course_videos")
          .update({
            video_url: video.video_url,
            video_platform: video.video_platform || "youtube",
          })
          .eq("lesson_id", video.lesson_id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("course_videos")
          .insert({
            course_id: video.course_id,
            module_id: video.module_id,
            lesson_id: video.lesson_id,
            video_url: video.video_url,
            video_platform: video.video_platform || "youtube",
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-videos"] });
      queryClient.invalidateQueries({ queryKey: ["course-video"] });
      toast.success("Video URL saved successfully");
    },
    onError: (error) => {
      console.error("Error saving video:", error);
      toast.error("Failed to save video URL");
    },
  });
};

export const useDeleteCourseVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase
        .from("course_videos")
        .delete()
        .eq("lesson_id", lessonId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-videos"] });
      queryClient.invalidateQueries({ queryKey: ["course-video"] });
      toast.success("Video URL removed");
    },
    onError: (error) => {
      console.error("Error deleting video:", error);
      toast.error("Failed to remove video URL");
    },
  });
};
