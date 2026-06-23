import type { ReactNode } from 'react';

interface JsonLdScriptProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function JsonLdScript({ data }: JsonLdScriptProps): ReactNode {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, index) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
