// Progressive enhancement for the HTML-only public landing (blode.co/edda).
// That proxy strips the Next runtime, so nothing here may depend on React
// hydration. Every section renders complete without this file.
//
// Event names and property keys mirror LANDING_EVENTS in lib/analytics.ts.

// ---------------------------------------------------------------------------
// MDX demo renderer. A small, safe renderer for a fixed subset: headings,
// paragraphs, lists, bold, italic, inline code, links, fenced code, and the
// callout components (Note, Tip, Warning, Info, Check, Danger, Callout).
// The Markdown side mirrors toAgentMarkdown in packages/previewing for that
// subset. lib/mdx-demo.unit.test.ts runs this file to keep the server-rendered
// example in sync.
// ---------------------------------------------------------------------------

const EDDA_CALLOUTS = {
  Callout: "",
  Check: "check",
  Danger: "danger",
  Info: "info",
  Note: "note",
  Tip: "tip",
  Warning: "warning",
};

const EDDA_MAX_SOURCE = 4000;

// The index blockquote the real .md route prepends to every page, for the
// demo's page. Mirrors DEMO_INDEX_QUOTE in lib/mdx-demo.ts.
const EDDA_INDEX_QUOTE =
  "> ## Documentation Index\n> [HTML page](https://acme.blode.md/quickstart)\n> [Documentation index](https://acme.blode.md/llms.txt)\n> Use the index to discover all available pages before exploring further.";

// Private-use code points mark protected spans. The input is stripped of them.
const EDDA_MARK = "";
const EDDA_MARKS = //gu;

const eddaEscape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const eddaAttr = (attributes, name) => {
  const match = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{\\s*"([^"]*)"\\s*\\})`,
    "u"
  ).exec(attributes || "");
  if (!match) {
    return null;
  }
  return match[1] || match[2] || match[3] || null;
};

// `/\host` is protocol-relative to browsers, so a backslash after the leading
// slash is as unsafe as a second slash.
const eddaSafeHref = (url) => {
  const trimmed = url.trim();
  return /^(?:https?:\/\/|\/(?![/\\])|#)/iu.test(trimmed) ? trimmed : null;
};

// `*` and `_` become entities so the emphasis passes cannot put tags inside
// the href. The browser decodes them back to the same URL.
const eddaHrefAttr = (href) =>
  eddaEscape(href).replaceAll("*", "&#42;").replaceAll("_", "&#95;");

const eddaInline = (text) => {
  const codes = [];
  let out = text.replaceAll(/`([^`\n]+)`/gu, (_match, code) => {
    codes.push(code);
    return `${EDDA_MARK}${codes.length - 1}${EDDA_MARK}`;
  });
  out = eddaEscape(out);
  out = out.replaceAll(/\[([^\]]+)\]\(([^)\s]+)\)/gu, (match, label, url) => {
    // A code span inside the destination is not a link, as in CommonMark.
    if (url.includes(EDDA_MARK)) {
      return match;
    }
    const href = eddaSafeHref(url.replaceAll("&amp;", "&"));
    if (!href) {
      return label;
    }
    return `<a href="${eddaHrefAttr(href)}" rel="nofollow noopener">${label}</a>`;
  });
  out = out.replaceAll(/\*\*([^*\n]+)\*\*/gu, "<strong>$1</strong>");
  out = out.replaceAll(/\*([^*\n]+)\*/gu, "<em>$1</em>");
  out = out.replaceAll(/(^|\W)_([^_\n]+)_(?!\w)/gu, "$1<em>$2</em>");
  return out.replaceAll(
    new RegExp(`${EDDA_MARK}(\\d+)${EDDA_MARK}`, "gu"),
    (_match, index) => `<code>${eddaEscape(codes[Number(index)])}</code>`
  );
};

const eddaIsFenceClose = (line, fence) => {
  const trimmed = line.trim();
  const [char] = fence;
  return (
    trimmed.length >= fence.length &&
    [...trimmed].every((character) => character === char)
  );
};

const eddaList = (list) => {
  const items = list.items.map((item) => `<li>${eddaInline(item)}</li>`);
  return `<${list.type}>${items.join("")}</${list.type}>`;
};

const eddaBlocks = (lines, state, depth) => {
  const html = [];
  let paragraph = [];
  let list = null;
  let index = 0;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${eddaInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      html.push(eddaList(list));
      list = null;
    }
  };
  const flush = () => {
    flushParagraph();
    flushList();
  };

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    const fence = /^(`{3,}|~{3,})\s*([\w-]*)/u.exec(trimmed);
    if (fence) {
      flush();
      const code = [];
      let closed = false;
      index += 1;
      while (index < lines.length) {
        if (eddaIsFenceClose(lines[index], fence[1])) {
          closed = true;
          index += 1;
          break;
        }
        code.push(lines[index]);
        index += 1;
      }
      if (!closed) {
        state.error ||= `Close the code block with ${fence[1]}.`;
      }
      const language = fence[2]
        ? ` data-language="${eddaEscape(fence[2])}"`
        : "";
      html.push(
        `<pre><code${language}>${eddaEscape(code.join("\n"))}</code></pre>`
      );
      continue;
    }

    const open = /^<([A-Z][A-Za-z0-9]*)(\s[^>]*)?>$/u.exec(trimmed);
    if (open && depth < 2 && Object.hasOwn(EDDA_CALLOUTS, open[1])) {
      const [, name, attributes] = open;
      const inner = [];
      let end = index + 1;
      while (end < lines.length && lines[end].trim() !== `</${name}>`) {
        inner.push(lines[end]);
        end += 1;
      }
      if (end < lines.length) {
        flush();
        const type =
          EDDA_CALLOUTS[name] ||
          (eddaAttr(attributes, "type") || "note").toLowerCase();
        const title = name === "Callout" ? eddaAttr(attributes, "title") : null;
        const heading = title
          ? `<p><strong>${eddaInline(title)}</strong></p>`
          : "";
        html.push(
          `<div class="callout" data-type="${eddaEscape(type)}">${heading}${eddaBlocks(inner, state, depth + 1)}</div>`
        );
        index = end + 1;
        continue;
      }
      state.error ||= `Close <${name}> with </${name}>.`;
    }

    const heading = /^(#{1,3})\s+(.+)$/u.exec(trimmed);
    if (heading) {
      flush();
      // Shift by two so the demo page never adds an h1 or h2 to the outline
      // of the landing page that hosts it.
      const level = heading[1].length + 2;
      html.push(`<h${level}>${eddaInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    const item = /^(?:([-*])|\d+\.)\s+(.+)$/u.exec(trimmed);
    if (item) {
      flushParagraph();
      const listType = item[1] ? "ul" : "ol";
      if (list && list.type !== listType) {
        flushList();
      }
      list ||= { items: [], type: listType };
      list.items.push(item[2]);
      index += 1;
      continue;
    }

    if (trimmed === "") {
      flush();
    } else {
      flushList();
      paragraph.push(trimmed);
    }
    index += 1;
  }

  flush();
  return html.join("");
};

const eddaQuote = (type, body) =>
  `> [!${type}]\n${body
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n")}`;

const eddaCompact = (source) =>
  source
    .replaceAll(/[ \t]+\n/gu, "\n")
    .replaceAll(/\n{3,}/gu, "\n\n")
    .trim();

const eddaAgentMarkdown = (source) => {
  const blocks = [];
  let text = source.replaceAll(
    /(^|\n)([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n[ \t]*\3(?=\n|$)/gu,
    (match) => {
      const lead = match.startsWith("\n") ? "\n" : "";
      blocks.push(match.replace(/^\n/u, "").trim());
      return `${lead}${EDDA_MARK}B${blocks.length - 1}${EDDA_MARK}`;
    }
  );
  const spans = [];
  text = text.replaceAll(/`[^`\n]+`/gu, (match) => {
    spans.push(match);
    return `${EDDA_MARK}I${spans.length - 1}${EDDA_MARK}`;
  });
  text = text.replaceAll(
    /<Callout(?=[\s>])\s*([^>]*)>([\s\S]*?)<\/Callout>/gu,
    (_match, attributes, children) => {
      const type = (eddaAttr(attributes, "type") || "note").toUpperCase();
      const title = eddaAttr(attributes, "title");
      const body = [title ? `**${title}**` : "", children.trim()]
        .filter(Boolean)
        .join("\n\n");
      return eddaQuote(type, body);
    }
  );
  for (const tag of ["Note", "Warning", "Info", "Tip", "Check", "Danger"]) {
    text = text.replaceAll(
      new RegExp(`<${tag}(?=[\\s>])\\s*[^>]*>([\\s\\S]*?)</${tag}>`, "gu"),
      (_match, children) => eddaQuote(tag.toUpperCase(), children.trim())
    );
  }
  text = eddaCompact(text);
  text = text.replaceAll(
    new RegExp(`${EDDA_MARK}I(\\d+)${EDDA_MARK}`, "gu"),
    (_match, index) => spans[Number(index)]
  );
  text = text.replaceAll(
    new RegExp(`${EDDA_MARK}B(\\d+)${EDDA_MARK}`, "gu"),
    (_match, index) => blocks[Number(index)]
  );
  return eddaCompact(text);
};

const eddaUnknownComponent = (source) => {
  const prose = source
    .replaceAll(/(`{3,}|~{3,})[\s\S]*?(?:\1|$)/gu, "")
    .replaceAll(/`[^`\n]+`/gu, "");
  for (const match of prose.matchAll(/<([A-Z][A-Za-z0-9.]*)/gu)) {
    if (!Object.hasOwn(EDDA_CALLOUTS, match[1])) {
      return match[1];
    }
  }
  return null;
};

/** Returns `{ html, markdown, error }` for a demo MDX source. */
const eddaRenderMdx = (input) => {
  const source = String(input)
    .replaceAll(/\r\n?/gu, "\n")
    .replaceAll(EDDA_MARKS, "")
    .slice(0, EDDA_MAX_SOURCE);
  const state = { error: null };
  const html = eddaBlocks(source.split("\n"), state, 0);
  const unknown = eddaUnknownComponent(source);
  if (unknown && !state.error) {
    state.error = `<${unknown}> is not in this demo. Try Note, Tip, Warning or Info.`;
  }
  const body = eddaAgentMarkdown(source);
  const markdown = body ? `${EDDA_INDEX_QUOTE}\n\n${body}` : EDDA_INDEX_QUOTE;
  return { error: state.error, html, markdown };
};

// ---------------------------------------------------------------------------
// Browser wiring
// ---------------------------------------------------------------------------

const eddaTrack = (event, properties) => {
  const client = window.posthog;
  if (!client || typeof client.capture !== "function") {
    return;
  }
  // Analytics runs before the demo render and the copy in the same handlers,
  // so a throwing third-party client must not take them down.
  try {
    client.capture(event, { ...properties, site: "edda" });
  } catch {
    // Dropping one event is the right outcome.
  }
};

const eddaInitDemo = (root) => {
  const input = root.querySelector("[data-mdx-input]");
  const preview = root.querySelector("[data-mdx-preview]");
  const output = root.querySelector("[data-mdx-output]");
  const status = root.querySelector("[data-mdx-status]");
  const reset = root.querySelector("[data-mdx-reset]");
  if (!(input && preview && output && status)) {
    return;
  }
  const initial = input.value;
  let opened = false;

  const render = () => {
    const result = eddaRenderMdx(input.value);
    preview.innerHTML =
      result.html ||
      '<p class="mdx-demo-empty">Type some MDX to see the page.</p>';
    output.textContent = result.markdown;
    status.textContent = result.error || "";
    root.toggleAttribute("data-error", Boolean(result.error));
  };

  const markOpened = () => {
    if (!opened) {
      opened = true;
      eddaTrack("demo_opened", {});
    }
  };

  input.readOnly = false;
  root.dataset.ready = "";
  input.addEventListener("focus", markOpened);
  input.addEventListener("input", () => {
    markOpened();
    render();
  });
  if (reset) {
    reset.hidden = false;
    reset.addEventListener("click", () => {
      input.value = initial;
      render();
      input.focus();
    });
  }
};

const eddaInitReveals = () => {
  const reduce = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reduce || !("IntersectionObserver" in window)) {
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.dataset.reveal = "shown";
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px" }
  );
  for (const element of document.querySelectorAll("[data-reveal]")) {
    // Only below the fold: anything already on screen stays put.
    if (element.getBoundingClientRect().top > window.innerHeight) {
      element.dataset.reveal = "pending";
      observer.observe(element);
    }
  }
};

// section_viewed {site, section} once per section per page view, the first
// time half of it (or half the viewport, for a tall section) is on screen.
// Skips the hero and anything already in view on load.
// lib/analytics.unit.test.ts runs this against a fake observer.
const eddaInitSectionViews = () => {
  try {
    if (!("IntersectionObserver" in window)) {
      return;
    }
    const seen = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          try {
            const id = entry.target.dataset.section;
            const viewport = entry.rootBounds
              ? entry.rootBounds.height
              : window.innerHeight;
            const visible =
              entry.intersectionRatio >= 0.5 ||
              entry.intersectionRect.height >= viewport * 0.5;
            if (!(id && entry.isIntersecting && visible) || seen.has(id)) {
              continue;
            }
            seen.add(id);
            observer.unobserve(entry.target);
            eddaTrack("section_viewed", { section: id });
          } catch {
            // One bad entry must not stop the others.
          }
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] }
    );
    for (const section of document.querySelectorAll("[data-section]")) {
      const id = section.dataset.section;
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (id && id !== "hero" && !inView) {
        observer.observe(section);
      }
    }
  } catch {
    // Analytics must not break the page.
  }
};

const eddaCopy = async (button) => {
  const scope = button.closest("[data-copy-scope]") || button.parentElement;
  const status = scope.querySelector("[data-copy-status]");
  const label = button.dataset.copyLabel || "Copy";
  try {
    await navigator.clipboard.writeText(button.dataset.copyCommand);
    button.textContent = "Copied";
    if (status) {
      status.textContent = "Install commands copied.";
    }
    eddaTrack("install_command_copied", {
      variant: button.dataset.copyVariant || "default",
    });
    window.setTimeout(() => {
      button.textContent = label;
    }, 2000);
  } catch {
    if (status) {
      status.textContent =
        "Could not copy. Select the commands below and copy them manually.";
    }
  }
};

if (typeof document !== "undefined" && typeof window !== "undefined") {
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }
    const cta = target.closest("[data-cta-location]");
    if (cta) {
      eddaTrack("cta_clicked", {
        label: cta.dataset.ctaLabel || cta.textContent.trim(),
        location: cta.dataset.ctaLocation,
      });
    }
    const button = target.closest("button[data-copy-command]");
    if (button) {
      eddaCopy(button);
    }
  });

  for (const details of document.querySelectorAll("details[data-faq]")) {
    details.addEventListener("toggle", () => {
      if (details.open) {
        eddaTrack("faq_opened", { question: details.dataset.faq });
      }
    });
  }

  for (const root of document.querySelectorAll("[data-mdx-demo]")) {
    eddaInitDemo(root);
  }
  eddaInitReveals();
  eddaInitSectionViews();
}
