import { getCacheEntry } from "@/lib/db";
import type { Metadata } from "next";
import RepoCard from "@/components/RepoCard";
import PRTimelineItem from "@/components/PRTimelineItem";
import type { GitHubCache } from "@/lib/github";
import { fetchGitHubCache } from "@/lib/github";

export const metadata: Metadata = {
  title: "OSS",
  description: "My open source contributions, featured projects, and PR activity",
};

export const revalidate = 3600;

async function getGitHubData(): Promise<GitHubCache | null> {
  try {
    const cached = await getCacheEntry<GitHubCache>("github:data");
    if (cached) return cached;
  } catch {
    // DB not available, fall through
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
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function OSSPage() {
  const data = await getGitHubData();

  return (
    <section className="section">
      <div className="container">
        <div className="reveal">
          {/* Page header */}
          <div className="mb-10">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h1 className="section-title">Open Source</h1>
              {data && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  updated {formatRelativeTime(data.last_updated)}
                </span>
              )}
            </div>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Projects I maintain and contributions to the open source ecosystem.
            </p>
          </div>

          {!data && (
            <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-200">
              GitHub data is not yet available. Run the cron endpoint to populate it.
            </div>
          )}

          {/* Featured repos */}
          {data && data.repos.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
                </svg>
                Featured Projects
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.repos.map((repo) => (
                  <RepoCard key={repo.full_name} repo={repo} />
                ))}
              </div>
            </section>
          )}

          {/* PR timeline */}
          {data && data.prs.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
                </svg>
                PR Activity
              </h2>
              <div>
                {data.prs.map((pr, i) => (
                  <PRTimelineItem
                    key={pr.id}
                    pr={pr}
                    isLast={i === data.prs.length - 1}
                  />
                ))}
              </div>
            </section>
          )}

          {data && data.repos.length === 0 && data.prs.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No data yet. Tag a repo with the{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">blog-featured</code>{" "}
              GitHub topic to feature it here.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
