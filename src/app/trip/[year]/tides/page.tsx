import { requireYear } from "@/lib/routes";
import { getTides } from "@/lib/content";
import TidePageClient from "@/components/TidePageClient";

export default async function TidesPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: rawYear } = await params;
  const year = await requireYear(rawYear);
  const tides = await getTides(year);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-ocean-500 mb-2">
        Tides & Trip Timing
      </h1>
      <p className="text-drift-300 mb-1">
        {tides.station} &middot; {tides.dateRange.start} to{" "}
        {tides.dateRange.end}
      </p>
      <p className="text-xs text-drift-200 mb-8">
        Tide predictions do not describe currents, weather or safe conditions.
        Check official local guidance before water activities.
      </p>
      <TidePageClient tides={tides} />
    </div>
  );
}
