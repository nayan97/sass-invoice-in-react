import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerGroupRelation {
    id: number;
    name: string;
    discount_rate: string;
}

export interface Customer {
    id: number;
    company_id: number;
    group_id: number | null;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    total_sales: string;
    total_paid: string;
    total_due: string;
    status: boolean;
    created_at: string;
    updated_at: string;
    // relation
    group: CustomerGroupRelation | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedCustomers {
    data: Customer[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CustomerPayload {
    group_id?: number | null;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;   // TODO: confirm — plain string/URL, na file upload (FormData) lagbe?
    status?: boolean;
}

export interface CustomerListParams {
    companyId: number;
    page?: number;
    per_page?: number;
    search?: string;
    group_id?: number | "all";
    status?: "active" | "inactive" | "all";
    sort_by?: string;
    sort_dir?: "asc" | "desc";
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const customerApi = baseApi
    .enhanceEndpoints({ addTagTypes: ["Customer"] })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ── List ─────────────────────────────────────────────────────────
            getCustomers: builder.query<PaginatedCustomers, CustomerListParams>({
                query: ({ companyId, page = 1, per_page = 15, search, group_id, status, sort_by, sort_dir }) => {
                    const params = new URLSearchParams({
                        page: String(page),
                        per_page: String(per_page),
                    });
                    if (search && search !== "") params.set("search", search);
                    if (group_id && group_id !== "all") params.set("group_id", String(group_id));
                    if (status && status !== "all") params.set("status", status);
                    if (sort_by) params.set("sort_by", sort_by);
                    if (sort_dir) params.set("sort_dir", sort_dir);

                    return `/companies/${companyId}/customers?${params}`;
                },

                transformResponse: (response: any): PaginatedCustomers => ({
                    data: response.original.data ?? [],
                    meta: {
                        current_page: response.original.current_page,
                        last_page: response.original.last_page,
                        per_page: response.original.per_page,
                        total: response.original.total,
                        from: response.original.from ?? 0,
                        to: response.original.to ?? 0,
                    },
                }),

                providesTags: (result, _err, { companyId }) =>
                    result
                        ? [
                            ...result.data.map(({ id }) => ({ type: "Customer" as const, id })),
                            { type: "Customer", id: `LIST-${companyId}` },
                        ]
                        : [{ type: "Customer", id: `LIST-${companyId}` }],
            }),

            // ── Single ───────────────────────────────────────────────────────
            getCustomer: builder.query<Customer, { companyId: number; customerId: number }>({
                query: ({ companyId, customerId }) =>
                    `/companies/${companyId}/customers/${customerId}`,

                transformResponse: (response: any): Customer =>
                    response.data ?? response,

                providesTags: (_result, _err, { customerId }) => [
                    { type: "Customer", id: customerId },
                ],
            }),

            // ── Create (FormData — avatar upload) ────────────────────────────
            createCustomer: builder.mutation<Customer, { companyId: number; formData: FormData }>({
                query: ({ companyId, formData }) => ({
                    url: `/companies/${companyId}/customers`,
                    method: "POST",
                    body: formData,
                }),

                transformResponse: (response: any): Customer =>
                    response.data ?? response,

                invalidatesTags: (_result, _err, { companyId }) => [
                    { type: "Customer", id: `LIST-${companyId}` },
                ],
            }),

            // ── Update (FormData — avatar upload) ────────────────────────────
            updateCustomer: builder.mutation<
                Customer,
                { companyId: number; customerId: number; formData: FormData }
            >({
                query: ({ companyId, customerId, formData }) => ({
                    url: `/companies/${companyId}/customers/${customerId}`,
                    method: "PATCH", // multipart workaround
                    body: formData,
                }),

                transformResponse: (response: any): Customer =>
                    response.data ?? response,

                invalidatesTags: (_result, _err, { companyId, customerId }) => [
                    { type: "Customer", id: customerId },
                    { type: "Customer", id: `LIST-${companyId}` },
                ],
            }),

            // ── Delete ───────────────────────────────────────────────────────
            deleteCustomer: builder.mutation<
                { message: string },
                { companyId: number; customerId: number }
            >({
                query: ({ companyId, customerId }) => ({
                    url: `/companies/${companyId}/customers/${customerId}`,
                    method: "DELETE",
                }),

                invalidatesTags: (_result, _err, { companyId, customerId }) => [
                    { type: "Customer", id: customerId },
                    { type: "Customer", id: `LIST-${companyId}` },
                ],
            }),
        }),
    });

export const {
    useGetCustomersQuery,
    useGetCustomerQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
} = customerApi;