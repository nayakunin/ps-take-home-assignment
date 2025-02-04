/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useCallback, useEffect, useMemo } from "react";

import { getCuratedPhotos } from "@/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/dialog";
import { ScrollArea, ScrollAreaViewPort } from "@/components/scroll-area";

import type { Route } from "./+types/home";
import { useColumns } from "./hooks/use-columns";

export const PER_PAGE = 80;

export async function loader() {
  return await getCuratedPhotos({ page: 1, per_page: PER_PAGE });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const cols = useColumns();
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    if (ref.current && !ready) {
      setReady(true);
    }
  }, []);

  return (
    <div ref={ref} key={cols} className="h-screen w-screen">
      {ready && (
        <App1
          cols={cols}
          containerWidth={ref.current!.clientWidth}
          initialData={loaderData}
        />
      )}
    </div>
  );
}

export const App1 = (props: {
  cols: number;
  containerWidth: number;
  initialData: Route.ComponentProps["loaderData"];
}) => {
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const {
    data: queryData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["photos"],
    queryFn: async (ctx) => {
      return await getCuratedPhotos({
        page: ctx.pageParam,
        per_page: PER_PAGE,
      });
    },
    getNextPageParam: (lastGroup) => lastGroup.page + 1,
    initialPageParam: 0,
    initialData: {
      pages: [props.initialData],
      pageParams: [0],
    },
  });

  const data = useMemo(
    () => queryData?.pages.flatMap((page) => page.photos),
    [queryData],
  );

  const getItemKey = useCallback((index: number) => data[index].id, [data]);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => {
      const colWidth = props.containerWidth / props.cols;
      const aspectRatio = data[i].height / data[i].width;
      return colWidth * aspectRatio;
    },
    getItemKey,
    overscan: props.cols * 2,
    lanes: props.cols,
  });

  React.useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    console.log(lastItem);

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= data.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    data.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <>
      <ScrollArea className="h-full w-full">
        <ScrollAreaViewPort className="relative" ref={parentRef}>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => (
              <div
                key={virtualRow.index}
                className="absolute top-0"
                style={{
                  left: `${virtualRow.lane * (100 / props.cols)}%`,
                  width: `calc(100%/${props.cols})`,
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  background: data[virtualRow.index].avg_color,
                }}
                onClick={() => setSelectedIndex(virtualRow.index)}
              >
                <img
                  className="w-full cursor-pointer"
                  src={data[virtualRow.index].src.tiny}
                  srcSet={`
                    ${data[virtualRow.index].src.small} 300w,
                    ${data[virtualRow.index].src.medium} 768w,
                    ${data[virtualRow.index].src.large} 1280w,
                    ${data[virtualRow.index].src.large2x} 2560w
                  `}
                  sizes="(min-width: 1280px) 2560px, (min-width: 768px) 1280px, 100vw"
                  alt={data[virtualRow.index].alt}
                />
              </div>
            ))}
          </div>
        </ScrollAreaViewPort>
      </ScrollArea>
      <Dialog
        open={selectedIndex !== null}
        onOpenChange={() => setSelectedIndex(null)}
      >
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            {selectedIndex !== null && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    Photo by {data[selectedIndex].photographer}
                  </DialogTitle>
                  <DialogDescription className="text-neutral-600">
                    Some description about the photo
                  </DialogDescription>
                </DialogHeader>
                <div
                  className="relative w-full"
                  style={{
                    aspectRatio:
                      data[selectedIndex].width / data[selectedIndex].height,
                  }}
                >
                  <div className="absolute inset-0 h-full w-full animate-pulse bg-neutral-200" />
                  <img
                    className="relative z-10"
                    src={data[selectedIndex].src.original}
                    alt={data[selectedIndex].alt}
                  />
                </div>
              </>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
};
