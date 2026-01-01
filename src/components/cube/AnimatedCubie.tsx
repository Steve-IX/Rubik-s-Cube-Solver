import React, { useRef, useMemo, useEffect } from 'react';
import { Group, Color as ThreeColor, Matrix4, Vector3, Euler } from 'three';
import { useFrame } from '@react-three/fiber';
import type { Color, Face } from '../../utils/colorUtils';
import { COLOR_TO_RGB } from '../../utils/colorUtils';
import type { Move } from '../../models/Move';

interface AnimatedCubieProps {
  position: [number, number, number];
  colors: Partial<Record<Face, Color>>;
  size?: number;
  gap?: number;
  currentMove: Move | null;
  animationProgress: number;
  targetAngle: number;
  axis: 'x' | 'y' | 'z';
}

/**
 * Check if this cubie should rotate based on its position and the current move
 */
function shouldRotate(position: [number, number, number], face: Face | undefined): boolean {
  if (!face) return false;
  
  const [x, y, z] = position;
  const threshold = 0.5;
  
  switch (face) {
    case 'U': return y > threshold;
    case 'D': return y < -threshold;
    case 'L': return x < -threshold;
    case 'R': return x > threshold;
    case 'F': return z > threshold;
    case 'B': return z < -threshold;
    default: return false;
  }
}

export function AnimatedCubie({ 
  position, 
  colors, 
  size = 1, 
  gap = 0.04,
  currentMove,
  animationProgress,
  targetAngle,
  axis,
}: AnimatedCubieProps) {
  const groupRef = useRef<Group>(null);
  const rotationGroupRef = useRef<Group>(null);
  const stickerSize = size - gap * 2;
  const halfSize = size / 2;
  const stickerOffset = halfSize + 0.001;

  const isRotating = currentMove && shouldRotate(position, currentMove.face);

  // Apply rotation around cube center (0,0,0) using useFrame for proper matrix transformations
  useFrame(() => {
    if (groupRef.current && isRotating) {
      // Create rotation matrix around cube center
      const rotationMatrix = new Matrix4();
      const rotationEuler = new Euler();
      
      // Set rotation based on axis
      if (axis === 'x') {
        rotationEuler.set(targetAngle * animationProgress, 0, 0);
      } else if (axis === 'y') {
        rotationEuler.set(0, targetAngle * animationProgress, 0);
      } else if (axis === 'z') {
        rotationEuler.set(0, 0, targetAngle * animationProgress);
      }
      
      rotationMatrix.makeRotationFromEuler(rotationEuler);
      
      // Get cubie's position relative to cube center
      const positionVec = new Vector3(...position);
      
      // Rotate the position vector around cube center
      positionVec.applyMatrix4(rotationMatrix);
      
      // Apply the rotated position
      groupRef.current.position.copy(positionVec);
      
      // Also rotate the cubie's geometry to maintain proper orientation
      if (rotationGroupRef.current) {
        // Apply same rotation to keep stickers facing correctly as cubie orbits
        if (axis === 'x') {
          rotationGroupRef.current.rotation.x = targetAngle * animationProgress;
        } else if (axis === 'y') {
          rotationGroupRef.current.rotation.y = targetAngle * animationProgress;
        } else if (axis === 'z') {
          rotationGroupRef.current.rotation.z = targetAngle * animationProgress;
        }
      }
    } else if (groupRef.current) {
      // Reset to original position and rotation when not rotating
      groupRef.current.position.set(...position);
      if (rotationGroupRef.current) {
        rotationGroupRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  const stickerMaterials = useMemo(() => {
    const materials: Partial<Record<Face, { color: ThreeColor; emissive: ThreeColor }>> = {};
    const faces: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
    
    for (const face of faces) {
      if (colors[face]) {
        const rgb = COLOR_TO_RGB[colors[face]!];
        const color = new ThreeColor(rgb[0], rgb[1], rgb[2]);
        // Reduced emissive to make colors more vibrant and visible
        const emissive = new ThreeColor(rgb[0] * 0.08, rgb[1] * 0.08, rgb[2] * 0.08);
        materials[face] = { color, emissive };
      }
    }
    return materials;
  }, [colors]);

  // Store previous colors to detect changes
  const prevColorsRef = useRef(colors);
  
  // Update position and ensure colors are synced when props change
  useEffect(() => {
    if (groupRef.current && !isRotating) {
      groupRef.current.position.set(...position);
      // Reset rotation when not animating to ensure proper state
      if (rotationGroupRef.current) {
        rotationGroupRef.current.rotation.set(0, 0, 0);
      }
    }
    // Update colors reference
    prevColorsRef.current = colors;
  }, [position, colors, isRotating]);

  return (
    <group ref={groupRef}>
      {/* Rotation wrapper - this group rotates during animations */}
      <group ref={rotationGroupRef}>
        {/* Core cube - dark plastic look */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[size * 0.96, size * 0.96, size * 0.96]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
        
        {/* Face stickers */}
        {colors.U && stickerMaterials.U && (
          <mesh position={[0, stickerOffset, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial
              color={stickerMaterials.U.color}
              emissive={stickerMaterials.U.emissive}
              roughness={0.15}
              metalness={0.1}
            />
          </mesh>
        )}
        {colors.D && stickerMaterials.D && (
          <mesh position={[0, -stickerOffset, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial
              color={stickerMaterials.D.color}
              emissive={stickerMaterials.D.emissive}
              roughness={0.15}
              metalness={0.1}
            />
          </mesh>
        )}
        {colors.L && stickerMaterials.L && (
          <mesh position={[-stickerOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial
              color={stickerMaterials.L.color}
              emissive={stickerMaterials.L.emissive}
              roughness={0.15}
              metalness={0.1}
            />
          </mesh>
        )}
        {colors.R && stickerMaterials.R && (
          <mesh position={[stickerOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial
              color={stickerMaterials.R.color}
              emissive={stickerMaterials.R.emissive}
              roughness={0.15}
              metalness={0.1}
            />
          </mesh>
        )}
        {colors.F && stickerMaterials.F && (
          <mesh position={[0, 0, stickerOffset]} castShadow>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial
              color={stickerMaterials.F.color}
              emissive={stickerMaterials.F.emissive}
              roughness={0.15}
              metalness={0.1}
            />
          </mesh>
        )}
        {colors.B && stickerMaterials.B && (
          <mesh position={[0, 0, -stickerOffset]} rotation={[0, Math.PI, 0]} castShadow>
            <planeGeometry args={[stickerSize, stickerSize]} />
            <meshStandardMaterial
              color={stickerMaterials.B.color}
              emissive={stickerMaterials.B.emissive}
              roughness={0.15}
              metalness={0.1}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

