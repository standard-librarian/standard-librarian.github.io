import type { ReactNode } from "react";

type DemoShellProps = {
  title?: string;
  children: ReactNode;
};

export function DemoShell({ title, children }: DemoShellProps) {
  return (
    <div className="demo-shell">
      <div className="demo-shell-header">
        <span className="demo-title">{title}</span>
        <span className="demo-badge">Interactive</span>
      </div>
      <div className="demo-body">{children}</div>
    </div>
  );
}
