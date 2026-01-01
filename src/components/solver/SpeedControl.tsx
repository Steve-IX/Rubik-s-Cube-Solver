import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { setPlaybackSpeed } from '../../store/slices/uiSlice';

const speedPresets = [0.5, 1, 1.5, 2, 3];

export function SpeedControl() {
  const dispatch = useDispatch<AppDispatch>();
  const speed = useSelector((state: RootState) => state.ui.playback.speed);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    dispatch(setPlaybackSpeed(newSpeed));
  };

  const handlePresetClick = (preset: number) => {
    dispatch(setPlaybackSpeed(preset));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 
          className="text-xs uppercase tracking-wider"
          style={{ color: 'var(--text-muted)', fontFamily: "'Orbitron', sans-serif" }}
        >
          Speed
        </h3>
        <span 
          className="text-lg font-bold"
          style={{ 
            color: 'var(--accent-primary)',
            fontFamily: "'Orbitron', sans-serif",
          }}
        >
          {speed.toFixed(1)}x
        </span>
      </div>
      
      {/* Slider */}
      <input
        type="range"
        min="0.5"
        max="3"
        step="0.1"
        value={speed}
        onChange={handleSpeedChange}
        className="w-full mb-3"
      />
      
      {/* Presets */}
      <div className="flex gap-1">
        {speedPresets.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className="flex-1 py-1 rounded text-xs transition-all duration-200"
            style={{
              background: Math.abs(speed - preset) < 0.05 
                ? 'var(--gradient-primary)' 
                : 'rgba(255, 255, 255, 0.05)',
              color: Math.abs(speed - preset) < 0.05 
                ? 'var(--bg-primary)' 
                : 'var(--text-muted)',
              border: '1px solid',
              borderColor: Math.abs(speed - preset) < 0.05 
                ? 'transparent' 
                : 'rgba(255, 255, 255, 0.1)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {preset}x
          </button>
        ))}
      </div>
    </div>
  );
}
