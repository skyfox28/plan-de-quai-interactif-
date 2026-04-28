import { create } from 'zustand'
import { createAisles, createEpisPositions, createQuais, STATUS, QUAI_STATUS } from '../data/warehouse'

const EMPTY_AISLE = {
  status: STATUS.FREE, client: null, command: null,
  notes: '', usedPalettes: 0, quaiId: null, deliveryId: null,
}

export const useWarehouseStore = create((set, get) => ({
  aisles:        createAisles(),
  episPositions: createEpisPositions(),
  quais:         createQuais(),
  selected:      null, // { type: 'aisle'|'epis'|'quai', id }
  tfDeliveries:  [],   // [{ id, dest, ville, transporteur, truckId, quaiId, palSilo }]

  select:  (type, id) => set({ selected: { type, id } }),
  deselect: ()        => set({ selected: null }),
  setTfDeliveries: (deliveries) => set({ tfDeliveries: deliveries }),

  getSelected: () => {
    const { selected, aisles, episPositions, quais } = get()
    if (!selected) return null
    if (selected.type === 'aisle') return aisles.find(a => a.id === selected.id)
    if (selected.type === 'epis')  return episPositions.find(e => e.id === selected.id)
    return quais.find(q => q.id === selected.id)
  },

  updateItem: (type, id, updates) => {
    if (type === 'aisle') {
      set(s => ({ aisles: s.aisles.map(a => a.id === id ? { ...a, ...updates } : a) }))
    } else {
      set(s => ({ episPositions: s.episPositions.map(e => e.id === id ? { ...e, ...updates } : e) }))
    }
  },

  resetItem: (type, id) => {
    if (type === 'aisle') {
      set(s => ({ aisles: s.aisles.map(a => a.id === id ? { ...a, ...EMPTY_AISLE } : a) }))
    } else {
      set(s => ({ episPositions: s.episPositions.map(e => e.id === id ? { ...e, ...EMPTY_AISLE } : e) }))
    }
  },

  // Update quai only — aisles are assigned manually and independently
  assignQuai: (quaiId, data) => {
    set(s => ({
      quais: s.quais.map(q => q.id === quaiId ? { ...q, ...data } : q),
    }))
  },

  // Clear quai only — aisles remain untouched
  clearQuai: (quaiId) => {
    set(s => ({
      quais: s.quais.map(q => q.id === quaiId ? {
        ...q, truck: '', status: QUAI_STATUS.EMPTY,
        arrivalTime: '', departureTime: '', notes: '',
      } : q),
    }))
  },

  getStats: () => {
    const { aisles, episPositions, quais } = get()
    const all = [...aisles, ...episPositions]
    const totalCapacity = all.reduce((s, x) => s + x.totalPalettes, 0)
    const usedPalettes  = all.reduce((s, x) => s + x.usedPalettes, 0)
    const byStatus = {}
    Object.values(STATUS).forEach(k => { byStatus[k] = aisles.filter(a => a.status === k).length })
    const quaiActive = quais.filter(q => q.status !== 'empty').length
    return {
      totalCapacity, usedPalettes,
      freePalettes: totalCapacity - usedPalettes,
      occupancyPct: totalCapacity ? Math.round((usedPalettes / totalCapacity) * 100) : 0,
      byStatus, quaiActive,
    }
  },
}))
