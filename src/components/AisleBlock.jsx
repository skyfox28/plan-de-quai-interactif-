import { useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { STATUS_META, LAYOUT } from '../data/warehouse'

const PAL_H   = 0.42  // palette height (tall enough to see from above)
const PAL_GAP = 0.10  // gap between levels

export default function AisleBlock({ aisle, posX, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)

  const meta        = STATUS_META[aisle.status]
  const depth       = aisle.zone === 'A' ? LAYOUT.DEPTH_A : LAYOUT.DEPTH_B
  const groundPos   = aisle.groundPositions || (aisle.zone === 'A' ? 9 : 7)
  const w           = LAYOUT.AISLE_W - 0.15
  const h           = LAYOUT.BLOCK_H
  const glow        = isSelected ? 0.55 : hovered ? 0.25 : 0.06
  const used        = aisle.usedPalettes || 0
  const slotSpacing = depth / groundPos
  const slotDepth   = slotSpacing - 0.14
  const slotW       = w - 0.22

  return (
    <group position={[posX, 0, depth / 2]}>

      {/* ── Floor base ─────────────────────────────── */}
      <mesh
        position={[0, h / 2, 0]}
        onPointerOver={e => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        <boxGeometry args={[w, h, depth]} />
        <meshStandardMaterial
          color="#0d1a2e"
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* ── Palette slots ──────────────────────────── */}
      {Array.from({ length: groundPos }, (_, i) => {
        const zLocal = -depth / 2 + slotSpacing / 2 + i * slotSpacing
        return [0, 1].map(lvl => {
          const fillIndex = lvl === 0 ? i : groundPos + i
          const filled    = fillIndex < used
          const y         = h + lvl * (PAL_H + PAL_GAP) + PAL_H / 2

          if (filled) {
            // Filled: solid colored block, brighter at gerber level
            const emissive = isSelected ? 0.65 : lvl === 1 ? 0.45 : 0.28
            return (
              <mesh key={`${i}-${lvl}`} position={[0, y, zLocal]}>
                <boxGeometry args={[slotW, PAL_H, slotDepth]} />
                <meshStandardMaterial
                  color={meta.color}
                  emissive={meta.color}
                  emissiveIntensity={emissive}
                  roughness={0.35}
                  metalness={0.3}
                />
              </mesh>
            )
          } else {
            // Empty: thin dark outline so slots are still visible
            return (
              <mesh key={`${i}-${lvl}`} position={[0, y - PAL_H / 2 + 0.03, zLocal]}>
                <boxGeometry args={[slotW, 0.06, slotDepth]} />
                <meshStandardMaterial
                  color="#1e3a5f"
                  emissive="#1e3a5f"
                  emissiveIntensity={0.15}
                  roughness={0.8}
                />
              </mesh>
            )
          }
        })
      })}

      {/* ── Front face highlight (dock side) ───────── */}
      <mesh position={[0, 1.0, -depth / 2 + 0.05]}>
        <boxGeometry args={[w, 2.0, 0.1]} />
        <meshStandardMaterial
          color={meta.color}
          emissive={meta.color}
          emissiveIntensity={isSelected ? 1.1 : hovered ? 0.6 : 0.35}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* ── Selection wireframe ─────────────────────── */}
      {isSelected && (
        <mesh position={[0, (h + PAL_H * 2 + PAL_GAP) / 2, 0]}>
          <boxGeometry args={[w + 0.2, h + PAL_H * 2 + PAL_GAP + 0.1, depth + 0.2]} />
          <meshBasicMaterial color={meta.color} wireframe opacity={0.6} transparent />
        </mesh>
      )}

      {/* ── Billboard label ─────────────────────────── */}
      <Billboard position={[0, 3.8, 0]}>
        <Text fontSize={0.6} color="#f8fafc" anchorX="center" outlineWidth={0.05} outlineColor="#000014">
          {aisle.name}
        </Text>
        {aisle.client && (
          <Text
            fontSize={0.38}
            color="#fde68a"
            anchorX="center"
            position={[0, -0.76, 0]}
            outlineWidth={0.03}
            outlineColor="#000014"
            maxWidth={LAYOUT.AISLE_W + 1}
          >
            {aisle.client}
          </Text>
        )}
        <Text
          fontSize={0.32}
          color={used > 0 ? '#7dd3fc' : '#475569'}
          anchorX="center"
          position={[0, aisle.client ? -1.26 : -0.76, 0]}
        >
          {`${used}/${aisle.totalPalettes} pal.`}
        </Text>
      </Billboard>
    </group>
  )
}
