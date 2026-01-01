import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SolveSession } from '../../models/SolveSession';
import type { SolveStep } from '../../models/SolveStep';
import type { CubeState } from '../../models/CubeState';
import { createSolvedCubeState } from '../../models/CubeState';

const initialState: SolveSession = {
  id: '',
  initialState: createSolvedCubeState(),
  steps: [],
  status: 'idle',
};

const solveSlice = createSlice({
  name: 'solve',
  initialState,
  reducers: {
    startSolving: (state, action: PayloadAction<CubeState>) => {
      state.status = 'solving';
      state.initialState = action.payload;
      state.steps = [];
      state.error = undefined;
    },
    setSolution: (state, action: PayloadAction<{ steps: SolveStep[]; solutionString: string }>) => {
      state.steps = action.payload.steps;
      state.solutionString = action.payload.solutionString;
      state.status = 'solved';
    },
    setSolvingError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    resetSolve: (state) => {
      state.id = '';
      state.initialState = initialState.initialState;
      state.steps = [];
      state.status = 'idle';
      state.solutionString = undefined;
      state.error = undefined;
    },
  },
});

export const { startSolving, setSolution, setSolvingError, resetSolve } = solveSlice.actions;
export default solveSlice.reducer;

