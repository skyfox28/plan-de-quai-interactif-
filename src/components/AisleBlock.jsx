import { useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { STATUS_META, LAYOUT } from '../data/warehouse'

const PALETTE_H   = 0.20
const PALETTE_GAP = 0.05

export default function AisleBlock({ aisle, posX, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)

  const meta           = STATUS_META[aisle.status]
  const depth          = aisle.zone === 'A' ? LAYOUT.DEPTH_A : LAYOUT.DEPTH_B
  const groundPos      = aisle.groundPositions || (aisle.zone === 'A' ? 9 : 7)
  const w              = LAYOUT.AISLE_W - 0.15
  const h              = LAYOUT.BLOCK_H
  const glow           = isSelected ? 0.7 : hovered ? 0.38 : 0.1
  const usedPalettes   = aisle.usedPalettes || 0
  const slotSpacing    = depth / groundPos
  const slotDepth      = slotSpacing - 0.09
  const slotW          = w - 0.18

  // Build palette slots — fill ground level (lvl 0) left→right then gerber level (lvl 1)
  const paletteSlots = []
  for (let i = 0; i < groundPos; i++) {
    const zLocal = -depth / 2 + slotSpacing / 2 + i * slotSpacing
    for (let lvl = 0; lvl < 2; lvl++) {
      const fillIndex = lvl === 0 ? i : groundPos + i
      const filled    = fillIndex < usedPalettes
      const y         = h + lvl * (PALETTE_H + PALETTE_GAP) + PALETTE_H / 2
      paletteSlots.push(
        <mesh key={`p-${i}-${lvl}`} position={[0, y, zLocal]}>
          <boxGeometry args={[slotW, PALETTE_H, slotDepth]} />
          <meshStandardMaterial
            color={filled ? meta.color : '#0a1520'}
            emissive={filled ? meta.color : '#000'}
            emissiveIntensity={filled ? (isSelected ? 0.5 : 0.18) : 0}
            roughness={0.45}
            metalness={0.2}
            transparent={!filled}
            opacity={filled ? 1 : 0.28}
          />
        </mesh>
      )
    }
  }

  return (
    <group position={[posX, 0, depth / 2]}>
      {/* Floor block */}
      <mesh
        position={[0, h / 2, 0]}
        onPointerOver={e => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        <boxGeometry args={[w, h, depth]} />
        <meshStandardMaterial
          color={meta.color}
          emissive={meta.color}
          emissiveIntensity={glow}
          roughness={0.35}
          metalness={0.45}
        />
      </mesh>

      {/* Palette visualization */}
      {paletteSlots}

      {/* Front face highlight (dock side) */}
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

      {/* Selection wireframe */}
      {isSelected && (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[w + 0.2, h + 0.1, depth + 0.2]} />
          <meshBasicMaterial color={meta.color} wireframe opacity={0.7} transparent />
        </mesh>
      )}

      {/* Billboard label */}
      <Billboard position={[0, 3.5, 0]}>
        <Text fontSize={0.6} color="#f8fafc" anchorX="center" outlineWidth={0.05} outlineColor="#000014">
          {aisle.name}
        </Text>
        {aisle.client && (
          <Text
            fontSize={0.38}
            color="#fde68a"
            anchorX="center"
            position={[0, -0.72, 0]}
            outlineWidth={0.03}
            outlineColor="#000014"
            maxWidth={LAYOUT.AISLE_W + 1}
          >
            {aisle.client}
          </Text>
        )}
        <Text
          fontSize={0.32}
          color={usedPalettes > 0 ? '#7dd3fc' : '#475569'}
          anchorX="center"
          position={[0, aisle.client ? -1.22 : -0.72, 0]}
        >
          {`${usedPalettes}/${aisle.totalPalettes} pal.`}
        </Text>
      </Billboard>
    </group>
  )
}
