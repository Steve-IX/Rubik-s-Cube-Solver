import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Raycaster, Vector3 } from 'three';
import type { Face } from '../../utils/colorUtils';

interface CubeControlsProps {
  onFaceClick?: (face: Face) => void;
}

/**
 * Component to handle cube interactions (click detection)
 */
export function CubeControls({ onFaceClick }: CubeControlsProps) {
  const { camera, scene, gl } = useThree();
  const raycasterRef = useRef(new Raycaster());

  // Handle click events
  const handleClick = (event: MouseEvent) => {
    if (!onFaceClick) return;

    // Normalize pointer coordinates
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera({ x, y } as any, camera);

    // Find intersected objects
    const intersects = raycasterRef.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      // Determine which face was clicked based on intersection
      // This is a simplified version - in practice, you'd check the cubie and face
      const face = determineFaceFromIntersection(intersects[0]);
      if (face) {
        onFaceClick(face);
      }
    }
  };

  // Attach click handler
  useFrame(() => {
    gl.domElement.addEventListener('click', handleClick);
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  });

  return null;
}

/**
 * Determine which face was clicked from intersection data
 * This is a simplified version - would need proper face detection
 */
function determineFaceFromIntersection(_intersection: any): Face | null {
  // This is a placeholder - actual implementation would check the cubie position
  // and intersection normal to determine the face
  // For now, return null to avoid incorrect face detection
  return null;
}

