import type { ReactNode } from "react";

type SplitProps = {
  left: ReactNode;
  right: ReactNode;
};

export function Split({ left, right }: SplitProps) {
  return (
    <div className="split">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
