import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { VideoRecord } from "../../types";
import { cn } from "../../utils/cn";

const srcOf = (video: VideoRecord) => video.src || video.url;

/**
 * A still taken from the video itself.
 *
 * The stored `thumbnail` field was produced by applying an image transform to
 * the MP4 URL, so it returns the video file rather than an image and renders as
 * a broken thumbnail. ImageKit derives a real frame at `<video-url>/ik-thumbnail.jpg`,
 * which is what every poster here uses.
 */
const posterOf = (video: VideoRecord, width: number) => {
  const src = srcOf(video);
  if (!src || !src.includes("ik.imagekit.io")) return undefined;
  return `${src}/ik-thumbnail.jpg?tr=w-${width}`;
};

/**
 * Published job videos, presented as a projection stage rather than a card grid.
 *
 * The band is a flat deep ink so filmed footage carries its own light; the video
 * is letterboxed inside a black stage so portrait and landscape uploads both sit
 * correctly without cropping. Titles are shown exactly as they were published —
 * nothing here is generated, and no duration is claimed because the record does
 * not store one.
 */
export default function VideoShowcase({
  videos,
  isLoading = false,
}: {
  videos: VideoRecord[];
  isLoading?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stageRef = useRef<HTMLVideoElement | null>(null);

  const count = videos.length;
  const safeIndex = count ? Math.min(index, count - 1) : 0;
  const current: VideoRecord | undefined = count ? videos[safeIndex] : undefined;

  // Selecting another record must stop the previous source, not leave it playing.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.pause();
    stage.currentTime = 0;
    setPlaying(false);
  }, [current?._id]);

  const start = () => {
    void stageRef.current?.play().catch(() => setPlaying(false));
  };

  return (
    <section
      aria-labelledby="job-videos-heading"
      className="bg-ink-900 py-16 lg:py-20"
    >
      <div className="container-xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-3 sm:mb-10">
          <h2
            id="job-videos-heading"
            className="font-display text-[26px] font-bold leading-[1.14] tracking-[-0.028em] text-white sm:text-[34px]"
          >
            Job videos
          </h2>
          {count > 1 && (
            <p className="pb-1 text-[12.5px] font-medium tabular-nums text-white/55">
              {safeIndex + 1} / {count}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
            <div>
              <div className="aspect-video w-full animate-pulse bg-ink-800" />
              <div className="mt-4 h-4 w-48 animate-pulse bg-ink-800" />
            </div>
            <div className="hidden flex-col gap-3 lg:flex">
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-[78px] animate-pulse bg-ink-800" />
              ))}
            </div>
          </div>
        ) : !current ? (
          <p className="border-t border-ink-800 pt-5 text-[13.5px] text-white/65">
            No job videos have been published yet.
          </p>
        ) : (
          <div
            className={cn(
              "grid gap-8 lg:gap-12",
              count > 1 && "lg:grid-cols-[minmax(0,1fr)_320px]",
            )}
          >
            <div className="min-w-0">
              <div className="relative bg-black">
                <video
                  key={current._id}
                  ref={stageRef}
                  src={srcOf(current)}
                  poster={posterOf(current, 1280)}
                  controls
                  playsInline
                  preload="none"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onEnded={() => setPlaying(false)}
                  className="aspect-[4/3] w-full object-contain sm:aspect-video"
                />

                {!playing && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <button
                      type="button"
                      onClick={start}
                      className="pointer-events-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-600 text-white transition-colors hover:bg-sky-700 sm:h-[68px] sm:w-[68px]"
                    >
                      <Play
                        size={22}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="translate-x-[1px] fill-current"
                      />
                      <span className="sr-only">Play {current.title}</span>
                    </button>
                  </div>
                )}
              </div>

              <h3 className="mt-4 max-w-[620px] font-display text-[17px] font-bold leading-snug tracking-[-0.012em] text-white">
                {current.title}
              </h3>
            </div>

            {count > 1 && (
              <ul className="flex flex-col self-start">
                {videos.map((video, position) => {
                  const selected = position === safeIndex;
                  return (
                    <li key={video._id}>
                      <button
                        type="button"
                        onClick={() => setIndex(position)}
                        aria-current={selected}
                        className={cn(
                          "flex w-full items-center gap-3 border-t border-ink-800 px-2.5 py-3 text-left transition-colors",
                          selected ? "bg-ink-800" : "hover:bg-ink-800/60",
                        )}
                      >
                        <span className="h-[54px] w-[80px] shrink-0 overflow-hidden bg-black">
                          {posterOf(video, 240) ? (
                            <img
                              src={posterOf(video, 240)}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 text-[13px] font-medium leading-snug",
                            selected ? "text-white" : "text-white/75",
                          )}
                        >
                          {video.title}
                        </span>
                        {selected && (
                          <Play
                            size={13}
                            aria-hidden="true"
                            className="shrink-0 fill-current text-sky-400"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
