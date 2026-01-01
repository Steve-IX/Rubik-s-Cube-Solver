import React, { useRef, useMemo } from 'react';
import { Group, Color as ThreeColor } from 'three';
import type { Color, Face } from '../../utils/colorUtils';
import { COLOR_TO_RGB } from '../../utils/colorUtils';

interface CubieProps {
  position: [number, number, number];
  colors: Partial<Record<Face, Color>>;
  size?: number;
  gap?: number;
}

/**
 * Individual cubie (small cube) component
 * Each cubie can have up to 3 visible faces with rounded stickers
 */
export function Cubie({ position, colors, size = 1, gap = 0.04 }: CubieProps) {
  const groupRef = useRef<Group>(null);
  const stickerSize = size - gap * 2;
  const halfSize = size / 2;
  const stickerOffset = halfSize + 0.001; // Slight offset to prevent z-fighting
  const borderRadius = 0.08;

  const stickerMaterials = useMemo(() => {
    const materials: Partial<Record<Face, { color: ThreeColor; emissive: ThreeColor }>> = {};
    const faces: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
    
    for (const face of faces) {
      if (colors[face]) {
        const rgb = COLOR_TO_RGB[colors[face]!];
        const color = new ThreeColor(rgb[0], rgb[1], rgb[2]);
        const emissive = new ThreeColor(rgb[0] * 0.1, rgb[1] * 0.1, rgb[2] * 0.1);
        materials[face] = { color, emissive };
      }
    }
    return materials;
  }, [colors]);

  return (
    <group ref={groupRef} position={position}>
      {/* Core cube - dark plastic look */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size * 0.98, size * 0.98, size * 0.98]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      
      {/* Rounded corner edges */}
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial 
          color="#0a0a0a"
          roughness={0.6}
          metalness={0}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Face stickers with glow effect */}
      {colors.U && stickerMaterials.U && (
        <mesh position={[0, stickerOffset, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <planeGeometry args={[stickerSize, stickerSize]} />
          <meshStandardMaterial
            color={stickerMaterials.U.color}
            emissive={stickerMaterials.U.emissive}
            roughness={0.2}
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
            roughness={0.2}
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
            roughness={0.2}
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
            roughness={0.2}
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
            roughness={0.2}
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
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
}
