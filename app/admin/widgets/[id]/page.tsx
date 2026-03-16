import { notFound } from "next/navigation";
import { getWidgetById } from "@/lib/widget-queries";
import { DynamicComponentClient } from "@/components/DynamicComponentClient";
import { AdminWidgetEditor } from "@/components/admin/AdminWidgetEditor";
import type { WidgetDef } from "@/types/widget";

export const dynamic = "force-dynamic";

export default async function AdminWidgetReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const comp = await getWidgetById(params.id);
  if (!comp) notFound();

  let definition: WidgetDef | null = null;
  try {
    definition = JSON.parse(comp.definition) as WidgetDef;
  } catch {
    // Invalid JSON — still show the editor
  }

  return (
    <section className="section">
      <div className="container">
        <div className="admin-header">
          <h1 className="section-title">{comp.name}</h1>
          <span className={`admin-status admin-status-${comp.status}`}>
            {comp.status}
          </span>
        </div>

        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          <strong>ID:</strong> <code>{comp.id}</code> &nbsp;·&nbsp;
          <strong>Author:</strong> {comp.author || "anonymous"} &nbsp;·&nbsp;
          <strong>Created:</strong> {comp.created_at.slice(0, 10)}
        </p>

        {definition && (
          <div style={{ marginBottom: "32px" }}>
            <h2 className="section-title" style={{ fontSize: "1rem", marginBottom: "12px" }}>
              Preview
            </h2>
            <DynamicComponentClient definition={definition} />
          </div>
        )}

        <AdminWidgetEditor comp={comp} />
      </div>
    </section>
  );
}
