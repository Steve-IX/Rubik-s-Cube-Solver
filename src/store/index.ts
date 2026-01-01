import { configureStore } from '@reduxjs/toolkit';
import cubeReducer from './slices/cubeSlice';
import uiReducer from './slices/uiSlice';
import solveReducer from './slices/solveSlice';
import historyReducer from './slices/historySlice';
import type { RootState } from './types';

export const store = configureStore({
  reducer: {
    cube: cubeReducer,
    ui: uiReducer,
    solve: solveReducer,
    history: historyReducer,
  },
});

export type AppDispatch = typeof store.dispatch;

// Typed hooks
export type { RootState };

