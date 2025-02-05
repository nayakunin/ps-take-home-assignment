/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useCallback, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";

import { ScrollArea, ScrollAreaViewPort } from "@/components/scroll-area";

import type { Route } from "./+types/home";
import { DataLayer, type Query } from "./components/data-layer";
import { ImageDetailsDialog } from "./components/image-details-dialog";
import { useColumns } from "./hooks/use-columns";

export default function Home({ params }: Route.ComponentProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const cols = useColumns();
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    if (ref.current && !ready) {
      setReady(true);
    }
  }, []);

  const selectedIndex = useMemo(() => {
    if (params.imageIndex === undefined) {
      return null;
    }

    const num = Number(params.imageIndex);
    if (Number.isNaN(num)) {
      return null;
    }

    return num;
  }, [params.imageIndex]);

  return (
    <div
      ref={ref}
      key={`${cols}-${ref.current?.clientWidth}`}
      className="h-screen w-screen"
    >
      <DataLayer enabled={ready}>
        {(query) => (
          <Masonry
            cols={cols}
            containerWidth={ref.current!.clientWidth}
            query={query}
            selectedIndex={selectedIndex}
          />
        )}
      </DataLayer>
    </div>
  );
}

export const Masonry = (props: {
  cols: number;
  containerWidth: number;
  selectedIndex: number | null;
  query: Query;
}) => {
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const data = useMemo(
    () => props.query.data.pages.flatMap((page) => page?.photos),
    [props.query.data],
  );

  const getItemKey = useCallback(
    (index: number) => data[index]?.id || 0,
    [data],
  );

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

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= data.length - 1 &&
      props.query.hasNextPage &&
      !props.query.isFetchingNextPage
    ) {
      props.query.fetchNextPage();
    }
  }, [
    data.length,
    props.query.hasNextPage,
    props.query.isFetchingNextPage,
    props.query.fetchNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <>
      <ScrollArea className="h-full w-full">
        <ScrollAreaViewPort className="relative" ref={parentRef}>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => (
              <Link
                to={`/${virtualRow.index}`}
                key={virtualRow.index}
                className="absolute top-0"
                style={{
                  left: `${virtualRow.lane * (100 / props.cols)}%`,
                  width: `calc(100%/${props.cols})`,
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  background: data[virtualRow.index].avg_color,
                }}
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
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </ScrollAreaViewPort>
      </ScrollArea>
      <ImageDetailsDialog
        open={props.selectedIndex !== null}
        data={props.selectedIndex ? data[props.selectedIndex] : null}
        onClose={() => navigate("/")}
      />
    </>
  );
};
