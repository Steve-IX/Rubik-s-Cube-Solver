import { useSelector } from 'react-redux';
import type { RootState } from '../../store/types';
import { validateCubeState } from '../../utils/validation';

export function MappingValidator() {
  const cubeState = useSelector((state: RootState) => state.cube.currentState);
  const validation = validateCubeState(cubeState);

  if (validation.isValid) {
    return (
      <div 
        className="panel-cyber p-4 flex items-center gap-3"
        style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}
      >
        <div 
          className="w-10 h-10 rounded flex items-center justify-center"
          style={{ 
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--accent-success)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <div 
            className="text-sm font-semibold"
            style={{ color: 'var(--accent-success)' }}
          >
            Valid Configuration
          </div>
          <div 
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Ready to solve!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="panel-cyber p-4"
      style={{ borderColor: 'rgba(239, 68, 68, 0.2)', maxWidth: '300px' }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--accent-error)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <div>
          <div 
            className="text-sm font-semibold mb-2"
            style={{ color: 'var(--accent-error)' }}
          >
            Invalid Configuration
          </div>
          <ul className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
            {validation.errors.slice(0, 3).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
            {validation.errors.length > 3 && (
              <li>• +{validation.errors.length - 3} more issues</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
