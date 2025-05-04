import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  expiresAt: null, requestData: {
    group_name: "notchosen", date: "", para: "notchosen", teacher_name: null,
  },
};

const attendanceSlice = createSlice({
  name: 'attendance', initialState: initialState, reducers: {
    turnOn: (state, action) => {
      state.expiresAt = Date.now() + action.payload.expirationTimer; // 1 minute
      state.requestData = action.payload.lesson;
    }, turnOff: (state) => {
      state.expiresAt = null;
      state.requestData = {
        group_name: "notchosen", date: "", para: "notchosen", teacher_name: null,
      };
    },
  },
});

export const {turnOn, turnOff} = attendanceSlice.actions;
export default attendanceSlice.reducer;

export const selectAttendanceState = (state) => {
  const {expiresAt, requestData} = state.attendance;
  const isActive = expiresAt !== null && Date.now() < expiresAt;
  return {expiresAt, isActive, requestData};
};
