import { customerBaseApi } from "./customerBaseApi";

// ─── Types (আগের মতোই থাকবে) ──────────────────────────────────────────
export interface CustomerAddress {
  id: number;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  is_default: boolean;
}

export interface CustomerProfileData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  addresses: CustomerAddress[];
}

export interface CustomerInvoiceListItem {
  id: number;
  invoice_no: string;
  public_token: string;
  grand_total: string;
  status: string;
  due_date:string;
  created_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
}

// ─── API ────────────────────────────────────────────────────────────────

export const customerPortalApi = customerBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerProfile: builder.query<CustomerProfileData, { company: string }>({
      query: ({ company }) => `/customer-portal/${company}/profile`,
      providesTags: ["CustomerPortalProfile"],
    }),

    updateCustomerProfile: builder.mutation<CustomerProfileData,
      { company: string; name?: string; phone?: string }
    >({
      query: ({ company, ...body }) => ({
        url: `/customer-portal/${company}/profile`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CustomerPortalProfile"],
    }),

    getCustomerAddresses: builder.query<CustomerAddress[], { company: string }>({
      query: ({ company }) => `/customer-portal/${company}/addresses`,
      providesTags: ["CustomerPortalAddress"],
    }),

    createCustomerAddress: builder.mutation<CustomerAddress,
      { company: string; label: string; line1: string; line2?: string; city: string; is_default?: boolean }
    >({
      query: ({ company, ...body }) => ({
        url: `/customer-portal/${company}/addresses`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CustomerPortalAddress"],
    }),

    updateCustomerAddress: builder.mutation<CustomerAddress,
      { company: string; id: number; label?: string; line1?: string; line2?: string; city?: string; is_default?: boolean }
    >({
      query: ({ company, id, ...body }) => ({
        url: `/customer-portal/${company}/addresses/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CustomerPortalAddress"],
    }),

    deleteCustomerAddress: builder.mutation<{ message: string }, { company: string; id: number }>({
      query: ({ company, id }) => ({
        url: `/customer-portal/${company}/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomerPortalAddress"],
    }),

    getCustomerInvoices: builder.query<PaginatedResponse<CustomerInvoiceListItem>, { company: string }>({
      query: ({ company }) => `/customer-portal/${company}/invoices`,
    }),
  }),
});

export const {
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
  useGetCustomerAddressesQuery,
  useCreateCustomerAddressMutation,
  useUpdateCustomerAddressMutation,
  useDeleteCustomerAddressMutation,
  useGetCustomerInvoicesQuery,
} = customerPortalApi;