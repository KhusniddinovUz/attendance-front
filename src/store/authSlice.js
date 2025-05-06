import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {url} from "../data/api.js";

export const login = createAsyncThunk('auth/login', async (credentials, {rejectWithValue}) => {
  try {
    const {data} = await axios.post(`${url}/api/teacher/login/`, credentials);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Login failed');
  }
});

export const adminLogin = createAsyncThunk('auth/adminLogin', async (payload, {rejectWithValue}) => {
  try {
    const {data} = await axios.post(`${url}/api/teacher/admin-login/`, payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Admin Login failed');
  }
});

export const updateUserInfo = createAsyncThunk('auth/update', async (payload, {rejectWithValue}) => {
  try {
    const {data} = await axios.get(`${url}/api/teacher/profile/`, {
      headers: {"Authorization": `Token ${payload}`},
    });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Update failed');
  }
})

const authSlice = createSlice({
  name: 'auth', initialState: {
    user: null, token: null, isLoggedIn: false, isLoading: false,
  }, reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
    }, setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
  }, extraReducers: builder => {
    builder.addCase(login.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(adminLogin.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(adminLogin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.token = action.payload.token;
    })
    builder.addCase(adminLogin.rejected, state => {
      state.isLoading = false;
    });
    builder.addCase(updateUserInfo.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(updateUserInfo.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.user = action.payload;
    })
    builder.addCase(updateUserInfo.rejected, state => {
      state.isLoading = false;
    });
  }
},);

export const {logout, setCredentials} = authSlice.actions;
export default authSlice.reducer;
