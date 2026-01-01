import type { Color } from '../../utils/colorUtils';
import { COLORS, COLOR_TO_HEX, COLOR_NAMES } from '../../utils/colorUtils';

interface ColorPickerProps {
  selectedColor: Color | null;
  onColorSelect: (color: Color) => void;
  disabled?: boolean;
}

export function ColorPicker({ selectedColor, onColorSelect, disabled = false }: ColorPickerProps) {
  return (
    <div 
      className="panel-cyber p-4 flex items-center gap-3"
    >
      <span 
        className="text-xs uppercase tracking-wider"
        style={{ 
          color: 'var(--text-muted)',
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        Color:
      </span>
      
      <div className="flex gap-2">
        {COLORS.map((color) => {
          const isSelected = selectedColor === color;
          return (
            <button
              key={color}
              onClick={() => !disabled && onColorSelect(color)}
              disabled={disabled}
              className="relative w-10 h-10 rounded transition-all duration-200"
              style={{
                backgroundColor: COLOR_TO_HEX[color],
                border: isSelected 
                  ? '3px solid var(--accent-primary)' 
                  : '2px solid rgba(255, 255, 255, 0.2)',
                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                boxShadow: isSelected 
                  ? `0 0 12px ${COLOR_TO_HEX[color]}60` 
                  : 'none',
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
              title={COLOR_NAMES[color]}
            >
              {isSelected && (
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ 
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
