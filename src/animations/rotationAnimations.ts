import { gsap } from 'gsap';
import { Group } from 'three';
import type { Face } from '../utils/colorUtils';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration?: number;
  ease?: string;
  reducedMotion?: boolean;
}

const DEFAULT_CONFIG: Required<AnimationConfig> = {
  duration: 0.3,
  ease: 'power2.out',
  reducedMotion: false,
};

/**
 * Get rotation axis and angle for a face rotation
 */
function getRotationAxisAndAngle(face: Face, direction: number): { axis: 'x' | 'y' | 'z', angle: number } {
  const baseAngle = (Math.PI / 2) * direction; // 90 degrees per direction unit
  
  switch (face) {
    case 'U': // Up face - rotate around Y axis
      return { axis: 'y', angle: baseAngle };
    case 'D': // Down face - rotate around Y axis (opposite)
      return { axis: 'y', angle: -baseAngle };
    case 'L': // Left face - rotate around X axis
      return { axis: 'x', angle: baseAngle };
    case 'R': // Right face - rotate around X axis (opposite)
      return { axis: 'x', angle: -baseAngle };
    case 'F': // Front face - rotate around Z axis
      return { axis: 'z', angle: baseAngle };
    case 'B': // Back face - rotate around Z axis (opposite)
      return { axis: 'z', angle: -baseAngle };
  }
}

/**
 * Animate a face rotation
 * Returns a GSAP timeline that can be awaited
 */
export function animateFaceRotation(
  cubieGroups: Group[],
  face: Face,
  direction: number,
  config: AnimationConfig = {}
): gsap.core.Timeline {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (finalConfig.reducedMotion) {
    // For reduced motion, use very short duration
    finalConfig.duration = 0.01;
  }

  const { axis, angle } = getRotationAxisAndAngle(face, direction);
  const timeline = gsap.timeline();

  // Filter cubies that should rotate for this face
  const rotatingCubies = getCubiesForFace(cubieGroups, face);

  // Animate each cubie's rotation
  rotatingCubies.forEach((cubie) => {
    const currentRotation = cubie.rotation[axis];
    const targetRotation = currentRotation + angle;
    
    timeline.to(
      cubie.rotation,
      {
        [axis]: targetRotation,
        duration: finalConfig.duration,
        ease: finalConfig.ease,
      },
      0 // Start all animations at the same time
    );
  });

  return timeline;
}

/**
 * Get cubie groups that should rotate for a given face
 */
function getCubiesForFace(cubieGroups: Group[], face: Face): Group[] {
  // This is a simplified version - in practice, you'd need to check
  // the cubie's position to determine if it's on the specified face
  // For now, we'll rotate all cubies (this should be optimized later)
  return cubieGroups;
}

/**
 * Create an animation queue to prevent overlapping animations
 */
export class AnimationQueue {
  private queue: Array<() => Promise<void>> = [];
  private running = false;

  async add(animationFn: () => Promise<void>): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(async () => {
        await animationFn();
        resolve();
      });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running || this.queue.length === 0) return;
    
    this.running = true;
    while (this.queue.length > 0) {
      const animation = this.queue.shift()!;
      await animation();
    }
    this.running = false;
  }

  clear(): void {
    this.queue = [];
  }
}

