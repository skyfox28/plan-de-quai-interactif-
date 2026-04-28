import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useWarehouseStore } from '../store/warehouseStore'
import AisleBlock from './AisleBlock'
import EpisZone from './EpisZone'
import DockWall from './DockWall'
import { computeLayout } from '../data/warehouse'

function WarehouseFloor({ totalW }) {
  return (
    <>
      <Grid
        args={[totalW + 12, 26]}
        position={[0, -0.02, 3]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e3a5f"
        sectionSize={5}
        sectionThickness={1.0}
        sectionColor="#2563eb"
        fadeDistance={130}
        infiniteGrid={false}
      />
      <mesh position={[0, -0.03, 3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[totalW + 12, 26]} />
        <meshStandardMaterial color="#060d18" />
      </mesh>
    </>
  )
}

export default function Scene() {
  const { aisles, episPositions, quais, selected, select } = useWarehouseStore()
  const layout = useMemo(computeLayout, [])
  const { aisleX, totalW, quaiPositions } = layout

  return (
    <Canvas
      camera={{ position: [0, 55, -28], fov: 52 }}
      gl={{ antialias: true, alpha: false, toneMapping: 4 /* ACESFilmic */ }}
      style={{ background: '#060d18' }}
    >
      {/* Ambient fill — very low, let other lights do the work */}
      <ambientLight intensity={0.18} />

      {/* Hemisphere — cool sky / pitch ground for depth */}
      <hemisphereLight args={['#1e3a5f', '#060d18', 0.7]} />

      {/* Main key light — slightly warm from upper-front */}
      <directionalLight position={[10, 40, 15]} intensity={1.2} color="#dbeafe" />

      {/* Fill from left-rear — cool blue for secondary shadows */}
      <directionalLight position={[-20, 22, -8]} intensity={0.4} color="#93c5fd" />

      {/* Dock accent — blue point light hovering over the quai apron */}
      <pointLight position={[0, 8, -4]} intensity={22} distance={60} color="#3b82f6" decay={2} />

      {/* Warm overhead for the warehouse floor (mid-scene) */}
      <pointLight position={[0, 28, 12]} intensity={35} distance={90} color="#eff6ff" decay={2} />

      <OrbitControls
        makeDefault
        target={[0, 0, 4]}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 8}
        minDistance={10}
        maxDistance={140}
        enablePan
      />

      <WarehouseFloor totalW={totalW} />

      <DockWall
        quais={quais}
        quaiPositions={quaiPositions}
        selected={selected}
        onSelect={select}
      />

      {aisles.map(aisle => {
        const posX = aisleX[aisle.id - 1]
        if (posX === undefined) return null
        const isSelected = selected?.type === 'aisle' && selected?.id === aisle.id
        return (
          <AisleBlock
            key={aisle.id}
            aisle={aisle}
            posX={posX}
            isSelected={isSelected}
            onClick={() => select('aisle', aisle.id)}
          />
        )
      })}

      <EpisZone
        episPositions={episPositions}
        layout={layout}
        selected={selected}
        onSelect={select}
      />
    </Canvas>
  )
}
