import { useWarehouseStore } from '../store/warehouseStore'
import { STATUS, STATUS_META, QUAI_STATUS_META, QUAI_STATUS } from '../data/warehouse'
import SyncButton from './SyncButton'

export default function StatsBar() {
  const getStats      = useWarehouseStore(s => s.getStats)
  const quais         = useWarehouseStore(s => s.quais)
  useWarehouseStore(s => s.aisles)         // trigger re-render on aisle changes
  useWarehouseStore(s => s.episPositions)  // trigger re-render on épis changes
  const stats = getStats()

  const loading = quais.filter(q => q.status === QUAI_STATUS.LOADING).length
  const waiting = quais.filter(q => q.status === QUAI_STATUS.WAITING).length

  return (
    <div className="stats-bar">
      <div className="stats-brand">Plan de Quai <span className="stats-brand-accent">3D</span></div>
      <SyncButton />
      <div className="stats-divider" />
      <div className="stats-items">
        <StatItem label="Palettes" value={`${stats.usedPalettes}`} sub={`/ ${stats.totalCapacity}`} />
        <StatItem label="Occupation" value={`${stats.occupancyPct}%`} sub="entrepôt" accent={pctColor(stats.occupancyPct)} glow />
        <StatItem label="Allées libres" value={stats.byStatus[STATUS.FREE]} sub="/ 21" />
        <StatItem label="Quais actifs" value={stats.quaiActive} sub="/ 6" accent={stats.quaiActive > 0 ? QUAI_STATUS_META[QUAI_STATUS.LOADING].color : undefined} />
        <StatItem label="En chargement" value={loading} sub="quais" accent={loading > 0 ? QUAI_STATUS_META[QUAI_STATUS.LOADING].color : undefined} />
        <StatItem label="En attente" value={waiting} sub="quais" accent={waiting > 0 ? QUAI_STATUS_META[QUAI_STATUS.WAITING].color : undefined} />
        <StatItem label="Affectées" value={stats.byStatus[STATUS.ASSIGNED]} sub="allées" accent={STATUS_META[STATUS.ASSIGNED].color} />
        <StatItem label="En cours" value={stats.byStatus[STATUS.IN_PROGRESS]} sub="allées" accent={STATUS_META[STATUS.IN_PROGRESS].color} />
      </div>
    </div>
  )
}

function StatItem({ label, value, sub, accent, glow }) {
  return (
    <div className="stat-item">
      <span className="stat-label">{label}</span>
      <span
        className={`stat-value${glow && accent ? ' stat-value--glow' : ''}`}
        style={accent ? { color: accent, '--glow-color': accent } : undefined}
      >
        {value}
      </span>
      <span className="stat-sub">{sub}</span>
    </div>
  )
}

function pctColor(pct) {
  if (pct < 50) return '#22c55e'
  if (pct < 80) return '#f59e0b'
  return '#ef4444'
}
