import { getCuratedPhotos } from "@/api";

import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  return await getCuratedPhotos({
    per_page: 24,
  });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-2">
      {loaderData.photos.map((photo) => (
        <img
          key={photo.id}
          src={photo.src.large2x}
          alt={photo.alt}
          className="w-full mb-2"
        />
      ))}
    </div>
  );
}
