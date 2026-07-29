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

export interface CompanyInfo {
    id: number;
    name: string;
    email: string;
    phone: string;
    tax_number: string;
}

export interface CompanyAddressesResponse {
    company: CompanyInfo;
    addresses: Address[];
}

export interface AddressPayload {
    type: string;
    address_line: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    is_default?: boolean;
}

export const companyAddressApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["CompanyAddress"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

        // ================================
        // GET ALL ADDRESSES FOR A COMPANY (+ company info)
        // ================================
        getCompanyAddresses: builder.query<CompanyAddressesResponse, number>({
            query: (companyId) => `/companies/${companyId}/addresses`,

            transformResponse: (response: any) => ({
                company: response.company,
                addresses: response.data ?? [],
            }),

            providesTags: (result, _error, companyId) =>
                result
                    ? [
                        ...result.addresses.map(({ id }) => ({ type: "CompanyAddress" as const, id })),
                        { type: "CompanyAddress", id: `LIST-${companyId}` },
                    ]
                    : [{ type: "CompanyAddress", id: `LIST-${companyId}` }],
        }),

            // ================================
            // CREATE ADDRESS
            // ================================
            createCompanyAddress: builder.mutation<Address, { companyId: number; data: AddressPayload }>({
                query: ({ companyId, data }) => ({
                    url: `/companies/${companyId}/addresses`,
                    method: "POST",
                    body: data,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, { companyId }) => [
                    { type: "CompanyAddress", id: `LIST-${companyId}` },
                ],
            }),

            // ================================
            // UPDATE ADDRESS
            // ================================
            updateCompanyAddress: builder.mutation<Address, { companyId: number; addressId: number; data: Partial<AddressPayload> }>({
                query: ({ companyId, addressId, data }) => ({
                    url: `/companies/${companyId}/addresses/${addressId}`,
                    method: "PUT",
                    body: data,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, { companyId, addressId }) => [
                    { type: "CompanyAddress", id: addressId },
                    { type: "CompanyAddress", id: `LIST-${companyId}` },
                ],
            }),

            // ================================
            // DELETE ADDRESS
            // ================================
            deleteCompanyAddress: builder.mutation<{ message: string }, { companyId: number; addressId: number }>({
                query: ({ companyId, addressId }) => ({
                    url: `/companies/${companyId}/addresses/${addressId}`,
                    method: "DELETE",
                }),

                invalidatesTags: (_result, _error, { companyId, addressId }) => [
                    { type: "CompanyAddress", id: addressId },
                    { type: "CompanyAddress", id: `LIST-${companyId}` },
                ],
            }),
        }),
    });

export const {
    useGetCompanyAddressesQuery,
    useCreateCompanyAddressMutation,
    useUpdateCompanyAddressMutation,
    useDeleteCompanyAddressMutation,
} = companyAddressApi;