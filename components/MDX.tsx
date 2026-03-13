import type { ComponentPropsWithoutRef } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { Split } from "@/components/Split";
import { CodeSnippet } from "@/components/CodeSnippet";

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => <h1 className="mdx-h1" {...props} />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => <h2 className="mdx-h2" {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <h3 className="mdx-h3" {...props} />,
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="mdx-p" {...props} />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => <ul className="mdx-ul" {...props} />,
  ol: (props: ComponentPropsWithoutRef<"ol">) => <ol className="mdx-ol" {...props} />,
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="mdx-li" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => <blockquote className="mdx-quote" {...props} />,
  a: (props: ComponentPropsWithoutRef<"a">) => <a className="mdx-link" {...props} />,
  code: (props: ComponentPropsWithoutRef<"code">) => <code className="mdx-code" {...props} />,
  pre: (props: ComponentPropsWithoutRef<"pre">) => <CodeBlock {...props} />,
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr className="mdx-hr" {...props} />,
  Split,
  CodeSnippet,
};
