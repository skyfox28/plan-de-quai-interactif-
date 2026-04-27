import { useWarehouseStore } from '../store/warehouseStore'
import { STATUS, STATUS_META } from '../data/warehouse'

export default function StatsBar() {
  const getStats = useWarehouseStore(s => s.getStats)
  const stats = getStats()

  return (
    <div className="stats-bar">
      <div className="stats-brand">Plan de Quai 3D</div>
      <div className="stats-items">
        <StatItem label="Capacité" value={`${stats.usedPalettes} / ${stats.totalCapacity}`} sub="palettes" />
        <StatItem label="Occupation" value={`${stats.occupancyPct}%`} sub="utilisé" accent={occupancyColor(stats.occupancyPct)} />
        <StatItem label="Libres" value={stats.byStatus[STATUS.FREE]} sub="allées" />
        <StatItem label="Affectées" value={stats.byStatus[STATUS.ASSIGNED]} sub="allées" accent={STATUS_META[STATUS.ASSIGNED].color} />
        <StatItem label="En cours" value={stats.byStatus[STATUS.IN_PROGRESS]} sub="allées" accent={STATUS_META[STATUS.IN_PROGRESS].color} />
        <StatItem label="Complet" value={stats.byStatus[STATUS.FULL]} sub="allées" accent={STATUS_META[STATUS.FULL].color} />
      </div>
    </div>
  )
}

function StatItem({ label, value, sub, accent }) {
  return (
    <div className="stat-item">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={accent ? { color: accent } : undefined}>{value}</span>
      <span className="stat-sub">{sub}</span>
    </div>
  )
}

function occupancyColor(pct) {
  if (pct < 50) return '#22c55e'
  if (pct < 80) return '#f59e0b'
  return '#ef4444'
}
