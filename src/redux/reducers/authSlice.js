import { BaseUrl } from '@/constants/BaseUrl';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk for fetching customers
export const fetchCustomers = createAsyncThunk(
  'auth/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BaseUrl}/api/users`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk for fetching Orders
export const fetchOrders = createAsyncThunk(
  'auth/fetchOrders',
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BaseUrl}/company/fetchdata/${companyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userInitialState = {
  token: null,
  customers: [],
  orders: [],
  att: [],
  period: 'NA',
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
    attREf(state, action) {
      state.att = action.payload.att;
    },
    updateUserAttendance(state, action) {
      const { phone, period, status } = action.payload;
      const userIndex = state.att.findIndex(user => user.phone === phone);
      
      if (userIndex !== -1) {
        // Update the attendance for the specific period
        state.att[userIndex] = {
          ...state.att[userIndex],
          attendance: status // Directly update attendance if not period-specific
        };
      }
    },
    updateCustomers(state, action) {
      state.customers = action.payload.customers;
    },
    logout(state) {
      state.token = null;
      state.customers = [];
      state.orders = [];
    },
    setOrders(state, action) {
      state.orders = action.payload.orders;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
        state.loading = false;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { loginSuccess, logout, setOrders, updateCustomers, attREf, updateUserAttendance } = authSlice.actions;
export default authSlice.reducer;
