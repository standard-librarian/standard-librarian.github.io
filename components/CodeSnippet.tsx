"use client";

import { useMemo } from "react";
import hljs from "highlight.js";
import { CopyButton } from "@/components/CopyButton";

type CodeSnippetProps = {
  code: string;
  lang: string;
};

export function CodeSnippet({ code, lang }: CodeSnippetProps) {
  const html = useMemo(() => {
    try {
      return hljs.highlight(code.trim(), { language: lang }).value;
    } catch {
      return code.trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }, [code, lang]);

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-lang">{lang}</span>
        <CopyButton text={code.trim()} label="Copy" />
      </div>
      <pre className="mdx-pre">
        <code
          className={`hljs language-${lang}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  );
}
