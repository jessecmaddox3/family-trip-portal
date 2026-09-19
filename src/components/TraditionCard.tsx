import { assetPath } from "@/lib/assets";
import type { Tradition } from "@/lib/types";

export default function TraditionCard({ tradition }: { tradition: Tradition }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-sand-100 p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{tradition.icon}</span>
        <div>
          <h3 className="font-heading font-semibold text-drift-500 text-sm">
            {tradition.name}
          </h3>
          <p className="text-xs text-drift-300 mt-0.5">
            {tradition.yearsActive}
          </p>
          <p className="text-xs text-drift-400 mt-1">{tradition.description}</p>
          {tradition.details && (
            <p className="text-xs text-drift-400 mt-2">{tradition.details}</p>
          )}
          {tradition.relatedLink && (
            <a
              className="text-sm text-ocean-400 underline mt-2 inline-block"
              href={assetPath(tradition.relatedLink)}
            >
              More about this tradition
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
