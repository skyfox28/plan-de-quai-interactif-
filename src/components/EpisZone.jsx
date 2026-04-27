import { useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { STATUS_META, LAYOUT } from '../data/warehouse'

// 14 positions épis: 7 on each side of a central lane, angled at 45°
// Layout: rows of 7 on left side (angle +45°) and 7 on right side (angle -45°)
const EPIS_W = 2.2   // width of one épis slot
const EPIS_L = 1.4   // length of one épis slot
const EPIS_H = 0.4   // height

function EpisSlot({ epis, position, rotation, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)
  const meta = STATUS_META[epis.status]
  const glow = isSelected ? 0.55 : hovered ? 0.3 : 0.08

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh
        position={[0, EPIS_H / 2, 0]}
        onPointerOver={e => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        <boxGeometry args={[EPIS_W, EPIS_H, EPIS_L]} />
        <meshStandardMaterial
          color={meta.color}
          emissive={meta.color}
          emissiveIntensity={glow}
          roughness={0.5}
        />
      </mesh>
      {isSelected && (
        <mesh position={[0, EPIS_H / 2, 0]}>
          <boxGeometry args={[EPIS_W + 0.15, EPIS_H + 0.08, EPIS_L + 0.15]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      )}
      <Billboard position={[0, 1.4, 0]}>
        <Text fontSize={0.38} color="#f8fafc" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#000">
          {epis.name}
        </Text>
        {epis.client && (
          <Text fontSize={0.3} color="#fde68a" anchorX="center" anchorY="middle" position={[0, -0.48, 0]} outlineWidth={0.02} outlineColor="#000">
            {epis.client}
          </Text>
        )}
      </Billboard>
    </group>
  )
}

export default function EpisZone({ episPositions, episCenterZ, selected, onSelect }) {
  const { EPIS_WIDTH, EPIS_DEPTH } = LAYOUT

  // 7 slots each side, spaced along X, centered at x=0
  // Left row (negative X): angled -45° (pointing inward)
  // Right row (positive X): angled +45° (pointing inward)
  const count = 7
  const spacing = (EPIS_WIDTH - 2) / (count - 1) // X spacing between slots
  const startX = -(EPIS_WIDTH - 2) / 2

  const positions = []
  for (let i = 0; i < count; i++) {
    const x = startX + i * spacing
    // Left side: z offset toward front
    positions.push({ index: i, x, z: episCenterZ - 1.5, rotation: Math.PI / 4 })
    // Right side: z offset toward back
    positions.push({ index: i + count, x, z: episCenterZ + 1.5, rotation: -Math.PI / 4 })
  }

  return (
    <group>
      {/* Zone background plate */}
      <mesh position={[0, 0.05, episCenterZ]}>
        <boxGeometry args={[EPIS_WIDTH + 1, 0.08, EPIS_DEPTH - 1]} />
        <meshStandardMaterial color="#1e3a5f" opacity={0.6} transparent />
      </mesh>

      {/* Zone label */}
      <Billboard position={[0, 3.5, episCenterZ]}>
        <Text fontSize={0.7} color="#93c5fd" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#000">
          Zone Épis
        </Text>
      </Billboard>

      {/* Central driving lane marker */}
      <mesh position={[0, 0.06, episCenterZ]}>
        <boxGeometry args={[EPIS_WIDTH + 0.5, 0.02, 1.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Epis slots */}
      {positions.map(({ index, x, z, rotation }) => {
        const epis = episPositions[index]
        if (!epis) return null
        const isSelected = selected?.type === 'epis' && selected?.id === epis.id
        return (
          <EpisSlot
            key={epis.id}
            epis={epis}
            position={[x, 0, z]}
            rotation={rotation}
            isSelected={isSelected}
            onClick={() => onSelect('epis', epis.id)}
          />
        )
      })}
    </group>
  )
}
