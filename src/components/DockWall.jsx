import { useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { QUAI_STATUS_META, LAYOUT } from '../data/warehouse'

const WALL_H    = 4.5
const WALL_Z    = -(LAYOUT.DOCK_THICK / 2)   // center of wall in Z
const BAY_H     = 3.8
const BAY_DEPTH = 0.12

function QuaiBay({ quai, posX, width, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)
  const meta = QUAI_STATUS_META[quai.status]
  const glow = isSelected ? 0.65 : hovered ? 0.35 : 0.12

  return (
    <group position={[posX, 0, WALL_Z - LAYOUT.DOCK_THICK / 2 - 0.05]}>
      {/* Bay panel */}
      <mesh
        position={[0, BAY_H / 2, 0]}
        onPointerOver={e => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        <boxGeometry args={[width - 0.3, BAY_H, BAY_DEPTH]} />
        <meshStandardMaterial
          color={meta.color}
          emissive={meta.color}
          emissiveIntensity={glow}
          roughness={0.4}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, BAY_H / 2, 0]}>
          <boxGeometry args={[width - 0.1, BAY_H + 0.15, BAY_DEPTH + 0.1]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      )}

      {/* Quai number + truck label */}
      <Billboard position={[0, BAY_H + 1.0, 0]}>
        <Text fontSize={0.9} color="#f8fafc" anchorX="center" fontWeight="bold" outlineWidth={0.06} outlineColor="#000">
          {quai.label}
        </Text>
        {quai.truck && (
          <Text fontSize={0.46} color="#fde68a" anchorX="center" position={[0, -1.05, 0]} outlineWidth={0.03} outlineColor="#000" maxWidth={width - 0.5}>
            {quai.truck}
          </Text>
        )}
        <Text fontSize={0.35} color={meta.color} anchorX="center" position={[0, quai.truck ? -1.65 : -1.05, 0]}>
          {meta.label}
        </Text>
        {quai.arrivalTime && (
          <Text fontSize={0.3} color="#64748b" anchorX="center" position={[0, quai.truck ? -2.1 : -1.5, 0]}>
            {`Arr. ${quai.arrivalTime}`}
          </Text>
        )}
      </Billboard>

      {/* Bottom ground strip */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[width - 0.3, 0.1, BAY_DEPTH + 0.4]} />
        <meshStandardMaterial color={meta.color} emissive={meta.color} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

export default function DockWall({ quais, quaiPositions, selected, onSelect }) {
  const totalW = 60.5  // matches computeLayout totalW

  return (
    <group>
      {/* Main concrete wall */}
      <mesh position={[0, WALL_H / 2, WALL_Z]}>
        <boxGeometry args={[totalW + 4, WALL_H, LAYOUT.DOCK_THICK]} />
        <meshStandardMaterial color="#0d1b2a" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, WALL_H + 0.2, WALL_Z]}>
        <boxGeometry args={[totalW + 4, 0.4, LAYOUT.DOCK_THICK + 0.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* "QUAI" wall label */}
      <Billboard position={[-(totalW / 2) - 1.5, WALL_H / 2, WALL_Z - LAYOUT.DOCK_THICK]}>
        <Text fontSize={0.6} color="#334155" anchorX="center" rotation={[0, 0, Math.PI / 2]}>
          QUAI
        </Text>
      </Billboard>

      {/* Individual quai bays */}
      {quais.map(quai => {
        const pos = quaiPositions[quai.id]
        if (!pos) return null
        const isSelected = selected?.type === 'quai' && selected?.id === quai.id
        return (
          <QuaiBay
            key={quai.id}
            quai={quai}
            posX={pos.centerX}
            width={pos.width}
            isSelected={isSelected}
            onClick={() => onSelect('quai', quai.id)}
          />
        )
      })}

      {/* Separation pillars between quais */}
      {quais.slice(0, -1).map(quai => {
        const pos = quaiPositions[quai.id]
        if (!pos) return null
        return (
          <mesh key={`pillar-${quai.id}`} position={[pos.xMax, WALL_H / 2, WALL_Z - LAYOUT.DOCK_THICK / 2 - 0.05]}>
            <boxGeometry args={[0.25, WALL_H + 0.5, 0.4]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
        )
      })}
    </group>
  )
}
