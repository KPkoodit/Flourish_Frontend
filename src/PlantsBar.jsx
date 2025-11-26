import { useState, useEffect } from 'react'
import ColorPicker from './components/ColorPicker'

// Plants bar: add/edit/delete
export default function PlantsBar({ plants, selectedPlantId, onAdd, onDelete, onRename, onColorChange, onUpdate }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#34d399') // emerald-400
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#34d399')
  const [hasChanges, setHasChanges] = useState(false)

  const selected = plants.find((p) => p.id === selectedPlantId)

  // Sync local state when selected plant changes
  useEffect(() => {
    if (selected) {
      setEditName(selected.name)
      setEditColor(selected.color)
    }
    setHasChanges(false)
  }, [selectedPlantId, selected])

  function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim(), color)
    setName('')
  }

  function handleNameChange(newName) {
    setEditName(newName)
    setHasChanges(true)
  }

  function handleColorChange(newColor) {
    setEditColor(newColor)
    setHasChanges(true)
  }

  function handleUpdate() {
    if (selected) {
      onRename(selected.id, editName)
      onColorChange(selected.id, editColor)
      onUpdate(selected.id, editName, editColor)
      setHasChanges(false)
    }
  }

  return (
    <section className="mb-6 space-y-4">
      <fieldset className="border border-neutral-700 rounded p-2.5 sm:p-3">
        <legend className="px-1 text-sm text-neutral-300">Add plant</legend>
        <form className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap" onSubmit={handleAdd}>
          <label className="w-40 sm:w-64">
            <span className="sr-only">Plant name</span>
            <input
              id="plant_name_field"
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
          <button id="add_plant_button" className="w-24 inline-flex items-center justify-center px-3 py-1 rounded border border-neutral-600 hover:border-neutral-400 text-sm" type="submit">Add</button>
        </form>
      </fieldset>

      {selected && (
        <fieldset className="border border-neutral-700 rounded p-2.5 sm:p-3">
          <legend className="px-1 text-sm text-neutral-300">Selected plant</legend>
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <label className="w-40 sm:w-64">
              <span className="sr-only">Rename plant</span>
              <input
                id="modify_plant_field"
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-100"
                value={editName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </label>
            <label>
              <span className="sr-only">Change plant color</span>
              <ColorPicker color={editColor} onChange={handleColorChange} />
            </label>
            <button 
              id="update_plant_button" 
              className={`w-24 inline-flex items-center justify-center px-3 py-1 rounded border text-sm ${
                hasChanges 
                  ? 'border-emerald-600 hover:border-emerald-400 text-emerald-300' 
                  : 'border-neutral-600 text-neutral-400 cursor-not-allowed'
              }`}
              onClick={handleUpdate}
              disabled={!hasChanges}
            >
              Update
            </button>
            <button id="delete_plant_button" className="w-24 inline-flex items-center justify-center px-3 py-1 rounded border border-red-600 hover:border-red-400 text-sm text-red-300" onClick={() => onDelete(selected.id)}>
              Delete
            </button>
          </div>
        </fieldset>
      )}
    </section>
  )
}
