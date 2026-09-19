import type { MealNight } from "@/lib/types";

export default function MealCard({ meal }: { meal: MealNight }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-sand-100 overflow-hidden">
      <div className="bg-coral-300 text-white px-5 py-3 flex items-baseline justify-between">
        <h3 className="font-heading font-semibold text-lg">{meal.dayOfWeek}</h3>
        <span className="text-coral-100 text-sm">{meal.date}</span>
      </div>
      <div className="p-5">
        <p className="font-heading text-xl font-bold text-ocean-500 mb-3">
          {meal.theme}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-drift-300 font-medium uppercase tracking-wide mb-1">
              Chefs
            </p>
            <p className="text-sm text-drift-500 font-medium">
              {meal.chefs.join(", ") || "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-xs text-drift-300 font-medium uppercase tracking-wide mb-1">
              Headcount
            </p>
            <p className="text-sm text-drift-500">
              {meal.headcount.adults} adults, {meal.headcount.kids} kids
            </p>
          </div>
        </div>
        <div className="mb-3">
          <p className="text-xs text-drift-300 font-medium uppercase tracking-wide mb-1">
            Menu
          </p>
          <ul className="space-y-0.5">
            {meal.menu.map((item) => (
              <li key={item} className="text-sm text-drift-400">
                &bull; {item}
              </li>
            ))}
          </ul>
        </div>
        {meal.dietaryNotes && meal.dietaryNotes.length > 0 && (
          <div className="bg-seaglass-50 border border-seaglass-200 rounded-lg p-3 mt-3">
            <p className="text-xs text-seaglass-400 font-medium">
              {meal.dietaryNotes.join(" | ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
