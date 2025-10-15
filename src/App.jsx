import { useEffect, useMemo, useState } from 'react'
import './App.css'
import ColorPicker from './components/ColorPicker'

// Date helpers: compute month boundaries and format dates as YYYY-MM-DD
function startOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  return d
}

function endOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return d
}

function formatYYYYMMDD(date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
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

// Top header with app title and month navigation controls
function Header({ monthDate, onPrev, onNext, onToday }) {
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

// Legend: selectable chips; highlights the active plant
function Legend({ plants, selectedPlantId, onSelect }) {
  if (!plants.length) return null
  return (
    <nav className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-sm text-neutral-300 mb-3" aria-label="Plants">
      <ul className="flex items-center flex-wrap gap-1.5 sm:gap-2 m-0 p-0 list-none">
        {plants.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => onSelect(p.id)}
              className={`px-2 py-1 sm:px-3 rounded border border-transparent whitespace-nowrap transition-colors duration-150 ${selectedPlantId === p.id && selectedPlantId !== null ? 'ring-1 ring-white' : 'ring-0'}`}
              title={p.name}
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full mr-2 align-middle" style={{ backgroundColor: p.color }}></span>
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Calendar grid: shows days, dots for plants on a given day, and toggles selected plant on click
function Calendar({ monthDate, plants, selectedPlantId, onToggleDay }) {
  const weeks = useMemo(() => getMonthMatrix(monthDate), [monthDate])
  const todayKey = formatYYYYMMDD(new Date())

  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Background style hint when the selected plant has a mark on this day
  function dayStyle(hasSelected) {
    if (!hasSelected) return 'bg-neutral-950 hover:bg-neutral-900'
    return ''
  }

  return (
    <section className="rounded-lg border border-neutral-700 overflow-hidden" aria-label="Calendar">
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
              const key = formatYYYYMMDD(date)
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
                              <span key={p.id} className="inline-block h-2 w-2 rounded-full shrink-0" title={p.name} style={{ backgroundColor: p.color }}></span>
                            ))}
                            {plantsOnDay.length > 4 && (
                              <span className="text-[10px] text-neutral-400">+{plantsOnDay.length - 4}</span>
                            )}
                          </div>
                          {/* ≥ sm: up to 6 dots, then +N */}
                          <div className="hidden sm:flex flex-wrap items-center gap-1 max-w-full overflow-hidden">
                            {plantsOnDay.slice(0, Math.max(1, Math.min(6, plantsOnDay.length))).map((p) => (
                              <span key={p.id} className="inline-block h-2.5 w-2.5 rounded-full shrink-0" title={p.name} style={{ backgroundColor: p.color }}></span>
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

// Plants bar: add/edit/delete
function PlantsBar({ plants, selectedPlantId, onAdd, onDelete, onRename, onColorChange }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#34d399') // emerald-400

  function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim(), color)
    setName('')
  }

  const selected = plants.find((p) => p.id === selectedPlantId)

  return (
    <section className="mb-6 space-y-4">
      <fieldset className="border border-neutral-700 rounded p-2.5 sm:p-3">
        <legend className="px-1 text-sm text-neutral-300">Add plant</legend>
        <form className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap" onSubmit={handleAdd}>
          <label className="w-40 sm:w-64">
            <span className="sr-only">Plant name</span>
            <input
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-100 placeholder-neutral-400"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Color</span>
            <ColorPicker color={color} onChange={setColor} />
          </label>
          <button className="w-24 inline-flex items-center justify-center px-3 py-1 rounded border border-neutral-600 hover:border-neutral-400 text-sm" type="submit">Add</button>
        </form>
      </fieldset>

      {selected && (
        <fieldset className="border border-neutral-700 rounded p-2.5 sm:p-3">
          <legend className="px-1 text-sm text-neutral-300">Selected plant</legend>
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <label className="w-40 sm:w-64">
              <span className="sr-only">Rename plant</span>
              <input
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-100"
                value={selected.name}
                onChange={(e) => onRename(selected.id, e.target.value)}
                aria-label="Rename plant"
              />
            </label>
            <label>
              <span className="sr-only">Change plant color</span>
              <ColorPicker color={selected.color} onChange={(color) => onColorChange(selected.id, color)} />
            </label>
            <button className="w-24 inline-flex items-center justify-center px-3 py-1 rounded border border-red-600 hover:border-red-400 text-sm text-red-300" onClick={() => onDelete(selected.id)}>
              Delete
            </button>
          </div>
        </fieldset>
      )}
    </section>
  )
}

// App: top-level state, persistence, and handlers
function App() {
  const [current, setCurrent] = useState(new Date())

  // Plants are stored in localStorage; initialize from storage (or empty)
  // Shape: [{ id, name, color, dates: string[] }]
  const [plants, setPlants] = useState(() => {
    try {
      const raw = localStorage.getItem('flourish_plants')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed
      }
      return []
    } catch {
      return []
    }
  })

  // Remember which plant is selected across reloads
  const [selectedPlantId, setSelectedPlantId] = useState(() => {
    try {
      const raw = localStorage.getItem('flourish_selectedPlantId')
      if (raw) return raw
      return null
    } catch {
      return null
    }
  })

  // Derived state: add Set for quick per-day lookups when rendering calendar
  const plantsWithSets = useMemo(() => {
    return plants.map((p) => ({ ...p, datesSet: new Set(p.dates) }))
  }, [plants])

  // Persist changes to localStorage
  useEffect(() => {
    localStorage.setItem('flourish_plants', JSON.stringify(plants))
  }, [plants])
  useEffect(() => {
    if (selectedPlantId !== null) {
      localStorage.setItem('flourish_selectedPlantId', selectedPlantId)
    }
  }, [selectedPlantId])

  // Month navigation
  function goPrev() {
    setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function goNext() {
    setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }
  function goToday() {
    const now = new Date()
    setCurrent(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  // Toggle the selected plant's fertilization mark for a day
  function handleToggleDay(key) {
    if (!selectedPlantId) return
    setPlants((prev) => prev.map((p) => {
      if (p.id !== selectedPlantId) return p
      const has = p.dates.includes(key)
      const nextDates = has ? p.dates.filter((d) => d !== key) : [...p.dates, key]
      return { ...p, dates: nextDates }
    }))
  }

  // Plant management actions
  function handleAddPlant(name, color) {
    const newPlant = { id: cryptoRandomId(), name, color, dates: [] }
    setPlants((prev) => [...prev, newPlant])
    setSelectedPlantId(newPlant.id)
  }

  function handleSelectPlant(id) {
    setSelectedPlantId(prev => (prev === id ? null : id))
  }

  function handleDeletePlant(id) {
    setPlants((prev) => prev.filter((p) => p.id !== id))
    setSelectedPlantId((curr) => (curr === id ? null : curr))
  }

  function handleRenamePlant(id, name) {
    setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  function handleColorChange(id, color) {
    setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, color } : p)))
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-6 overflow-x-hidden">
      <main className="max-w-3xl xl:max-w-4xl mx-auto">
        <Header monthDate={current} onPrev={goPrev} onNext={goNext} onToday={goToday} />
        <PlantsBar
          plants={plantsWithSets}
          selectedPlantId={selectedPlantId}
          onAdd={handleAddPlant}
          onDelete={handleDeletePlant}
          onRename={handleRenamePlant}
          onColorChange={handleColorChange}
        />
        <Legend plants={plantsWithSets} selectedPlantId={selectedPlantId} onSelect={handleSelectPlant} />
        <Calendar
          monthDate={current}
          plants={plantsWithSets}
          selectedPlantId={selectedPlantId}
          onToggleDay={handleToggleDay}
        />
      </main>
    </div>
  )
}

// Simple random id helper for plants
function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(2)
    crypto.getRandomValues(buf)
    return `${buf[0].toString(36)}${buf[1].toString(36)}`
  }
  return Math.random().toString(36).slice(2)
}

export default App
