import { useState } from "react";
import { Play, Pause, Maximize, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  thumbnail?: string;
  isPreview?: boolean;
}

const VideoPlayer = ({ videoUrl, title, thumbnail, isPreview }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Check if it's a YouTube or Vimeo URL
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");

  const getEmbedUrl = () => {
    if (isYouTube) {
      const videoId = videoUrl.includes("youtu.be") 
        ? videoUrl.split("/").pop()?.split("?")[0]
        : new URLSearchParams(new URL(videoUrl).search).get("v");
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (isVimeo) {
      const videoId = videoUrl.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return videoUrl;
  };

  if (isYouTube || isVimeo) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        {isPreview && (
          <Badge className="absolute top-3 left-3 z-10 bg-green-500 hover:bg-green-600 text-white">
            Free Preview
          </Badge>
        )}
        {!isPlaying ? (
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            {thumbnail ? (
              <img 
                src={thumbnail} 
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                <span className="text-muted-foreground text-sm">{title}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm font-medium truncate">{title}</p>
            </div>
          </div>
        ) : (
          <iframe
            src={getEmbedUrl()}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        )}
      </div>
    );
  }

  // Native video player for direct video URLs
  return (
    <div 
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      {isPreview && (
        <Badge className="absolute top-3 left-3 z-10 bg-green-500 hover:bg-green-600 text-white">
          Free Preview
        </Badge>
      )}
      <video
        src={videoUrl}
        className="w-full h-full object-contain"
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          const video = e.currentTarget;
          setProgress((video.currentTime / video.duration) * 100);
        }}
        poster={thumbnail}
        onClick={(e) => {
          const video = e.currentTarget;
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        }}
      />
      
      {/* Play overlay for paused state */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
            <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              const video = document.querySelector('video');
              if (video) {
                if (video.paused) video.play();
                else video.pause();
              }
            }}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <div className="flex-1">
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              className="cursor-pointer"
              onValueChange={(value) => {
                const video = document.querySelector('video');
                if (video) {
                  video.currentTime = (value[0] / 100) * video.duration;
                }
              }}
            />
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              const video = document.querySelector('video');
              if (video) video.requestFullscreen();
            }}
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
