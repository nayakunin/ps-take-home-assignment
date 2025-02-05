import type { Photo } from "@/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/dialog";

export const ImageDetailsDialog = (props: {
  open: boolean;
  onClose: () => void;
  data: Photo | null;
}) => {
  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          {props.data !== null && (
            <>
              <DialogHeader>
                <DialogTitle>Photo by {props.data.photographer}</DialogTitle>
                <DialogDescription className="text-neutral-600">
                  Some description about the photo
                </DialogDescription>
              </DialogHeader>
              <div
                className="relative w-full"
                style={{
                  aspectRatio: props.data.width / props.data.height,
                }}
              >
                <div
                  className="absolute inset-0 h-full w-full"
                  style={{
                    backgroundColor: props.data.avg_color,
                  }}
                />
                <img
                  className="relative z-10"
                  src={props.data.src.small}
                  srcSet={`${props.data.src.small} 480w, ${props.data.src.original} 800w`}
                  sizes="(max-width: 800px) 100vw, 800px"
                  alt={props.data.alt}
                />
              </div>
            </>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
