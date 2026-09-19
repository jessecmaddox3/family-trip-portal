import { requireYear } from "@/lib/routes";
import { getPeople } from "@/lib/content";
import PersonCard from "@/components/PersonCard";

export default async function PeoplePage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: rawYear } = await params;
  const year = await requireYear(rawYear);
  const people = await getPeople(year);

  const families = people.reduce<Record<string, typeof people>>(
    (acc, person) => {
      if (!acc[person.family]) acc[person.family] = [];
      acc[person.family].push(person);
      return acc;
    },
    {},
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-ocean-500 mb-2">
        Who&apos;s Coming
      </h1>
      <p className="text-drift-300 mb-8">
        {people.length} people listed for the {year} trip, including tentative
        and declined invitations.
      </p>
      <div className="space-y-8">
        {Object.entries(families).map(([family, members]) => (
          <div key={family}>
            <h2 className="font-heading text-lg font-semibold text-ocean-500 mb-3">
              {family}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {members.map((person) => (
                <PersonCard key={person.name} person={person} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
