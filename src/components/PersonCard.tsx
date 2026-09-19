import type { Attendee } from "@/lib/types";

export default function PersonCard({ person }: { person: Attendee }) {
  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-sand-100 p-4">
      <div className="w-10 h-10 rounded-full bg-ocean-500 text-white flex items-center justify-center font-heading font-bold text-sm shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="font-heading font-semibold text-drift-500 text-sm">
          {person.name}
        </p>
        <p className="text-xs text-ocean-400 capitalize">{person.attendance}</p>
        {(person.arrivalDate || person.departureDate) && (
          <p className="text-xs text-drift-400">
            {person.arrivalDate || "Arrival TBD"} to{" "}
            {person.departureDate || "Departure TBD"}
          </p>
        )}
        {person.phone && (
          <a className="block text-xs underline" href={`tel:${person.phone}`}>
            {person.phone}
          </a>
        )}
        {person.email && (
          <a
            className="block text-xs underline break-all"
            href={`mailto:${person.email}`}
          >
            {person.email}
          </a>
        )}
        {person.role && (
          <p className="text-xs text-seaglass-400">{person.role}</p>
        )}
        {person.dietaryNotes && (
          <p className="text-xs text-coral-400">{person.dietaryNotes}</p>
        )}
        {person.notes && (
          <p className="text-xs text-drift-300">{person.notes}</p>
        )}
      </div>
    </div>
  );
}
