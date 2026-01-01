import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CubeState } from '../../models/CubeState';
import { createSolvedCubeState } from '../../models/CubeState';
import { scrambleCube } from '../../engine/CubeScrambler';

interface CubeStateSlice {
  currentState: CubeState;
}

// Start with a scrambled cube instead of solved
const initialSolvedState = createSolvedCubeState();
const { scrambledState } = scrambleCube(initialSolvedState, 25);

const initialState: CubeStateSlice = {
  currentState: scrambledState,
};

const cubeSlice = createSlice({
  name: 'cube',
  initialState,
  reducers: {
    setCubeState: (state, action: PayloadAction<CubeState>) => {
      state.currentState = action.payload;
    },
    resetCube: (state) => {
      state.currentState = createSolvedCubeState();
    },
    updateCubeState: (state, action: PayloadAction<Partial<CubeState>>) => {
      state.currentState = { ...state.currentState, ...action.payload };
    },
  },
});

export const { setCubeState, resetCube, updateCubeState } = cubeSlice.actions;
export default cubeSlice.reducer;

