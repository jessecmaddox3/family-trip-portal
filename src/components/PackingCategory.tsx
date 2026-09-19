import type { PackingItem } from "@/lib/types";

interface PackingCategoryProps {
  category: string;
  items: PackingItem[];
}

export default function PackingCategory({
  category,
  items,
}: PackingCategoryProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-sand-100 overflow-hidden">
      <div className="bg-seaglass-300 text-white px-5 py-3">
        <h3 className="font-heading font-semibold">{category}</h3>
      </div>
      <ul className="divide-y divide-sand-100">
        {items.map((item) => (
          <li
            key={item.id}
            className="px-5 py-3 flex items-start justify-between gap-3"
          >
            <div>
              <p className="text-sm text-drift-500 font-medium">
                {item.item}
                {item.quantity !== undefined && (
                  <span className="ml-2 text-drift-400 font-normal">
                    × {item.quantity}
                  </span>
                )}
              </p>
              {item.notes && (
                <p className="text-xs text-drift-300 mt-0.5">{item.notes}</p>
              )}
            </div>
            {item.claimedBy ? (
              <span className="text-xs bg-seaglass-50 text-seaglass-400 px-2.5 py-1 rounded-full border border-seaglass-200">
                {item.claimedBy}
              </span>
            ) : (
              <span className="text-xs bg-sand-50 text-drift-300 px-2.5 py-1 rounded-full border border-sand-200">
                Unclaimed
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
