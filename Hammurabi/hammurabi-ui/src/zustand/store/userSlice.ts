// // src/store/userSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface UserState {
//   profile: any; // You can add a stricter type here if you wish
//   isAuthenticated: boolean;
// }

// const initialState: UserState = {
//   profile: null,
//   isAuthenticated: false,
// };

// const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     setUserProfile(state, action: PayloadAction<any>) {
//       state.profile = action.payload;
//       state.isAuthenticated = !!action.payload;
//     },
//     clearUserProfile(state) {
//       state.profile = null;
//       state.isAuthenticated = false;
//     },
//   },
// });

// export const { setUserProfile, clearUserProfile } = userSlice.actions;
// export default userSlice.reducer;

export {}