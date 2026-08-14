export const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    // oxlint-disable-next-line no-danger -- JSON-LD for SEO
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    type="application/ld+json"
  />
);
