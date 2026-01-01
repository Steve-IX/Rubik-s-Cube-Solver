import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { setCurrentStepIndex, setPlaybackPlaying } from '../../store/slices/uiSlice';

export function SolutionTimeline() {
  const dispatch = useDispatch<AppDispatch>();
  const solveSteps = useSelector((state: RootState) => state.solve.steps);
  const currentStepIndex = useSelector((state: RootState) => state.ui.playback.currentStepIndex);

  if (solveSteps.length === 0) {
    return (
      <div className="text-center py-8">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-30" style={{ color: 'var(--accent-primary)' }}>
          <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2" />
        </svg>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          No solution available yet.
        </p>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">
          Click "Solve Cube" to generate a solution.
        </p>
      </div>
    );
  }

  const handleStepClick = (index: number) => {
    dispatch(setCurrentStepIndex(index));
    dispatch(setPlaybackPlaying(false));
  };

  return (
    <div>
      <h3 
        className="text-xs uppercase tracking-wider mb-3"
        style={{ color: 'var(--accent-primary)', fontFamily: "'Orbitron', sans-serif" }}
      >
        Moves
      </h3>
      
      {/* Move grid */}
      <div className="grid grid-cols-5 gap-1">
        {solveSteps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isPast = index < currentStepIndex;
          
          return (
            <button
              key={step.index}
              onClick={() => handleStepClick(index)}
              className="relative p-2 rounded text-center transition-all duration-200"
              style={{
                background: isActive 
                  ? 'var(--gradient-primary)' 
                  : isPast 
                  ? 'rgba(0, 255, 136, 0.1)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: isActive 
                  ? 'var(--bg-primary)' 
                  : isPast 
                  ? 'var(--accent-success)' 
                  : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: isActive 
                  ? 'transparent' 
                  : isPast 
                  ? 'rgba(0, 255, 136, 0.3)' 
                  : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isActive ? '0 0 15px rgba(0, 240, 255, 0.4)' : 'none',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
              }}
              title={`Move ${index + 1}: ${step.move.notation}`}
            >
              {step.move.notation}
            </button>
          );
        })}
      </div>
      
      {/* Notation string */}
      <div 
        className="mt-4 p-3 rounded text-xs break-all"
        style={{ 
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(0, 240, 255, 0.1)',
          color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {solveSteps.map((step, i) => (
          <span 
            key={i}
            className="inline-block mr-1 cursor-pointer hover:underline transition-colors"
            style={{
              color: i === currentStepIndex 
                ? 'var(--accent-primary)' 
                : i < currentStepIndex 
                ? 'var(--accent-success)' 
                : 'var(--text-muted)',
              fontWeight: i === currentStepIndex ? 700 : 400,
            }}
            onClick={() => handleStepClick(i)}
          >
            {step.move.notation}
          </span>
        ))}
      </div>
    </div>
  );
}
