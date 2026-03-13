import type { Post } from "@/lib/posts";
import { buildCopyText, buildSummaryText } from "@/lib/copy";
import { CopyButton } from "@/components/CopyButton";

type PostPromptProps = {
  post: Post;
};

export function PostPrompt({ post }: PostPromptProps) {
  const tokenEstimate = Math.round(post.content.length / 4 / 100) * 100;

  const readPrompt = `Read this post carefully. Explain the core ideas and ask 3 follow-up questions.`;
  const readText = buildCopyText(post, readPrompt);
  const summaryText = buildSummaryText(post);

  return (
    <div className="prompt-banner">
      <span className="prompt-banner-label">~{tokenEstimate.toLocaleString()} tokens</span>
      <div className="prompt-banner-actions">
        <CopyButton text={readText} label="Read with AI" />
        <CopyButton text={summaryText} label="Summarize" />
      </div>
    </div>
  );
}
