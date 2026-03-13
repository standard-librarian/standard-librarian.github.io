import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default async function HomePage() {
  const posts = (await getAllPosts()).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container reveal">
          <div className="hero-split">
            <div>
              <h1 className="hero-title">Mdht</h1>
              <p className="hero-lead">
                Notes on systems design, context engineering, and real-world delivery.
              </p>
              <div className="hero-cta">
                <Link className="btn primary" href="/posts">
                  Read the notes
                </Link>
                <Link className="btn ghost" href="/about">
                  About
                </Link>
              </div>
            </div>
            <div className="hero-code" aria-hidden="true">
              <div>$ go run ./cmd/api</div>
              <div>&gt; server started on :8080</div>
              <div>$ curl /context</div>
              <div>&gt; &#123;&quot;tokens&quot;:4096,&quot;used&quot;:1820&#125;</div>
              <div>$ _</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal delay-1">
            <h2 className="section-title">Writing</h2>
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
      </section>
    </>
  );
}
