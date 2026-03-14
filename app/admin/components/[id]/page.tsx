import { notFound } from "next/navigation";
import { getComponentById } from "@/lib/components";
import { DynamicComponentClient } from "@/components/DynamicComponentClient";
import { AdminComponentEditor } from "@/components/admin/AdminComponentEditor";
import type { ComponentDef } from "@/types/component";

export const dynamic = "force-dynamic";

export default async function AdminComponentReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const comp = await getComponentById(params.id);
  if (!comp) notFound();

  let definition: ComponentDef | null = null;
  try {
    definition = JSON.parse(comp.definition) as ComponentDef;
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

        <AdminComponentEditor comp={comp} />
      </div>
    </section>
  );
}
