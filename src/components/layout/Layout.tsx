import { useSelector } from 'react-redux';
import type { RootState } from '../../store/types';
import { Cube3D } from '../cube/Cube3D';
import { ModeSelector } from '../shared/ModeSelector';
import { ScrambleReset } from '../shared/ScrambleReset';
import { UndoRedo } from '../shared/UndoRedo';
import { CubeNetView } from '../mapping/CubeNetView';
import { SolveSidebar } from '../solver/SolveSidebar';
import { SolveButton } from '../solver/SolveButton';
import { PlaybackControllerComponent } from '../solver/PlaybackController';
import { KeyboardShortcuts } from '../shared/KeyboardShortcuts';
import { StatsPanel } from '../shared/StatsPanel';
import { KeyboardHints } from '../shared/KeyboardHints';

export function Layout() {
  const cubeState = useSelector((state: RootState) => state.cube.currentState);
  const mode = useSelector((state: RootState) => state.ui.mode);
  const solveStatus = useSelector((state: RootState) => state.solve.status);
  const steps = useSelector((state: RootState) => state.solve.steps);

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Subtle background */}
      <div className="absolute inset-0" style={{ background: 'var(--gradient-bg)' }} />
      
      <KeyboardShortcuts />
      <PlaybackControllerComponent />
      
      {/* Header */}
      <header className="relative z-10 panel-cyber border-t-0 border-l-0 border-r-0">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <h1 
                className="text-2xl font-bold tracking-wider"
                style={{ 
                  fontFamily: "'Orbitron', sans-serif",
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                RUBIK SOLVER
              </h1>
              <div 
                className="absolute -bottom-1 left-0 right-0 h-px"
                style={{ background: 'var(--gradient-primary)' }}
              />
            </div>
            
            {/* Status indicator */}
            {solveStatus === 'solving' && (
              <div className="flex items-center gap-2 px-3 py-1 rounded" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <div 
                  className="w-2 h-2 rounded-full animate-pulse-glow"
                  style={{ background: 'var(--accent-primary)' }}
                />
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                  Computing
                </span>
              </div>
            )}
            {solveStatus === 'solved' && steps.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--accent-success)' }}>
                  {steps.length} moves
                </span>
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            <ModeSelector />
            
            <div className="w-px h-8" style={{ background: 'rgba(59, 130, 246, 0.15)' }} />
            
            {mode === 'play' && (
              <>
                <ScrambleReset />
                <UndoRedo />
              </>
            )}
            {mode === 'solve' && <SolveButton />}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 h-[calc(100vh-72px)] flex">
        {/* Sidebar */}
        {mode === 'solve' && <SolveSidebar />}
        
        {/* 3D View / Net View */}
        <div 
          className="flex-1 relative transition-all duration-300"
          style={{ marginLeft: mode === 'solve' ? '320px' : '0' }}
        >
          {mode === 'play' || mode === 'solve' ? (
            <Cube3D cubeState={cubeState} />
          ) : mode === 'mapping' ? (
            <CubeNetView cubeState={cubeState} />
          ) : null}
          
          {/* Stats overlay */}
          {mode === 'play' && <StatsPanel />}
          
          {/* Keyboard hints */}
          <KeyboardHints />
        </div>
      </main>
      
    </div>
  );
}
