import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Posts",
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const allPosts = await getAllPosts();
  const allTags = Array.from(new Set(allPosts.flatMap((p) => p.tags))).sort();
  const activeTag = searchParams.tag;
  const posts = activeTag ? allPosts.filter((p) => p.tags.includes(activeTag)) : allPosts;

  return (
    <section className="section">
      <div className="container">
        <div className="reveal">
          <h1 className="section-title">All posts</h1>
          <div className="posts-layout">
            <aside className="posts-sidebar">
              <p className="sidebar-heading">Topics</p>
              <div className="sidebar-tags">
                <Link
                  href="/posts"
                  className={`sidebar-tag${!activeTag ? " active" : ""}`}
                >
                  All
                </Link>
                {allTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/posts?tag=${tag}`}
                    className={`sidebar-tag${activeTag === tag ? " active" : ""}`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </aside>
            <div className="post-list">
              {posts.map((post) => (
                <div key={post.slug} className="post-list-item">
                  <Link className="post-list-item-link" href={`/posts/${post.slug}`}>
                    <div className="post-list-item-header">
                      <span className="post-list-title">{post.title}</span>
                      <span className="post-list-date">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="post-list-summary">{post.summary}</p>
                  </Link>
                  <div className="tag-row">
                    {post.tags.map((tag) => (
                      <Link key={tag} href={`/posts?tag=${tag}`} className="tag">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
