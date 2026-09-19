import type { FamilyVideoData } from "@/lib/types";
import Image from "next/image";
import { assetPath } from "@/lib/assets";
export default function FamilyVideoSection({
  data,
}: {
  data: FamilyVideoData;
}) {
  return (
    <div className="space-y-8">
      {data.memorial.length > 0 && (
        <section className="bg-sand-100 rounded-xl border border-sand-200 p-6">
          <h3 className="font-heading text-lg font-semibold text-ocean-500 mb-1">
            In Loving Memory
          </h3>
          {data.memorialIntro && (
            <p className="text-sm text-drift-400 mb-4">{data.memorialIntro}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.memorial.map((person) => (
              <article
                key={person.name}
                className="bg-white rounded-xl border border-sand-200 p-4"
              >
                <h4 className="font-heading font-semibold text-ocean-500">
                  {person.name}
                </h4>
                <p className="text-xs text-drift-400 mt-1">
                  {person.relationship}
                </p>
                <p className="text-sm text-drift-400 mt-2 italic">
                  {person.note}
                </p>
                {person.playlistUrl && (
                  <a
                    href={assetPath(person.playlistUrl)}
                    className="text-sm text-ocean-400 underline mt-3 inline-block"
                  >
                    Watch {person.videoCount}{" "}
                    {person.videoCount === 1 ? "video" : "videos"} →
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
      {data.beachVideos.length > 0 && (
        <section>
          <h3 className="font-heading text-lg font-semibold text-ocean-500 mb-4">
            Trip Video Collection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.beachVideos.map((v) => (
              <a
                key={v.id}
                href={assetPath(v.url)}
                className="group flex items-center gap-3 bg-white rounded-xl border border-sand-100 p-3 hover:shadow-sm"
              >
                <div className="relative w-20 h-14 bg-ocean-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {v.thumbnail ? (
                    <Image
                      src={assetPath(v.thumbnail)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <span aria-hidden="true">▶</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-drift-500">
                    {v.title}
                  </p>
                  <p className="text-xs text-drift-400">{v.date}</p>
                  {v.people.length > 0 && (
                    <p className="text-xs text-drift-400">
                      {v.people.join(", ")}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
      {data.playlists.length > 0 && (
        <section>
          <h3 className="font-heading text-lg font-semibold text-ocean-500 mb-3">
            Video Archive
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.playlists.map((p) => (
              <a
                key={p.id}
                href={assetPath(p.url)}
                className="bg-white rounded-lg border border-sand-100 px-4 py-3 hover:border-ocean-200"
              >
                <p className="font-heading font-semibold text-sm text-ocean-500">
                  {p.name}
                </p>
                <p className="text-xs text-drift-400 mt-1">
                  {p.person} · {p.relationship}
                </p>
                <p className="text-xs text-drift-400">
                  {p.videoCount} {p.videoCount === 1 ? "video" : "videos"}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}
      {data.channel && (
        <a
          href={assetPath(data.channel.url)}
          className="inline-block text-sm text-ocean-400 underline"
        >
          Browse {data.channel.name} →
        </a>
      )}
    </div>
  );
}
