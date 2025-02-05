import {
  type DefinedInfiniteQueryObserverResult,
  type InfiniteData,
  type InfiniteQueryObserverPlaceholderResult,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { getCuratedPhotos, type GetCuratedPhotosResponse } from "@/api";

const PER_PAGE = 80;

export type Query =
  | DefinedInfiniteQueryObserverResult<
      InfiniteData<GetCuratedPhotosResponse, unknown>,
      Error
    >
  | InfiniteQueryObserverPlaceholderResult<
      InfiniteData<GetCuratedPhotosResponse, unknown>,
      Error
    >;

export const DataLayer = (props: {
  enabled: boolean;
  children: (args: Query) => React.ReactNode;
}) => {
  const query = useInfiniteQuery({
    queryKey: ["photos"],
    queryFn: async (ctx) => {
      return await getCuratedPhotos({
        page: ctx.pageParam,
        per_page: PER_PAGE,
      });
    },
    getNextPageParam: (lastGroup) => {
      if (!lastGroup) {
        return null;
      }

      if (lastGroup.total_results <= PER_PAGE * lastGroup.page) {
        return null;
      }
      return lastGroup.page + 1;
    },
    initialPageParam: 0,
    enabled: props.enabled,
  });

  if (!query.data) {
    return null;
  }

  return props.children(query);
};
