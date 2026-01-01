import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { undo, redo } from '../../store/slices/historySlice';
import { setCubeState } from '../../store/slices/cubeSlice';
import { useCallback } from 'react';
import { createSolvedCubeState } from '../../models/CubeState';

export function UndoRedo() {
  const dispatch = useDispatch<AppDispatch>();
  const history = useSelector((state: RootState) => state.history);

  const handleUndo = useCallback(() => {
    if (history.past.length > 0) {
      const previousIndex = history.past.length - 2;
      const previousState = previousIndex >= 0 
        ? history.past[previousIndex].state 
        : null;
      
      dispatch(undo());
      
      if (previousState) {
        dispatch(setCubeState(previousState));
      } else {
        dispatch(setCubeState(createSolvedCubeState()));
      }
    }
  }, [dispatch, history.past]);

  const handleRedo = useCallback(() => {
    if (history.future.length > 0) {
      const nextEntry = history.future[history.future.length - 1];
      dispatch(redo());
      dispatch(setCubeState(nextEntry.state));
    }
  }, [dispatch, history.future]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return (
    <div className="flex gap-1">
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className="p-2 rounded transition-all duration-200"
        style={{
          background: canUndo ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
          border: '1px solid',
          borderColor: canUndo ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
          color: canUndo ? 'var(--accent-primary)' : 'var(--text-muted)',
          opacity: canUndo ? 1 : 0.5,
          cursor: canUndo ? 'pointer' : 'not-allowed',
        }}
        title="Undo (Ctrl+Z)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10h10a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H8" />
          <polyline points="8,5 3,10 8,15" />
        </svg>
      </button>
      <button
        onClick={handleRedo}
        disabled={!canRedo}
        className="p-2 rounded transition-all duration-200"
        style={{
          background: canRedo ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
          border: '1px solid',
          borderColor: canRedo ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
          color: canRedo ? 'var(--accent-primary)' : 'var(--text-muted)',
          opacity: canRedo ? 1 : 0.5,
          cursor: canRedo ? 'pointer' : 'not-allowed',
        }}
        title="Redo (Ctrl+Y)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10H11a5 5 0 0 0-5 5v0a5 5 0 0 0 5 5h5" />
          <polyline points="16,5 21,10 16,15" />
        </svg>
      </button>
    </div>
  );
}
