import { WidgetSubmitForm } from "@/components/WidgetSubmitForm";

export default function SubmitWidgetPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "720px" }}>
        <h1 className="section-title">Submit a Widget</h1>
        <p className="mdx-p" style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
          Submit an interactive widget for review. Once approved, it can be embedded in posts
          using <code className="mdx-code">&lt;DynamicComponent id=&quot;your-id&quot; /&gt;</code>.
        </p>
        <WidgetSubmitForm />
      </div>
    </section>
  );
}
