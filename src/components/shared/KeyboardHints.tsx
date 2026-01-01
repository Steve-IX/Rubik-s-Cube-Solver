import { useSelector } from 'react-redux';
import type { RootState } from '../../store/types';

interface HintProps {
  keys: string[];
  action: string;
}

function Hint({ keys, action }: HintProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd 
            key={i}
            className="px-2 py-1 text-xs rounded"
            style={{ 
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: 'var(--accent-primary)',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{action}</span>
    </div>
  );
}

export function KeyboardHints() {
  const mode = useSelector((state: RootState) => state.ui.mode);

  const hints = {
    play: [
      { keys: ['R'], action: 'Reset cube' },
      { keys: ['1', '2', '3'], action: 'Switch modes' },
    ],
    solve: [
      { keys: ['Space'], action: 'Play/Pause' },
      { keys: ['←', '→'], action: 'Step through' },
      { keys: ['Esc'], action: 'Exit solve' },
    ],
    mapping: [
      { keys: ['1', '2', '3'], action: 'Switch modes' },
    ],
  };

  const currentHints = hints[mode] || hints.play;

  return (
    <div 
      className="absolute bottom-6 right-6 panel-cyber p-4 animate-fade-in"
    >
      <h3 
        className="text-xs uppercase tracking-wider mb-3"
        style={{ color: 'var(--accent-secondary)', fontFamily: "'Orbitron', sans-serif" }}
      >
        Keyboard
      </h3>
      
      <div className="space-y-2">
        {currentHints.map((hint, i) => (
          <Hint key={i} keys={hint.keys} action={hint.action} />
        ))}
      </div>
    </div>
  );
}

