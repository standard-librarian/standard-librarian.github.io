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

function getPRStatus(pr: OSSPR): { label: string; color: string } {
  if (pr.merged_at) return { label: "merged", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" };
  if (pr.state === "closed") return { label: "closed", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" };
  return { label: "open", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" };
}

function PRIcon({ merged, closed }: { merged: boolean; closed: boolean }) {
  if (merged) {
    return (
      <svg className="w-4 h-4 text-purple-500" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z" />
      </svg>
    );
  }
  if (closed) {
    return (
      <svg className="w-4 h-4 text-red-500" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.251 2.251 0 0 1 3.25 1Zm9.5 14a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5ZM2.5 3.25a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0ZM3.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9.5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-green-500" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
    </svg>
  );
}

export default function PRTimelineItem({
  pr,
  isLast,
}: {
  pr: OSSPR;
  isLast: boolean;
}) {
  const status = getPRStatus(pr);
  const isMerged = !!pr.merged_at;
  const isClosed = pr.state === "closed" && !pr.merged_at;

  return (
    <div className="flex gap-3">
      {/* Timeline line + icon */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0 z-10">
          <PRIcon merged={isMerged} closed={isClosed} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <a
            href={pr.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline leading-snug"
          >
            {pr.title}
          </a>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${status.color}`}
          >
            {status.label}
          </span>
        </div>

        {/* Repo + meta */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <a
            href={pr.repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
            {pr.repo.full_name}
          </a>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
            </svg>
            {formatStars(pr.repo.stargazers_count)}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            #{pr.number} · {formatDate(pr.created_at)}
          </span>
          {pr.repo.language && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {pr.repo.language}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
