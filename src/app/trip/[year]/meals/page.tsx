import { requireYear } from "@/lib/routes";
import { getMeals, getTripHistory, getTripInfo } from "@/lib/content";
import MealCard from "@/components/MealCard";
import MealHistory from "@/components/MealHistory";

export default async function MealsPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: rawYear } = await params;
  const year = await requireYear(rawYear);
  const [meals, allTrips, trip] = await Promise.all([
    getMeals(year),
    getTripHistory(),
    getTripInfo(year),
  ]);

  // Only show history from past years (not the current trip year)
  const pastTrips = allTrips.filter((t) => t.year < year);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-ocean-500 mb-2">
        Meal Planner
      </h1>
      <p className="text-drift-300 mb-2">{trip.mealIntro}</p>
      <p className="text-sm text-seaglass-400 mb-8">{trip.mealNotes}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {meals.map((meal) => (
          <MealCard key={meal.date} meal={meal} />
        ))}
      </div>
      <MealHistory trips={pastTrips} />
    </div>
  );
}
