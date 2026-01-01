import type { Color, Face } from '../../utils/colorUtils';
import { FACE_TO_COLOR, COLOR_TO_HEX, FACE_NAMES } from '../../utils/colorUtils';

interface FaceNetProps {
  face: Face;
  colors: Color[][];
  selectedSticker: { face: Face; row: number; col: number } | null;
  onStickerClick: (face: Face, row: number, col: number) => void;
  isCenterLocked?: boolean;
}

export function FaceNet({
  face,
  colors,
  selectedSticker,
  onStickerClick,
  isCenterLocked = true,
}: FaceNetProps) {
  const isCenter = (row: number, col: number) => row === 1 && col === 1;

  return (
    <div className="flex flex-col items-center">
      {/* Face label */}
      <div 
        className="text-xs uppercase tracking-wider mb-2 px-2 py-1 rounded"
        style={{ 
          fontFamily: "'Orbitron', sans-serif",
          color: 'var(--accent-primary)',
          background: 'rgba(59, 130, 246, 0.1)',
        }}
      >
        {FACE_NAMES[face]}
      </div>
      
      {/* 3x3 grid */}
      <div 
        className="grid grid-cols-3 gap-1 p-2 rounded"
        style={{ background: 'rgba(0, 0, 0, 0.3)' }}
      >
        {colors.map((row, rowIdx) =>
          row.map((color, colIdx) => {
            const isSelected =
              selectedSticker?.face === face &&
              selectedSticker?.row === rowIdx &&
              selectedSticker?.col === colIdx;
            const isLocked = isCenter(rowIdx, colIdx) && isCenterLocked;

            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => !isLocked && onStickerClick(face, rowIdx, colIdx)}
                disabled={isLocked}
                className="relative w-10 h-10 rounded transition-all duration-200"
                style={{
                  backgroundColor: COLOR_TO_HEX[color],
                  border: isSelected 
                    ? '3px solid var(--accent-primary)' 
                    : '2px solid rgba(0, 0, 0, 0.5)',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isSelected 
                    ? '0 0 10px rgba(59, 130, 246, 0.3)' 
                    : 'inset 0 2px 4px rgba(0,0,0,0.2)',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.8 : 1,
                }}
                title={
                  isLocked
                    ? `Center (${FACE_TO_COLOR[face]})`
                    : `Click to change color`
                }
              >
                {isLocked && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ 
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '4px',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
