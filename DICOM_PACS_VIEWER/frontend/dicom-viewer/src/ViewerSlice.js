// ViewerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

function getBackendUrl() {
  // If our env.js was loaded, it sets window._env_
  // Use that if it’s available; otherwise, fall back to a default
  if (window._env_ && window._env_.REACT_APP_BACKEND_URL) {
    return window._env_.REACT_APP_BACKEND_URL;
  }
  return 'http://localhost:5001'; // some default fallback
}
/**
 * Async thunk: Start retrieve (C-FIND + C-MOVE in background) for a patient,
 * then keep polling for images until done.
 */
export const startRetrieve = createAsyncThunk(
  'viewer/startRetrieve',
  async (patientId, { dispatch, rejectWithValue }) => {
    try {
      // 1) Start retrieval
      const backendUrl = getBackendUrl();
      const startResp = await axios.get(`${backendUrl}/api/start_retrieve?patientId=${patientId}`);
      if (startResp.data.error) {
        return rejectWithValue(startResp.data.error);
      }

      // 2) Return patientId so we can do a polling loop in extraReducers
      return { patientId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Async thunk: Poll the server for the list of images. We do NOT
 * wait for them all before returning. The server returns any images so far.
 * If done=true, we know we've received everything.
 */
export const pollImages = createAsyncThunk(
  'viewer/pollImages',
  async (patientId, { rejectWithValue }) => {
    try {
      const backendUrl = getBackendUrl();
      const resp = await axios.get(`${backendUrl}/api/images?patientId=${patientId}`);
      return {
        images: resp.data.images || [],
        done: resp.data.done,
        error: resp.data.error,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

let pollInterval = null;

const viewerSlice = createSlice({
  name: 'viewer',
  initialState: {
    patientId: '',
    images: [],
    currentIndex: 0,
    metadata: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    done: false,    // indicates if the retrieval is done
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
    clearImages: (state) => {
      state.images = [];
      state.currentIndex = 0;
      state.metadata = null;
      state.done = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // START RETRIEVE
    builder.addCase(startRetrieve.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.done = false;
    });
    builder.addCase(startRetrieve.fulfilled, (state, action) => {
      state.status = 'loading'; 
      // We remain in "loading" because we haven't got the images yet
      // We'll poll in the background
    });
    builder.addCase(startRetrieve.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to start retrieval';
    });

    // POLL IMAGES
    builder.addCase(pollImages.pending, (state) => {
      // no change needed or:
      // state.status = 'loading';
    });
    builder.addCase(pollImages.fulfilled, (state, action) => {
      // Update the images array, done status, etc.
      const { images, done, error } = action.payload;
      // If new images arrived, we update state.images
      state.images = images;
      if (error) {
        state.error = error;
      }
      if (done) {
        state.done = true;
        state.status = 'succeeded';
      } else {
        // not done yet
        state.status = 'loading';
      }
    });
    builder.addCase(pollImages.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to poll images';
    });
  },
});

// Export actions
export const { setPatientId, setCurrentIndex, setMetadata, clearImages } = viewerSlice.actions;

// A helper to start polling in an interval
export const beginPolling = (patientId) => (dispatch, getState) => {
  // Clear any existing poll
  if (pollInterval) {
    clearInterval(pollInterval);
  }
  pollInterval = setInterval(async () => {
    const { viewer } = getState();
    // if we've finished or encountered error, stop
    if (viewer.done || viewer.status === 'failed') {
      clearInterval(pollInterval);
      pollInterval = null;
      return;
    }
    // otherwise poll
    dispatch(pollImages(patientId));
  }, 2000); // e.g. every 2 seconds
};

// A helper to stop polling if needed
export const stopPolling = () => () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

export default viewerSlice.reducer;
