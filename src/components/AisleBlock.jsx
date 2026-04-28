import { useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { STATUS_META, LAYOUT } from '../data/warehouse'

const PAL_H     = 0.65   // palette height — clearly visible from above
const PAL_GAP   = 0.14   // vertical gap between levels
const GERBER_CAP_H = 0.10 // amber stripe on top of gerber palettes

export default function AisleBlock({ aisle, posX, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)

  const meta        = STATUS_META[aisle.status]
  const depth       = aisle.zone === 'A' ? LAYOUT.DEPTH_A : LAYOUT.DEPTH_B
  const groundPos   = aisle.groundPositions || (aisle.zone === 'A' ? 9 : 7)
  const w           = LAYOUT.AISLE_W - 0.15
  const h           = LAYOUT.BLOCK_H
  const used        = aisle.usedPalettes || 0
  const slotSpacing = depth / groundPos
  const slotW       = w - 0.20
  const slotDepth   = slotSpacing - 0.16

  return (
    <group position={[posX, 0, depth / 2]}>

      {/* ── Aisle floor ─────────────────────────────── */}
      <mesh
        position={[0, h / 2, 0]}
        onPointerOver={e => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        <boxGeometry args={[w, h, depth]} />
        <meshStandardMaterial
          color={isSelected ? '#0d2040' : hovered ? '#0a1830' : '#080e1c'}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* ── Palette slots ──────────────────────────── */}
      {Array.from({ length: groundPos }, (_, i) => {
        const zLocal = -depth / 2 + slotSpacing / 2 + i * slotSpacing
        return [0, 1].map(lvl => {
          const fillIndex = lvl === 0 ? i : groundPos + i
          const filled    = fillIndex < used
          const yCenter   = h + lvl * (PAL_H + PAL_GAP) + PAL_H / 2

          if (filled) {
            const emissive = lvl === 1 ? 0.42 : 0.26
            return (
              <group key={`${i}-${lvl}`}>
                {/* Main palette body */}
                <mesh position={[0, yCenter, zLocal]}>
                  <boxGeometry args={[slotW, PAL_H, slotDepth]} />
                  <meshStandardMaterial
                    color={meta.color}
                    emissive={meta.color}
                    emissiveIntensity={isSelected ? emissive + 0.25 : emissive}
                    roughness={0.35}
                    metalness={0.25}
                  />
                </mesh>
                {/* Gerber cap — amber/yellow stripe on top of level 2 */}
                {lvl === 1 && (
                  <mesh position={[0, yCenter + PAL_H / 2 + 0.02 + GERBER_CAP_H / 2, zLocal]}>
                    <boxGeometry args={[slotW, GERBER_CAP_H, slotDepth]} />
                    <meshStandardMaterial
                      color="#f59e0b"
                      emissive="#f59e0b"
                      emissiveIntensity={0.75}
                      roughness={0.3}
                    />
                  </mesh>
                )}
              </group>
            )
          } else {
            return null
          }
        })
      })}

      {/* ── Front face highlight (dock side) ───────── */}
      <mesh position={[0, 1.0, -depth / 2 + 0.05]}>
        <boxGeometry args={[w, 2.0, 0.1]} />
        <meshStandardMaterial
          color={meta.color}
          emissive={meta.color}
          emissiveIntensity={isSelected ? 1.1 : hovered ? 0.55 : 0.3}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* ── Selection outline ──────────────────────── */}
      {isSelected && (
        <mesh position={[0, (h + PAL_H * 2 + PAL_GAP) / 2, 0]}>
          <boxGeometry args={[w + 0.25, h + PAL_H * 2 + PAL_GAP + GERBER_CAP_H + 0.2, depth + 0.25]} />
          <meshBasicMaterial color={meta.color} wireframe opacity={0.5} transparent />
        </mesh>
      )}

      {/* ── Billboard label ─────────────────────────── */}
      <Billboard position={[0, 4.2, 0]}>
        <Text fontSize={0.65} color="#f8fafc" anchorX="center" outlineWidth={0.05} outlineColor="#000014">
          {aisle.name}
        </Text>
        {aisle.client && (
          <Text
            fontSize={0.40}
            color="#fde68a"
            anchorX="center"
            position={[0, -0.82, 0]}
            outlineWidth={0.03}
            outlineColor="#000014"
            maxWidth={LAYOUT.AISLE_W + 1.5}
          >
            {aisle.client}
          </Text>
        )}
        <Text
          fontSize={0.34}
          color={used > 0 ? '#7dd3fc' : '#475569'}
          anchorX="center"
          position={[0, aisle.client ? -1.32 : -0.82, 0]}
        >
          {`${used}/${aisle.totalPalettes}`}
        </Text>
      </Billboard>
    </group>
  )
}
