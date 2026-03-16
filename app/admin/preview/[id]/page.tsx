import { notFound } from "next/navigation";
import { getPreview } from "@/lib/preview-store";
import { renderMdx } from "@/lib/mdx";

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const result = await getPreview(params.id);

  if (result === null) notFound();

  if (result === "expired") {
    return (
      <>
        <div className="preview-topbar">
          <span className="preview-topbar-label">Preview</span>
        </div>
        <section className="section">
          <div className="container">
            <p style={{ color: "var(--text-muted)", marginTop: "48px", textAlign: "center" }}>
              This preview has expired (30-minute limit). Return to the editor and generate a new link.
            </p>
          </div>
        </section>
      </>
    );
  }

  const rendered = await renderMdx(result.content);

  return (
    <>
      <div className="preview-topbar">
        <span className="preview-topbar-label">Preview</span>
      </div>
      <section className="section">
        <div className="container">
          <article className="post-body">{rendered}</article>
        </div>
      </section>
    </>
  );
}
