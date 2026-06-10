import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // baseUrl: "http://127.0.0.1:8000/api",
    baseUrl: "https://api.businessinvoice.net/api",
    prepareHeaders: (headers, { getState }) => {
      headers.set("Accept", "application/json");
      const token = (getState() as any).auth.access_token || localStorage.getItem("access_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Product", "Order"],
  endpoints: () => ({}),
});
