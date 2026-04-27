import { useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment, Billboard, Text } from '@react-three/drei'
import { useWarehouseStore } from '../store/warehouseStore'
import AisleBlock from './AisleBlock'
import EpisZone from './EpisZone'
import { computeLayout, LAYOUT } from '../data/warehouse'

function WarehouseFloor({ totalDepth }) {
  const w = LAYOUT.GROUP_A_WIDTH + 8
  return (
    <>
      <Grid
        args={[w + 4, totalDepth + 6]}
        position={[0, -0.02, 0]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#1e3a5f"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#2d4a6a"
        fadeDistance={120}
        infiniteGrid={false}
      />
      {/* Floor plane */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w + 4, totalDepth + 6]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </>
  )
}

function QuaiLabel({ aisleZ }) {
  if (aisleZ === undefined) return null
  return (
    <Billboard position={[0, 1, aisleZ - 3.5]}>
      <Text fontSize={1} color="#475569" anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#000">
        ← QUAI →
      </Text>
    </Billboard>
  )
}

export default function Scene() {
  const { aisles, episPositions, selected, select } = useWarehouseStore()
  const { aisleZ, episCenterZ, totalDepth } = useMemo(computeLayout, [])

  return (
    <Canvas
      camera={{ position: [0, 52, 30], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#080f1a' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[15, 30, 10]} intensity={0.9} castShadow={false} />
      <directionalLight position={[-15, 20, -10]} intensity={0.4} />

      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 8}
        minDistance={12}
        maxDistance={110}
        target={[0, 0, 0]}
        enablePan
      />

      <WarehouseFloor totalDepth={totalDepth} />
      <QuaiLabel aisleZ={aisleZ[0]} />

      {/* Allées */}
      {aisles.map(aisle => {
        const z = aisleZ[aisle.id - 1]
        if (z === undefined) return null
        const isSelected = selected?.type === 'aisle' && selected?.id === aisle.id
        const width = aisle.zone === 'A' ? LAYOUT.GROUP_A_WIDTH : LAYOUT.GROUP_B_WIDTH
        return (
          <AisleBlock
            key={aisle.id}
            aisle={aisle}
            position={[0, 0, z]}
            width={width}
            isSelected={isSelected}
            onClick={() => select('aisle', aisle.id)}
          />
        )
      })}

      {/* Zone épis */}
      <EpisZone
        episPositions={episPositions}
        episCenterZ={episCenterZ}
        selected={selected}
        onSelect={select}
      />
    </Canvas>
  )
}
