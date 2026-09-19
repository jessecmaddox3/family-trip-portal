import type { PhotoEntry } from "@/lib/types";
import Image from "next/image";
import { assetPath } from "@/lib/assets";
export default function PhotoGrid({ photos }: { photos: PhotoEntry[] }) {
  const albums = photos.filter((p) => p.type === "album-link"),
    media = photos.filter((p) => p.type !== "album-link");
  if (!photos.length)
    return (
      <div className="bg-sand-100 rounded-xl border border-sand-200 p-12 text-center">
        <p className="text-4xl mb-4">📸</p>
        <h2 className="font-heading text-lg font-semibold text-ocean-500 mb-2">
          Photos and videos coming soon
        </h2>
        <p className="text-sm text-drift-400">
          Add your own media to the trip file when you are ready.
        </p>
      </div>
    );
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {media.map((p, i) => (
          <figure
            key={`${p.src}:${i}`}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-sand-100"
          >
            <div className="relative aspect-[4/3] bg-ocean-50">
              {p.type === "video" ? (
                <video
                  className="w-full h-full object-contain"
                  controls
                  preload="none"
                  poster={p.poster ? assetPath(p.poster) : undefined}
                  aria-label={p.alt}
                >
                  <source src={assetPath(p.src!)} />
                  {p.captions && (
                    <track
                      kind="captions"
                      src={assetPath(p.captions)}
                      srcLang="en"
                      label="English"
                      default
                    />
                  )}
                  <p>
                    Your browser cannot play this video.{" "}
                    <a href={assetPath(p.src!)}>Download the video</a>.
                  </p>
                </video>
              ) : (
                <Image
                  src={assetPath(p.src!)}
                  alt={p.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 100vw, (max-width:768px) 50vw, 33vw"
                />
              )}
            </div>
            <figcaption className="px-4 py-3 text-sm text-drift-500">
              {p.caption || p.alt}
              {p.credit && (
                <span className="block text-xs text-drift-400 mt-1">
                  {p.credit}
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      {albums.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-semibold text-ocean-500 mb-3">
            Albums from Earlier Trips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {albums.map((p, i) => (
              <a
                key={i}
                href={assetPath(p.externalUrl!)}
                className="group bg-white rounded-xl shadow-sm border border-sand-100 p-5 hover:shadow-md"
              >
                <p className="font-heading font-semibold text-ocean-500">
                  📸 {p.alt}
                </p>
                <p className="text-sm text-drift-400 mt-1">{p.caption}</p>
                <p className="text-sm underline text-ocean-400 mt-2">
                  View album →
                </p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
