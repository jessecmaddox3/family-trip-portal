import { requireYear } from "@/lib/routes";
import { getPhotos } from "@/lib/content";
import PhotoGrid from "@/components/PhotoGrid";

export default async function PhotosPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: rawYear } = await params;
  const year = await requireYear(rawYear);
  const photos = await getPhotos(year);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-ocean-500 mb-2">
        Photos
      </h1>
      <p className="text-drift-300 mb-8">Photos and videos from {year}</p>
      <PhotoGrid photos={photos} />
    </div>
  );
}
