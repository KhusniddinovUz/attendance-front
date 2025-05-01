import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  expiresAt: null, requestData: {
    name: "notchosen", group_name: "notchosen", date: "", para: "notchosen"
  },
};

const attendanceSlice = createSlice({
  name: 'attendance', initialState: initialState, reducers: {
    turnOn: (state, action) => {
      state.expiresAt = Date.now() + 60000; // 1 minute
      state.requestData = action.payload;
    }, turnOff: (state) => {
      state.expiresAt = null;
      state.requestData = {
        name: "notchosen", group_name: "notchosen", date: "", para: "notchosen"
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
