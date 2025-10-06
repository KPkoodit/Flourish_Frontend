import { useEffect, useMemo, useState } from 'react'
import './App.css'

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
    <div className="flex items-center justify-between mb-4">
      <div className="text-2xl font-semibold">Flourish</div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 rounded border border-neutral-600 hover:border-neutral-400" onClick={onPrev}>&larr;</button>
        <div className="min-w-40 text-center font-medium">{month} {year}</div>
        <button className="px-3 py-1 rounded border border-neutral-600 hover:border-neutral-400" onClick={onNext}>&rarr;</button>
        <button className="ml-2 px-3 py-1 rounded border border-neutral-600 hover:border-neutral-400" onClick={onToday}>Today</button>
      </div>
    </div>
  )
}

// Legend: shows color → plant mapping
function Legend({ plants }) {
  if (!plants.length) return null
  return (
    <div className="flex items-center flex-wrap gap-4 text-sm text-neutral-300 mb-3">
      {plants.map((p) => (
        <div key={p.id} className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: p.color }}></span>
          <span>{p.name}</span>
        </div>
      ))}
    </div>
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
    <div className="rounded-lg border border-neutral-700 overflow-hidden">
      <div className="grid grid-cols-7 bg-neutral-900">
        {weekdayLabels.map((w) => (
          <div key={w} className="px-3 py-2 text-center text-neutral-300 text-sm border-r border-neutral-800 last:border-r-0">{w}</div>
        ))}
      </div>
      <div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-t border-neutral-800">
            {week.map((date, di) => {
              // Empty cells before/after the month days
              if (!date) {
                return <div key={di} className="h-24 bg-neutral-950 border-r border-neutral-800 last:border-r-0" />
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
                    `h-24 w-full text-left p-2 border-r last:border-r-0 border-neutral-800 focus:outline-none ${dayStyle(hasSelected)}`
                  }
                  // Subtle highlight using selected plant color when that plant has this day marked
                  style={hasSelected ? { backgroundColor: `${selected.color}20` } : undefined}
                >
                  <div className="flex items-start justify-between">
                    <span className={'text-sm ' + (hasSelected ? 'text-white' : 'text-neutral-300')}>
                      {date.getDate()}
                    </span>
                    {isToday && <span className="text-[10px] px-1 py-0.5 rounded bg-neutral-700 text-neutral-200">Today</span>}
                  </div>
                  {plantsOnDay.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      {/* Up to 5 color dots to indicate plants with entries on this day */}
                      {plantsOnDay.slice(0, 5).map((p) => (
                        <span key={p.id} className="inline-block h-2.5 w-2.5 rounded-full" title={p.name} style={{ backgroundColor: p.color }}></span>
                      ))}
                      {plantsOnDay.length > 5 && (
                        <span className="text-[10px] text-neutral-400">+{plantsOnDay.length - 5}</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// Plants bar: manage plants (add/select/rename/recolor/delete)
function PlantsBar({ plants, selectedPlantId, onSelect, onAdd, onDelete, onRename, onColorChange }) {
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
    <div className="mb-4 grid gap-3 md:grid-cols-2">
      <div className="flex items-center gap-2 overflow-x-auto">
        {plants.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`px-3 py-1 rounded border text-sm whitespace-nowrap ${selectedPlantId === p.id ? 'border-white' : 'border-neutral-600 hover:border-neutral-400'}`}
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full mr-2 align-middle" style={{ backgroundColor: p.color }}></span>
            {p.name}
          </button>
        ))}
      </div>
      <form className="flex items-center gap-2" onSubmit={handleAdd}>
        <input
          className="flex-1 min-w-0 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-100 placeholder-neutral-400"
          placeholder="Add plant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="color"
          className="h-8 w-10 p-0 bg-transparent border border-neutral-700 rounded"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label="Pick plant color"
        />
        <button className="px-3 py-1 rounded border border-neutral-600 hover:border-neutral-400 text-sm" type="submit">Add</button>
      </form>
      {selected && (
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-100"
            value={selected.name}
            onChange={(e) => onRename(selected.id, e.target.value)}
            aria-label="Rename plant"
          />
          <input
            type="color"
            className="h-8 w-10 p-0 bg-transparent border border-neutral-700 rounded"
            value={selected.color}
            onChange={(e) => onColorChange(selected.id, e.target.value)}
            aria-label="Change plant color"
          />
          <button className="ml-auto px-3 py-1 rounded border border-red-600 hover:border-red-400 text-sm text-red-300" onClick={() => onDelete(selected.id)}>
            Delete
          </button>
        </div>
      )}
    </div>
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
    setSelectedPlantId(id)
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Header monthDate={current} onPrev={goPrev} onNext={goNext} onToday={goToday} />
        <PlantsBar
          plants={plantsWithSets}
          selectedPlantId={selectedPlantId}
          onSelect={handleSelectPlant}
          onAdd={handleAddPlant}
          onDelete={handleDeletePlant}
          onRename={handleRenamePlant}
          onColorChange={handleColorChange}
        />
        <Legend plants={plantsWithSets} />
        <Calendar
          monthDate={current}
          plants={plantsWithSets}
          selectedPlantId={selectedPlantId}
          onToggleDay={handleToggleDay}
        />
      </div>
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
