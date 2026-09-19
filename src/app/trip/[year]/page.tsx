import { assetPath } from "@/lib/assets";
import { formatArrival } from "@/lib/time";
import { requireYear } from "@/lib/routes";
import { getTripInfo } from "@/lib/content";

export default async function TripPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: rawYear } = await params;
  const year = await requireYear(rawYear);
  const trip = await getTripInfo(year);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-ocean-500 mb-2">
        {trip.name}
      </h1>
      <p className="text-drift-300 text-lg mb-8">{trip.tagline}</p>

      {/* Dates card */}
      <div className="bg-white rounded-xl shadow-sm border border-sand-100 p-6 mb-6">
        <h2 className="font-heading text-xl font-semibold text-ocean-500 mb-4">
          Dates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-drift-300 font-medium">Check In</p>
            <p className="text-drift-500 font-semibold">
              {formatArrival(trip.checkIn, trip.timeZone)}
            </p>
          </div>
          <div>
            <p className="text-sm text-drift-300 font-medium">Check Out</p>
            <p className="text-drift-500 font-semibold">
              {formatArrival(trip.checkOut, trip.timeZone)}
            </p>
          </div>
        </div>
      </div>

      {/* House card */}
      <div className="bg-white rounded-xl shadow-sm border border-sand-100 p-6 mb-6">
        <h2 className="font-heading text-xl font-semibold text-ocean-500 mb-2">
          {trip.house.name}
        </h2>
        <p className="text-drift-400 mb-4">{trip.house.address}</p>
        <p className="text-sm text-drift-400 mb-4">
          {trip.house.beds} beds · maximum {trip.house.maxGuests} guests
        </p>

        <h3 className="text-sm font-semibold text-drift-400 uppercase tracking-wide mb-2">
          Amenities
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-6">
          {trip.house.amenities.map((a) => (
            <li
              key={a}
              className="text-drift-400 text-sm flex items-start gap-2"
            >
              <span className="text-seaglass-300 mt-0.5">&#10003;</span>
              {a}
            </li>
          ))}
        </ul>

        <h3 className="text-sm font-semibold text-drift-400 uppercase tracking-wide mb-2">
          House Rules
        </h3>
        <ul className="space-y-1 mb-6">
          {trip.house.rules.map((r) => (
            <li
              key={r}
              className="text-drift-400 text-sm flex items-start gap-2"
            >
              <span className="text-coral-300 mt-0.5">&#9679;</span>
              {r}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          {trip.house.mapUrl && (
            <a
              href={assetPath(trip.house.mapUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-coral-300 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-coral-400 transition-colors text-sm"
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
    </div>
  );
}
