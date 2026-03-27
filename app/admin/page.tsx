import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { db, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

async function deletePost(slug: string) {
  "use server";
  await ensureSchema();
  await db.execute({ sql: "DELETE FROM posts WHERE slug = ?", args: [slug] });
}

export default async function AdminPage() {
  const posts = await getAllPosts({ includeUnlisted: true });

  return (
    <section className="section">
      <div className="container">
        <div className="admin-header">
          <h1 className="section-title">Posts</h1>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href="/admin/docs" className="btn ghost">Docs</Link>
            <Link href="/admin/widgets" className="btn ghost">Widgets</Link>
            <Link href="/admin/new" className="btn primary">New Post</Link>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Visibility</th>
              <th>Date</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.slug}>
                <td>
                  <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                </td>
                <td>{post.isUnlisted ? "Unlisted" : "Public"}</td>
                <td>{post.date}</td>
                <td>{post.tags.join(", ")}</td>
                <td className="admin-actions">
                  <Link href={`/admin/edit/${post.slug}`} className="admin-action-btn">
                    Edit
                  </Link>
                  <form
                    action={deletePost.bind(null, post.slug)}
                    style={{ display: "inline" }}
                  >
                    <button type="submit" className="admin-action-btn admin-action-danger">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
