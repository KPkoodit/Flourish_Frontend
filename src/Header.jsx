// Top header with app title and month navigation controls
export default function Header({ monthDate, onPrev, onNext, onToday }) {
  const month = monthDate.toLocaleString(undefined, { month: 'long' })
  const year = monthDate.getFullYear()
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div className="text-2xl font-semibold">Flourish</div>
      <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mt-2 sm:mt-0">
        <button className="px-3 py-1 rounded border border-neutral-600 hover:border-emerald-600" onClick={onPrev}>&larr;</button>
        <div className="min-w-0 sm:min-w-40 text-center font-medium truncate">{month} {year}</div>
        <button className="px-3 py-1 rounded border border-neutral-600 hover:border-emerald-600" onClick={onNext}>&rarr;</button>
        <button className="px-3 py-1 rounded border border-neutral-600 hover:border-emerald-600" onClick={onToday}>Today</button>
      </div>
    </header>
  )
}
