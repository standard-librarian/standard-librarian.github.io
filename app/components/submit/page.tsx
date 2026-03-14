import { ComponentSubmitForm } from "@/components/ComponentSubmitForm";

export default function SubmitComponentPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "720px" }}>
        <h1 className="section-title">Submit a Component</h1>
        <p className="mdx-p" style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
          Submit an interactive component for review. Once approved, it can be embedded in posts
          using <code className="mdx-code">&lt;DynamicComponent id=&quot;your-id&quot; /&gt;</code>.
        </p>
        <ComponentSubmitForm />
      </div>
    </section>
  );
}
