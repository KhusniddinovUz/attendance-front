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

export const register = createAsyncThunk('auth/register', async (payload, {rejectWithValue}) => {
  try {
    const {data} = await axios.post(`${url}/api/teacher/register/`, payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Registration failed');
  }
});

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
      console.log("login pending");
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      console.log("login done", action.payload);
    });
    builder.addCase(login.rejected, state => {
      state.isLoading = false;
      console.log("login rejected");
    });
    builder.addCase(register.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    })
    builder.addCase(register.rejected, state => {
      state.isLoading = false;
    });
  }
},);

export const {logout, setCredentials} = authSlice.actions;
export default authSlice.reducer;
