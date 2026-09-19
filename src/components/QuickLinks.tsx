import Link from "next/link";

export default function QuickLinks({ year }: { year: number }) {
  const links = [
    {
      label: "Trip Details",
      href: `/trip/${year}`,
      icon: "🏠",
      description: "House info, check-in, directions",
    },
    {
      label: "Schedule",
      href: `/trip/${year}/schedule`,
      icon: "📅",
      description: "Daily itinerary & events",
    },
    {
      label: "Tides & Beach",
      href: `/trip/${year}/tides`,
      icon: "🌊",
      description: "Charts & organizer timing preferences",
    },
    {
      label: "Meals",
      href: `/trip/${year}/meals`,
      icon: "🍽️",
      description: "Dinner nights & menus",
    },
    {
      label: "Packing List",
      href: `/trip/${year}/packing`,
      icon: "🎒",
      description: "What to bring & who is bringing it",
    },
    {
      label: "Local Guide",
      href: `/trip/${year}/guide`,
      icon: "🗺️",
      description: "Restaurants, beaches, tips",
    },
    {
      label: "Who's Coming",
      href: `/trip/${year}/people`,
      icon: "👨‍👩‍👧‍👦",
      description: "Attendees & contact info",
    },
    {
      label: "Photos",
      href: `/trip/${year}/photos`,
      icon: "📸",
      description: "Trip photo gallery",
    },
    {
      label: "Trip History",
      href: "/history",
      icon: "⏳",
      description: "Traditions, videos & earlier trips",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group bg-white rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md border border-sand-100 transition-all hover:-translate-y-0.5"
        >
          <div className="text-2xl md:text-3xl mb-2">{link.icon}</div>
          <h3 className="font-heading font-semibold text-ocean-500 text-sm md:text-base group-hover:text-coral-300 transition-colors">
            {link.label}
          </h3>
          <p className="text-xs text-drift-300 mt-1 hidden md:block">
            {link.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
