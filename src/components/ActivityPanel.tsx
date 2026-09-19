import type { ActivityWindow } from "@/lib/types";
import { formatClock } from "@/lib/time";
import { assetPath } from "@/lib/assets";
const meta: Record<string, { icon: string; color: string }> = {
  beach: {
    icon: "🏖️",
    color: "bg-seaglass-50 border-seaglass-200 text-seaglass-500",
  },
  shelling: { icon: "🐚", color: "bg-sand-50 border-sand-200 text-drift-500" },
  kayaking: {
    icon: "🛶",
    color: "bg-ocean-50 border-ocean-200 text-ocean-500",
  },
  fishing: { icon: "🎣", color: "bg-coral-50 border-coral-200 text-coral-500" },
  gathering: {
    icon: "✨",
    color: "bg-sand-100 border-sand-300 text-drift-500",
  },
  "nature-walk": {
    icon: "🌿",
    color: "bg-seaglass-50 border-seaglass-200 text-seaglass-500",
  },
};
const badges = {
  excellent: "bg-seaglass-500 text-white",
  good: "bg-ocean-400 text-white",
  fair: "bg-drift-400 text-white",
};
export default function ActivityPanel({
  activities,
  timeZone,
}: {
  activities: ActivityWindow[];
  timeZone: string;
}) {
  return (
    <section className="mt-6">
      <h3 className="font-heading text-lg font-semibold text-ocean-500 mb-2">
        Organizer&apos;s Timing Preferences
      </h3>
      <p className="text-sm text-drift-400 mb-4">
        These windows follow your configured rules. Fit labels describe those
        preferences, not water safety, weather or currents.
      </p>
      {!activities.length && (
        <p className="text-sm text-drift-400">
          No planning windows for this day.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activities.map((a) => {
          const m = meta[a.activity] || meta.beach;
          return (
            <article
              key={`${a.id}:${a.startTimestamp}`}
              className={`rounded-xl border p-4 ${m.color}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2">
                  <span className="text-xl" aria-hidden="true">
                    {m.icon}
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm">{a.label}</h4>
                    <p className="text-xs mt-1">
                      {formatClock(a.startTimestamp, timeZone)} to{" "}
                      {formatClock(a.endTimestamp, timeZone)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${badges[a.quality]}`}
                >
                  {a.quality} fit
                </span>
              </div>
              <p className="text-sm mt-3">{a.reason}</p>
              {a.url && (
                <a
                  href={assetPath(a.url)}
                  className="text-sm underline mt-2 inline-block"
                >
                  More details →
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
