"use client";

import type { ComponentPropsWithoutRef, ReactNode, ReactElement } from "react";
import { CopyButton } from "@/components/CopyButton";
import { MermaidDiagram } from "@/components/MermaidDiagram";

// Recursively extract plain text from a React node tree
// (needed because rehype-highlight turns children into span elements)
function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node !== null && typeof node === "object" && "props" in (node as object)) {
    return extractText(
      (node as ReactElement<{ children?: ReactNode }>).props.children
    );
  }
  return "";
}

type CodeChild = ReactElement<{ className?: string; children?: ReactNode }>;

export function CodeBlock({ children, ...rest }: ComponentPropsWithoutRef<"pre">) {
  const child = children as CodeChild | undefined;
  const className = child?.props?.className ?? "";
  // Use regex so "hljs language-go" → "go" (handles rehype-highlight's added "hljs" class)
  const lang = className.match(/language-(\w+)/)?.[1] ?? "";
  const code = extractText(child?.props?.children);

  if (lang === "mermaid") {
    return (
      <div className="mermaid-block">
        <MermaidDiagram chart={code} />
      </div>
    );
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-lang">{lang}</span>
        <CopyButton text={code} label="Copy" />
      </div>
      <pre className="mdx-pre" {...rest}>
        {children}
      </pre>
    </div>
  );
}
