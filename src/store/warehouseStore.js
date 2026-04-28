import { create } from 'zustand'
import { createAisles, createEpisPositions, createQuais, STATUS, QUAI_STATUS, QUAI_DEFS } from '../data/warehouse'

const EMPTY_AISLE = {
  status: STATUS.FREE, client: null, command: null,
  notes: '', usedPalettes: 0, quaiId: null,
}

export const useWarehouseStore = create((set, get) => ({
  aisles:        createAisles(),
  episPositions: createEpisPositions(),
  quais:         createQuais(),
  selected:      null, // { type: 'aisle'|'epis'|'quai', id }

  select:  (type, id) => set({ selected: { type, id } }),
  deselect: ()        => set({ selected: null }),

  getSelected: () => {
    const { selected, aisles, episPositions, quais } = get()
    if (!selected) return null
    if (selected.type === 'aisle') return aisles.find(a => a.id === selected.id)
    if (selected.type === 'epis')  return episPositions.find(e => e.id === selected.id)
    return quais.find(q => q.id === selected.id)
  },

  // Generic update for aisle / epis
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

  // Assign truck to a quai and propagate to its aisles + épis
  assignQuai: (quaiId, data) => {
    const def = QUAI_DEFS.find(q => q.id === quaiId)
    const hasTruck = !!data.truck?.trim()

    const aisleStatus = !hasTruck
      ? STATUS.FREE
      : data.status === QUAI_STATUS.LOADING  ? STATUS.IN_PROGRESS
      : data.status === QUAI_STATUS.DONE     ? STATUS.FULL
      : STATUS.ASSIGNED

    set(s => ({
      quais: s.quais.map(q => q.id === quaiId ? { ...q, ...data } : q),

      aisles: s.aisles.map(a => {
        if (!def?.aisleIds.includes(a.id)) return a
        return hasTruck
          ? { ...a, quaiId, client: data.truck, status: aisleStatus }
          : { ...a, quaiId: null, client: null, status: STATUS.FREE, usedPalettes: 0 }
      }),

      episPositions: s.episPositions.map(e => {
        if (!def?.episIds?.includes(e.id)) return e
        return hasTruck
          ? { ...e, quaiId, client: data.truck, status: aisleStatus }
          : { ...e, quaiId: null, client: null, status: STATUS.FREE, usedPalettes: 0 }
      }),
    }))
  },

  // Clear quai and all its aisles/épis
  clearQuai: (quaiId) => {
    const def = QUAI_DEFS.find(q => q.id === quaiId)
    set(s => ({
      quais: s.quais.map(q => q.id === quaiId ? {
        ...q, truck: '', status: QUAI_STATUS.EMPTY,
        arrivalTime: '', departureTime: '', notes: '',
      } : q),
      aisles: s.aisles.map(a =>
        def?.aisleIds.includes(a.id) ? { ...a, ...EMPTY_AISLE } : a
      ),
      episPositions: s.episPositions.map(e =>
        def?.episIds?.includes(e.id) ? { ...e, ...EMPTY_AISLE } : e
      ),
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
