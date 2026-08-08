import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
}

export const Panel = ({ children }: PanelProps) => (
  <aside
    data-typeset-block=""
    className="rounded-xl border border-border bg-card p-4"
  >
    {children}
  </aside>
);
