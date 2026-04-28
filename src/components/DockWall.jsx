import { useState } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { QUAI_STATUS_META, LAYOUT } from '../data/warehouse'

// Quais are rendered as raised floor platforms OUTSIDE the warehouse (Z < 0)
const DOCK_Z_CENTER = -3.5   // center of dock platform zone
const DOCK_DEPTH    = 4      // Z depth of dock zone
const PLATFORM_H    = 0.5    // height of raised platform

function QuaiBay({ quai, posX, width, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false)
  const meta = QUAI_STATUS_META[quai.status]
  const glow = isSelected ? 0.6 : hovered ? 0.3 : 0.1

  return (
    <group>
      {/* Raised dock platform (flat, visible from above) */}
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
          roughness={0.5}
        />
      </mesh>

      {/* Selection outline */}
      {isSelected && (
        <mesh position={[posX, PLATFORM_H / 2, DOCK_Z_CENTER]}>
          <boxGeometry args={[width - 0.2, PLATFORM_H + 0.1, DOCK_DEPTH + 0.2]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      )}

      {/* Connector strip between platform and aisle entrance */}
      <mesh position={[posX, 0.06, -0.8]}>
        <boxGeometry args={[width - 0.4, 0.12, 1.4]} />
        <meshStandardMaterial color={meta.color} emissive={meta.color} emissiveIntensity={0.35} />
      </mesh>

      {/* Billboard label (always faces camera) */}
      <Billboard position={[posX, 4.5, DOCK_Z_CENTER]}>
        <Text
          fontSize={1.1}
          color="#f8fafc"
          anchorX="center"
          fontWeight="bold"
          outlineWidth={0.07}
          outlineColor="#000"
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
            outlineColor="#000"
            maxWidth={width - 0.5}
          >
            {quai.truck}
          </Text>
        )}
        <Text
          fontSize={0.38}
          color={meta.color}
          anchorX="center"
          position={[0, quai.truck ? -2.0 : -1.3, 0]}
        >
          {meta.label}
        </Text>
        {quai.arrivalTime && (
          <Text fontSize={0.3} color="#64748b" anchorX="center" position={[0, quai.truck ? -2.5 : -1.8, 0]}>
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
      {/* Base dock apron (dark ground) */}
      <mesh position={[0, 0.02, DOCK_Z_CENTER]}>
        <boxGeometry args={[totalW + 4, 0.04, DOCK_DEPTH + 2]} />
        <meshStandardMaterial color="#0a1628" />
      </mesh>

      {/* "QUAI" label on dock floor */}
      <Billboard position={[-(totalW / 2) - 2.5, 1.5, DOCK_Z_CENTER]}>
        <Text fontSize={0.7} color="#334155" anchorX="center">QUAI</Text>
      </Billboard>

      {/* Separation pillars between bays */}
      {Object.values(quaiPositions).map(pos => (
        <mesh key={`sep-${pos.xMax}`} position={[pos.xMax, PLATFORM_H, DOCK_Z_CENTER]}>
          <boxGeometry args={[0.2, PLATFORM_H * 2, DOCK_DEPTH + 0.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      ))}

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
    </group>
  )
}
