"use client";

import { useEffect, useState } from "react";

interface RelativeTimeProps {
  className?: string;
  date: string;
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const formatRelative = (date: Date): string => {
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);

  if (abs < MINUTE) {
    return "just now";
  }
  if (abs < HOUR) {
    return formatter.format(Math.round(diffSeconds / MINUTE), "minute");
  }
  if (abs < DAY) {
    return formatter.format(Math.round(diffSeconds / HOUR), "hour");
  }
  if (abs < WEEK) {
    return formatter.format(Math.round(diffSeconds / DAY), "day");
  }
  if (abs < MONTH) {
    return formatter.format(Math.round(diffSeconds / WEEK), "week");
  }
  if (abs < YEAR) {
    return formatter.format(Math.round(diffSeconds / MONTH), "month");
  }
  return formatter.format(Math.round(diffSeconds / YEAR), "year");
};

const formatAbsolute = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const RelativeTime = ({ className, date }: RelativeTimeProps) => {
  const parsed = new Date(date);
  const absolute = formatAbsolute(parsed);
  const [label, setLabel] = useState(absolute);

  useEffect(() => {
    // Intentional: the server renders the absolute date so markup is stable,
    // then the client swaps in the relative label after mount. Deriving this
    // during render instead would produce a hydration mismatch, because
    // "3 hours ago" is computed from a clock the server and client do not share.
    // oxlint-disable-next-line react/set-state-in-effect
    setLabel(formatRelative(new Date(date)));
  }, [date]);

  return (
    <time className={className} dateTime={date} title={absolute}>
      {label}
    </time>
  );
};
