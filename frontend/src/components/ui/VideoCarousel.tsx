import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type VideoSlide = {
  src: string;
  thumbnail?: string;
  title?: string;
};

type Props = {
  videos: VideoSlide[];
  className?: string;
};

export default function VideoCarousel({ videos, className = "" }: Props) {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const count = videos.length;
  const currentVideo = useMemo(() => videos[index], [index, videos]);

  useEffect(() => {
    if (!count) return;
    setIndex((current) => Math.min(current, count - 1));
  }, [count]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay is best effort; muted inline playback should usually succeed.
      });
    }
  }, [index]);

  function prevVideo() {
    setIndex((current) => (current - 1 + count) % count);
  }

  function nextVideo() {
    setIndex((current) => (current + 1) % count);
  }

  if (!count) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-64 overflow-hidden rounded-4xl border border-slate-200 bg-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.25)] sm:h-80 lg:h-96">
        <video
          key={currentVideo.src}
          ref={videoRef}
          src={currentVideo.src}
          poster={currentVideo.thumbnail}
          autoPlay
          muted
          playsInline
          controls={false}
          preload="metadata"
          onEnded={nextVideo}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 sm:inset-x-6 sm:bottom-6">
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Previous video"
              onClick={prevVideo}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next video"
              onClick={nextVideo}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
