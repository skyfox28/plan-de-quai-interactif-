export const STATUS = {
  FREE: 'free',
  ASSIGNED: 'assigned',
  RESERVED: 'reserved',
  IN_PROGRESS: 'in_progress',
  FULL: 'full',
}

export const STATUS_META = {
  [STATUS.FREE]:        { label: 'Libre',          color: '#22c55e' },
  [STATUS.ASSIGNED]:    { label: 'Affecté',        color: '#3b82f6' },
  [STATUS.RESERVED]:    { label: 'Réservé',        color: '#f59e0b' },
  [STATUS.IN_PROGRESS]: { label: 'En cours',       color: '#a855f7' },
  [STATUS.FULL]:        { label: 'Complet',        color: '#ef4444' },
}

export const QUAI_STATUS = {
  EMPTY:    'empty',
  WAITING:  'waiting',
  LOADING:  'loading',
  DONE:     'done',
  DEPARTED: 'departed',
}

export const QUAI_STATUS_META = {
  [QUAI_STATUS.EMPTY]:    { label: 'Libre',          color: '#374151' },
  [QUAI_STATUS.WAITING]:  { label: 'En attente',     color: '#f59e0b' },
  [QUAI_STATUS.LOADING]:  { label: 'En chargement',  color: '#3b82f6' },
  [QUAI_STATUS.DONE]:     { label: 'Terminé',        color: '#22c55e' },
  [QUAI_STATUS.DEPARTED]: { label: 'Parti',          color: '#6b7280' },
}

// Quai → allées + épis.
// Q2 has a fixed X position (silo side, far right).
// Épis E1-E7 = Q7 side, E8-E14 = Q8 side.
export const QUAI_DEFS = [
  { id: 9, label: 'Q9', aisleIds: [17, 18, 19, 20, 21], episIds: [] },
  { id: 8, label: 'Q8', aisleIds: [16],                 episIds: ['E8','E9','E10','E11','E12','E13','E14'] },
  { id: 7, label: 'Q7', aisleIds: [14, 15],             episIds: ['E1','E2','E3','E4','E5','E6','E7'] },
  { id: 6, label: 'Q6', aisleIds: [9, 10, 11, 12, 13], episIds: [] },
  { id: 5, label: 'Q5', aisleIds: [4, 5, 6, 7, 8],     episIds: [] },
  { id: 4, label: 'Q4', aisleIds: [1, 2, 3],           episIds: [] },
  // Q2 = silo access quai, far right, no warehouse aisles
  { id: 2, label: 'Q2', aisleIds: [], episIds: [], fixedCenterX: 34.5, fixedWidth: 7.5 },
]

// Layout constants (1 unit ≈ 1 m)
export const LAYOUT = {
  AISLE_W:     2.5,   // X width per aisle slot
  EPIS_ZONE_W: 8,     // X width of épis zone (between A15 and A16)
  DEPTH_A:     13,    // Z depth for aisles A1-A15  (9 positions)
  DEPTH_B:     10,    // Z depth for aisles A16-A21 (7 positions)
  BLOCK_H:     0.45,  // Y height of floor blocks
  DOCK_THICK:  1.2,   // Z thickness of dock wall structure
}

export function createAisles() {
  const aisles = []
  for (let i = 1; i <= 21; i++) {
    const isA = i <= 15
    aisles.push({
      id: i,
      name: `A${i}`,
      zone: isA ? 'A' : 'B',
      groundPositions: isA ? 9 : 7,
      levels: 2,
      totalPalettes: isA ? 18 : 14,
      usedPalettes: 0,
      status: STATUS.FREE,
      client: null,
      command: null,
      notes: '',
      quaiId: null,
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
    quaiId: null,
  }))
}

export function createQuais() {
  return QUAI_DEFS.map(def => ({
    ...def,
    truck: '',
    status: QUAI_STATUS.EMPTY,
    arrivalTime: '',
    departureTime: '',
    notes: '',
  }))
}

/**
 * Compute X center of each aisle, épis zone, and quai bays.
 * Layout (top view, MIRRORED so Q9 is left, Q2 is right):
 *   X axis → Q9 (left, negative X) … Q4 … Q2 (right, positive X)
 *   Z axis → 0 (dock wall) → positive (interior / silo)
 */
export function computeLayout() {
  const { AISLE_W, EPIS_ZONE_W } = LAYOUT
  const totalW = 21 * AISLE_W + EPIS_ZONE_W   // 60.5
  const leftEdge = -totalW / 2                  // -30.25

  // Compute pre-mirror aisle X centers (A1 left → A21 right)
  const rawAisleX = []
  for (let i = 0; i < 15; i++) {
    rawAisleX[i] = leftEdge + i * AISLE_W + AISLE_W / 2
  }
  const episLeftEdgeRaw  = leftEdge + 15 * AISLE_W  // 7.25
  const episCenterXRaw   = episLeftEdgeRaw + EPIS_ZONE_W / 2  // 11.25
  const episRightEdgeRaw = episLeftEdgeRaw + EPIS_ZONE_W       // 15.25
  for (let i = 0; i < 6; i++) {
    rawAisleX[15 + i] = episRightEdgeRaw + i * AISLE_W + AISLE_W / 2
  }

  // Mirror X: negate all X values so Q9 (high +X) becomes left (high -X)
  const aisleX = rawAisleX.map(x => -x)
  const episCenterX   = -episCenterXRaw    // -11.25
  const episLeftEdge  = -episRightEdgeRaw  // -15.25  (was right, now left after mirror)
  const episRightEdge = -episLeftEdgeRaw   // -7.25

  // Quai X coverage (post-mirror)
  const quaiPositions = {}
  QUAI_DEFS.forEach(def => {
    if (def.fixedCenterX !== undefined) {
      // Q2: fixed absolute position (far right, beyond Q4)
      quaiPositions[def.id] = {
        centerX: def.fixedCenterX,
        width:   def.fixedWidth,
        xMin:    def.fixedCenterX - def.fixedWidth / 2,
        xMax:    def.fixedCenterX + def.fixedWidth / 2,
      }
      return
    }
    const leftAisle  = Math.min(...def.aisleIds)
    const rightAisle = Math.max(...def.aisleIds)
    // Post-mirror: aisleX[i] = -rawAisleX[i], so "left" is the aisle with the smallest (most negative) X
    // The aisle with the highest id now has the most negative X (leftmost)
    const xValues = def.aisleIds.map(id => aisleX[id - 1])
    let xMin = Math.min(...xValues) - AISLE_W / 2
    let xMax = Math.max(...xValues) + AISLE_W / 2
    // Q7 extends into right half of épis zone (post-mirror: right = positive X side)
    if (def.id === 7) xMax = episCenterX > xMax ? xMax : episCenterX  // clamp to episCenter on right
    // Q8 extends into left half of épis zone (post-mirror: left = negative X side)
    if (def.id === 8) xMin = episCenterX < xMin ? xMin : episCenterX
    // Post-mirror: Q7 (aisles 14-15) is RIGHT of epis zone → extends left to episCenterX
    //              Q8 (aisle 16)    is LEFT  of epis zone → extends right to episCenterX
    if (def.id === 7) { xMin = episCenterX; xMax = Math.max(...xValues) + AISLE_W / 2 }
    if (def.id === 8) { xMin = Math.min(...xValues) - AISLE_W / 2; xMax = episCenterX }
    quaiPositions[def.id] = {
      centerX: (xMin + xMax) / 2,
      width:    xMax - xMin,
      xMin, xMax,
    }
  })

  return {
    aisleX,
    episCenterX,
    episLeftEdge,
    episRightEdge,
    totalW,
    leftEdge: -leftEdge,  // after mirror, left boundary is now the old right boundary
    mirrored: true,
    quaiPositions,
  }
}
