import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import { customerBaseApi } from "./customerBaseApi";
import authReducer from "./authSlice";
import customerAuthReducer from "./customerAuthSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [customerBaseApi.reducerPath]: customerBaseApi.reducer,
    auth: authReducer,
    customerAuth: customerAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, customerBaseApi.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;