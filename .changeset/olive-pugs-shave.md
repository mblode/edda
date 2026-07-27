---
"blodemd": patch
---

Accept `seo.siteUrl` in `docs.json`, so a site proxied behind your own domain
can declare where it is actually published. Canonical tags, `og:url`, JSON-LD,
the sitemap, `llms.txt` and the `.md` alternates are all built from that value
instead of being inferred from the request, which a proxy makes impossible.

Validation now distinguishes authoring from serving: `blodemd validate` still
rejects unknown keys so typos fail before they ship, while a published site
renders through them rather than being replaced by an error page.
