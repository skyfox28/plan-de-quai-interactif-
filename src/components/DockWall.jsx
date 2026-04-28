import { useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { QUAI_STATUS_META, LAYOUT } from '../data/warehouse'

const DOCK_Z_CENTER = -3.5
const DOCK_DEPTH    = 4
const PLATFORM_H    = 0.5

function QuaiBay({ quai, posX, width, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)
  const meta = QUAI_STATUS_META[quai.status]
  const glow = isSelected ? 0.75 : hovered ? 0.4 : 0.14

  return (
    <group>
      {/* Raised dock platform */}
      <mesh
        position={[posX, PLATFORM_H / 2, DOCK_Z_CENTER]}
        onPointerOver={e => { e.stopPropagation(); setHovered(true) }}
        onPointerOut={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        <boxGeometry args={[width - 0.4, PLATFORM_H, DOCK_DEPTH]} />
        <meshStandardMaterial
          color={meta.color}
          emissive={meta.color}
          emissiveIntensity={glow}
          roughness={0.28}
          metalness={0.55}
        />
      </mesh>

      {/* Selection outline */}
      {isSelected && (
        <mesh position={[posX, PLATFORM_H / 2, DOCK_Z_CENTER]}>
          <boxGeometry args={[width - 0.2, PLATFORM_H + 0.12, DOCK_DEPTH + 0.25]} />
          <meshBasicMaterial color={meta.color} wireframe opacity={0.75} transparent />
        </mesh>
      )}

      {/* Connector strip */}
      <mesh position={[posX, 0.06, -0.8]}>
        <boxGeometry args={[width - 0.4, 0.12, 1.4]} />
        <meshStandardMaterial
          color={meta.color}
          emissive={meta.color}
          emissiveIntensity={isSelected ? 0.65 : 0.3}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Billboard label */}
      <Billboard position={[posX, 4.5, DOCK_Z_CENTER]}>
        <Text
          fontSize={1.1}
          color="#f8fafc"
          anchorX="center"
          fontWeight="bold"
          outlineWidth={0.08}
          outlineColor="#000014"
        >
          {quai.label}
        </Text>
        {quai.truck && (
          <Text
            fontSize={0.5}
            color="#fde68a"
            anchorX="center"
            position={[0, -1.3, 0]}
            outlineWidth={0.03}
            outlineColor="#000014"
            maxWidth={width - 0.5}
          >
            {quai.truck}
          </Text>
        )}
        <Text
          fontSize={0.4}
          color={meta.color}
          anchorX="center"
          position={[0, quai.truck ? -2.0 : -1.3, 0]}
        >
          {meta.label}
        </Text>
        {quai.arrivalTime && (
          <Text fontSize={0.32} color="#64748b" anchorX="center" position={[0, quai.truck ? -2.6 : -1.85, 0]}>
            {`Arr. ${quai.arrivalTime}`}
          </Text>
        )}
      </Billboard>
    </group>
  )
}

export default function DockWall({ quais, quaiPositions, selected, onSelect }) {
  const totalW = 60.5

  return (
    <group>
      {/* Dock apron */}
      <mesh position={[0, 0.02, DOCK_Z_CENTER]}>
        <boxGeometry args={[totalW + 4, 0.04, DOCK_DEPTH + 2]} />
        <meshStandardMaterial color="#070e1c" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* "QUAI" label */}
      <Billboard position={[-(totalW / 2) - 2.5, 1.5, DOCK_Z_CENTER]}>
        <Text fontSize={0.7} color="#1e3a5f" anchorX="center">QUAI</Text>
      </Billboard>

      {/* Separation pillars */}
      {Object.values(quaiPositions).map(pos => (
        <mesh key={`sep-${pos.xMax}`} position={[pos.xMax, PLATFORM_H, DOCK_Z_CENTER]}>
          <boxGeometry args={[0.22, PLATFORM_H * 2.2, DOCK_DEPTH + 0.3]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

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
    </group>
  )
}
