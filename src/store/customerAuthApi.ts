import { baseApi } from "./baseApi";

export const customerAuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestCustomerOtp: builder.mutation<
      { message: string },
      { company: string; email: string }
    >({
      query: ({ company, email }) => ({
        url: `/customer-portal/${company}/otp/request`,
        method: "POST",
        body: { email },
      }),
    }),
    verifyCustomerOtp: builder.mutation<
      { token: string },
      { company: string; email: string; otp: string }
    >({
      query: ({ company, email, otp }) => ({
        url: `/customer-portal/${company}/otp/verify`,
        method: "POST",
        body: { email, otp },
      }),
    }),
  }),
});

export const {
  useRequestCustomerOtpMutation,
  useVerifyCustomerOtpMutation,
} = customerAuthApi;