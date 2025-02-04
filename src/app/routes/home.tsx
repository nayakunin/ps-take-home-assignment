import { getCuratedPhotos } from "src/api";

import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  return await getCuratedPhotos();
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <div>{JSON.stringify(loaderData)}</div>;
}
