import { baseApi } from "./baseApi";

export type TransactionStatus = "paid" | "pending" | "failed" | "refunded" | "rejected" | "approved";

export interface Transaction {
    id: number;
    subscription_id: number;
    amount: string;
    payment_method: string;
    transaction_id: string;
    status: TransactionStatus;
    created_at: string;
    updated_at: string;
}

export interface TransactionPayload {
    amount: string;
    payment_method: string;
    transaction_id: string;
    status: TransactionStatus;
}

export const transactionApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["Transaction"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET ALL TRANSACTIONS (ADMIN)
            // ================================
            getAllTransactions: builder.query<Transaction[], void>({
                query: () => "/subscriptions-transactions",

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (result) =>
                    result
                        ? [
                            ...result.map(({ id }) => ({
                                type: "Transaction" as const,
                                id,
                            })),
                            { type: "Transaction", id: "LIST" },
                        ]
                        : [{ type: "Transaction", id: "LIST" }],
            }),

            // ================================
            // APPROVE TRANSACTION (ADMIN)
            // ================================
            approveTransaction: builder.mutation<Transaction, number>({
                query: (id) => ({
                    url: `/subscriptions-transactions/${id}/approve`,
                    method: "PATCH",
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, id) => [
                    { type: "Transaction", id },
                    { type: "Transaction", id: "LIST" },
                ],
            }),

            // ================================
            // REJECT TRANSACTION (ADMIN)
            // ================================
            rejectTransaction: builder.mutation<Transaction, number>({
                query: (id) => ({
                    url: `/subscriptions-transactions/${id}/reject`,
                    method: "PATCH",
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, id) => [
                    { type: "Transaction", id },
                    { type: "Transaction", id: "LIST" },
                ],
            }),
        }),
    });

export const {
    useGetAllTransactionsQuery,
    useApproveTransactionMutation,
    useRejectTransactionMutation,
} = transactionApi;