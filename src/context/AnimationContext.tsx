import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import type { Move } from '../models/Move';

interface AnimationQueueItem {
  move: Move;
  onComplete?: () => void;
}

interface AnimationContextValue {
  // Queue a move for animation
  queueMove: (move: Move, onComplete?: () => void) => void;
  // Get the next move to animate
  getNextMove: () => AnimationQueueItem | null;
  // Report that animation is complete
  completeAnimation: () => void;
  // Check if currently animating
  isAnimating: boolean;
  // Current move being animated
  currentMove: Move | null;
  // Animation speed multiplier
  speed: number;
  setSpeed: (speed: number) => void;
  // Clear the queue
  clearQueue: () => void;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const queueRef = useRef<AnimationQueueItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMove, setCurrentMove] = useState<Move | null>(null);
  const [speed, setSpeed] = useState(1);
  const processingRef = useRef(false);

  const processQueue = useCallback(() => {
    if (processingRef.current || queueRef.current.length === 0) return;
    
    processingRef.current = true;
    const next = queueRef.current[0];
    setCurrentMove(next.move);
    setIsAnimating(true);
  }, []);

  const queueMove = useCallback((move: Move, onComplete?: () => void) => {
    queueRef.current.push({ move, onComplete });
    processQueue();
  }, [processQueue]);

  const getNextMove = useCallback((): AnimationQueueItem | null => {
    if (queueRef.current.length === 0) return null;
    return queueRef.current[0];
  }, []);

  const completeAnimation = useCallback(() => {
    if (queueRef.current.length > 0) {
      const completed = queueRef.current.shift();
      if (completed?.onComplete) {
        completed.onComplete();
      }
    }
    
    processingRef.current = false;
    setCurrentMove(null);
    setIsAnimating(false);
    
    // Process next in queue
    if (queueRef.current.length > 0) {
      setTimeout(processQueue, 50); // Small delay between moves
    }
  }, [processQueue]);

  const clearQueue = useCallback(() => {
    queueRef.current = [];
    processingRef.current = false;
    setCurrentMove(null);
    setIsAnimating(false);
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        queueMove,
        getNextMove,
        completeAnimation,
        isAnimating,
        currentMove,
        speed,
        setSpeed,
        clearQueue,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
}

