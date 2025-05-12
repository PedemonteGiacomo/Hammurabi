// // src/store/viewerSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { SeriesInfo } from '../../components/newViewer';

// export interface ViewerMetadata {
//   patientId?: string;
//   patientName?: string;
//   patientSex?: string;
//   studyDate?: string;
//   studyDescription?: string;
//   seriesDescription?: string;
//   manufacturer?: string;
// }

// interface ViewerState {
//   selectedSeries: SeriesInfo | null;
//   metadata: ViewerMetadata | null;
// }

// const initialState: ViewerState = {
//   selectedSeries: null,
//   metadata: null,
// };

// const viewerSlice = createSlice({
//   name: 'viewer',
//   initialState,
//   reducers: {
//     setSelectedSeries(state, action: PayloadAction<SeriesInfo | null>) {
//       state.selectedSeries = action.payload;
//     },
//     setMetadata(state, action: PayloadAction<ViewerMetadata | null>) {
//       state.metadata = action.payload;
//     },
//     clearViewerState(state) {
//       state.selectedSeries = null;
//       state.metadata = null;
//     },
//   },
// });

// export const { setSelectedSeries, setMetadata, clearViewerState } = viewerSlice.actions;
// export default viewerSlice.reducer;
export {}