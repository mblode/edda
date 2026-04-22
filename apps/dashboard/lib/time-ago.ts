const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const timeAgo = (iso: string | null): string => {
  if (!iso) {
    return "";
  }
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  for (const [unit, secs] of units) {
    if (Math.abs(seconds) >= secs || unit === "second") {
      return rtf.format(-Math.round(seconds / secs), unit);
    }
  }
  return "";
};
