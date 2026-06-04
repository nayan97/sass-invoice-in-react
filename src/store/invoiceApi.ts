import { baseApi } from "./baseApi";

export type InvoiceStatus = "unpaid" | "paid" | "overdue" | "cancelled";

export interface Invoice {
    id: number;
    invoice_number: string;
    amount: string;
    billing_date: string;
    due_date: string;
    status: InvoiceStatus;
    paid_at: string | null;
    subscription_id: number;
    subscription?: {
        id: number;
        plan?: { name: string };
        company?: { name: string };
    };
    created_at: string;
    updated_at: string;
}

export const invoiceApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["Invoice"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET ALL INVOICES (Admin)
            // ================================
            getAllInvoices: builder.query<Invoice[], void>({
                query: () => `/invoices`,

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (result) =>
                    result
                        ? [
                            ...result.map(({ id }) => ({ type: "Invoice" as const, id })),
                            { type: "Invoice", id: "LIST" },
                        ]
                        : [{ type: "Invoice", id: "LIST" }],
            }),

            // ================================
            // MARK PAID
            // ================================
            markInvoicePaid: builder.mutation<Invoice, number>({
                query: (id) => ({
                    url: `/invoices/${id}/mark-paid`,
                    method: "PATCH",
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, id) => [
                    { type: "Invoice", id },
                    { type: "Invoice", id: "LIST" },
                ],
            }),

            // ================================
            // CANCEL INVOICE
            // ================================
            cancelInvoice: builder.mutation<Invoice, number>({
                query: (id) => ({
                    url: `/invoices/${id}/cancel`,
                    method: "PATCH",
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, id) => [
                    { type: "Invoice", id },
                    { type: "Invoice", id: "LIST" },
                ],
            }),
        }),
    });

export const {
    useGetAllInvoicesQuery,
    useMarkInvoicePaidMutation,
    useCancelInvoiceMutation,
} = invoiceApi;