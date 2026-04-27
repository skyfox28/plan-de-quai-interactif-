import { useState, useRef } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { STATUS_META, LAYOUT } from '../data/warehouse'

export default function AisleBlock({ aisle, position, width, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()

  const meta = STATUS_META[aisle.status]
  const h = LAYOUT.BLOCK_HEIGHT
  const depth = LAYOUT.AISLE_DEPTH
  const glow = isSelected ? 0.55 : hovered ? 0.3 : 0.08

  return (
    <group position={position}>
      {/* Main colored block */}
      <mesh
        ref={meshRef}
        position={[0, h / 2, 0]}
        onPointerOver={e => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        <boxGeometry args={[width, h, depth]} />
        <meshStandardMaterial
          color={meta.color}
          emissive={meta.color}
          emissiveIntensity={glow}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* White outline when selected */}
      {isSelected && (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[width + 0.25, h + 0.1, depth + 0.25]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      )}

      {/* Rack pillars on both ends (visual depth) */}
      {[-width / 2 + 0.3, width / 2 - 0.3].map((x, i) => (
        <mesh key={i} position={[x, 1, 0]}>
          <boxGeometry args={[0.35, 2, depth - 0.1]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      ))}

      {/* Billboard label (always faces camera) */}
      <Billboard position={[0, 2.5, 0]}>
        <Text fontSize={0.65} color="#f8fafc" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000">
          {aisle.name}
        </Text>
        {aisle.client && (
          <Text fontSize={0.42} color="#fde68a" anchorX="center" anchorY="middle" position={[0, -0.75, 0]} outlineWidth={0.03} outlineColor="#000" maxWidth={width - 1}>
            {aisle.client}
          </Text>
        )}
        <Text fontSize={0.35} color="#94a3b8" anchorX="center" anchorY="middle" position={[0, -1.35, 0]}>
          {`${aisle.usedPalettes}/${aisle.totalPalettes} pal.`}
        </Text>
      </Billboard>
    </group>
  )
}
