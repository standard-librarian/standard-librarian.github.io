import { getCacheEntry } from "@/lib/db";
import type { Metadata } from "next";
import RepoCard from "@/components/RepoCard";
import PRList from "@/components/PRList";
import type { GitHubCache } from "@/lib/github";
import { fetchGitHubCache } from "@/lib/github";

export const metadata: Metadata = {
  title: "OSS",
  description: "Open source contributions, featured projects, and PR activity.",
};

export const dynamic = "force-dynamic";

async function getGitHubData(): Promise<GitHubCache | null> {
  try {
    const cached = await getCacheEntry<GitHubCache>("github:data");
    if (cached) return cached;
  } catch {
    // DB not available
  }
  try {
    return await fetchGitHubCache();
  } catch {
    return null;
  }
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function OSSPage() {
  const data = await getGitHubData();

  const totalPRs = data?.prs.length ?? 0;
  const mergedPRs = data?.prs.filter((p) => p.merged_at).length ?? 0;
  const totalRepos = data?.repos.length ?? 0;

  return (
    <section className="section">
      <div className="container">
        <div className="reveal">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <h1 className="section-title" style={{ margin: 0 }}>Open source</h1>
            {data && (
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                synced {formatRelativeTime(data.last_updated)}
              </span>
            )}
          </div>

          {data && (
            <div className="oss-stats">
              <div>
                <span className="oss-stat-value">{totalPRs}</span>
                <span className="oss-stat-label">Pull requests</span>
              </div>
              <div>
                <span className="oss-stat-value">{mergedPRs}</span>
                <span className="oss-stat-label">Merged</span>
              </div>
              {totalRepos > 0 && (
                <div>
                  <span className="oss-stat-value">{totalRepos}</span>
                  <span className="oss-stat-label">Own repos</span>
                </div>
              )}
            </div>
          )}

          {!data && (
            <p className="oss-empty">
              GitHub data is not yet available.{" "}
              <code style={{ fontSize: "0.88em", background: "var(--surface-2)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--line)" }}>
                GET /api/cron/github
              </code>{" "}
              to populate it.
            </p>
          )}

          {data && data.repos.length > 0 && (
            <div style={{ marginBottom: 52 }}>
              <p className="oss-section-label">Featured repos</p>
              <div className="oss-repo-grid">
                {data.repos.map((repo) => (
                  <RepoCard key={repo.full_name} repo={repo} />
                ))}
              </div>
            </div>
          )}

          {data && data.prs.length > 0 && (
            <div>
              <p className="oss-section-label">PR activity</p>
              <PRList prs={data.prs} />
            </div>
          )}

          {data && data.repos.length === 0 && data.prs.length === 0 && (
            <p className="oss-empty">
              No data yet. Tag a GitHub repo with the topic{" "}
              <code style={{ fontSize: "0.88em", background: "var(--surface-2)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--line)" }}>
                blog-featured
              </code>{" "}
              to surface it here.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
