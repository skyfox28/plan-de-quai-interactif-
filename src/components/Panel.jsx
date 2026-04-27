import { useState, useEffect } from 'react'
import { useWarehouseStore } from '../store/warehouseStore'
import { STATUS, STATUS_META } from '../data/warehouse'

export default function Panel() {
  const selected = useWarehouseStore(s => s.selected)
  const getSelected = useWarehouseStore(s => s.getSelected)
  const updateItem = useWarehouseStore(s => s.updateItem)
  const resetItem = useWarehouseStore(s => s.resetItem)
  const deselect = useWarehouseStore(s => s.deselect)

  const item = getSelected()

  const [form, setForm] = useState(null)

  // Sync form when selection changes
  useEffect(() => {
    if (item) {
      setForm({
        client: item.client || '',
        command: item.command || '',
        status: item.status,
        usedPalettes: item.usedPalettes ?? 0,
        notes: item.notes || '',
      })
    } else {
      setForm(null)
    }
  }, [selected, item?.status, item?.client])

  if (!item || !form) {
    return (
      <div className="panel panel-empty">
        <div className="panel-hint">
          <span className="panel-hint-icon">👆</span>
          <p>Cliquez sur une allée ou un emplacement épis pour l'affecter</p>
        </div>
      </div>
    )
  }

  const isEpis = selected.type === 'epis'

  function handleSave(e) {
    e.preventDefault()
    updateItem(selected.type, selected.id, {
      client: form.client.trim() || null,
      command: form.command.trim() || null,
      status: form.status,
      usedPalettes: Number(form.usedPalettes),
      notes: form.notes.trim(),
    })
  }

  function handleReset() {
    resetItem(selected.type, selected.id)
  }

  const meta = STATUS_META[form.status]

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-dot" style={{ background: meta.color }} />
          <span>{item.name}</span>
          {isEpis && <span className="panel-badge">Épis</span>}
        </div>
        <button className="panel-close" onClick={deselect}>✕</button>
      </div>

      <div className="panel-capacity">
        <div className="capacity-bar-wrap">
          <div
            className="capacity-bar-fill"
            style={{
              width: `${Math.min(100, (form.usedPalettes / item.totalPalettes) * 100)}%`,
              background: meta.color,
            }}
          />
        </div>
        <span className="capacity-label">{form.usedPalettes} / {item.totalPalettes} palettes</span>
      </div>

      <form className="panel-form" onSubmit={handleSave}>
        <label>
          <span>Client</span>
          <input
            type="text"
            value={form.client}
            placeholder="Nom du client…"
            onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
          />
        </label>

        <label>
          <span>Commande / BL</span>
          <input
            type="text"
            value={form.command}
            placeholder="N° commande…"
            onChange={e => setForm(f => ({ ...f, command: e.target.value }))}
          />
        </label>

        <label>
          <span>Statut</span>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          >
            {Object.entries(STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Palettes utilisées</span>
          <input
            type="number"
            min={0}
            max={item.totalPalettes}
            value={form.usedPalettes}
            onChange={e => setForm(f => ({ ...f, usedPalettes: e.target.value }))}
          />
        </label>

        <label>
          <span>Notes</span>
          <textarea
            rows={3}
            value={form.notes}
            placeholder="Informations complémentaires…"
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </label>

        <div className="panel-actions">
          <button type="submit" className="btn-primary">Enregistrer</button>
          <button type="button" className="btn-danger" onClick={handleReset}>Libérer</button>
        </div>
      </form>

      {item.notes && (
        <div className="panel-notes">
          <span>Notes :</span> {item.notes}
        </div>
      )}
    </div>
  )
}
