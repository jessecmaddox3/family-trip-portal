import type { ScheduleDay, ScheduleEvent } from "@/lib/types";

const typeColors: Record<ScheduleEvent["type"], string> = {
  activity: "bg-seaglass-50 text-seaglass-400 border-seaglass-200",
  meal: "bg-coral-50 text-coral-400 border-coral-200",
  ceremony: "bg-sand-100 text-sand-500 border-sand-300",
  travel: "bg-ocean-50 text-ocean-400 border-ocean-200",
  free: "bg-drift-50 text-drift-300 border-drift-200",
};

export default function DayCard({ day }: { day: ScheduleDay }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-sand-100 overflow-hidden">
      <div className="bg-ocean-500 text-white px-5 py-3 flex items-baseline justify-between">
        <h3 className="font-heading font-semibold text-lg">
          {day.dayOfWeek} &middot; {day.label}
        </h3>
        <span className="text-ocean-200 text-sm">{day.date}</span>
      </div>
      <div className="p-5 space-y-3">
        {day.events.map((event, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 ${typeColors[event.type]} ${event.highlight ? "ring-2 ring-sand-300" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{event.title}</p>
                <p className="text-xs mt-0.5 opacity-80">{event.description}</p>
                {event.location && (
                  <p className="text-xs mt-1 opacity-60">📍 {event.location}</p>
                )}
              </div>
              <span className="text-xs font-medium whitespace-nowrap opacity-70">
                {event.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
