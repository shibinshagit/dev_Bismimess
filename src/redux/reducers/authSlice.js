
import { createSlice } from '@reduxjs/toolkit';

const userInitialState = {
  token: null,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: "auth",
  initialState: userInitialState,
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload.token;
    },
    logout(state) {
      state.token = null;
    },
  }
});

export const { loginSuccess, logout, } = authSlice.actions;
export default authSlice.reducer;