export const STATUS = {
  FREE: 'free',
  ASSIGNED: 'assigned',
  RESERVED: 'reserved',
  IN_PROGRESS: 'in_progress',
  FULL: 'full',
}

export const STATUS_META = {
  [STATUS.FREE]:        { label: 'Libre',       color: '#22c55e', emissive: '#166534' },
  [STATUS.ASSIGNED]:    { label: 'Affecté',     color: '#3b82f6', emissive: '#1e3a8a' },
  [STATUS.RESERVED]:    { label: 'Réservé',     color: '#f59e0b', emissive: '#78350f' },
  [STATUS.IN_PROGRESS]: { label: 'En cours',    color: '#a855f7', emissive: '#4a1d96' },
  [STATUS.FULL]:        { label: 'Complet',     color: '#ef4444', emissive: '#7f1d1d' },
}

// Layout constants (scene units ≈ metres)
export const LAYOUT = {
  AISLE_DEPTH: 3,     // Z depth of one aisle block
  AISLE_GAP: 0.8,     // gap between aisles
  EPIS_DEPTH: 8,      // Z depth of the épis zone
  EPIS_GAP: 1.5,      // extra gap before/after épis zone
  GROUP_A_WIDTH: 14,  // X length for aisles 1-15
  GROUP_B_WIDTH: 11,  // X length for aisles 16-21
  EPIS_WIDTH: 14,     // X length of épis zone
  BLOCK_HEIGHT: 0.5,  // Y height of aisle blocks
}

export function createAisles() {
  const aisles = []
  for (let i = 1; i <= 21; i++) {
    const isGroupA = i <= 15
    aisles.push({
      id: i,
      name: `A${i}`,
      zone: isGroupA ? 'A' : 'B',
      groundPositions: isGroupA ? 9 : 7,
      levels: 2,
      totalPalettes: isGroupA ? 18 : 14,
      usedPalettes: 0,
      status: STATUS.FREE,
      client: null,
      command: null,
      notes: '',
    })
  }
  return aisles
}

export function createEpisPositions() {
  return Array.from({ length: 14 }, (_, i) => ({
    id: `E${i + 1}`,
    name: `Ép.${i + 1}`,
    totalPalettes: 4,
    usedPalettes: 0,
    status: STATUS.FREE,
    client: null,
    command: null,
    notes: '',
  }))
}

// Compute the Z-center position (scene units) for each element, centered on 0
export function computeLayout() {
  const { AISLE_DEPTH, AISLE_GAP, EPIS_DEPTH, EPIS_GAP } = LAYOUT
  const unit = AISLE_DEPTH + AISLE_GAP

  // Raw Z positions (from z=0)
  const rawAisleZ = []
  for (let i = 0; i < 15; i++) {
    rawAisleZ.push(i * unit + AISLE_DEPTH / 2)
  }

  const episStart = 15 * unit + EPIS_GAP
  const episCenterRaw = episStart + EPIS_DEPTH / 2

  const afterEpis = episStart + EPIS_DEPTH + EPIS_GAP
  for (let i = 0; i < 6; i++) {
    rawAisleZ.push(afterEpis + i * unit + AISLE_DEPTH / 2)
  }

  const totalDepth = afterEpis + 6 * unit - AISLE_GAP
  const offset = totalDepth / 2

  return {
    aisleZ: rawAisleZ.map(z => z - offset),
    episCenterZ: episCenterRaw - offset,
    totalDepth,
  }
}
