import type { ReactNode } from "react";

interface StepsProps {
  children: ReactNode;
}

export const Steps = ({ children }: StepsProps) => (
  <div className="steps">{children}</div>
);
