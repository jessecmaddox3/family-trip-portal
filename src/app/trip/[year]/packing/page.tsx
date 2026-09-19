import { requireYear } from "@/lib/routes";
import { getPacking } from "@/lib/content";
import PackingCategory from "@/components/PackingCategory";

export default async function PackingPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: rawYear } = await params;
  const year = await requireYear(rawYear);
  const items = await getPacking(year);

  const categories = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-ocean-500 mb-2">
        Packing List
      </h1>
      <p className="text-drift-300 mb-8">
        A shared packing plan. Ask the organizer to update assignments in the
        trip file; this page is read-only.
      </p>
      <div className="space-y-6">
        {Object.entries(categories).map(([category, categoryItems]) => (
          <PackingCategory
            key={category}
            category={category}
            items={categoryItems}
          />
        ))}
      </div>
    </div>
  );
}
