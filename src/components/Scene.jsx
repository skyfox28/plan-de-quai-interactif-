import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useWarehouseStore } from '../store/warehouseStore'
import AisleBlock from './AisleBlock'
import EpisZone from './EpisZone'
import DockWall from './DockWall'
import { computeLayout, LAYOUT } from '../data/warehouse'

function WarehouseFloor({ totalW }) {
  return (
    <>
      <Grid
        args={[totalW + 12, 26]}
        position={[0, -0.02, 3]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#1e3a5f"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#2d4a6a"
        fadeDistance={130}
        infiniteGrid={false}
      />
      <mesh position={[0, -0.03, 3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[totalW + 12, 26]} />
        <meshStandardMaterial color="#080f1a" />
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
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#080f1a' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 35, 10]} intensity={0.9} />
      <directionalLight position={[-15, 20, -5]} intensity={0.4} />

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

      {/* Dock wall with quais */}
      <DockWall
        quais={quais}
        quaiPositions={quaiPositions}
        selected={selected}
        onSelect={select}
      />

      {/* Aisles */}
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

      {/* Épis zone */}
      <EpisZone
        episPositions={episPositions}
        layout={layout}
        selected={selected}
        onSelect={select}
      />
    </Canvas>
  )
}
