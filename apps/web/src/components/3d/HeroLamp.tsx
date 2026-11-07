import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

function LampModel({ isOn, onClick }: { isOn: boolean; onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const targetRotation = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 0.25 // max ~8 degrees
      const y = (e.clientY / window.innerHeight - 0.5) * 0.2
      targetRotation.current = { x: y, y: x }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.05
      groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.05
    }
  })

  // Light color warm amber
  const bulbColor = isOn ? '#F5B642' : '#333333'
  const lightIntensity = isOn ? 3.5 : 0

  return (
    <group ref={groupRef} position={[0, -1.2, 0]} onClick={onClick}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 0.15, 32]} />
        <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Stem */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.3, 16]} />
        <meshStandardMaterial color="#c5a028" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Shade (Dome / Bell shape) */}
      <mesh position={[0, 2.3, 0]}>
        <coneGeometry args={[0.85, 0.9, 32, 1, true]} />
        <meshStandardMaterial
          color="#1A222C"
          roughness={0.6}
          side={2} // THREE.DoubleSide
        />
      </mesh>

      {/* Light bulb */}
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={bulbColor}
          emissive={bulbColor}
          emissiveIntensity={isOn ? 2.5 : 0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Point light casting warm illumination downward */}
      <pointLight
        position={[0, 1.9, 0]}
        color="#F5B642"
        intensity={lightIntensity}
        distance={7}
        decay={2}
      />
    </group>
  )
}

export function HeroLamp() {
  const [isOn, setIsOn] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])

  if (reducedMotion) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <img
          src="/assets/bo-creation-logo.png"
          alt="Showroom LampeOnline"
          className="max-h-56 object-contain"
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[440px]">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-mute animate-pulse">Chargement 3D...</span>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 1, 4.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={0.6} />
          <LampModel isOn={isOn} onClick={() => setIsOn(!isOn)} />
        </Canvas>
      </Suspense>

      {/* Switch instruction pill */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsOn(!isOn)}
          className="px-3 py-1 rounded-pill bg-surface/80 backdrop-blur-sm border border-line text-[11px] font-medium text-ink hover:border-bulb transition-colors shadow-low flex items-center gap-1.5"
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isOn ? 'bg-bulb shadow-[0_0_8px_var(--bulb)]' : 'bg-mute'
            }`}
          />
          {isOn ? 'Éteindre la lampe (3D)' : 'Allumer la lampe (3D)'}
        </button>
      </div>
    </div>
  )
}
