import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { getPlants, createPlant, updatePlant, deletePlant } from './api/plantService'
import Calendar from './Calendar'
import Legend from './Legend'
import PlantsBar from './PlantsBar'
import Header from './Header'

function App() {
  const [current, setCurrent] = useState(new Date())

  // Plants loaded from backend
  // Shape: [{ id, name, color, dates: string[] }]
  const [plants, setPlants] = useState([])

  // Load plants from backend
  useEffect(() => {
    (async () => {
      try {
        const plants = await getPlants()
        if (Array.isArray(plants)) {
          setPlants(plants)
        }
      } catch (error) {
        console.error('Failed to load plants from backend:', error)
      }
    })()
  }, [])

  // Remember which plant is selected
  const [selectedPlantId, setSelectedPlantId] = useState(null)

  // Derived state: add Set for quick per-day lookups when rendering calendar
  const plantsWithSets = useMemo(() => {
    return plants.map((p) => ({ ...p, datesSet: new Set(p.dates) }))
  }, [plants])

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
      const updatedPlant = { ...p, dates: nextDates }
      updatePlant(updatedPlant.id, updatedPlant).catch((e) => console.error('Failed to update plant', e))
      return updatedPlant
    }))
  }

  // Plant management actions
  function handleAddPlant(name, color) {
    const newPlant = { id: cryptoRandomId(), name, color, dates: [] }
    setPlants((prev) => [...prev, newPlant])
    setSelectedPlantId(newPlant.id)
    createPlant(newPlant).catch((e) => console.error('Failed to create plant', e))
  }

  function handleSelectPlant(id) {
    setSelectedPlantId(prev => (prev === id ? null : id))
  }

  function handleDeletePlant(id) {
    setPlants((prev) => prev.filter((p) => p.id !== id))
    setSelectedPlantId((curr) => (curr === id ? null : curr))
    deletePlant(id).catch((e) => console.error('Failed to delete plant', e))
  }

  function handleRenamePlant(id, name) {
    setPlants((prev) => prev.map((p) => {
      if (p.id !== id) return p
      return { ...p, name }
    }))
  }

  function handleUpdatePlant(id, name, color) {
    const plant = plants.find((p) => p.id === id)
    if (plant) {
      const updatedPlant = { ...plant, name, color }
      updatePlant(id, updatedPlant).catch((e) => console.error('Failed to update plant', e))
    }
  }

  function handleColorChange(id, color) {
    setPlants((prev) => prev.map((p) => {
      if (p.id !== id) return p
      return { ...p, color }
    }))
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
          onUpdate={handleUpdatePlant}
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
