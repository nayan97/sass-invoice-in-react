import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CustomerAuthState {
  token: string | null;
  email: string | null;
}

const initialState: CustomerAuthState = {
  token: localStorage.getItem("customer_token"),
  email: localStorage.getItem("customer_email"),
};

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    setCustomerCredentials: (
      state,
      action: PayloadAction<{ token: string; email: string }>
    ) => {
      state.token = action.payload.token;
      state.email = action.payload.email;
      localStorage.setItem("customer_token", action.payload.token);
      localStorage.setItem("customer_email", action.payload.email);
    },
    clearCustomerCredentials: (state) => {
      state.token = null;
      state.email = null;
      localStorage.removeItem("customer_token");
      localStorage.removeItem("customer_email");
    },
  },
});

export const { setCustomerCredentials, clearCustomerCredentials } =
  customerAuthSlice.actions;
export default customerAuthSlice.reducer;