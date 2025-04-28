import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {url} from "../data/api.js";

export const createLesson = createAsyncThunk('lesson/create', async (payload, {rejectWithValue}) => {
  try {
    const {data} = await axios.post(`${url}/api/lesson/create/`, payload.lesson, {
      headers: {"Authorization": `Token ${payload.token}`},
    });
    return data;
  } catch (err) {
    console.log(err);
    return rejectWithValue(err.response?.data || 'Creating Lessons failed');
  }
});


export const getGroups = createAsyncThunk('group/get', async (token, {rejectWithValue}) => {
  try {
    const {data} = await axios.get(`${url}/api/group/get/`, {
      headers: {"Authorization": `Token ${token}`},
    });
    return data;
  } catch (err) {
    console.log(err);
    return rejectWithValue(err.response?.data || 'Getting Groups failed');
  }
})


const groupSlice = createSlice({
  name: 'group', initialState: {
    isLoading: false, groups: [],
  }, reducers: {}, extraReducers: builder => {
    builder.addCase(createLesson.pending, state => {
      state.isLoading = true;
      console.log("create lesson pending");
    })
    builder.addCase(createLesson.fulfilled, (state, action) => {
      state.isLoading = false;
      console.log("create lesson done", action.payload);
    });
    builder.addCase(createLesson.rejected, state => {
      state.isLoading = false;
      console.log("create lesson rejected");
    });
    //Get Groups Builders
    builder.addCase(getGroups.pending, state => {
      state.isLoading = true;
      console.log("get groups pending");
    })
    builder.addCase(getGroups.fulfilled, (state, action) => {
      state.groups = action.payload
      state.isLoading = false;
      console.log("get groups done", action.payload);
    });
    builder.addCase(getGroups.rejected, state => {
      state.isLoading = false;
      console.log("get groups rejected");
    });
  }
});

export default groupSlice.reducer;
