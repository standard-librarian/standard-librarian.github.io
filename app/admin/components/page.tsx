import Link from "next/link";
import { getAllComponents } from "@/lib/components";

export const dynamic = "force-dynamic";

export default async function AdminComponentsPage() {
  const components = await getAllComponents();

  return (
    <section className="section">
      <div className="container">
        <div className="admin-header">
          <h1 className="section-title">Components</h1>
          <Link href="/components/submit" className="btn primary">
            Submit New
          </Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Author</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {components.map((comp) => (
              <tr key={comp.id}>
                <td>
                  <code>{comp.id}</code>
                </td>
                <td>{comp.name}</td>
                <td>{comp.author || "—"}</td>
                <td>
                  <span className={`admin-status admin-status-${comp.status}`}>
                    {comp.status}
                  </span>
                </td>
                <td>{comp.created_at.slice(0, 10)}</td>
                <td className="admin-actions">
                  <Link
                    href={`/admin/components/${comp.id}`}
                    className="admin-action-btn"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {components.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  No components yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
