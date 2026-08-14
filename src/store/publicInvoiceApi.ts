import { baseApi } from "./baseApi";
import type { InvoiceStatus } from "./mainInvoiceApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublicInvoiceItem {
    id: number;
    description: string;
    additional_details: string | null;
    qty: number;
    unit_price: string;
    tax_percent: string;
    discount_percent: string;
}

export interface PaymentMethodEntry {
    name: string;
    [key: string]: string;
}

export interface PublicInvoice {
    id: number;
    public_token: string;
    company_id: number;
    customer_id: number;
    currency_id: number;
    // Header
    invoice_no: string;
    title: string | null;
    logo: string | null;
    color: string | null;
    invoice_date: string;
    due_date: string | null;
    status: InvoiceStatus;
    terms: string | null;
    // Company
    company_name: string;
    company_email: string | null;
    company_phone: string | null;
    company_business_number: string | null;
    company_address: string | null;
    // Customer
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    customer_mobile: string | null;
    customer_fax: string | null;
    customer_address: string | null;
    // Pricing
    tax_type: "none" | "percent" | "fixed" | null;
    tax_rate: string | null;
    tax_total: string | null;
    discount_type: "none" | "percent" | "fixed" | null;
    discount_value: string | null;
    discount_total: string | null;
    total_amount: string;
    grand_total: string;   // was total_amount
    subtotal: string;
    // Footer
    payment_schedule: string | null;
    notes: string | null;
    terms_conditions: string | null;
    signature_image: string | null;
    authority_name: string | null;
    receiver_name: string | null;
    qr_code: string | undefined;
    qr_code_url: string | null;
    // Audit & tracking
    email_sent_at: string | null;
    paid_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    // Relations
    items: PublicInvoiceItem[];
    payment_method: PaymentMethodEntry[] | null;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const publicInvoiceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPublicInvoice: builder.query<PublicInvoice, string>({
            query: (publicToken) => `/public/invoices/${publicToken}`,
            transformResponse: (response: any): PublicInvoice => response.data,
        }),

        createStripeCheckoutSession: builder.mutation<{ checkout_url: string }, string>({
            query: (token) => ({
                url: `/pay/${token}/stripe`,
                method: "GET",
            }),
        }),
    }),
});

export const { useGetPublicInvoiceQuery, useCreateStripeCheckoutSessionMutation } = publicInvoiceApi;