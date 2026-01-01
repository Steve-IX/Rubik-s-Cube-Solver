import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { setMode } from '../../store/slices/uiSlice';
import type { AppMode } from '../../models/UIState';

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const MapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
  </svg>
);

const SolveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const modes: { value: AppMode; label: string; icon: React.ReactNode }[] = [
  { value: 'play', label: 'Play', icon: <PlayIcon /> },
  { value: 'mapping', label: 'Map', icon: <MapIcon /> },
  { value: 'solve', label: 'Solve', icon: <SolveIcon /> },
];

export function ModeSelector() {
  const dispatch = useDispatch<AppDispatch>();
  const currentMode = useSelector((state: RootState) => state.ui.mode);

  return (
    <div 
      className="flex p-1 rounded"
      style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(59, 130, 246, 0.15)' }}
    >
      {modes.map((mode) => {
        const isActive = currentMode === mode.value;
        return (
          <button
            key={mode.value}
            onClick={() => dispatch(setMode(mode.value))}
            className="relative px-4 py-2 rounded transition-all duration-300 flex items-center gap-2"
            style={{
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '0.75rem',
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <span className="flex items-center">{mode.icon}</span>
            <span>{mode.label}</span>
            {isActive && (
              <div 
                className="absolute inset-0 rounded"
                style={{ 
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.2)',
                  pointerEvents: 'none'
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
