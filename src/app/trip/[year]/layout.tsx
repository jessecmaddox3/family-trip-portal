import { getAvailableYears } from "@/lib/content";
import { requireYear } from "@/lib/routes";
export const dynamicParams = false;
export async function generateStaticParams() {
  return (await getAvailableYears()).map((year) => ({ year: String(year) }));
}
import Link from "next/link";

const subNav = [
  { label: "Overview", href: "" },
  { label: "Schedule", href: "/schedule" },
  { label: "Tides", href: "/tides" },
  { label: "Meals", href: "/meals" },
  { label: "Packing", href: "/packing" },
  { label: "Guide", href: "/guide" },
  { label: "People", href: "/people" },
  { label: "Photos", href: "/photos" },
];

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ year: string }>;
}) {
  const { year: rawYear } = await params;
  const year = await requireYear(rawYear);

  return (
    <div>
      <div className="bg-sand-100 border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 py-2 min-w-max">
            {subNav.map((item) => (
              <Link
                key={item.href}
                href={`/trip/${year}${item.href}`}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-drift-400 hover:bg-sand-200 hover:text-ocean-500 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
