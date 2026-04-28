import { QUAI_STATUS } from '../data/warehouse'

const POLL_INTERVAL_MS = 30_000

/**
 * Derive a QUAI_STATUS from a TruckFlow timestamp object.
 * TruckFlow timestamp lifecycle: arr → quai → chg → fin → dep
 */
export function deriveStatus(ts) {
  if (!ts) return QUAI_STATUS.WAITING        // planned, not yet arrived
  if (ts.dep) return QUAI_STATUS.DEPARTED
  if (ts.fin) return QUAI_STATUS.DONE
  if (ts.chg || ts.quai) return QUAI_STATUS.LOADING
  if (ts.arr) return QUAI_STATUS.WAITING     // arrived, not yet loading
  return QUAI_STATUS.WAITING
}

/** Format ISO timestamp to "HH:MM" local time string */
function toHHMM(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Parse a TruckFlow session JSON and return quai assignments + full delivery list.
 *
 * @param {object} session  - parsed TruckFlow session JSON
 * @param {string} forDate  - ISO date string "YYYY-MM-DD" (default: today)
 * @returns {{ assignments: Array, deliveries: Array }}
 */
export function parseTruckFlowSession(session, forDate) {
  const today = forDate || new Date().toISOString().slice(0, 10)
  const quaiMap   = session.quai || {}        // { "6": "truckId", ... }
  const trucks    = session.trucks || []
  const tsMap     = session.timestamps || {}

  // Build a lookup map from delivery id → delivery object
  const deliveryMap = {}
  for (const d of (session.deliveries || [])) {
    deliveryMap[d.id] = d
  }

  // Build a lookup: truckId → quaiId (Q4-Q9 only)
  const truckToQuai = {}
  for (const [quaiStr, truckId] of Object.entries(quaiMap)) {
    const qn = parseInt(quaiStr, 10)
    if (qn >= 4 && qn <= 9) truckToQuai[truckId] = qn
  }

  const assignments = []
  const deliveries  = []

  for (const truck of trucks) {
    const truckDate = truck.date || ''
    if (truckDate !== today) continue

    const quaiId = truckToQuai[truck.id] ?? null
    const ts     = tsMap[truck.id] || null

    // Quai assignment (only for trucks physically on Q4-Q9)
    if (quaiId !== null) {
      assignments.push({
        quaiId,
        truck:         truck.transporteur || truck.itin || '?',
        creneau:       truck.creneau || '',
        status:        deriveStatus(ts),
        arrivalTime:   toHHMM(ts?.arr),
        departureTime: toHHMM(ts?.dep),
        notes:         truck.notes || '',
      })
    }

    // Enrich every delivery belonging to today's trucks
    for (const delivId of (truck.deliveries || [])) {
      const d = deliveryMap[delivId]
      if (!d) continue
      deliveries.push({
        id:          String(d.id),
        dest:        d.dest  || '',
        ville:       d.ville || '',
        transporteur: truck.transporteur || truck.itin || '',
        truckId:     truck.id,
        quaiId,          // null if truck is not on Q4-Q9
        palSilo:     d.palSilo || 0,
      })
    }
  }

  return { assignments, deliveries }
}

/**
 * TruckFlow file-based sync service.
 * Uses the File System Access API to read the sync JSON file periodically.
 */
export class TruckFlowSync {
  constructor(onUpdate, onError) {
    this._onUpdate = onUpdate  // callback(assignments[])
    this._onError  = onError   // callback(errorMessage)
    this._fileHandle = null
    this._timer      = null
    this._active     = false
    this._lastSync   = null
  }

  get isConnected() { return this._active && !!this._fileHandle }
  get lastSync()    { return this._lastSync }

  /** Open file picker and start polling */
  async connect() {
    if (!window.showOpenFilePicker) {
      this._onError('Ton navigateur ne supporte pas l\'API File System (Chrome / Edge requis).')
      return false
    }
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        multiple: false,
      })
      this._fileHandle = handle
      this._active = true
      await this._poll()       // immediate first read
      this._scheduleNext()
      return true
    } catch (e) {
      if (e.name !== 'AbortError') this._onError('Impossible d\'ouvrir le fichier.')
      return false
    }
  }

  /** Stop polling */
  disconnect() {
    this._active = false
    this._fileHandle = null
    clearTimeout(this._timer)
    this._timer = null
  }

  async _poll() {
    if (!this._active || !this._fileHandle) return
    try {
      const file    = await this._fileHandle.getFile()
      const text    = await file.text()
      const session = JSON.parse(text)
      const result  = parseTruckFlowSession(session)
      this._lastSync = new Date()
      this._onUpdate(result)
    } catch (e) {
      this._onError('Erreur de lecture : ' + e.message)
    }
  }

  _scheduleNext() {
    if (!this._active) return
    this._timer = setTimeout(async () => {
      await this._poll()
      this._scheduleNext()
    }, POLL_INTERVAL_MS)
  }
}
