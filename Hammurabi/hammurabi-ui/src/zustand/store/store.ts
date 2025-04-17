// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import viewerReducer from './viewerSlice';
import userReducer from './userSlice';

const store = configureStore({
  reducer: {
    viewer: viewerReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
