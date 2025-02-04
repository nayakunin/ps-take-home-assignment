import * as Dialog from "@radix-ui/react-dialog";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useCallback, useMemo } from "react";

import { getCuratedPhotos } from "@/api";

import type { Route } from "./+types/home";

const PER_PAGE = 80;

export async function loader() {
  return await getCuratedPhotos({ page: 1, per_page: PER_PAGE });
}

function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}

const useColumns = () => {
  const sm = useMediaQuery("(min-width: 640px)");
  const md = useMediaQuery("(min-width: 768px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  const xl = useMediaQuery("(min-width: 1280px)");
  const xxl = useMediaQuery("(min-width: 1536px)");

  if (xxl) return 6;
  if (xl) return 5;
  if (lg) return 4;
  if (md) return 3;
  if (sm) return 2;
  return 1;
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const cols = useColumns();

  return (
    <div ref={ref} key={`${cols}`} className="h-screen w-screen">
      {ref.current && (
        <App1
          cols={cols}
          containerWidth={ref.current.clientWidth}
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

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["photos"],
      queryFn: (ctx) =>
        getCuratedPhotos({ page: ctx.pageParam, per_page: PER_PAGE }),
      getNextPageParam: (lastGroup) => lastGroup.page * lastGroup.per_page,
      initialPageParam: 0,
      initialData: {
        pages: [props.initialData],
        pageParams: [0],
      },
    });

  const allRows = useMemo(() => {
    return data.pages.flatMap((page) => page.photos);
  }, [data]);

  const getItemKey = useCallback(
    (index: number) => allRows[index].id,
    [allRows],
  );

  const rowVirtualizer = useVirtualizer({
    count: allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => {
      const colWidth = props.containerWidth / props.cols;
      const aspectRatio = allRows[i].height / allRows[i].width;
      return colWidth * aspectRatio;
    },
    getItemKey,
    overscan: 5,
    lanes: props.cols,
  });

  React.useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <>
      <ScrollArea.Root className="relative h-full w-full overflow-hidden">
        <ScrollArea.Viewport className="relative h-full w-full" ref={parentRef}>
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
                }}
              >
                <img
                  className="w-full cursor-pointer"
                  src={allRows[virtualRow.index].src.medium}
                  srcSet={`
                    ${allRows[virtualRow.index].src.small} 300w,
                    ${allRows[virtualRow.index].src.medium} 768w,
                    ${allRows[virtualRow.index].src.large} 1280w,
                    ${allRows[virtualRow.index].src.large2x} 2560w
                  `}
                  sizes="(min-width: 1280px) 2560px, (min-width: 768px) 1280px, 100vw"
                  alt={allRows[virtualRow.index].alt}
                  onClick={() => setSelectedIndex(virtualRow.index)}
                />
              </div>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="flex h-full w-2.5 touch-none border-l border-l-transparent p-[1px] transition-colors select-none"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-neutral-200" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
      <Dialog.Root
        open={selectedIndex !== null}
        onOpenChange={() => setSelectedIndex(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=closed]:animate-out data-[state=open]:animate-in fixed inset-0 z-50 bg-black/80" />
          <Dialog.Content className="data-[state=closed]:animate-out data-[state=open]:animate-infixed absolute top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
            {selectedIndex !== null && (
              <>
                <Dialog.Title>
                  Photo by {allRows[selectedIndex].photographer}
                </Dialog.Title>
                <Dialog.Description>
                  {allRows[selectedIndex].alt}
                </Dialog.Description>
                <img
                  src={allRows[selectedIndex].src.original}
                  alt={allRows[selectedIndex].alt}
                />
              </>
            )}
            <Dialog.Close className="absolute top-4 right-4 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
              X
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
