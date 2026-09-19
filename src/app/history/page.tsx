import {
  getTripHistory,
  getTraditions,
  getFamilyVideos,
  getAvailableYears,
  getPortalConfig,
} from "@/lib/content";
import TraditionCard from "@/components/TraditionCard";
import HistoryCard from "@/components/HistoryCard";
import FamilyVideoSection from "@/components/FamilyVideoSection";

export default async function HistoryPage() {
  const [trips, traditions, videos, years, config] = await Promise.all([
    getTripHistory(),
    getTraditions(),
    getFamilyVideos(),
    getAvailableYears(),
    getPortalConfig(),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-ocean-500 mb-2">
        Trip History
      </h1>
      <p className="text-drift-300 mb-8">{config.historyIntro}</p>

      {/* Family Traditions */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-bold text-drift-500 mb-1">
          Family Traditions
        </h2>
        <p className="text-sm text-drift-300 mb-4">
          The rituals and customs that make every trip uniquely ours.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {traditions.map((tradition) => (
            <TraditionCard key={tradition.id} tradition={tradition} />
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <h2 className="font-heading text-xl font-bold text-drift-500 mb-6">
          The Timeline
        </h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-sand-200 md:left-1/2 md:-translate-x-px" />

          <div className="space-y-8">
            {trips.map((trip, i) => (
              <div
                key={trip.year}
                className={`relative flex items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-ocean-500 rounded-full border-2 border-white shadow-sm -translate-x-1.5 mt-6 z-10" />

                {/* Card */}
                <div className="ml-10 md:ml-0 md:w-[calc(50%-2rem)]">
                  <HistoryCard
                    trip={trip}
                    hasTrip={years.includes(trip.year)}
                  />
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block md:w-[calc(50%-2rem)]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Family Videos */}
      <section>
        <h2 className="font-heading text-xl font-bold text-drift-500 mb-1">
          Family Videos
        </h2>
        <p className="text-sm text-drift-300 mb-6">{videos.intro}</p>
        <FamilyVideoSection data={videos} />
      </section>
    </div>
  );
}
