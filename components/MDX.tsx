import type { ComponentPropsWithoutRef } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { Split } from "@/components/Split";
import { CodeSnippet } from "@/components/CodeSnippet";
import { DynamicComponent } from "@/components/DynamicComponent";
import { MdhtPortrait } from "@/components/MdhtPortrait";
import { MdhtHero } from "@/components/MdhtHero";
import {
  ClientStoryFigmaScene,
  ClientStoryImplementationScene,
  ClientStoryIssuesScene,
  ClientStoryIterationScene,
  ClientStoryLaunchScene,
  ClientStoryMeetingScene,
  ClientStoryNotesScene,
  ClientStoryRequirementsScene,
  ClientStoryReviewScene,
  ClientStoryStoriesScene,
  ClientStoryTestingScene,
} from "@/components/ClientStoryScenes";

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => <h1 className="mdx-h1" {...props} />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => <h2 className="mdx-h2" {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <h3 className="mdx-h3" {...props} />,
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="mdx-p" {...props} />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => <ul className="mdx-ul" {...props} />,
  ol: (props: ComponentPropsWithoutRef<"ol">) => <ol className="mdx-ol" {...props} />,
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="mdx-li" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => <blockquote className="mdx-quote" {...props} />,
  a: (props: ComponentPropsWithoutRef<"a">) => <a className="mdx-link" {...props} />,
  code: (props: ComponentPropsWithoutRef<"code">) => <code className="mdx-code" {...props} />,
  pre: (props: ComponentPropsWithoutRef<"pre">) => <CodeBlock {...props} />,
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr className="mdx-hr" {...props} />,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mdx-table-wrap">
      <table className="mdx-table" {...props} />
    </div>
  ),
  Split,
  CodeSnippet,
  DynamicComponent,
  MdhtPortrait,
  MdhtHero,
  ClientStoryMeetingScene,
  ClientStoryNotesScene,
  ClientStoryRequirementsScene,
  ClientStoryStoriesScene,
  ClientStoryFigmaScene,
  ClientStoryReviewScene,
  ClientStoryIterationScene,
  ClientStoryImplementationScene,
  ClientStoryTestingScene,
  ClientStoryIssuesScene,
  ClientStoryLaunchScene,
};
