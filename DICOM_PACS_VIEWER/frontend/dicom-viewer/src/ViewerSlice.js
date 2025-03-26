// viewerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Async thunk: Fetch images for a given patient ID.
 */
export const fetchImages = createAsyncThunk(
  'viewer/fetchImages',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/images?patientId=${patientId}`);
      const urls = response.data.images || [];
      return urls;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Our main slice for viewer-related state:
 * - patientId
 * - images array
 * - currentIndex
 * - metadata (for the currently displayed image)
 * - status/loading
 * - error
 */
const viewerSlice = createSlice({
  name: 'viewer',
  initialState: {
    patientId: '',
    images: [],
    currentIndex: 0,
    metadata: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    setPatientId: (state, action) => {
      state.patientId = action.payload;
    },
    setCurrentIndex: (state, action) => {
      state.currentIndex = action.payload;
    },
    setMetadata: (state, action) => {
      state.metadata = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.images = [];
        state.currentIndex = 0;
        state.metadata = null;
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.images = action.payload; // array of image URLs
        // Reset everything else so user sees the first loaded image
        state.currentIndex = 0;
        state.metadata = null;
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch images';
      });
  },
});

export const { setPatientId, setCurrentIndex, setMetadata } = viewerSlice.actions;
export default viewerSlice.reducer;
