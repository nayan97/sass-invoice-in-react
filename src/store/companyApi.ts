import { baseApi } from "./baseApi";

export interface Address {
    id: number;
    company_id: number;
    type: string;
    address_line: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface Company {
    id: number;
    owner_id: number;
    name: string;
    slug: string;
    email: string;
    logo: string | null;
    phone: string;
    tax_number: string;
    timezone: string;
    currency: string;
    plan: string;
    trial_ends_at: string | null;
    status: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    addresses: Address[];
}

export interface CompanyPayload {
    name: string;
    email: string;
    phone?: string;
    tax_number?: string;
    timezone?: string;
    currency?: string;
}

export const companyApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["Company"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET ALL COMPANIES
            // ================================
            getAllCompanies: builder.query<Company[], void>({
                query: () => `/companies`,

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (result) =>
                    result
                        ? [
                            ...result.map(({ id }) => ({ type: "Company" as const, id })),
                            { type: "Company", id: "LIST" },
                        ]
                        : [{ type: "Company", id: "LIST" }],
            }),

            // ================================
            // GET COMPANY BY ID
            // ================================
            getCompanyById: builder.query<Company, number>({
                query: (id) => `/companies/${id}`,

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (_result, _error, id) => [
                    { type: "Company", id },
                ],
            }),

            // ================================
            // UPDATE COMPANY
            // ================================
            updateCompany: builder.mutation<Company, { id: number; data: Partial<CompanyPayload> }>({
                query: ({ id, data }) => ({
                    url: `/companies/${id}`,
                    method: "PUT",
                    body: data,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, { id }) => [
                    { type: "Company", id },
                    { type: "Company", id: "LIST" },
                ],
            }),

            // ================================
            // DELETE COMPANY
            // ================================
            deleteCompany: builder.mutation<{ message: string }, number>({
                query: (id) => ({
                    url: `/companies/${id}`,
                    method: "DELETE",
                }),

                invalidatesTags: (_result, _error, id) => [
                    { type: "Company", id },
                    { type: "Company", id: "LIST" },
                ],
            }),
        }),
    });

export const {
    useGetAllCompaniesQuery,
    useGetCompanyByIdQuery,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
} = companyApi;