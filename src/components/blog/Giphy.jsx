export function Giphy({
  id,
  title = "GIPHY embed",
  caption,
  ratio = 63,
  credit = true,
}) {
  return (
    <figure className="not-prose my-6">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-slate-200"
        style={{ paddingBottom: `${ratio}%` }}
      >
        <iframe
          src={`https://giphy.com/embed/${id}`}
          title={title}
          allowFullScreen
          className="absolute left-0 top-0 h-full w-full"
        />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-1 text-left text-sm text-slate-500">
          {caption}
          {caption && credit && " "}
          {credit && (
            <a
              href={`https://giphy.com/gifs/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              via GIPHY
            </a>
          )}
        </figcaption>
      )}
    </figure>
  );
}
