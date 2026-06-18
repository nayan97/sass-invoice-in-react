import { baseApi } from "./baseApi";

export interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    decimal_places: number;
    exchange_rate: number;
    is_default: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CurrencyPayload {
    name: string;
    code: string;
    symbol: string;
    decimal_places?: number;
    exchange_rate?: number;
    is_default?: boolean;
    is_active?: boolean;
}

export interface CurrencyMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface CurrencyPaginatedResponse {
    data: Currency[];
    meta: CurrencyMeta;
}

export const currencyApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["Currency"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET ALL CURRENCIES (paginated)
            // ================================
            getCurrencies: builder.query<CurrencyPaginatedResponse, { page?: number; per_page?: number }>({
                query: ({ page = 1, per_page = 15 } = {}) =>
                    `/currencies?page=${page}&per_page=${per_page}`,

                transformResponse: (response: any): CurrencyPaginatedResponse => ({
                    data: response.data || [],
                    meta: response.meta || { current_page: 1, per_page: 15, total: 0, last_page: 1 },
                }),

                providesTags: (result) =>
                    result
                        ? [
                            ...result.data.map(({ id }) => ({ type: "Currency" as const, id })),
                            { type: "Currency", id: "LIST" },
                        ]
                        : [{ type: "Currency", id: "LIST" }],
            }),

            // ================================
            // GET CURRENCY BY ID
            // ================================
            getCurrencyById: builder.query<Currency, number>({
                query: (id) => `/currencies/${id}`,

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (_result, _error, id) => [
                    { type: "Currency", id },
                ],
            }),

            // ================================
            // CREATE CURRENCY
            // ================================
            createCurrency: builder.mutation<Currency, CurrencyPayload>({
                query: (data) => ({
                    url: `/currencies`,
                    method: "POST",
                    body: data,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: [{ type: "Currency", id: "LIST" }],
            }),

            // ================================
            // UPDATE CURRENCY
            // ================================
            updateCurrency: builder.mutation<Currency, { id: number; data: Partial<CurrencyPayload> }>({
                query: ({ id, data }) => ({
                    url: `/currencies/${id}`,
                    method: "PUT",
                    body: data,
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, { id }) => [
                    { type: "Currency", id },
                    { type: "Currency", id: "LIST" },
                ],
            }),

            // ================================
            // DELETE CURRENCY
            // ================================
            deleteCurrency: builder.mutation<{ message: string }, number>({
                query: (id) => ({
                    url: `/currencies/${id}`,
                    method: "DELETE",
                }),

                invalidatesTags: (_result, _error, id) => [
                    { type: "Currency", id },
                    { type: "Currency", id: "LIST" },
                ],
            }),
        }),
    });

export const {
    useGetCurrenciesQuery,
    useGetCurrencyByIdQuery,
    useCreateCurrencyMutation,
    useUpdateCurrencyMutation,
    useDeleteCurrencyMutation,
} = currencyApi;