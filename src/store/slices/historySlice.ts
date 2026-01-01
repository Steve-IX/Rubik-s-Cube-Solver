import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Move } from '../../models/Move';
import type { CubeState } from '../../models/CubeState';

interface HistoryState {
  past: Array<{ move: Move; state: CubeState }>;
  future: Array<{ move: Move; state: CubeState }>;
  maxHistory: number;
}

const initialState: HistoryState = {
  past: [],
  future: [],
  maxHistory: 100,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addMove: (state, action: PayloadAction<{ move: Move; state: CubeState }>) => {
      // Add move and state to past, clear future
      state.past.push(action.payload);
      state.future = [];
      
      // Limit history size
      if (state.past.length > state.maxHistory) {
        state.past.shift();
      }
    },
    undo: (state) => {
      if (state.past.length > 0) {
        const entry = state.past.pop()!;
        state.future.push(entry);
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const entry = state.future.pop()!;
        state.past.push(entry);
      }
    },
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
    },
    setMaxHistory: (state, action: PayloadAction<number>) => {
      state.maxHistory = action.payload;
    },
  },
});

export const { addMove, undo, redo, clearHistory, setMaxHistory } = historySlice.actions;
export default historySlice.reducer;

