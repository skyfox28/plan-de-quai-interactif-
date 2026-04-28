import { useState, useEffect, useRef } from 'react'
import { useWarehouseStore } from '../store/warehouseStore'
import { TruckFlowSync } from '../services/truckflowSync'

export default function SyncButton() {
  const [connected, setConnected] = useState(false)
  const [lastSync, setLastSync]   = useState(null)
  const [error, setError]         = useState(null)
  const [loading, setLoading]     = useState(false)
  const syncRef = useRef(null)

  const assignQuai = useWarehouseStore(s => s.assignQuai)
  const clearQuai  = useWarehouseStore(s => s.clearQuai)

  useEffect(() => {
    syncRef.current = new TruckFlowSync(
      // onUpdate: apply assignments from TruckFlow
      (assignments) => {
        setError(null)
        setLastSync(new Date())

        // Track which quais TruckFlow knows about
        const tfQuaiIds = new Set(assignments.map(a => a.quaiId))

        assignments.forEach(a => {
          assignQuai(a.quaiId, {
            truck:         a.truck,
            status:        a.status,
            arrivalTime:   a.arrivalTime,
            departureTime: a.departureTime,
            notes:         a.creneau ? `Créneau : ${a.creneau}` : '',
          })
        })

        // Clear quais that TruckFlow no longer has a truck assigned to
        ;[4, 5, 6, 7, 8, 9].forEach(qid => {
          if (!tfQuaiIds.has(qid)) clearQuai(qid)
        })
      },
      // onError
      (msg) => setError(msg),
    )
    return () => syncRef.current?.disconnect()
  }, [])

  async function handleConnect() {
    setLoading(true)
    setError(null)
    const ok = await syncRef.current.connect()
    setConnected(ok)
    setLoading(false)
  }

  function handleDisconnect() {
    syncRef.current.disconnect()
    setConnected(false)
    setLastSync(null)
    setError(null)
  }

  const timeStr = lastSync
    ? lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  if (connected) {
    return (
      <div className="sync-badge sync-badge--on">
        <span className="sync-dot" />
        <span className="sync-label">TruckFlow</span>
        {timeStr && <span className="sync-time">{timeStr}</span>}
        <button className="sync-disc" onClick={handleDisconnect} title="Déconnecter">✕</button>
      </div>
    )
  }

  return (
    <div className="sync-wrap">
      <button
        className="sync-connect-btn"
        onClick={handleConnect}
        disabled={loading}
        title="Connecter au fichier sync TruckFlow"
      >
        {loading ? '…' : '📡'} TruckFlow
      </button>
      {error && <span className="sync-error" title={error}>⚠</span>}
    </div>
  )
}
