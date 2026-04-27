import { STATUS_META } from '../data/warehouse'

export default function Legend() {
  return (
    <div className="legend">
      {Object.entries(STATUS_META).map(([key, meta]) => (
        <div key={key} className="legend-item">
          <span className="legend-dot" style={{ background: meta.color }} />
          <span className="legend-label">{meta.label}</span>
        </div>
      ))}
    </div>
  )
}
