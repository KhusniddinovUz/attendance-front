import {configureStore, combineReducers} from "@reduxjs/toolkit";
import {persistReducer, persistStore} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";
import groupReducer from "./groupSlice";

const persistConfig = {
  key: "root", storage, whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer, group: groupReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer, middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: false,   // redux-persist saves non-serializable values
  }),
});

export const persistor = persistStore(store);
