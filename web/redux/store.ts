import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import languageReducer from "./slices/languageSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      language: languageReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
