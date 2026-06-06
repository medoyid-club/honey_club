type Props = {
  src: string;
  poster?: string | null;
  title: string;
};

export function CourseOverviewVideo({ src, poster, title }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black/5">
      <video
        controls
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        className="aspect-video w-full bg-black"
        aria-label={title}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
