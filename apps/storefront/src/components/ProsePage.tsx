import type { ReactNode } from "react";

interface Props {
  title: string;
  html?: string;
  children?: ReactNode;
}

export function ProsePage({ title, html, children }: Props) {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-10 md:px-6 md:py-14">
      <h1 className="font-display mb-8 text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h1>
      {html ? (
        <div
          className="prose-product max-w-none [&_a]:text-accent [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-snow [&_img]:my-4 [&_img]:rounded-2xl [&_table]:w-full [&_td]:border [&_td]:border-line [&_td]:p-2 [&_th]:border [&_th]:border-line [&_th]:p-2"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
      {children}
    </div>
  );
}
