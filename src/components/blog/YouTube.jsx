export function YouTube({ id, title = "YouTube video" }) {
  return (
    <div className="my-6 aspect-video w-full overflow-hidden rounded-xl border border-slate-200">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
