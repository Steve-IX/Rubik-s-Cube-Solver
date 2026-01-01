import { useSelector } from 'react-redux';
import type { RootState } from '../../store/types';
import { getMoveExplanation } from '../../models/Move';
import { FACE_NAMES } from '../../utils/colorUtils';

export function MoveExplanation() {
  const playback = useSelector((state: RootState) => state.ui.playback);
  const solveSteps = useSelector((state: RootState) => state.solve.steps);

  if (solveSteps.length === 0) {
    return null;
  }

  const currentStep = solveSteps[playback.currentStepIndex];
  if (!currentStep) {
    return (
      <div className="text-center py-4">
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          Select a step to see details
        </p>
      </div>
    );
  }

  const explanation = getMoveExplanation(currentStep.move);
  const faceName = FACE_NAMES[currentStep.move.face];
  const direction = currentStep.move.direction === 1 
    ? 'Clockwise' 
    : currentStep.move.direction === -1 
    ? 'Counter-clockwise' 
    : 'Half turn';

  return (
    <div>
      <h3 
        className="text-xs uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-muted)', fontFamily: "'Orbitron', sans-serif" }}
      >
        Current Move
      </h3>
      
      {/* Big notation display */}
      <div 
        className="text-center py-5 rounded mb-4"
        style={{ 
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}
      >
        <div 
          className="text-5xl font-bold"
          style={{ 
            color: 'var(--accent-primary)',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '0.1em',
          }}
        >
          {currentStep.move.notation}
        </div>
      </div>
      
      {/* Details - more scannable */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: 'rgba(59, 130, 246, 0.1)' }}>
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Face</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{faceName}</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: 'rgba(59, 130, 246, 0.1)' }}>
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Direction</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{direction}</span>
        </div>
        <div className="flex justify-between items-center py-1.5">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Step</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--accent-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
            {playback.currentStepIndex + 1} / {solveSteps.length}
          </span>
        </div>
      </div>
      
      {/* Plain English instruction */}
      <div 
        className="p-3 rounded text-sm flex items-start gap-2.5"
        style={{ 
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          color: 'var(--text-secondary)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-secondary)' }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <span className="leading-relaxed">{explanation}</span>
      </div>
    </div>
  );
}
