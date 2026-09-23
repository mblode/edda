interface ProofStat {
  label: string;
  value: string;
}

interface ProofStatsProps {
  stats: readonly ProofStat[];
}

/**
 * Local mirror of `@blode/proof-stats`, with fixed cited figures instead of
 * live fetches. The section that renders it carries the source link.
 */
export const ProofStats = ({ stats }: ProofStatsProps) => (
  <dl className="mx-auto grid max-w-5xl gap-10 text-center md:grid-cols-3 md:gap-12">
    {stats.map((stat) => (
      <div className="flex flex-col-reverse gap-2" key={stat.value}>
        <dt className="mx-auto max-w-72 text-balance text-muted-foreground text-sm">
          {stat.label}
        </dt>
        <dd className="font-semibold text-4xl tabular-nums md:text-5xl">
          {stat.value}
        </dd>
      </div>
    ))}
  </dl>
);
