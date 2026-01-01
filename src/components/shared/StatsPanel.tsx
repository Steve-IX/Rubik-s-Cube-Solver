import { useSelector } from 'react-redux';
import type { RootState } from '../../store/types';

export function StatsPanel() {
  const history = useSelector((state: RootState) => state.history);
  const solveStatus = useSelector((state: RootState) => state.solve.status);
  const steps = useSelector((state: RootState) => state.solve.steps);

  return (
    <div 
      className="absolute bottom-6 left-6 panel-cyber p-4 animate-fade-in"
      style={{ minWidth: '200px' }}
    >
      <h3 
        className="text-xs uppercase tracking-wider mb-3"
        style={{ color: 'var(--accent-primary)', fontFamily: "'Orbitron', sans-serif" }}
      >
        Statistics
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Moves Made</span>
          <span 
            className="font-bold text-lg"
            style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}
          >
            {history.past.length}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Undo Stack</span>
          <span 
            className="font-bold text-lg"
            style={{ color: 'var(--text-primary)', fontFamily: "'Orbitron', sans-serif" }}
          >
            {history.future.length}
          </span>
        </div>
        
        {solveStatus === 'solved' && (
          <div className="flex justify-between items-center pt-2 mt-2" style={{ borderTop: '1px solid rgba(0, 240, 255, 0.2)' }}>
            <span style={{ color: 'var(--accent-success)' }} className="text-sm">Solution</span>
            <span 
              className="font-bold text-lg"
              style={{ color: 'var(--accent-success)', fontFamily: "'Orbitron', sans-serif" }}
            >
              {steps.length} moves
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

