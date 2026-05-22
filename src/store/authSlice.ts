import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  access_token: string | null;
  token_type: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  access_token: localStorage.getItem("access_token"),
  token_type: localStorage.getItem("token_type"),
  isAuthenticated: !!localStorage.getItem("access_token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; access_token: string; token_type: string }>
    ) => {
      const { user, access_token, token_type } = action.payload;
      state.user = user;
      state.access_token = access_token;
      state.token_type = token_type;
      state.isAuthenticated = true;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("token_type", token_type);
      localStorage.setItem("isAdmin", "true"); // Keeping your previous logic
    },
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.token_type = null;
      state.isAuthenticated = false;

      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("isAdmin");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
