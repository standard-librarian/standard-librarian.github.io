import { notFound } from "next/navigation";
import { getPreview } from "@/lib/preview-store";
import { renderMdx } from "@/lib/mdx";

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const content = getPreview(params.id);
  if (!content) notFound();

  const rendered = await renderMdx(content);

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
