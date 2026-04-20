import Image from "next/image";

import { placeholderShimmer } from "@/lib/placeholder";
import { cn } from "@/lib/utils";

interface HeroMediaProps {
  className?: string;
}

const WIDTH = 2400;
const HEIGHT = 1500;

export const HeroMedia = ({ className }: HeroMediaProps) => (
  <div
    className={cn(
      "relative mx-auto w-full max-w-5xl px-4 [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]",
      className
    )}
  >
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-foreground/5 ring-1 ring-border/50">
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/30 px-4 py-3">
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="ml-3 rounded-md bg-background/60 px-2.5 py-1 font-mono text-muted-foreground text-xs">
          acme.blode.md
        </span>
      </div>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-background">
        <Image
          alt="Preview of a Blode.md documentation site"
          blurDataURL={placeholderShimmer(WIDTH, HEIGHT)}
          className="h-full w-full object-cover object-top"
          height={HEIGHT}
          placeholder="blur"
          priority
          sizes="(min-width: 1280px) 1200px, 100vw"
          src="/hero-docs.png"
          width={WIDTH}
        />
      </div>
    </div>
  </div>
);
