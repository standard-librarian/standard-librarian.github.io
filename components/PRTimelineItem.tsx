import type { OSSPR } from "@/lib/github";

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PRTimelineItem({
  pr,
}: {
  pr: OSSPR;
  isLast: boolean;
}) {
  const isMerged = !!pr.merged_at;
  const isOpen = pr.state === "open";

  const statusLabel = isMerged ? "merged" : isOpen ? "open" : "closed";
  const badgeClass = `oss-pr-badge${isMerged ? " oss-pr-badge-merged" : ""}`;

  const metaParts: string[] = [];
  metaParts.push(`#${pr.number}`);
  if (pr.repo.language) metaParts.push(pr.repo.language);
  metaParts.push(`${formatStars(pr.repo.stargazers_count)} ★`);
  metaParts.push(formatDate(pr.created_at));

  return (
    <div className="oss-pr">
      <div className="oss-pr-main">
        <a
          href={pr.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="oss-pr-title"
        >
          {pr.title}
        </a>
        <span className={badgeClass}>{statusLabel}</span>
      </div>
      <div className="oss-pr-meta">
        <a
          href={pr.repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="oss-pr-repo"
        >
          {pr.repo.full_name}
        </a>
        {metaParts.map((p, i) => (
          <span key={i}>{p}</span>
        ))}
      </div>
    </div>
  );
}
