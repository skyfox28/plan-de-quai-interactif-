import { create } from 'zustand'
import { createAisles, createEpisPositions, STATUS } from '../data/warehouse'

const EMPTY_SLOT = {
  status: STATUS.FREE,
  client: null,
  command: null,
  notes: '',
  usedPalettes: 0,
}

export const useWarehouseStore = create((set, get) => ({
  aisles: createAisles(),
  episPositions: createEpisPositions(),
  selected: null, // { type: 'aisle' | 'epis', id }

  select: (type, id) => set({ selected: { type, id } }),
  deselect: () => set({ selected: null }),

  getSelected: () => {
    const { selected, aisles, episPositions } = get()
    if (!selected) return null
    return selected.type === 'aisle'
      ? aisles.find(a => a.id === selected.id)
      : episPositions.find(e => e.id === selected.id)
  },

  updateItem: (type, id, updates) => {
    if (type === 'aisle') {
      set(state => ({
        aisles: state.aisles.map(a => a.id === id ? { ...a, ...updates } : a),
      }))
    } else {
      set(state => ({
        episPositions: state.episPositions.map(e => e.id === id ? { ...e, ...updates } : e),
      }))
    }
  },

  resetItem: (type, id) => {
    if (type === 'aisle') {
      set(state => ({
        aisles: state.aisles.map(a => a.id === id ? { ...a, ...EMPTY_SLOT } : a),
      }))
    } else {
      set(state => ({
        episPositions: state.episPositions.map(e => e.id === id ? { ...e, ...EMPTY_SLOT } : e),
      }))
    }
  },

  getStats: () => {
    const { aisles, episPositions } = get()
    const all = [...aisles, ...episPositions]
    const totalCapacity = all.reduce((s, x) => s + x.totalPalettes, 0)
    const usedPalettes = all.reduce((s, x) => s + x.usedPalettes, 0)
    const byStatus = {}
    Object.values(STATUS).forEach(s => {
      byStatus[s] = aisles.filter(a => a.status === s).length
    })
    return {
      totalCapacity,
      usedPalettes,
      freePalettes: totalCapacity - usedPalettes,
      occupancyPct: Math.round((usedPalettes / totalCapacity) * 100),
      byStatus,
    }
  },
}))
