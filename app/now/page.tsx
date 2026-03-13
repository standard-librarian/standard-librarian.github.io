import { notFound } from "next/navigation";
import { renderMdx } from "@/lib/mdx";
import { getPageBySlug } from "@/lib/pages";

export const metadata = {
  title: "Now"
};

export default async function NowPage() {
  const page = getPageBySlug("now");

  if (!page) {
    notFound();
  }

  const content = await renderMdx(page.content);

  return (
    <section className="section">
      <div className="container">
        <div className="reveal">
          <h1 className="section-title">{page.title}</h1>
          <div>{content}</div>
        </div>
      </div>
    </section>
  );
}
