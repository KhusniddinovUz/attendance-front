import {configureStore, combineReducers} from "@reduxjs/toolkit";
import {persistReducer, persistStore} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";
import groupReducer from "./groupSlice";
import attendanceReducer from "./attendanceSlice";

const persistConfig = {
  key: "root", storage, whitelist: ["auth", "attendance"],
};

const rootReducer = combineReducers({
  auth: authReducer, group: groupReducer, attendance: attendanceReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer, middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: false,   // redux-persist saves non-serializable values
  }),
});

export const persistor = persistStore(store);
