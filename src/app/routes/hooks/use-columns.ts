import { useMediaQuery } from "@/hooks/use-media-query";

export const useColumns = () => {
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
