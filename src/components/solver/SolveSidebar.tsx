import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { toggleSidebar, toggleSidebarCollapsed } from '../../store/slices/uiSlice';
import { SolveControls } from './SolveControls';
import { SolutionTimeline } from './SolutionTimeline';
import { MoveExplanation } from './MoveExplanation';
import { SpeedControl } from './SpeedControl';

export function SolveSidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const sidebar = useSelector((state: RootState) => state.ui.sidebar);
  const solveStatus = useSelector((state: RootState) => state.solve.status);
  const steps = useSelector((state: RootState) => state.solve.steps);
  const currentStepIndex = useSelector((state: RootState) => state.ui.playback.currentStepIndex);

  if (!sidebar.isOpen) {
    return (
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 p-3 transition-all duration-300"
        style={{
          background: 'var(--gradient-primary)',
          borderTopRightRadius: '8px',
          borderBottomRightRadius: '8px',
          boxShadow: '0 0 12px rgba(59, 130, 246, 0.2)',
        }}
        aria-label="Open solve sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,6 15,12 9,18" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className={`fixed left-0 top-[72px] h-[calc(100vh-72px)] z-40 transition-all duration-300 animate-slide-in ${
        sidebar.isCollapsed ? 'w-16' : 'w-80'
      }`}
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(59, 130, 246, 0.15)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4"
        style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.1)' }}
      >
        {!sidebar.isCollapsed && (
          <h2 
            className="text-sm uppercase tracking-wider"
            style={{ 
              fontFamily: "'Orbitron', sans-serif",
              color: 'var(--accent-primary)',
            }}
          >
            Solution
          </h2>
        )}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className="p-2 rounded transition-all duration-200"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--accent-primary)',
            }}
            aria-label={sidebar.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ transform: sidebar.isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
            >
              <polyline points="9,6 15,12 9,18" />
            </svg>
          </button>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded transition-all duration-200"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--accent-secondary)',
            }}
            aria-label="Close sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {!sidebar.isCollapsed && (
        <div className="flex flex-col h-[calc(100%-60px)] overflow-hidden">
          {/* Status Section */}
          <div className="p-4" style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <h3 
              className="text-xs uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-muted)', fontFamily: "'Orbitron', sans-serif" }}
            >
              Status
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded"
                style={{
                  background: solveStatus === 'solved' 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : solveStatus === 'solving'
                    ? 'rgba(59, 130, 246, 0.1)'
                    : solveStatus === 'error'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(100, 116, 139, 0.1)',
                }}
              >
                {solveStatus === 'solving' && (
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: 'var(--accent-primary)' }}
                  />
                )}
                <span 
                  className="text-sm font-semibold capitalize"
                  style={{
                    color: solveStatus === 'solved' 
                      ? 'var(--accent-success)' 
                      : solveStatus === 'solving'
                      ? 'var(--accent-primary)'
                      : solveStatus === 'error'
                      ? 'var(--accent-error)'
                      : 'var(--text-secondary)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {solveStatus}
                </span>
              </div>
            </div>
            
            {/* Progress indicator */}
            {solveStatus === 'solved' && steps.length > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ color: 'var(--accent-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {currentStepIndex + 1} / {steps.length}
                  </span>
                </div>
                <div 
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                      background: 'var(--gradient-primary)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4" style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <h3 
              className="text-xs uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-muted)', fontFamily: "'Orbitron', sans-serif" }}
            >
              Controls
            </h3>
            <SolveControls />
          </div>

          {/* Speed control */}
          <div className="p-4" style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <SpeedControl />
          </div>

          {/* Move explanation */}
          <div className="p-4" style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <MoveExplanation />
          </div>

          {/* Timeline */}
          <div className="flex-1 p-4 overflow-y-auto">
            <SolutionTimeline />
          </div>
        </div>
      )}
      
      {/* Collapsed view */}
      {sidebar.isCollapsed && solveStatus === 'solved' && steps.length > 0 && (
        <div className="flex flex-col items-center p-2 gap-2">
          <div 
            className="text-lg font-bold"
            style={{ color: 'var(--accent-primary)', fontFamily: "'Orbitron', sans-serif" }}
          >
            {currentStepIndex + 1}
          </div>
          <div 
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            of {steps.length}
          </div>
        </div>
      )}
    </div>
  );
}
