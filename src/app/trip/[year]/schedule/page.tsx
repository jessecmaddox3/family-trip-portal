import { requireYear } from "@/lib/routes";
import { getSchedule, getTripInfo } from "@/lib/content";
import DayCard from "@/components/DayCard";
import { assetPath } from "@/lib/assets";
export default async function SchedulePage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const year = await requireYear((await params).year),
    [schedule, trip] = await Promise.all([
      getSchedule(year),
      getTripInfo(year),
    ]);
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-ocean-500 mb-2">
        Daily Schedule
      </h1>
      <p className="text-drift-300 mb-8">
        What&apos;s happening each day. Times are local to {trip.timeZone}.
      </p>
      <div className="space-y-6">
        {schedule.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
      {trip.featuredEvent && (
        <aside className="bg-sand-100 rounded-xl border border-sand-200 p-5 mt-6">
          <h2 className="font-heading font-semibold text-drift-500">
            {trip.featuredEvent.title}
          </h2>
          <p className="text-sm text-drift-400 mt-2">
            {trip.featuredEvent.description}
          </p>
          {trip.featuredEvent.url && (
            <a
              className="text-sm underline text-ocean-400 mt-2 inline-block"
              href={assetPath(trip.featuredEvent.url)}
            >
              More about this gathering
            </a>
          )}
        </aside>
      )}
    </div>
  );
}
