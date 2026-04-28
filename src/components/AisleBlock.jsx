import { useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { STATUS_META, LAYOUT } from '../data/warehouse'

export default function AisleBlock({ aisle, posX, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)

  const meta  = STATUS_META[aisle.status]
  const depth = aisle.zone === 'A' ? LAYOUT.DEPTH_A : LAYOUT.DEPTH_B
  const w     = LAYOUT.AISLE_W - 0.15
  const h     = LAYOUT.BLOCK_H
  const glow  = isSelected ? 0.7 : hovered ? 0.38 : 0.1

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
      <Billboard position={[0, 3.2, 0]}>
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
          color={aisle.usedPalettes > 0 ? '#7dd3fc' : '#475569'}
          anchorX="center"
          position={[0, aisle.client ? -1.22 : -0.72, 0]}
        >
          {`${aisle.usedPalettes}/${aisle.totalPalettes} pal.`}
        </Text>
      </Billboard>
    </group>
  )
}
