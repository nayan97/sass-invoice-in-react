import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
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
  company_id: number | null;
}

// ─── Safe JSON parse helper ───────────────────────────────────────────────────

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === "undefined") return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user:            safeParse<User | null>("user", null),
  access_token:    localStorage.getItem("access_token"),
  token_type:      localStorage.getItem("token_type"),
  isAuthenticated: !!localStorage.getItem("access_token"),
  roles:           safeParse<string[]>("roles", []),
  permissions:     safeParse<string[]>("permissions", []),
  company_id:      safeParse<number | null>("company_id", null),
};

// ─── Slice ────────────────────────────────────────────────────────────────────

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
        company_id: number | null;
      }>
    ) => {
      const { user, access_token, token_type, roles, permissions, company_id } = action.payload;

      state.user           = user;
      state.access_token   = access_token;
      state.token_type     = token_type;
      state.isAuthenticated = true;
      state.roles          = roles;
      state.permissions    = permissions;
      state.company_id     = company_id;

      localStorage.setItem("user",         JSON.stringify(user));
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("token_type",   token_type);
      localStorage.setItem("roles",        JSON.stringify(roles));
      localStorage.setItem("permissions",  JSON.stringify(permissions));
      localStorage.setItem("company_id",   JSON.stringify(company_id ?? null));
    },

    setCompanyId: (state, action: PayloadAction<number | null>) => {
      state.company_id = action.payload;
      localStorage.setItem("company_id", JSON.stringify(action.payload ?? null));
    },

    logout: (state) => {
      state.user            = null;
      state.access_token    = null;
      state.token_type      = null;
      state.isAuthenticated = false;
      state.roles           = [];
      state.permissions     = [];
      state.company_id      = null;

      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("roles");
      localStorage.removeItem("permissions");
      localStorage.removeItem("company_id");
    },
  },
});

export const { setCredentials, setCompanyId, logout } = authSlice.actions;
export default authSlice.reducer;