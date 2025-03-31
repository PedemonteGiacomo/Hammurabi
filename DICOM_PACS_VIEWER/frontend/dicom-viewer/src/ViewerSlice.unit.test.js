// viewerSlice.unit.test.js
import viewerReducer, {
  fetchImages,
  setPatientId,
  setCurrentIndex,
  setMetadata,
} from './ViewerSlice';

describe('ViewerSlice - Unit Tests', () => {
  const initialState = {
    patientId: '',
    images: [],
    currentIndex: 0,
    metadata: null,
    status: 'idle',
    error: null,
  };

  it('should return the initial state on first run', () => {
    const result = viewerReducer(undefined, { type: '@@INIT' });
    expect(result).toEqual(initialState);
  });

  it('should set patientId when setPatientId is dispatched', () => {
    const state = viewerReducer(initialState, setPatientId('ABC123'));
    expect(state.patientId).toBe('ABC123');
  });

  it('should set currentIndex when setCurrentIndex is dispatched', () => {
    const state = viewerReducer(initialState, setCurrentIndex(5));
    expect(state.currentIndex).toBe(5);
  });

  it('should set metadata when setMetadata is dispatched', () => {
    const sampleMeta = { group: { TagName: 'Value' } };
    const state = viewerReducer(initialState, setMetadata(sampleMeta));
    expect(state.metadata).toEqual(sampleMeta);
  });

  it('should handle fetchImages.pending action', () => {
    const action = { type: fetchImages.pending.type };
    const state = viewerReducer(initialState, action);
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
    expect(state.images).toEqual([]);
  });

  it('should handle fetchImages.fulfilled action', () => {
    const action = {
      type: fetchImages.fulfilled.type,
      payload: ['url1', 'url2'],
    };
    const state = viewerReducer(initialState, action);
    expect(state.status).toBe('succeeded');
    expect(state.images).toEqual(['url1', 'url2']);
  });

  it('should handle fetchImages.rejected action', () => {
    const action = {
      type: fetchImages.rejected.type,
      payload: 'Not found',
    };
    const state = viewerReducer(initialState, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Not found');
  });
});
