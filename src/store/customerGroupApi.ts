import { baseApi } from "./baseApi";

export interface CustomerGroup {
    id: number;
    company_id: string;
    name: string;
    description: string | null;
    discount_rate: string;
    created_at: string;
    updated_at: string;
    customers_count: string;
}

export interface CustomerGroupPayload {
    name: string;
    description?: string | null;
    discount_rate: number | string;
}

export const customerGroupApi = baseApi
    .enhanceEndpoints({ addTagTypes: ["CustomerGroup"] })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET ALL (plain array — no pagination)
            // ================================
            getCustomerGroups: builder.query<
                CustomerGroup[],
                { companyId: number }
            >({
                query: ({ companyId }) =>
                    `/companies/${companyId}/customer-groups`,

                transformResponse: (response: any): CustomerGroup[] =>
                    response.data ?? response,

                providesTags: (result, _error, { companyId }) =>
                    result
                        ? [
                            ...result.map(({ id }) => ({ type: "CustomerGroup" as const, id })),
                            { type: "CustomerGroup", id: `LIST-${companyId}` },
                        ]
                        : [{ type: "CustomerGroup", id: `LIST-${companyId}` }],
            }),

            // ================================
            // CREATE
            // ================================
            createCustomerGroup: builder.mutation<
                CustomerGroup,
                { companyId: number; data: CustomerGroupPayload }
            >({
                query: ({ companyId, data }) => ({
                    url: `/companies/${companyId}/customer-groups`,
                    method: "POST",
                    body: data,
                }),

                transformResponse: (response: any) => response.data || response,

                invalidatesTags: (_result, _error, { companyId }) => [
                    { type: "CustomerGroup", id: `LIST-${companyId}` },
                ],
            }),

            // ================================
            // UPDATE
            // ================================
            updateCustomerGroup: builder.mutation<
                CustomerGroup,
                { companyId: number; groupId: number; data: CustomerGroupPayload }
            >({
                query: ({ companyId, groupId, data }) => ({
                    url: `/companies/${companyId}/customer-groups/${groupId}`,
                    method: "PUT",
                    body: data,
                }),

                transformResponse: (response: any) => response.data || response,

                invalidatesTags: (_result, _error, { companyId, groupId }) => [
                    { type: "CustomerGroup", id: groupId },
                    { type: "CustomerGroup", id: `LIST-${companyId}` },
                ],
            }),

            // ================================
            // DELETE
            // ================================
            deleteCustomerGroup: builder.mutation<
                { message: string },
                { companyId: number; groupId: number }
            >({
                query: ({ companyId, groupId }) => ({
                    url: `/companies/${companyId}/customer-groups/${groupId}`,
                    method: "DELETE",
                }),

                invalidatesTags: (_result, _error, { companyId }) => [
                    { type: "CustomerGroup", id: `LIST-${companyId}` },
                ],
            }),
        }),
    });

export const {
    useGetCustomerGroupsQuery,
    useCreateCustomerGroupMutation,
    useUpdateCustomerGroupMutation,
    useDeleteCustomerGroupMutation,
} = customerGroupApi;
