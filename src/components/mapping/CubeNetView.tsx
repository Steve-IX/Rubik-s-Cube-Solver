import { useState } from 'react';
import type { CubeState } from '../../models/CubeState';
import { cloneCubeState } from '../../models/CubeState';
import type { Face, Color } from '../../utils/colorUtils';
import { FaceNet } from './FaceNet';
import { ColorPicker } from './ColorPicker';
import { MappingValidator } from './MappingValidator';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { setCubeState } from '../../store/slices/cubeSlice';

interface CubeNetViewProps {
  cubeState: CubeState;
}

export function CubeNetView({ cubeState }: CubeNetViewProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<{
    face: Face;
    row: number;
    col: number;
  } | null>(null);
  const [localState, setLocalState] = useState<CubeState>(cloneCubeState(cubeState));

  const handleStickerClick = (face: Face, row: number, col: number) => {
    if (row === 1 && col === 1) {
      return;
    }

    if (selectedColor) {
      const newState = cloneCubeState(localState);
      newState.faces[face][row][col] = selectedColor;
      setLocalState(newState);
      dispatch(setCubeState(newState));
    } else {
      setSelectedSticker({ face, row, col });
    }
  };

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
    if (selectedSticker) {
      const newState = cloneCubeState(localState);
      newState.faces[selectedSticker.face][selectedSticker.row][selectedSticker.col] = color;
      setLocalState(newState);
      dispatch(setCubeState(newState));
      setSelectedSticker(null);
    }
  };

  return (
    <div 
      className="w-full h-full p-8 overflow-auto"
      style={{ background: 'transparent' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 
            className="text-3xl font-bold mb-3"
            style={{ 
              fontFamily: "'Orbitron', sans-serif",
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Map Your Cube
          </h2>
          <div className="max-w-2xl mx-auto">
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
              Select a color from the palette, then click on any sticker to apply it.
            </p>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs">
              Center stickers are locked and cannot be changed.
            </p>
          </div>
        </div>

        {/* Color picker and validator */}
        <div className="flex gap-4 mb-8 flex-wrap justify-center">
          <ColorPicker
            selectedColor={selectedColor}
            onColorSelect={handleColorSelect}
          />
          <MappingValidator />
        </div>

        {/* Net layout */}
        <div 
          className="panel-cyber p-6 inline-block mx-auto"
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, auto)' }}>
            {/* Row 1: U face */}
            <div></div>
            <FaceNet
              face="U"
              colors={localState.faces.U}
              selectedSticker={selectedSticker}
              onStickerClick={handleStickerClick}
            />
            <div></div>
            <div></div>

            {/* Row 2: L, F, R, B faces */}
            <FaceNet
              face="L"
              colors={localState.faces.L}
              selectedSticker={selectedSticker}
              onStickerClick={handleStickerClick}
            />
            <FaceNet
              face="F"
              colors={localState.faces.F}
              selectedSticker={selectedSticker}
              onStickerClick={handleStickerClick}
            />
            <FaceNet
              face="R"
              colors={localState.faces.R}
              selectedSticker={selectedSticker}
              onStickerClick={handleStickerClick}
            />
            <FaceNet
              face="B"
              colors={localState.faces.B}
              selectedSticker={selectedSticker}
              onStickerClick={handleStickerClick}
            />

            {/* Row 3: D face */}
            <div></div>
            <FaceNet
              face="D"
              colors={localState.faces.D}
              selectedSticker={selectedSticker}
              onStickerClick={handleStickerClick}
            />
            <div></div>
            <div></div>
          </div>
        </div>

        {/* Instructions */}
        <div 
          className="mt-8 p-4 rounded"
          style={{ 
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.15)',
          }}
        >
          <div className="flex items-start gap-3 max-w-2xl mx-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-warning)' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Validation Tip
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Each color must appear exactly 9 times (once per face) for a valid cube configuration. The validator will show you any issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
