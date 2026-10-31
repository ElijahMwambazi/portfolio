import { isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Link } from "react-router-dom";
import { CodeBlock } from "../ui/CodeBlock";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node))
    return textOf((node as ReactElement<{ children?: ReactNode }>).props.children);
  return "";
}

function Heading({
  level,
  id,
  children,
}: {
  level: 2 | 3 | 4;
  id?: string;
  children?: ReactNode;
}) {
  const Tag = `h${level}` as const;
  const sizes = {
    2: "mt-12 text-xl sm:text-2xl",
    3: "mt-8 text-lg sm:text-xl",
    4: "mt-6 text-base sm:text-lg",
  } as const;
  return (
    <Tag
      id={id}
      className={`group scroll-mt-24 font-semibold tracking-tight text-neutral-50 ${sizes[level]}`}
    >
      {children}
      {id ? (
        <a
          href={`#${id}`}
          aria-label={`Link to section: ${textOf(children)}`}
          className="ml-2 text-neutral-600 opacity-0 transition hover:text-neutral-300 focus-visible:opacity-100 group-hover:opacity-100"
        >
          #
        </a>
      ) : null}
    </Tag>
  );
}

const components: Components = {
  h1: ({ children, id }) => (
    // The page title is the only h1; demote any stray one in the body.
    <Heading level={2} id={id}>
      {children}
    </Heading>
  ),
  h2: ({ children, id }) => (
    <Heading level={2} id={id}>
      {children}
    </Heading>
  ),
  h3: ({ children, id }) => (
    <Heading level={3} id={id}>
      {children}
    </Heading>
  ),
  h4: ({ children, id }) => (
    <Heading level={4} id={id}>
      {children}
    </Heading>
  ),
  p: ({ children }) => <p className="mt-5 first:mt-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-5 list-disc space-y-2 pl-6 marker:text-neutral-600">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 marker:text-neutral-500">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 border-white/20 pl-5 text-neutral-400 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-white/10" />,
  a: ({ href = "", children }) => {
    if (href.startsWith("#")) {
      return (
        <a href={href} className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
          {children}
        </a>
      );
    }
    if (href.startsWith("/")) {
      return (
        <Link to={href} className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      className="mt-6 max-w-full rounded-2xl border border-white/10"
    />
  ),
  code: ({ children }) => (
    <code className="rounded-md border border-white/10 bg-white/6 px-1.5 py-0.5 text-[0.9em] text-neutral-100">
      {children}
    </code>
  ),
  pre: ({ children }) => {
    const child = Array.isArray(children) ? children[0] : children;
    const props = isValidElement(child)
      ? (child as ReactElement<{ className?: string; children?: ReactNode }>).props
      : {};
    const language = /language-([\w+-]+)/.exec(props.className ?? "")?.[1];
    const code = textOf(props.children).replace(/\n$/, "");
    return <CodeBlock code={code} language={language} />;
  },
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-white/10 bg-white/4 px-4 py-2 font-medium text-neutral-200">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-white/5 px-4 py-2 align-top">{children}</td>
  ),
};

/**
 * Renders author-written Markdown. Raw HTML in the source is never rendered
 * (no rehype-raw), and react-markdown's default URL sanitizing blocks
 * `javascript:` links.
 */
export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <div className="text-base leading-8 text-neutral-300 sm:text-[17px] sm:leading-8 [&_strong]:font-semibold [&_strong]:text-neutral-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={components}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
