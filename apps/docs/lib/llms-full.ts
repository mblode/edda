export const LLMS_FULL_CHAR_LIMIT = 80_000;

const FENCE_LINE_REGEX = /^ {0,3}(`{3,}|~{3,})/;

const getTruncationFooter = (indexUrl: string) =>
  [
    "",
    "---",
    "",
    "Content truncated to keep this response under crawler size limits.",
    `Use ${indexUrl} for the full page index and fetch individual .md pages for uncapped content.`,
  ].join("\n");

const findOpenFence = (source: string) => {
  let openFence: string | null = null;

  for (const line of source.split(/\r?\n/)) {
    const marker = FENCE_LINE_REGEX.exec(line)?.[1];
    if (!marker) {
      continue;
    }

    if (!openFence) {
      openFence = marker;
      continue;
    }

    if (marker[0] === openFence[0] && marker.length >= openFence.length) {
      openFence = null;
    }
  }

  return openFence;
};

const closeOpenFence = (source: string) => {
  const openFence = findOpenFence(source);
  return openFence ? `${source}\n${openFence}` : source;
};

const findTruncationBoundary = (source: string, minimum: number) => {
  const sectionBoundary = source.lastIndexOf("\n# ");
  if (sectionBoundary > minimum) {
    return sectionBoundary;
  }

  const paragraphBoundary = source.lastIndexOf("\n\n");
  if (paragraphBoundary > minimum) {
    return paragraphBoundary;
  }

  const lineBoundary = source.lastIndexOf("\n");
  return lineBoundary > 0 ? lineBoundary : source.length;
};

export const capLlmsFullContent = (
  content: string,
  indexUrl: string,
  limit = LLMS_FULL_CHAR_LIMIT
) => {
  const trimmed = content.trim();
  if (trimmed.length <= limit) {
    return trimmed;
  }

  const footer = getTruncationFooter(indexUrl);
  let room = limit - footer.length - 16;
  while (room > 0) {
    const draft = trimmed.slice(0, room);
    const boundary = findTruncationBoundary(draft, Math.floor(room / 2));
    const capped = closeOpenFence(draft.slice(0, boundary).trimEnd());
    const result = `${capped}${footer}`;

    if (result.length <= limit) {
      return result;
    }

    room -= result.length - limit + 16;
  }

  return footer.trim().slice(0, limit);
};
