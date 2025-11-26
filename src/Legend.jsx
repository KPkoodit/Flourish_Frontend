// Legend: selectable chips; highlights the active plant
export default function Legend({ plants, selectedPlantId, onSelect }) {
  if (!plants.length) return null
  return (
    <nav className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-sm text-neutral-300 mb-3">
      <ul className="flex items-center flex-wrap gap-1.5 sm:gap-2 m-0 p-0 list-none">
        {plants.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => onSelect(p.id)}
              className={`px-2 py-1 sm:px-3 rounded border border-transparent whitespace-nowrap transition-colors duration-150 ${selectedPlantId === p.id && selectedPlantId !== null ? 'ring-1 ring-white' : 'ring-0'}`}
              name={p.name}
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
