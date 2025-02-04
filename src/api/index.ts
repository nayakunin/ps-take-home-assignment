type Photo = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
};

export type GetCuratedPhotosParams = {
  page?: number;
  per_page?: number;
};

export type GetCuratedPhotosResponse = {
  photos: Photo[];
  page: number;
  per_page: number;
  total_results: number;
  prev_page?: string;
  next_page?: string;
};

export const getCuratedPhotos = async (params: GetCuratedPhotosParams = {}) => {
  const urlParams = new URLSearchParams();
  if (params.page) urlParams.append("page", params.page.toString());
  if (params.per_page) urlParams.append("per_page", params.per_page.toString());

  const url = new URL("https://api.pexels.com/v1/curated");
  url.search = urlParams.toString();

  const response = await fetch(url, {
    headers: {
      Authorization: import.meta.env.VITE_PEXELS_API_KEY,
    },
  });

  return (await response.json()) as GetCuratedPhotosResponse;
};
