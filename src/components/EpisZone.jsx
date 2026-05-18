import { useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { STATUS_META, LAYOUT } from '../data/warehouse'

const SLOT_W = 2.1
const SLOT_D = 1.0
const SLOT_H = LAYOUT.BLOCK_H

function EpisSlot({ epis, position, rotY, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)
  const meta = STATUS_META[epis.status]
  const glow = isSelected ? 0.55 : hovered ? 0.28 : 0.07

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh
        position={[0, SLOT_H / 2, 0]}
        onPointerOver={e => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        <boxGeometry args={[SLOT_W, SLOT_H, SLOT_D]} />
        <meshStandardMaterial color={meta.color} emissive={meta.color} emissiveIntensity={glow} roughness={0.5} />
      </mesh>

      {isSelected && (
        <mesh position={[0, SLOT_H / 2, 0]}>
          <boxGeometry args={[SLOT_W + 0.15, SLOT_H + 0.08, SLOT_D + 0.15]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      )}

      <Billboard position={[0, 1.8, 0]}>
        <Text fontSize={0.32} color="#f8fafc" anchorX="center" outlineWidth={0.02} outlineColor="#000">
          {epis.name}
        </Text>
        {epis.client && (
          <Text fontSize={0.26} color="#fde68a" anchorX="center" position={[0, -0.42, 0]}>
            {epis.client}
          </Text>
        )}
      </Billboard>
    </group>
  )
}

export default function EpisZone({ episPositions, layout, selected, onSelect }) {
  const { episLeftEdge, episCenterX, episRightEdge } = layout
  const { DEPTH_B } = LAYOUT

  // E1-E7 belong to Q7 (RIGHT of epis zone after mirror)
  // E8-E14 belong to Q8 (LEFT  of epis zone after mirror)
  const q7Epis = episPositions.slice(0, 7)
  const q8Epis = episPositions.slice(7, 14)
  const count   = 7
  const spacing = DEPTH_B / count

  return (
    <group>
      {/* Zone background plate */}
      <mesh position={[episCenterX, 0.04, DEPTH_B / 2]}>
        <boxGeometry args={[episRightEdge - episLeftEdge, 0.06, DEPTH_B]} />
        <meshStandardMaterial color="#1e3a5f" opacity={0.55} transparent />
      </mesh>

      {/* Central divider lane */}
      <mesh position={[episCenterX, 0.06, DEPTH_B / 2]}>
        <boxGeometry args={[0.3, 0.05, DEPTH_B]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Zone label */}
      <Billboard position={[episCenterX, 4.5, DEPTH_B / 2]}>
        <Text fontSize={0.72} color="#93c5fd" anchorX="center" outlineWidth={0.05} outlineColor="#000">
          Zone Épis
        </Text>
      </Billboard>

      {/* Q7 side — RIGHT of epis zone (toward aisles A14-A15), angled right */}
      {q7Epis.map((epis, i) => {
        const z = spacing * (i + 0.5)
        const x = episRightEdge - 1.5
        const isSelected = selected?.type === 'epis' && selected?.id === epis.id
        return (
          <EpisSlot
            key={epis.id} epis={epis}
            position={[x, 0, z]}
            rotY={Math.PI / 4}
            isSelected={isSelected}
            onClick={() => onSelect('epis', epis.id)}
          />
        )
      })}

      {/* Q8 side — LEFT of epis zone (toward aisle A16), angled left */}
      {q8Epis.map((epis, i) => {
        const z = spacing * (i + 0.5)
        const x = episLeftEdge + 1.5
        const isSelected = selected?.type === 'epis' && selected?.id === epis.id
        return (
          <EpisSlot
            key={epis.id} epis={epis}
            position={[x, 0, z]}
            rotY={-Math.PI / 4}
            isSelected={isSelected}
            onClick={() => onSelect('epis', epis.id)}
          />
        )
      })}
    </group>
  )
}
