import React from "react";

export default function AdminDocsPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="section-title" style={{ marginBottom: "2rem" }}>MDX Reference</h1>

        <DocsSection title="Frontmatter">
          <p className="admin-docs-desc">Every post starts with YAML frontmatter between <code>---</code> delimiters.</p>
          <Pre>{`---
title: "My Post Title"
date: "2026-03-13"
tags: ["go", "platform", "ai"]
summary: "One-sentence description shown on the listing page."
---`}</Pre>
        </DocsSection>

        <DocsSection title="Headings">
          <Pre>{`# H1 — page title (avoid in posts, the title comes from frontmatter)
## H2 — main section heading
### H3 — sub-section`}</Pre>
        </DocsSection>

        <DocsSection title="Text formatting">
          <Pre>{`**bold text**
*italic text*
~~strikethrough~~
\`inline code\`
[link text](https://example.com)`}</Pre>
        </DocsSection>

        <DocsSection title="Code blocks">
          <p className="admin-docs-desc">Fenced with triple backticks. Specify the language for syntax highlighting.</p>
          <Pre>{`\`\`\`go
func main() {
    fmt.Println("hello world")
}
\`\`\`

\`\`\`ts
const greet = (name: string) => \`Hello, \${name}\`;
\`\`\`

\`\`\`bash
pnpm dev
\`\`\``}</Pre>
        </DocsSection>

        <DocsSection title="Mermaid diagrams">
          <p className="admin-docs-desc">Use the <code>mermaid</code> language tag. Renders client-side with Mermaid v11.</p>
          <Pre>{`\`\`\`mermaid
graph TD
  A((Start)) --> B((Process))
  B --> C((End))
  classDef blue fill:#2563eb,color:#fff
  class A,B,C blue
\`\`\``}</Pre>
          <Pre>{`\`\`\`mermaid
sequenceDiagram
  Client->>Server: GET /api/posts
  Server-->>Client: 200 JSON
\`\`\``}</Pre>
          <Pre>{`\`\`\`mermaid
flowchart LR
  A[Input] --> B{Valid?}
  B -- Yes --> C[Process]
  B -- No  --> D[Error]
\`\`\``}</Pre>
        </DocsSection>

        <DocsSection title="Tables (GFM)">
          <Pre>{`| Column A | Column B | Column C |
| -------- | -------- | -------- |
| foo      | bar      | baz      |
| 1        | 2        | 3        |

Alignment:
| Left | Center | Right |
| :--- | :----: | ----: |
| a    |   b    |     c |`}</Pre>
        </DocsSection>

        <DocsSection title="Lists">
          <Pre>{`- Unordered item
- Another item
  - Nested item

1. First
2. Second
3. Third`}</Pre>
        </DocsSection>

        <DocsSection title="Blockquotes">
          <Pre>{`> This is a blockquote.
> It can span multiple lines.`}</Pre>
        </DocsSection>

        <DocsSection title="Horizontal rule">
          <Pre>{`---`}</Pre>
        </DocsSection>

        <DocsSection title="Custom: Split (2-column layout)">
          <p className="admin-docs-desc">Renders two columns side by side. Good for comparisons.</p>
          <Pre>{`<Split>
<div>

**Left column**

Some content here.

</div>
<div>

**Right column**

Other content here.

</div>
</Split>`}</Pre>
        </DocsSection>

        <DocsSection title="Custom: CodeSnippet">
          <p className="admin-docs-desc">Manual code block with explicit language label — use when you want to control the display language name.</p>
          <Pre>{`<CodeSnippet lang="go">\`\`\`
func Add(a, b int) int {
    return a + b
}
\`\`\`</CodeSnippet>`}</Pre>
        </DocsSection>

        <DocsSection title="Widget schema">
          <p className="admin-docs-desc">
            Full reference for the <code>WidgetDef</code> JSON schema: state variable types,
            all action op types, every block type, template interpolation, and the scenario system.
          </p>
          <p><a href="/admin/docs/widget-schema" className="mdx-link">Open widget schema reference →</a></p>
        </DocsSection>
      </div>
    </section>
  );
}

function DocsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-docs-section">
      <h2 className="admin-docs-heading">{title}</h2>
      {children}
    </div>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="admin-docs-pre"><code>{children}</code></pre>
  );
}
