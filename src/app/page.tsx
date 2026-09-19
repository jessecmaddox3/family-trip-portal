import { assetPath } from "@/lib/assets";
import { formatArrival, instantMilliseconds } from "@/lib/time";
import CountdownTimer from "@/components/CountdownTimer";
import QuickLinks from "@/components/QuickLinks";
import ActionItems from "@/components/ActionItems";
import {
  getTripInfo,
  getMeals,
  getPacking,
  getPeople,
  getPortalConfig,
} from "@/lib/content";

export default async function Home() {
  const config = await getPortalConfig();
  const year = config.currentYear;
  const [trip, meals, packing, people] = await Promise.all([
    getTripInfo(year),
    getMeals(year),
    getPacking(year),
    getPeople(year),
  ]);

  return (
    <div>
      {/* Hero section with gradient */}
      <section className="hero-gradient text-white pt-16 pb-24 md:pt-24 md:pb-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="animate-fade-in-up">
            <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-ocean-200 border border-ocean-300/30 rounded-full px-4 py-1.5 mb-6">
              {trip.tagline}
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-heading text-5xl md:text-7xl font-bold mb-4 text-white animate-fade-in-up-delay-1"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.3)" }}
          >
            {trip.destination} <span className="text-sand-300">{year}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-ocean-100 mb-2 animate-fade-in-up-delay-1">
            {trip.house.name}
          </p>
          <p className="text-sm text-ocean-100 mb-10 animate-fade-in-up-delay-1">
            {formatArrival(trip.checkIn, trip.timeZone)} &rarr;{" "}
            {formatArrival(trip.checkOut, trip.timeZone)}
          </p>

          {/* Countdown */}
          <CountdownTimer
            targetInstant={instantMilliseconds(trip.checkIn)}
            demoNow={
              config.demoNow ? instantMilliseconds(config.demoNow) : undefined
            }
          />
        </div>
      </section>

      {/* Planning Status (context-aware) */}
      <section className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-sand-100 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-ocean-500">
              Planning Status
            </h2>
            <span className="text-xs text-drift-300 bg-sand-50 px-2.5 py-1 rounded-full">
              Organizer&apos;s plan
            </span>
          </div>
          <ActionItems
            year={year}
            meals={meals}
            packing={packing}
            people={people}
          />
        </div>
      </section>

      {/* Quick links */}
      <section className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-ocean-500 text-center mb-8">
          Everything You Need
        </h2>
        <QuickLinks year={year} />
      </section>

      {/* House preview */}
      <section className="bg-sand-100 py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="md:flex md:items-center md:gap-10">
            <div className="md:flex-1 text-center md:text-left mb-6 md:mb-0">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-ocean-500 mb-2">
                {trip.house.name}
              </h2>
              <p className="text-drift-400 mb-4">{trip.house.address}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {trip.house.amenities.map((a) => (
                  <span
                    key={a}
                    className="bg-white text-drift-400 text-xs px-3 py-1.5 rounded-full border border-sand-200"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {trip.house.mapUrl && (
                  <a
                    href={assetPath(trip.house.mapUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-coral-300 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-coral-400 transition-colors text-sm shadow-sm"
                  >
                    Get Directions
                  </a>
                )}
                {trip.house.hostPhone && (
                  <a
                    href={`tel:${trip.house.hostPhone}`}
                    className="bg-ocean-500 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-ocean-400 transition-colors text-sm"
                  >
                    Call Host
                  </a>
                )}
              </div>
            </div>
            <div className="md:flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-sand-200 p-4 text-center">
                <p className="text-xs text-drift-300 uppercase tracking-wide mb-1">
                  House Rules
                </p>
                {trip.house.rules.map((r) => (
                  <p
                    key={r}
                    className="text-sm text-drift-400 py-1 border-b border-sand-100 last:border-0"
                  >
                    {r}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
