import { useMemo } from 'react'

// Date helpers: compute month boundaries and format dates as DD-MM-YYYY
function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  return d
}

function endOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return d
}

function formatDDMMYYYY(date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${d}-${m}-${y}`
}

// Build a matrix of weeks → days for the current month, Monday as first day
function getMonthMatrix(current) {
  const start = startOfMonth(current)
  const end = endOfMonth(current)

  const startWeekday = (start.getDay() + 6) % 7 // make Monday=0
  const daysInMonth = end.getDate()

  const cells = []
  for (let i = 0; i < startWeekday; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(current.getFullYear(), current.getMonth(), d))
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

// Calendar grid: shows days, dots for plants on a given day, and toggles selected plant on click
export default function Calendar({ monthDate, plants, selectedPlantId, onToggleDay }) {
  const weeks = useMemo(() => getMonthMatrix(monthDate), [monthDate])
  const todayKey = formatDDMMYYYY(new Date())

  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Background style hint when the selected plant has a mark on this day
  function dayStyle(hasSelected) {
    if (!hasSelected) return 'bg-neutral-950 hover:bg-neutral-900'
    return ''
  }

  return (
    <section className="rounded-lg border border-neutral-700 overflow-hidden">
      <div className="grid grid-cols-7 bg-neutral-900">
        {weekdayLabels.map((w) => (
          <div key={w} className="px-2 sm:px-3 py-2 text-center text-xs sm:text-sm text-neutral-300 border-r border-neutral-800 last:border-r-0">{w}</div>
        ))}
      </div>
      <div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-t border-neutral-800">
            {week.map((date, di) => {
              // Empty cells before/after the month days
              if (!date) {
                return <div key={di} className="h-20 sm:h-24 bg-neutral-950 border-r border-neutral-800 last:border-r-0" />
              }
              const key = formatDDMMYYYY(date)
              const isToday = key === todayKey
              const plantsOnDay = plants.filter((p) => p.datesSet.has(key))
              const selected = plants.find((p) => p.id === selectedPlantId)
              const hasSelected = selected ? selected.datesSet.has(key) : false

              return (
                <button
                  key={di}
                  onClick={() => onToggleDay(key)}
                  className={
                    `calendar-day relative h-20 sm:h-24 w-full text-left px-2 py-2 sm:px-3 sm:py-2.5 border-r last:border-r-0 border-neutral-800 focus:outline-none ${dayStyle(hasSelected)}`
                  }
                  // Subtle highlight using selected plant color when that plant has this day marked
                  style={hasSelected ? { backgroundColor: `${selected.color}20` } : undefined}
                >
                  <div className="flex flex-col h-full">
                    <div className="relative h-auto sm:h-6 pr-0 sm:pr-10">
                      <div className="leading-none relative inline-block align-top">
                        <span
                          className={
                            (isToday
                              ? 'inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white leading-none '
                              : '') +
                            ('text-xs sm:text-sm ' + (isToday ? '' : hasSelected ? 'text-white' : 'text-neutral-300'))
                          }
                        >
                          {date.getDate()}
                        </span>
                      </div>
                    </div>
                    {/* Dot row: reserve height to avoid layout shift; always show at least one dot when there are markings */}
                    <div className="mt-1 sm:mt-3 min-h-[16px] sm:min-h-[20px] w-full">
                      {plantsOnDay.length > 0 && (
                        <>
                          {/* Base: up to 4 dots, then +N */}
                          <div className="flex sm:hidden flex-wrap items-center gap-1 max-w-full overflow-hidden">
                            {plantsOnDay.slice(0, Math.max(1, Math.min(4, plantsOnDay.length))).map((p) => (
                              <span key={p.id} className="inline-block h-2 w-2 rounded-full shrink-0" name={p.name} style={{ backgroundColor: p.color }}></span>
                            ))}
                            {plantsOnDay.length > 4 && (
                              <span className="text-[10px] text-neutral-400">+{plantsOnDay.length - 4}</span>
                            )}
                          </div>
                          {/* ≥ sm: up to 6 dots, then +N */}
                          <div className="hidden sm:flex flex-wrap items-center gap-1 max-w-full overflow-hidden">
                            {plantsOnDay.slice(0, Math.max(1, Math.min(6, plantsOnDay.length))).map((p) => (
                              <span key={p.id} className="inline-block h-2.5 w-2.5 rounded-full shrink-0" name={p.name} style={{ backgroundColor: p.color }}></span>
                            ))}
                            {plantsOnDay.length > 6 && (
                              <span className="text-[10px] text-neutral-400">+{plantsOnDay.length - 6}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
