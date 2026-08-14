import { baseApi } from "./baseApi";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SubscriptionInvoicePlan {
    id: number;
    name: string;
    price: string;
    customer_limit: number;
    product_limit: number;
    invoice_limit: number;
    trial_days: number;
    is_active: boolean;
}

export interface SubscriptionInvoiceSubscription {
    id: number;
    company_id: number;
    plan_id: number;
    coupon_id: number | null;
    start_date: string;
    end_date: string | null;
    trial_ends_at: string | null;
    renews_at: string | null;
    cancelled_at: string | null;
    status: "active" | "trial" | "expired" | "cancelled";
    plan: SubscriptionInvoicePlan;
}

export interface SubscriptionInvoice {
    id: number;
    subscription_id: number;
    invoice_number: string;
    amount: string;
    billing_date: string;
    due_date: string;
    status: "unpaid" | "paid" | "overdue" | "cancelled";
    paid_at: string | null;
    transaction_id: string | null;
    payment_slip: string | null;
    email_sent_at: string | null;
    created_at: string;
    updated_at: string;
    subscription: SubscriptionInvoiceSubscription;
}

export interface InitiatePaymentPayload {
    invoiceId: number;
    gateway_code: string;
}

export interface InitiatePaymentResponse {
    redirect_url: string;
    reference: string;
}

export interface PlatformPaymentMethod {
    id: number;
    name: string;
    code: string;
    type: string;
}

// ─── API ────────────────────────────────────────────────────────────────────

export const subscriptionInvoicesApi = baseApi
    .enhanceEndpoints({
        addTagTypes: ["SubscriptionInvoice", "PlatformPaymentMethod"],
    })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ================================
            // GET MY SUBSCRIPTION INVOICES
            // ================================
            getMyInvoices: builder.query<SubscriptionInvoice[], void>({
                query: () => `/invoices/my`,

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: (result) =>
                    result
                        ? [
                            ...result.map(({ id }) => ({ type: "SubscriptionInvoice" as const, id })),
                            { type: "SubscriptionInvoice", id: "LIST" },
                        ]
                        : [{ type: "SubscriptionInvoice", id: "LIST" }],
            }),

            // ================================
            // GET AVAILABLE PLATFORM PAYMENT GATEWAYS
            // ================================
            getPlatformPaymentMethods: builder.query<PlatformPaymentMethod[], void>({
                query: () => `/payment-methods/platform`,

                transformResponse: (response: any) =>
                    response.data || response,

                providesTags: [{ type: "PlatformPaymentMethod", id: "LIST" }],
            }),

            // ================================
            // INITIATE PAYMENT FOR AN INVOICE
            // ================================
            initiateInvoicePayment: builder.mutation<InitiatePaymentResponse, InitiatePaymentPayload>({
                query: ({ invoiceId, gateway_code }) => ({
                    url: `/invoices/${invoiceId}/pay`,
                    method: "POST",
                    body: { gateway_code },
                }),

                transformResponse: (response: any) =>
                    response.data || response,

                invalidatesTags: (_result, _error, { invoiceId }) => [
                    { type: "SubscriptionInvoice", id: invoiceId },
                    { type: "SubscriptionInvoice", id: "LIST" },
                ],
            }),
        }),
    });

export const {
    useGetMyInvoicesQuery,
    useGetPlatformPaymentMethodsQuery,
    useInitiateInvoicePaymentMutation,
} = subscriptionInvoicesApi;