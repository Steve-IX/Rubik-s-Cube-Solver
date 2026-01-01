import type { CubeState } from '../models/CubeState';

export interface SolverMessage {
  type: 'init' | 'solve' | 'cancel';
  payload?: {
    cubeState?: CubeState;
  };
}

export interface SolverResponse {
  type: 'init' | 'solve' | 'cancel' | 'error';
  success?: boolean;
  payload?: {
    solution: string;
    moves: string[];
  };
  error?: string;
}

/**
 * Solver worker wrapper
 * Handles communication with the Web Worker
 */
export class SolverWorker {
  private worker: Worker | null = null;
  private initialized = false;
  private initializationFailed = false;

  constructor() {
    try {
      this.worker = new Worker(new URL('./solver.worker.ts', import.meta.url), {
        type: 'module',
      });
      
      // Add error handler for worker errors
      this.worker.onerror = (error) => {
        console.error('Worker creation/runtime error:', error);
        this.initializationFailed = true;
      };
      
    } catch (error) {
      console.error('Failed to create solver worker:', error);
      this.worker = null;
      this.initializationFailed = true;
    }
  }

  /**
   * Check if worker is available
   */
  isAvailable(): boolean {
    return this.worker !== null && !this.initializationFailed;
  }

  async initialize(): Promise<void> {
    if (!this.worker || this.initialized) {
      if (this.initializationFailed) {
        throw new Error('Worker initialization previously failed - worker is not available');
      }
      return;
    }

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        const error = new Error('Worker not available - worker creation may have failed');
        console.error(error);
        this.initializationFailed = true;
        reject(error);
        return;
      }

      const timeout = setTimeout(() => {
        const error = new Error('Solver initialization timeout after 10 seconds. The cubejs library may not be compatible with Web Workers.');
        console.error(error);
        this.worker?.removeEventListener('message', handler);
        this.initializationFailed = true;
        reject(error);
      }, 10000);

      const handler = (event: MessageEvent<SolverResponse>) => {
        if (event.data.type === 'init' && event.data.success) {
          clearTimeout(timeout);
          this.worker?.removeEventListener('message', handler);
          this.initialized = true;
          this.initializationFailed = false;
          console.log('Solver worker initialized successfully');
          resolve();
        } else if (event.data.type === 'error') {
          clearTimeout(timeout);
          this.worker?.removeEventListener('message', handler);
          const error = new Error(event.data.error || 'Initialization failed');
          console.error('Solver worker initialization error:', error);
          this.initializationFailed = true;
          reject(error);
        }
      };

      this.worker.addEventListener('message', handler);
      this.worker.postMessage({ type: 'init' });
    });
  }

  async solve(cubeState: CubeState): Promise<{ solution: string; moves: string[] }> {
    if (!this.worker) {
      throw new Error('Worker not available');
    }

    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      // Increase timeout to 120 seconds - complex solves can take time
      const timeout = setTimeout(() => {
        this.worker?.removeEventListener('message', handler);
        reject(new Error('Solve timeout after 120 seconds. The cube may be in an unsolvable state or the solve is taking longer than expected.'));
      }, 120000); // 120 seconds

      let handlerCleanup: (() => void) | null = null;
      
      const handler = (event: MessageEvent<SolverResponse | { type: string; message?: string }>) => {
        // Handle progress updates
        if (event.data.type === 'solve-progress') {
          const progressData = event.data as { type: string; message?: string };
          console.log('Solve progress:', progressData.message);
          return; // Don't resolve/reject on progress updates
        }
        
        if (event.data.type === 'solve' && 'success' in event.data && event.data.success && event.data.payload) {
          clearTimeout(timeout);
          if (handlerCleanup) handlerCleanup();
          console.log('Solve completed, received solution from worker');
          resolve(event.data.payload);
        } else if (event.data.type === 'error') {
          clearTimeout(timeout);
          if (handlerCleanup) handlerCleanup();
          const errorMsg = 'error' in event.data ? event.data.error : 'Solve failed';
          console.error('Solve error from worker:', errorMsg);
          reject(new Error(errorMsg));
        }
      };

      this.worker?.addEventListener('message', handler);
      handlerCleanup = () => {
        this.worker?.removeEventListener('message', handler);
      };

      console.log('Sending solve request to worker...');
      this.worker?.postMessage({
        type: 'solve',
        payload: { cubeState },
      });
    });
  }

  cancel(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'cancel' });
    }
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }
}

