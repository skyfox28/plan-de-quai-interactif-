import { useState, useEffect } from 'react'
import { useWarehouseStore } from '../store/warehouseStore'
import { STATUS, STATUS_META, QUAI_STATUS, QUAI_STATUS_META, QUAI_DEFS } from '../data/warehouse'

/* ── Aisle / Épis panel ─────────────────────────── */
function SlotPanel({ item, selected, updateItem, resetItem, deselect }) {
  const tfDeliveries = useWarehouseStore(s => s.tfDeliveries)
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (item) {
      setForm({
        deliveryId:   item.deliveryId   || '',
        client:       item.client       || '',
        command:      item.command      || '',
        status:       item.status,
        usedPalettes: item.usedPalettes ?? 0,
        notes:        item.notes        || '',
      })
    }
  }, [selected?.id, selected?.type])

  if (!item || !form) return null
  const meta   = STATUS_META[form.status]
  const isEpis = selected.type === 'epis'

  function handleDeliverySelect(id) {
    if (!id) {
      setForm(f => ({ ...f, deliveryId: '', client: '', command: '' }))
      return
    }
    const d = tfDeliveries.find(d => d.id === id)
    if (d) {
      setForm(f => ({ ...f, deliveryId: id, client: d.dest, command: d.id, usedPalettes: d.palSilo || 0 }))
    }
  }

  function handleSave(e) {
    e.preventDefault()
    updateItem(selected.type, selected.id, {
      deliveryId:   form.deliveryId   || null,
      client:       form.client.trim()  || null,
      command:      form.command.trim() || null,
      status:       form.status,
      usedPalettes: Number(form.usedPalettes),
      notes:        form.notes.trim(),
    })
  }

  return (
    <>
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-dot" style={{ background: meta.color }} />
          <span>{item.name}</span>
          {isEpis && <span className="panel-badge">Épis</span>}
          {item.quaiId && <span className="panel-badge panel-badge-quai">Q{item.quaiId}</span>}
        </div>
        <button className="panel-close" onClick={deselect}>✕</button>
      </div>

      <div className="panel-capacity">
        <div className="capacity-bar-wrap">
          <div className="capacity-bar-fill" style={{
            width: `${Math.min(100, (form.usedPalettes / item.totalPalettes) * 100)}%`,
            background: meta.color,
          }} />
        </div>
        <span className="capacity-label">{form.usedPalettes} / {item.totalPalettes} palettes</span>
      </div>

      <form className="panel-form" onSubmit={handleSave}>

        {/* Delivery picker — only shown when TruckFlow is synced */}
        {tfDeliveries.length > 0 && (
          <label>
            <span>Livraison TruckFlow</span>
            <select value={form.deliveryId} onChange={e => handleDeliverySelect(e.target.value)}>
              <option value="">— Sélectionner une livraison —</option>
              {tfDeliveries.map(d => (
                <option key={d.id} value={d.id}>
                  {d.id} · {d.dest}{d.ville ? ` (${d.ville})` : ''} — {d.transporteur}
                </option>
              ))}
            </select>
          </label>
        )}

        <label><span>Client / Destination</span>
          <input type="text" value={form.client} placeholder="Nom du client…"
            onChange={e => setForm(f => ({ ...f, client: e.target.value, deliveryId: '' }))} />
        </label>
        <label><span>N° livraison / BL</span>
          <input type="text" value={form.command} placeholder="N° livraison…"
            onChange={e => setForm(f => ({ ...f, command: e.target.value, deliveryId: '' }))} />
        </label>
        <label><span>Statut</span>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </label>
        <label><span>Palettes placées ici</span>
          <input type="number" min={0} max={item.totalPalettes} value={form.usedPalettes}
            onChange={e => setForm(f => ({ ...f, usedPalettes: e.target.value }))} />
        </label>
        <label><span>Notes</span>
          <textarea rows={3} value={form.notes} placeholder="Informations complémentaires…"
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </label>
        <div className="panel-actions">
          <button type="submit" className="btn-primary">Enregistrer</button>
          <button type="button" className="btn-danger" onClick={() => resetItem(selected.type, selected.id)}>Libérer</button>
        </div>
      </form>

      {item.notes && (
        <div className="panel-notes"><span>Notes :</span> {item.notes}</div>
      )}
    </>
  )
}

/* ── Quai panel ─────────────────────────────────── */
function QuaiPanel({ item, selected, assignQuai, clearQuai, deselect }) {
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (item) {
      setForm({
        truck:         item.truck || '',
        status:        item.status,
        arrivalTime:   item.arrivalTime || '',
        departureTime: item.departureTime || '',
        notes:         item.notes || '',
      })
    }
  }, [selected?.id])

  if (!item || !form) return null

  const def  = QUAI_DEFS.find(q => q.id === item.id)
  const meta = QUAI_STATUS_META[form.status]

  function handleSave(e) {
    e.preventDefault()
    assignQuai(selected.id, {
      truck:         form.truck.trim(),
      status:        form.status,
      arrivalTime:   form.arrivalTime,
      departureTime: form.departureTime,
      notes:         form.notes.trim(),
    })
  }

  return (
    <>
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-dot" style={{ background: meta.color }} />
          <span>{item.label} — Quai de chargement</span>
        </div>
        <button className="panel-close" onClick={deselect}>✕</button>
      </div>

      {/* Aisles served */}
      <div className="quai-zones">
        <span className="quai-zones-label">Allées desservies</span>
        <div className="quai-zones-list">
          {def?.aisleIds.map(id => (
            <span key={id} className="quai-zone-chip">A{id}</span>
          ))}
          {def?.episIds?.length > 0 && (
            <span className="quai-zone-chip quai-zone-epis">
              Épis ({def.episIds.length})
            </span>
          )}
        </div>
      </div>

      <form className="panel-form" onSubmit={handleSave}>
        <label><span>Camion / Transporteur</span>
          <input type="text" value={form.truck} placeholder="Nom du transporteur…"
            onChange={e => setForm(f => ({ ...f, truck: e.target.value }))} />
        </label>
        <label><span>Statut quai</span>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {Object.entries(QUAI_STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label><span>Heure d'arrivée</span>
            <input type="time" value={form.arrivalTime}
              onChange={e => setForm(f => ({ ...f, arrivalTime: e.target.value }))} />
          </label>
          <label><span>Heure de départ</span>
            <input type="time" value={form.departureTime}
              onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))} />
          </label>
        </div>
        <label><span>Notes</span>
          <textarea rows={2} value={form.notes} placeholder="Informations complémentaires…"
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </label>
        <div className="panel-actions">
          <button type="submit" className="btn-primary">Affecter</button>
          <button type="button" className="btn-danger" onClick={() => clearQuai(selected.id)}>Libérer quai</button>
        </div>
      </form>

      <div className="quai-propagation-note">
        ℹ️ L'affectation se propage automatiquement aux allées desservies.
      </div>
    </>
  )
}

/* ── Main Panel ─────────────────────────────────── */
export default function Panel() {
  const selected     = useWarehouseStore(s => s.selected)
  const getSelected  = useWarehouseStore(s => s.getSelected)
  const updateItem   = useWarehouseStore(s => s.updateItem)
  const resetItem    = useWarehouseStore(s => s.resetItem)
  const assignQuai   = useWarehouseStore(s => s.assignQuai)
  const clearQuai    = useWarehouseStore(s => s.clearQuai)
  const deselect     = useWarehouseStore(s => s.deselect)

  const item = getSelected()

  if (!selected || !item) {
    return (
      <div className="panel panel-empty">
        <div className="panel-hint">
          <span className="panel-hint-icon">👆</span>
          <p>Cliquez sur un quai pour l'affecter à un camion,<br />ou sur une allée pour l'éditer.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      {selected.type === 'quai' ? (
        <QuaiPanel item={item} selected={selected} assignQuai={assignQuai} clearQuai={clearQuai} deselect={deselect} />
      ) : (
        <SlotPanel item={item} selected={selected} updateItem={updateItem} resetItem={resetItem} deselect={deselect} />
      )}
    </div>
  )
}
