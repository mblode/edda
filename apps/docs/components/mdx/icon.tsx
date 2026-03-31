import { DocIcon } from "@/components/icons/doc-icon";

interface IconProps {
  icon: string;
  color?: string;
  size?: number;
  className?: string;
}

export const Icon = ({ icon, color, size = 16, className }: IconProps) => (
  <DocIcon className={className} color={color} icon={icon} size={size} />
);
