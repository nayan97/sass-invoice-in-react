import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: string[];
}

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  jwt_version: number;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: string[];
}

interface AuthState {
  user: User | null;
  access_token: string | null;
  token_type: string | null;
  isAuthenticated: boolean;
  roles: string[];
  permissions: string[];
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  access_token: localStorage.getItem("access_token"),
  token_type: localStorage.getItem("token_type"),
  isAuthenticated: !!localStorage.getItem("access_token"),
  roles: JSON.parse(localStorage.getItem("roles") || "[]"),
  permissions: JSON.parse(localStorage.getItem("permissions") || "[]"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        access_token: string;
        token_type: string;
        roles: string[];
        permissions: string[];
      }>
    ) => {
      const { user, access_token, token_type, roles, permissions } = action.payload;

      state.user = user;
      state.access_token = access_token;
      state.token_type = token_type;
      state.isAuthenticated = true;
      state.roles = roles;
      state.permissions = permissions;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("token_type", token_type);
      localStorage.setItem("roles", JSON.stringify(roles));
      localStorage.setItem("permissions", JSON.stringify(permissions));
    },

    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.token_type = null;
      state.isAuthenticated = false;
      state.roles = [];
      state.permissions = [];

      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("roles");
      localStorage.removeItem("permissions");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;