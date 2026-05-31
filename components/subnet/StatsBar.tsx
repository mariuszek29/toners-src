interface StatsBarProps {
  stats: {
    total: number
    categories: number
    amasCompleted: number
    lastAdded: string
  }
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-bg-border rounded-lg overflow-hidden mb-8">
      {[
        { label: 'Subnets Indexed', value: stats.total },
        { label: 'AMAs Completed', value: stats.amasCompleted },
        { label: 'Categories', value: stats.categories },
        { label: 'Last Added', value: stats.lastAdded },
      ].map(({ label, value }) => (
        <div key={label} className="bg-bg-surface px-5 py-4">
          <div className="section-label mb-1">{label}</div>
          <div className="font-mono text-xl text-text-primary font-bold">{value}</div>
        </div>
      ))}
    </div>
  )
}
