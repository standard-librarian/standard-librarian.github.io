import type { GitHubRepo } from "@/lib/github";

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function RepoCard({ repo }: { repo: GitHubRepo }) {
  const parts: string[] = [];
  if (repo.language) parts.push(repo.language);
  if (repo.stargazers_count > 0) parts.push(`${formatStars(repo.stargazers_count)} ★`);
  if (repo.forks_count > 0) parts.push(`${repo.forks_count} forks`);
  parts.push(`updated ${timeAgo(repo.updated_at)}`);

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="oss-repo"
    >
      <span className="oss-repo-name">{repo.name}</span>
      <span className="oss-repo-desc">
        {repo.description ?? "No description."}
      </span>
      <span className="oss-repo-footer">{parts.join(" · ")}</span>
    </a>
  );
}
