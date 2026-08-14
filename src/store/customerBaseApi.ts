import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const customerBaseApi = createApi({
  reducerPath: "customerBaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:8000/api",
    // baseUrl: "https://api.businessinvoice.net/api",
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      const token = localStorage.getItem("customer_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["CustomerPortalProfile", "CustomerPortalAddress", "CustomerPortalInvoice"],
  endpoints: () => ({}),
});