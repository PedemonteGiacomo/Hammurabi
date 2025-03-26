// store.js
import { configureStore } from '@reduxjs/toolkit';
import viewerReducer from './../ViewerSlice';

export const store = configureStore({
  reducer: {
    viewer: viewerReducer,
  },
});

export default store;
