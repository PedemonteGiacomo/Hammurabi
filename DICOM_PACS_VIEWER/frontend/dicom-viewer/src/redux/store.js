// store.js
import { configureStore } from '@reduxjs/toolkit';
import viewerReducer from './viewerSlice';

export const store = configureStore({
  reducer: {
    viewer: viewerReducer,
  },
});

export default store;
