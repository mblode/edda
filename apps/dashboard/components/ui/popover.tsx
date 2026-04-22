"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import * as React from "react";

import { cn } from "@/lib/utils";

type PopoverInteractOutsideEvent = Event & {
  preventDefault: () => void;
};

interface PopoverContextType {
  setOnInteractOutside: (
    handler?: (event: PopoverInteractOutsideEvent) => void
  ) => void;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(
  undefined
);

const usePopoverContext = () => React.useContext(PopoverContext);

const Popover = ({
  onOpenChange,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) => {
  const onInteractOutsideRef = React.useRef<
    ((event: PopoverInteractOutsideEvent) => void) | null
  >(null);

  const handleOpenChange = React.useCallback<
    NonNullable<
      React.ComponentProps<typeof PopoverPrimitive.Root>["onOpenChange"]
    >
  >(
    (nextOpen, eventDetails) => {
      if (!nextOpen && eventDetails.reason === "outside-press") {
        const interactHandler = onInteractOutsideRef.current;

        if (interactHandler) {
          const wrappedEvent = Object.create(
            eventDetails.event
          ) as PopoverInteractOutsideEvent;
          wrappedEvent.preventDefault = () => eventDetails.cancel();
          interactHandler(wrappedEvent);
        }
      }

      onOpenChange?.(nextOpen, eventDetails);
    },
    [onOpenChange]
  );

  const contextValue = React.useMemo<PopoverContextType>(
    () => ({
      setOnInteractOutside: (handler) => {
        onInteractOutsideRef.current = handler ?? null;
      },
    }),
    []
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      <PopoverPrimitive.Root
        data-slot="popover"
        onOpenChange={handleOpenChange}
        {...props}
      />
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = ({
  asChild = false,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger> & {
  asChild?: boolean;
}) => {
  const render =
    asChild && React.isValidElement(children)
      ? (children as React.ReactElement)
      : undefined;

  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      render={render}
      {...props}
    >
      {asChild ? null : children}
    </PopoverPrimitive.Trigger>
  );
};

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof PopoverPrimitive.Positioner>,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    asChild?: boolean;
    onInteractOutside?: (event: PopoverInteractOutsideEvent) => void;
    onOpenAutoFocus?: (event: Event) => void;
  };

const PopoverContent = ({
  asChild = false,
  children,
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  initialFocus,
  onInteractOutside,
  onOpenAutoFocus,
  ...props
}: PopoverContentProps) => {
  const popoverContext = usePopoverContext();

  React.useEffect(() => {
    popoverContext?.setOnInteractOutside(onInteractOutside);

    return () => {
      popoverContext?.setOnInteractOutside(undefined);
    };
  }, [onInteractOutside, popoverContext]);

  React.useEffect(() => {
    if (!onOpenAutoFocus) {
      return;
    }

    const event = new Event("openAutoFocus", { cancelable: true });
    onOpenAutoFocus(event);
  }, [onOpenAutoFocus]);

  const render =
    asChild && React.isValidElement(children)
      ? (children as React.ReactElement)
      : undefined;

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          className={cn(
            "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-soft outline-hidden data-closed:animate-out data-open:animate-in",
            className
          )}
          data-slot="popover-content"
          initialFocus={onOpenAutoFocus ? false : initialFocus}
          render={render}
          {...props}
        >
          {asChild ? null : children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
};

export { Popover, PopoverTrigger, PopoverContent };
