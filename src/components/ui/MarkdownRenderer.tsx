import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Partial<Components> = {
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-foreground mb-2 mt-3 border-b border-white/10 pb-1">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-foreground mb-1.5 mt-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-foreground mb-1 mt-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-foreground/90 mb-2">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="text-primary font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-foreground/70 italic">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 mb-2 ml-1 text-sm text-foreground/85">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 mb-2 ml-1 text-sm text-foreground/85">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="bg-black/40 border border-white/5 rounded-lg p-3 overflow-x-auto mb-2 mt-1">
          <code className="text-xs font-mono text-primary/90 leading-relaxed">
            {children}
          </code>
        </pre>
      );
    }
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono border border-primary/15">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-sm text-foreground/70 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3 rounded-lg border border-white/5">
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/5 text-foreground/60 text-[10px] uppercase tracking-wider">
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-foreground/80">{children}</td>
  ),
  hr: () => <hr className="border-white/10 my-3" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
    >
      {children}
    </a>
  ),
};

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
