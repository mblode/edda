"use client";

import { SearchIcon } from "blode-icons-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const SearchDialog = dynamic(
  async () => {
    const mod = await import("@/components/ui/search-dialog");
    return mod.SearchDialog;
  },
  { loading: () => null, ssr: false }
);

const preloadDialog = async () => {
  // Eagerly fetch the dialog chunk so it's warm by the time the user opens it.
  try {
    await import("@/components/ui/search-dialog");
  } catch {
    // Ignore preload failures; the dialog will retry on open.
  }
};

const isEditableTarget = (target: EventTarget | null) =>
  (target instanceof HTMLElement && target.isContentEditable) ||
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement;

export const Search = ({ basePath }: { basePath: string }) => {
  const [open, setOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const openSearch = useCallback(() => {
    preloadDialog();
    setHasMounted(true);
    setOpen(true);
  }, []);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        event.key === "/"
      ) {
        if (isEditableTarget(event.target)) {
          return;
        }

        event.preventDefault();
        if (open) {
          setOpen(false);
          return;
        }

        preloadDialog();
        setHasMounted(true);
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [open]);

  return (
    <>
      <button
        aria-label="Search documentation"
        className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground md:hidden"
        onClick={openSearch}
        onFocus={preloadDialog}
        onMouseEnter={preloadDialog}
        type="button"
      >
        <SearchIcon className="size-4.5" />
      </button>
      <button
        className="relative hidden h-8 w-full items-center justify-start rounded-lg border border-border bg-muted/50 pl-3 text-sm font-normal text-foreground shadow-none transition-colors hover:bg-muted/80 md:flex md:w-48 lg:w-56 xl:w-64 dark:bg-card"
        onClick={openSearch}
        onFocus={preloadDialog}
        onMouseEnter={preloadDialog}
        type="button"
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
      </button>
      {hasMounted ? (
        <SearchDialog
          basePath={basePath}
          onOpenChange={handleOpenChange}
          open={open}
        />
      ) : null}
    </>
  );
};
