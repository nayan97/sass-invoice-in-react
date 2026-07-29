// File: src/store/paymentMethodsApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface PaymentMethodOption {
    id: number;
    name: string;
    code: string;
    type: string;
}

export const paymentMethodsApi = createApi({
    reducerPath: "paymentMethodsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
    endpoints: (builder) => ({
        getCompanyPaymentMethods: builder.query<PaymentMethodOption[], string>({
            query: (companyId) => `/companies/${companyId}/payment-methods`,
            transformResponse: (res: { success: boolean; data: PaymentMethodOption[] }) => res.data,
        }),
    }),
});

export const { useGetCompanyPaymentMethodsQuery } = paymentMethodsApi;