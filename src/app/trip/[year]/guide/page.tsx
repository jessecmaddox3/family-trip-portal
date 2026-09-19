import { requireYear } from "@/lib/routes";
import { getGuide } from "@/lib/content";
import GuideSection from "@/components/GuideSection";
import type { GuideEntry } from "@/lib/types";

const categoryOrder: GuideEntry["category"][] = [
  "restaurant",
  "beach",
  "activity",
  "grocery",
  "info",
];

export default async function GuidePage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: rawYear } = await params;
  const year = await requireYear(rawYear);
  const entries = await getGuide(year);

  const grouped = entries.reduce<Record<string, GuideEntry[]>>((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-ocean-500 mb-2">
        Local Guide
      </h1>
      <p className="text-drift-300 mb-8">
        Local notes, places and practical tips for this trip.
      </p>
      <div className="space-y-10">
        {categoryOrder
          .filter((cat) => grouped[cat])
          .map((cat) => (
            <GuideSection key={cat} category={cat} entries={grouped[cat]} />
          ))}
      </div>
    </div>
  );
}
