import { useRef } from 'react';
import { Color as ThreeColor } from 'three';
import type { Color } from '../../utils/colorUtils';
import { COLOR_TO_RGB } from '../../utils/colorUtils';

interface CubeStickerProps {
  color: Color;
  position: [number, number, number];
  size?: number;
}

export function CubeSticker({ color, position, size = 0.9 }: CubeStickerProps) {
  const meshRef = useRef<any>(null);
  const rgb = COLOR_TO_RGB[color];

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial
        color={new ThreeColor(rgb[0], rgb[1], rgb[2])}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

