const GITHUB_USER = "standard-librarian";
const GITHUB_API = "https://api.github.com";
const MIN_STARS_FOR_PR = 500;

function githubHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
  updated_at: string;
  topics: string[];
}

export interface OSSPR {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  repo: {
    full_name: string;
    html_url: string;
    stargazers_count: number;
    language: string | null;
  };
}

export interface GitHubCache {
  repos: GitHubRepo[];
  prs: OSSPR[];
  last_updated: string;
}

export async function fetchFeaturedRepos(): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${GITHUB_API}/users/${GITHUB_USER}/repos?per_page=100&type=owner&sort=updated`,
    { headers: githubHeaders() }
  );
  if (!res.ok) throw new Error(`GitHub repos fetch failed: ${res.status}`);
  const repos: GitHubRepo[] = await res.json();
  return repos.filter((r) => r.topics?.includes("blog-featured"));
}

export async function fetchOSSPRs(): Promise<OSSPR[]> {
  const q = encodeURIComponent(
    `is:pr author:${GITHUB_USER} -user:${GITHUB_USER}`
  );
  const res = await fetch(
    `${GITHUB_API}/search/issues?q=${q}&sort=updated&per_page=50`,
    { headers: githubHeaders() }
  );
  if (!res.ok) throw new Error(`GitHub PR search failed: ${res.status}`);
  const data = await res.json();
  const items: Array<{
    id: number;
    number: number;
    title: string;
    html_url: string;
    state: string;
    created_at: string;
    updated_at: string;
    pull_request: { merged_at: string | null };
    repository_url: string;
  }> = data.items ?? [];

  const repoUrls = [...new Set(items.map((i) => i.repository_url))];
  const repoMap = new Map<
    string,
    { full_name: string; html_url: string; stargazers_count: number; language: string | null }
  >();

  await Promise.all(
    repoUrls.map(async (url) => {
      try {
        const r = await fetch(url, { headers: githubHeaders() });
        if (!r.ok) return;
        const repo = await r.json();
        repoMap.set(url, {
          full_name: repo.full_name,
          html_url: repo.html_url,
          stargazers_count: repo.stargazers_count,
          language: repo.language,
        });
      } catch {
        // skip repos that fail
      }
    })
  );

  return items
    .map((item) => {
      const repo = repoMap.get(item.repository_url);
      if (!repo) return null;
      if (repo.stargazers_count < MIN_STARS_FOR_PR) return null;
      return {
        id: item.id,
        number: item.number,
        title: item.title,
        html_url: item.html_url,
        state: item.state as "open" | "closed",
        created_at: item.created_at,
        updated_at: item.updated_at,
        merged_at: item.pull_request?.merged_at ?? null,
        repo,
      };
    })
    .filter((pr): pr is OSSPR => pr !== null);
}

export async function fetchGitHubCache(): Promise<GitHubCache> {
  const [repos, prs] = await Promise.all([fetchFeaturedRepos(), fetchOSSPRs()]);
  return { repos, prs, last_updated: new Date().toISOString() };
}
