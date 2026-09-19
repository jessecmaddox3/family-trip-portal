import type { TripHistoryEntry } from "@/lib/types";

export default function MealHistory({ trips }: { trips: TripHistoryEntry[] }) {
  const tripsWithMeals = trips.filter((t) => t.meals && t.meals.length > 0);

  if (tripsWithMeals.length === 0) return null;

  return (
    <div className="bg-sand-50 rounded-xl border border-sand-200 p-5">
      <h3 className="font-heading text-lg font-semibold text-ocean-500 mb-1">
        Need Inspiration?
      </h3>
      <p className="text-xs text-drift-300 mb-4">
        Here is what we have cooked in past years.
      </p>

      <div className="space-y-4">
        {tripsWithMeals.map((trip) => (
          <div key={trip.year}>
            <p className="text-sm font-semibold text-drift-500 mb-1">
              {trip.year}{" "}
              <span className="text-xs font-normal text-drift-300">
                (
                {trip.mealFormat === "competition"
                  ? "Competition"
                  : trip.mealFormat === "themed"
                    ? "Themed Nights"
                    : "Shared Meals"}
                )
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {trip.meals!.map((meal, i) => (
                <p key={i} className="text-xs text-drift-400">
                  <span className="text-drift-300">{meal.night}:</span>{" "}
                  {meal.chefs}
                  {meal.dish && (
                    <span className="text-seaglass-400 font-medium">
                      {" "}
                      - {meal.dish}
                    </span>
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
