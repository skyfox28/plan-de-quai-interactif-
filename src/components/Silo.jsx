import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'

// Silo geometry constants
const SILO_X_CENTER  =  4.0   // slightly right to center the Q2 side
const SILO_WIDTH     = 70.0   // entire site width incl. Q2 zone
const SILO_DEPTH     = 14.0   // front Z=14 → back Z=28
const SILO_Z_FRONT   = 14.0
const SILO_Z_CENTER  = SILO_Z_FRONT + SILO_DEPTH / 2   // 21
const SILO_HEIGHT    = 30.0
const SILO_Y_CENTER  = SILO_HEIGHT / 2                  // 15
const SILO_X_LEFT    = SILO_X_CENTER - SILO_WIDTH / 2   // -31
const SILO_X_RIGHT   = SILO_X_CENTER + SILO_WIDTH / 2   // +39

const WALL_T = 0.4   // wall thickness

// 5 allées — equal width across the silo
const ALLEE_COUNT   = 5
const ALLEE_WIDTH   = SILO_WIDTH / ALLEE_COUNT  // 14m each
const ALLEE_CENTERS = Array.from({ length: ALLEE_COUNT }, (_, i) =>
  SILO_X_LEFT + (i + 0.5) * ALLEE_WIDTH
)
// [−24, −10, +4, +18, +32]

// 2 automatic transfers run BETWEEN allées (in Z direction, full silo depth)
const TRANSFER_X = [
  SILO_X_LEFT + ALLEE_WIDTH * 2,   // between A2 and A3: −31 + 28 = −3
  SILO_X_LEFT + ALLEE_WIDTH * 4,   // between A4 and A5: −31 + 56 = +25
]
const TRANSFER_W    = 1.4   // belt width
const TRANSFER_H    = 0.45
const TRANSFER_Y    = 0.55

// Conveyor connecting Q2 dock to silo (entry + exit)
const Q2_X       = 34.5
const CONV_Z_START = -3.5   // dock level
const CONV_Z_END   = SILO_Z_FRONT
const CONV_LENGTH  = CONV_Z_END - CONV_Z_START  // ≈17.5
const CONV_Z_MID   = (CONV_Z_START + CONV_Z_END) / 2
const CONV_W       = 1.4
const CONV_H       = 0.45
const CONV_Y       = 0.55

// Transversal conveyor: full site width, at Z = SILO_Z_FRONT
const TRANS_Z  = SILO_Z_FRONT - 0.8
const TRANS_W  = SILO_WIDTH + 4   // slightly wider
const TRANS_H  = 0.45
const TRANS_Y  = 0.55

// Rack columns per allée (visualized as rows of palette slots)
const RACK_ROWS  = 6    // rows deep in the silo
const RACK_COLS  = 5    // columns across each allée
const RACK_H     = 1.1  // height per level
const RACK_LEVELS = 5   // storage levels

function AnimatedBelt({ color, speed = 1 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.emissiveIntensity =
        0.35 + 0.15 * Math.sin(clock.elapsedTime * speed * 3)
    }
  })
  return (
    <mesh ref={ref}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.35}
        roughness={0.4}
        metalness={0.3}
      />
    </mesh>
  )
}

function ConveyorBelt({ position, args, color = '#f59e0b', speed = 1, label, labelOffset }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.emissiveIntensity =
        0.3 + 0.2 * Math.sin(clock.elapsedTime * speed * 2.5)
    }
  })
  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={args} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.35}
          metalness={0.35}
        />
      </mesh>
      {label && (
        <Billboard position={labelOffset ?? [0, 1.6, 0]}>
          <Text fontSize={0.55} color={color} anchorX="center" outlineWidth={0.04} outlineColor="#000">
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  )
}

function RackBlock({ position, alleeCenterX, siloZCenter }) {
  const slots = []
  for (let row = 0; row < RACK_ROWS; row++) {
    for (let col = 0; col < RACK_COLS; col++) {
      for (let lvl = 0; lvl < RACK_LEVELS; lvl++) {
        const x = alleeCenterX - (RACK_COLS / 2 - 0.5 - col) * (ALLEE_WIDTH / RACK_COLS)
        const z = SILO_Z_FRONT + 1.2 + row * (SILO_DEPTH / RACK_ROWS)
        const y = 0.5 + lvl * (RACK_H + 0.1)
        slots.push({ x, y, z, key: `${row}-${col}-${lvl}` })
      }
    }
  }

  return (
    <>
      {slots.map(s => (
        <mesh key={s.key} position={[s.x, s.y, s.z]}>
          <boxGeometry args={[1.8, RACK_H * 0.8, 1.0]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.08}
            roughness={0.6}
            metalness={0.1}
            opacity={0.65}
            transparent
          />
        </mesh>
      ))}
    </>
  )
}

export default function SiloComplex() {
  return (
    <group>

      {/* ══ SILO OUTER SHELL ══════════════════════════════════════════════ */}

      {/* Floor */}
      <mesh position={[SILO_X_CENTER, 0.02, SILO_Z_CENTER]}>
        <boxGeometry args={[SILO_WIDTH, 0.12, SILO_DEPTH]} />
        <meshStandardMaterial color="#0a1628" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Back wall (Z far) */}
      <mesh position={[SILO_X_CENTER, SILO_Y_CENTER, SILO_Z_FRONT + SILO_DEPTH - WALL_T / 2]}>
        <boxGeometry args={[SILO_WIDTH, SILO_HEIGHT, WALL_T]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.4} metalness={0.7} opacity={0.9} transparent />
      </mesh>

      {/* Front face (Z near) — semi-transparent to show interior */}
      <mesh position={[SILO_X_CENTER, SILO_Y_CENTER, SILO_Z_FRONT + WALL_T / 2]}>
        <boxGeometry args={[SILO_WIDTH, SILO_HEIGHT, WALL_T]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.3} metalness={0.8} opacity={0.35} transparent />
      </mesh>

      {/* Left wall */}
      <mesh position={[SILO_X_LEFT + WALL_T / 2, SILO_Y_CENTER, SILO_Z_CENTER]}>
        <boxGeometry args={[WALL_T, SILO_HEIGHT, SILO_DEPTH]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.4} metalness={0.7} opacity={0.85} transparent />
      </mesh>

      {/* Right wall */}
      <mesh position={[SILO_X_RIGHT - WALL_T / 2, SILO_Y_CENTER, SILO_Z_CENTER]}>
        <boxGeometry args={[WALL_T, SILO_HEIGHT, SILO_DEPTH]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.4} metalness={0.7} opacity={0.85} transparent />
      </mesh>

      {/* Roof */}
      <mesh position={[SILO_X_CENTER, SILO_HEIGHT - WALL_T / 2, SILO_Z_CENTER]}>
        <boxGeometry args={[SILO_WIDTH, WALL_T, SILO_DEPTH]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.3} metalness={0.8} opacity={0.7} transparent />
      </mesh>

      {/* ══ 5 ALLÉES INTERNES ══════════════════════════════════════════════ */}

      {ALLEE_CENTERS.map((cx, i) => (
        <group key={`allee-${i}`}>
          {/* Allée divider wall (between allées) */}
          {i < ALLEE_COUNT - 1 && (
            <mesh position={[cx + ALLEE_WIDTH / 2, SILO_Y_CENTER, SILO_Z_CENTER]}>
              <boxGeometry args={[0.25, SILO_HEIGHT, SILO_DEPTH]} />
              <meshStandardMaterial color="#0f2040" roughness={0.5} metalness={0.6} opacity={0.75} transparent />
            </mesh>
          )}

          {/* Floor marker per allée */}
          <mesh position={[cx, 0.08, SILO_Z_CENTER]}>
            <boxGeometry args={[ALLEE_WIDTH - 0.5, 0.04, SILO_DEPTH - 1]} />
            <meshStandardMaterial
              color={['#1e3a5f', '#162d4f', '#1e3a5f', '#162d4f', '#1e3a5f'][i]}
              roughness={0.7}
              metalness={0.2}
              opacity={0.6}
              transparent
            />
          </mesh>

          {/* Allée label */}
          <Billboard position={[cx, SILO_HEIGHT + 1.5, SILO_Z_CENTER]}>
            <Text fontSize={1.0} color="#93c5fd" anchorX="center" outlineWidth={0.07} outlineColor="#000">
              {`A${i + 1}`}
            </Text>
          </Billboard>

          {/* Palette racks (simplified) */}
          <RackBlock alleeCenterX={cx} siloZCenter={SILO_Z_CENTER} />
        </group>
      ))}

      {/* ══ 2 TRANSFERTS AUTOMATISÉS (entre allées, axe Z) ════════════════ */}

      {TRANSFER_X.map((tx, i) => (
        <group key={`transfer-${i}`}>
          {/* Transfer belt */}
          <ConveyorBelt
            position={[tx, TRANSFER_Y, SILO_Z_CENTER]}
            args={[TRANSFER_W, TRANSFER_H, SILO_DEPTH - 1]}
            color="#e879f9"
            speed={1.5 + i * 0.3}
            label={`Transfert auto. ${i + 1}`}
            labelOffset={[0, 2.2, 0]}
          />

          {/* Guide rails on each side */}
          {[-1, 1].map(side => (
            <mesh key={side} position={[tx + side * (TRANSFER_W / 2 + 0.15), TRANSFER_Y + 0.3, SILO_Z_CENTER]}>
              <boxGeometry args={[0.1, 0.25, SILO_DEPTH - 1]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ══ CONVOYEUR TRANSVERSAL (toute la superficie du site) ══════════ */}

      <ConveyorBelt
        position={[SILO_X_CENTER, TRANS_Y, TRANS_Z]}
        args={[TRANS_W, TRANS_H, CONV_W]}
        color="#f59e0b"
        speed={1.0}
        label="Convoyeur transversal — toute la superficie du site"
        labelOffset={[0, 2.2, 0]}
      />

      {/* Guide rails for transversal */}
      {[-1, 1].map(side => (
        <mesh key={side} position={[SILO_X_CENTER, TRANS_Y + 0.35, TRANS_Z + side * (CONV_W / 2 + 0.15)]}>
          <boxGeometry args={[TRANS_W, 0.2, 0.1]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}

      {/* ══ CONVOYEUR ENTRÉE SILO (Q2 → silo) ═══════════════════════════ */}

      <ConveyorBelt
        position={[Q2_X - 1.2, CONV_Y, CONV_Z_MID]}
        args={[CONV_W, CONV_H, CONV_LENGTH]}
        color="#22d3ee"
        speed={1.2}
        label="↑ Entrée Silo"
        labelOffset={[0, 2.0, 0]}
      />

      {/* Rails entrée */}
      {[-1, 1].map(side => (
        <mesh key={side} position={[Q2_X - 1.2 + side * (CONV_W / 2 + 0.15), CONV_Y + 0.3, CONV_Z_MID]}>
          <boxGeometry args={[0.1, 0.2, CONV_LENGTH]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}

      {/* ══ CONVOYEUR SORTIE SILO (silo → Q2) ═══════════════════════════ */}

      <ConveyorBelt
        position={[Q2_X + 1.2, CONV_Y, CONV_Z_MID]}
        args={[CONV_W, CONV_H, CONV_LENGTH]}
        color="#f87171"
        speed={1.2}
        label="↓ Sortie Silo"
        labelOffset={[0, 2.0, 0]}
      />

      {/* Rails sortie */}
      {[-1, 1].map(side => (
        <mesh key={side} position={[Q2_X + 1.2 + side * (CONV_W / 2 + 0.15), CONV_Y + 0.3, CONV_Z_MID]}>
          <boxGeometry args={[0.1, 0.2, CONV_LENGTH]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}

      {/* ══ SILO MAIN LABEL ═══════════════════════════════════════════════ */}

      <Billboard position={[SILO_X_CENTER, SILO_HEIGHT + 4, SILO_Z_CENTER]}>
        <Text fontSize={2.2} color="#e0f2fe" anchorX="center" fontWeight="bold" outlineWidth={0.14} outlineColor="#000">
          SILO AUTOMATISÉ
        </Text>
        <Text fontSize={1.1} color="#7dd3fc" anchorX="center" position={[0, -2.8, 0]} outlineWidth={0.07} outlineColor="#000">
          5 allées · 30 m hauteur · 13 200 places palette
        </Text>
      </Billboard>

      {/* Height indicator bar on left side */}
      <mesh position={[SILO_X_LEFT - 1.5, SILO_Y_CENTER, SILO_Z_CENTER]}>
        <boxGeometry args={[0.18, SILO_HEIGHT, 0.18]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} roughness={0.3} metalness={0.6} />
      </mesh>
      <Billboard position={[SILO_X_LEFT - 3.5, SILO_Y_CENTER, SILO_Z_CENTER]}>
        <Text fontSize={0.85} color="#7dd3fc" anchorX="center" outlineWidth={0.05} outlineColor="#000">
          30 m
        </Text>
      </Billboard>

    </group>
  )
}
