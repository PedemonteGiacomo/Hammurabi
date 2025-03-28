// viewerSlice.int.test.js
import { configureStore } from '@reduxjs/toolkit';
import viewerReducer, { fetchImages } from './ViewerSlice';
import axios from 'axios';

// Mock axios so no real network requests are made
jest.mock('axios');

describe('ViewerSlice - Integration Tests', () => {
  let store;

  beforeEach(() => {
    // Create a fresh store before each test
    store = configureStore({
      reducer: {
        viewer: viewerReducer,
      },
    });
  });

  it('dispatch(fetchImages) → updates state on success', async () => {
    // Mock success
    axios.get.mockResolvedValueOnce({
      data: { images: ['url1', 'url2'] },
    });

    // Dispatch the thunk
    await store.dispatch(fetchImages('PATIENT_123'));

    // Check final store state
    const state = store.getState().viewer;
    expect(state.status).toBe('succeeded');
    expect(state.images).toEqual(['url1', 'url2']);
    expect(state.error).toBeNull();
  });

  it('dispatch(fetchImages) → updates state on error', async () => {
    // Mock error
    axios.get.mockRejectedValueOnce({
      response: { data: { error: 'Not found' } },
    });

    await store.dispatch(fetchImages('PATIENT_123'));

    const state = store.getState().viewer;
    expect(state.status).toBe('failed');
    expect(state.images).toEqual([]);
    expect(state.error).toBe('Not found');
  });
});
