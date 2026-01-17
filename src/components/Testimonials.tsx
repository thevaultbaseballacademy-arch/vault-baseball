import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, TrendingUp, Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import testimonialJake from "@/assets/testimonial-jake.jpg";
import testimonialRyan from "@/assets/testimonial-ryan.jpg";
import testimonialMike from "@/assets/testimonial-mike.jpg";
import testimonialDylan from "@/assets/testimonial-dylan.jpg";
import testimonialMarcus from "@/assets/testimonial-marcus.jpg";
import testimonialSarah from "@/assets/testimonial-sarah.jpg";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  metric: string;
  videoUrl?: string; // YouTube, Vimeo, or direct video URL
  videoThumbnail?: string; // Custom thumbnail for video
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Jake Morrison",
    role: "D1 Commit, University of Texas",
    content: "After 8 weeks on the Velocity System, my exit velo went from 82 to 91 mph. The structured approach to training made it easy to stay consistent and see real progress.",
    rating: 5,
    image: testimonialJake,
    metric: "+9 MPH Exit Velo",
    // Add videoUrl to enable video testimonial, e.g.:
    // videoUrl: "https://www.youtube.com/embed/VIDEO_ID",
  },
  {
    id: 2,
    name: "Ryan Chen",
    role: "Junior, Westview High School",
    content: "My pop time dropped from 2.08 to 1.93 using the Speed & Agility program. I got my first college showcase invite last month.",
    rating: 5,
    image: testimonialRyan,
    metric: "1.93s Pop Time",
  },
  {
    id: 3,
    name: "Coach Mike Patterson",
    role: "Head Coach, Texas Thunder 16U",
    content: "We implemented Vault across our entire organization. The dashboard makes tracking 20+ athletes manageable, and parents love seeing the progress data.",
    rating: 5,
    image: testimonialMike,
    metric: "22 Athletes",
  },
  {
    id: 4,
    name: "Dylan Brooks",
    role: "Sophomore, St. Thomas Academy",
    content: "The throwing program helped me add 7 mph to my fastball while actually reducing arm soreness. The arm care routines are a game changer.",
    rating: 5,
    image: testimonialDylan,
    metric: "+7 MPH Velo",
  },
  {
    id: 5,
    name: "Marcus Williams",
    role: "JUCO Transfer, Blinn College",
    content: "Coming off an injury, the Strength & Conditioning program got me back stronger than before. Squatted 315 for the first time last week.",
    rating: 5,
    image: testimonialMarcus,
    metric: "315 lb Squat",
  },
  {
    id: 6,
    name: "Coach Sarah Torres",
    role: "Hitting Instructor, Houston Area",
    content: "I use Vault programming with all my private lesson clients. The video analysis tools help me show kids exactly what we are working on.",
    rating: 5,
    image: testimonialSarah,
    metric: "40+ Students",
  },
];

const VideoTestimonialCard = ({ 
  testimonial, 
  index, 
  onPlayVideo 
}: { 
  testimonial: Testimonial; 
  index: number;
  onPlayVideo: (url: string) => void;
}) => {
  const hasVideo = !!testimonial.videoUrl;
  const thumbnailImage = testimonial.videoThumbnail || testimonial.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-card border border-border rounded-2xl overflow-hidden relative group hover:border-foreground/20 transition-all duration-300 hover:shadow-lg"
    >
      {/* Video Thumbnail Section */}
      {hasVideo && (
        <div 
          className="relative aspect-video cursor-pointer overflow-hidden"
          onClick={() => onPlayVideo(testimonial.videoUrl!)}
        >
          <img 
            src={thumbnailImage} 
            alt={`${testimonial.name} video testimonial`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity group-hover:bg-black/50">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
              <Play className="w-7 h-7 text-foreground ml-1" fill="currentColor" />
            </div>
          </div>
          {/* Metric Badge on Video */}
          <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-foreground text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            {testimonial.metric}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-6 relative">
        <Quote className="absolute top-4 right-4 w-8 h-8 text-muted-foreground/10" />
        
        {/* Metric Badge (only show if no video) */}
        {!hasVideo && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-foreground text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            {testimonial.metric}
          </div>
        )}

        <div className="flex items-center gap-1 mb-3">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-foreground text-foreground" />
          ))}
        </div>

        <p className="text-foreground text-sm mb-5 leading-relaxed">
          "{testimonial.content}"
        </p>

        <div className="flex items-center gap-3">
          <img 
            src={testimonial.image} 
            alt={testimonial.name}
            className="w-11 h-11 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const handlePlayVideo = (url: string) => {
    setActiveVideoUrl(url);
  };

  const handleCloseVideo = () => {
    setActiveVideoUrl(null);
  };

  // Helper to convert YouTube watch URLs to embed URLs
  const getEmbedUrl = (url: string): string => {
    // Handle YouTube watch URLs
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    // Handle YouTube short URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    // Handle Vimeo URLs
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    // Already an embed URL or direct video URL
    return url.includes('autoplay') ? url : `${url}${url.includes('?') ? '&' : '?'}autoplay=1`;
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-medium uppercase tracking-widest mb-4 block">
            Athlete Results
          </span>
          <h2 className="text-4xl md:text-6xl font-display text-foreground mb-4">
            REAL RESULTS
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Athletes and coaches seeing measurable improvements with Vault training systems.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <VideoTestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
              onPlayVideo={handlePlayVideo}
            />
          ))}
        </div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
        >
          {[
            { value: "500+", label: "Athletes Trained" },
            { value: "35", label: "College Commits" },
            { value: "4.9", label: "Average Rating" },
            { value: "92%", label: "See Improvements" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-display text-foreground mb-1">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Video Modal */}
      <Dialog open={!!activeVideoUrl} onOpenChange={() => handleCloseVideo()}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none overflow-hidden">
          <button
            onClick={handleCloseVideo}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {activeVideoUrl && (
            <div className="aspect-video w-full">
              <iframe
                src={getEmbedUrl(activeVideoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video Testimonial"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Testimonials;
