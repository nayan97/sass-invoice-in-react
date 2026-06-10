import { baseApi } from "./baseApi";

export interface CompanyUser {
    id: number;
    company_id: number;
    user_id: number;
    role: string;
    is_active: boolean;
    joined_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
    };
}

export interface CompanyUserPayload {
    user_id: number;
    role: string;
    is_active?: boolean;
}

export const companyUsersApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["CompanyUser"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET ALL USERS FOR A COMPANY
            // ================================
            getCompanyUsers: builder.query<CompanyUser[], number>({
                query: (companyId) => `/companies/${companyId}/users`,

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (result, _error, companyId) =>
                    result
                        ? [
                            ...result.map(({ id }) => ({ type: "CompanyUser" as const, id })),
                            { type: "CompanyUser", id: `LIST-${companyId}` },
                        ]
                        : [{ type: "CompanyUser", id: `LIST-${companyId}` }],
            }),

            // ================================
            // ADD USER TO COMPANY
            // ================================
            addCompanyUser: builder.mutation<CompanyUser, { companyId: number; data: CompanyUserPayload }>({
                query: ({ companyId, data }) => ({
                    url: `/companies/${companyId}/users`,
                    method: "POST",
                    body: data,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, { companyId }) => [
                    { type: "CompanyUser", id: `LIST-${companyId}` },
                ],
            }),

            // ================================
            // UPDATE COMPANY USER
            // ================================
            updateCompanyUser: builder.mutation<CompanyUser, { companyId: number; userId: number; data: Partial<CompanyUserPayload> }>({
                query: ({ companyId, userId, data }) => ({
                    url: `/companies/${companyId}/users/${userId}`,
                    method: "PUT",
                    body: data,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, { companyId, userId }) => [
                    { type: "CompanyUser", id: userId },
                    { type: "CompanyUser", id: `LIST-${companyId}` },
                ],
            }),

            // ================================
            // REMOVE USER FROM COMPANY
            // ================================
            removeCompanyUser: builder.mutation<{ message: string }, { companyId: number; userId: number }>({
                query: ({ companyId, userId }) => ({
                    url: `/companies/${companyId}/users/${userId}`,
                    method: "DELETE",
                }),

                invalidatesTags: (_result, _error, { companyId, userId }) => [
                    { type: "CompanyUser", id: userId },
                    { type: "CompanyUser", id: `LIST-${companyId}` },
                ],
            }),
        }),
    });

export const {
    useGetCompanyUsersQuery,
    useAddCompanyUserMutation,
    useUpdateCompanyUserMutation,
    useRemoveCompanyUserMutation,
} = companyUsersApi;