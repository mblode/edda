import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;

// The server has no viewport, so it renders the desktop layout and the first
// client render corrects it.
const getServerSnapshot = () => false;

export const useIsMobile = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
