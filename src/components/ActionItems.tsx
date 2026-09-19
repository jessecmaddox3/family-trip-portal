import Link from "next/link";
import type { MealNight, PackingItem, Attendee } from "@/lib/types";

interface ActionItemsProps {
  year: number;
  meals: MealNight[];
  packing: PackingItem[];
  people: Attendee[];
}

export default function ActionItems({
  year,
  meals,
  packing,
  people,
}: ActionItemsProps) {
  const unassignedMeals = meals.filter(
    (m) =>
      !m.chefs.length ||
      m.chefs.some((c) => /^(tbd|unassigned)$/i.test(c.trim())),
  );
  const unclaimedItems = packing.filter((p) => !p.claimedBy?.trim());
  const uncertainAttendees = people.filter((p) => p.attendance === "tentative");
  const totalFamilies = new Set(
    people.filter((p) => p.attendance === "confirmed").map((p) => p.family),
  ).size;

  const items = [
    {
      label: "Meal nights need chefs",
      count: unassignedMeals.length,
      total: meals.length,
      href: `/trip/${year}/meals`,
      color: "coral",
      icon: "🍽️",
      urgent: unassignedMeals.length > 3,
    },
    {
      label: "Packing items unclaimed",
      count: unclaimedItems.length,
      total: packing.length,
      href: `/trip/${year}/packing`,
      color: "seaglass",
      icon: "🎒",
      urgent: false,
    },
    {
      label: "Attendance uncertain",
      count: uncertainAttendees.length,
      total: people.length,
      href: `/trip/${year}/people`,
      color: "ocean",
      icon: "👥",
      urgent: uncertainAttendees.length > 0,
    },
    {
      label: "Confirmed groups",
      count: totalFamilies,
      total: totalFamilies,
      href: `/trip/${year}/people`,
      color: "sand",
      icon: "🏠",
      urgent: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-sand-100 transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-2xl">{item.icon}</span>
            {item.urgent && item.count > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-coral-400" />
              </span>
            )}
          </div>
          <p
            className={`text-2xl md:text-3xl font-heading font-bold ${
              item.color === "coral"
                ? "text-coral-400"
                : item.color === "seaglass"
                  ? "text-seaglass-400"
                  : item.color === "ocean"
                    ? "text-ocean-500"
                    : "text-sand-500"
            }`}
          >
            {item.count === item.total && item.label !== "Confirmed groups" ? (
              <span>{item.count}</span>
            ) : item.label === "Confirmed groups" ? (
              <span>{item.count}</span>
            ) : (
              <span>
                {item.count}
                <span className="text-sm text-drift-300 font-normal">
                  /{item.total}
                </span>
              </span>
            )}
          </p>
          <p className="text-xs text-drift-400 mt-1 group-hover:text-ocean-500 transition-colors">
            {item.label}
          </p>
        </Link>
      ))}
    </div>
  );
}
