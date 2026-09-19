import { assetPath } from "@/lib/assets";
import type { GuideEntry } from "@/lib/types";

const categoryLabels: Record<GuideEntry["category"], string> = {
  restaurant: "Restaurants",
  beach: "Beaches",
  grocery: "Grocery & Supplies",
  activity: "Activities",
  info: "Good to Know",
};

const categoryIcons: Record<GuideEntry["category"], string> = {
  restaurant: "🍽️",
  beach: "🏖️",
  grocery: "🛒",
  activity: "🎯",
  info: "ℹ️",
};

interface GuideSectionProps {
  category: GuideEntry["category"];
  entries: GuideEntry[];
}

export default function GuideSection({ category, entries }: GuideSectionProps) {
  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-ocean-500 mb-4 flex items-center gap-2">
        <span>{categoryIcons[category]}</span>
        {categoryLabels[category]}
      </h2>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.name}
            className="bg-white rounded-xl shadow-sm border border-sand-100 p-5"
          >
            <h3 className="font-heading font-semibold text-drift-500 mb-1">
              {entry.name}
            </h3>
            <p className="text-sm text-drift-400 mb-2">{entry.description}</p>
            {entry.address && (
              <p className="text-xs text-drift-300 mb-1">📍 {entry.address}</p>
            )}
            {entry.phone && (
              <p className="text-xs text-drift-300 mb-1">
                📞{" "}
                <a href={`tel:${entry.phone}`} className="underline">
                  {entry.phone}
                </a>
              </p>
            )}
            {entry.hours && (
              <p className="text-xs text-drift-400 mb-2">
                Hours: {entry.hours}
              </p>
            )}
            {entry.mapUrl && (
              <a
                className="text-sm underline text-ocean-400"
                href={assetPath(entry.mapUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Map and directions
              </a>
            )}
            {entry.tip && (
              <div className="bg-sand-50 border border-sand-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-drift-400">
                  <span className="font-semibold">Tip:</span> {entry.tip}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
