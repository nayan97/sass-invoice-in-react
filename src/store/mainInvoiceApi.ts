import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvoiceStatus =
    | "draft"
    | "sent"
    | "viewed"
    | "paid"
    | "partial"
    | "overdue"
    | "cancelled";

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    sort_order: number;
    description: string;
    additional_details: string | null;
    qty: string;
    unit_price: string;
    tax_percent: string;
    discount_percent: string;
    line_total: string;
}

export interface InvoicePhoto {
    id: number;
    invoice_id: number;
    path: string;
    url: string;
    caption: string | null;
    sort_order: number;
}

export interface Invoice {
    id: number;
    company_id: number;
    customer_id: number | null;
    currency_id: number | null;
    invoice_no: string;
    title: string;
    logo: string | null;
    color: string | null;
    invoice_date: string;
    due_date: string | null;
    terms: string | null;
    tax_type: "none" | "percent" | "fixed";
    tax_rate: string;
    discount_type: "none" | "percent" | "fixed";
    discount_value: string;
    company_name: string;
    company_email: string | null;
    company_phone: string | null;
    company_business_number: string | null;
    company_address: string | null;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    customer_mobile: string | null;
    customer_fax: string | null;
    customer_address: string | null;
    subtotal: string;
    tax_total: string;
    discount_total: string;
    grand_total: string;
    status: InvoiceStatus;
    payment_schedule: { due_date: string; amount: number; note?: string }[] | null;
    notes: string | null;
    terms_conditions: string | null;
    signature_image: string | null;
    authority_name: string | null;
    receiver_name: string | null;
    qr_code: string | null;
    created_at: string;
    updated_at: string;
    // relations (loaded on show)
    items?: InvoiceItem[];
    photos?: InvoicePhoto[];
    currency?: { id: number; name: string; code: string; symbol: string } | null;
    customer?: { id: number; name: string; email: string } | null;
}

// ─── Pagination Meta ──────────────────────────────────────────────────────────

export interface PaginatedInvoices {
    data: Invoice[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface InvoiceItemPayload {
    id?: number;
    description: string;
    additional_details?: string;
    qty: number;
    unit_price: number;
    tax_percent?: number;
    discount_percent?: number;
    sort_order?: number;
}

export interface InvoicePayload {
    customer_id?: number | null;
    currency_id?: number | null;
    title?: string;
    color?: string;
    invoice_date: string;
    due_date?: string | null;
    terms?: string;
    tax_type?: "none" | "percent" | "fixed";
    tax_rate?: number;
    discount_type?: "none" | "percent" | "fixed";
    discount_value?: number;
    company_name: string;
    company_email?: string;
    company_phone?: string;
    company_business_number?: string;
    company_address?: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    customer_mobile?: string;
    customer_fax?: string;
    customer_address?: string;
    status?: InvoiceStatus;
    notes?: string;
    terms_conditions?: string;
    authority_name?: string;
    receiver_name?: string;
    items: InvoiceItemPayload[];
    // file fields handled separately via FormData
}

export interface InvoiceListParams {
    companyId: number;
    page?: number;
    per_page?: number;
    status?: InvoiceStatus | "all";
    search?: string;
    sort_by?: string;
    sort_dir?: "asc" | "desc";
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const mainInvoiceApi = baseApi
    .enhanceEndpoints({ addTagTypes: ["Invoice"] })
    .injectEndpoints({
        endpoints: (builder) => ({

            // ── List ─────────────────────────────────────────────────────────
            getInvoices: builder.query<PaginatedInvoices, InvoiceListParams>({
                query: ({ companyId, page = 1, per_page = 15, status, search, sort_by, sort_dir }) => {
                    const params = new URLSearchParams({
                        page: String(page),
                        per_page: String(per_page),
                    });
                    if (status && status !== "all") params.set("status", status);
                    if (search)    params.set("search", search);
                    if (sort_by)   params.set("sort_by", sort_by);
                    if (sort_dir)  params.set("sort_dir", sort_dir);

                    return `/companies/${companyId}/invoices?${params}`;
                },

                transformResponse: (response: any): PaginatedInvoices => ({
                    data: response.data?.data ?? response.data ?? [],
                    meta: response.data?.meta ?? response.meta,
                }),

                providesTags: (result, _err, { companyId }) =>
                    result
                        ? [
                            ...result.data.map(({ id }) => ({ type: "Invoice" as const, id })),
                            { type: "Invoice", id: `LIST-${companyId}` },
                          ]
                        : [{ type: "Invoice", id: `LIST-${companyId}` }],
            }),

            // ── Single ───────────────────────────────────────────────────────
            getInvoice: builder.query<Invoice, { companyId: number; invoiceId: number }>({
                query: ({ companyId, invoiceId }) =>
                    `/companies/${companyId}/invoices/${invoiceId}`,

                transformResponse: (response: any): Invoice =>
                    response.data ?? response,

                providesTags: (_result, _err, { invoiceId }) => [
                    { type: "Invoice", id: invoiceId },
                ],
            }),

            // ── Create (FormData for file uploads) ───────────────────────────
            createInvoice: builder.mutation<Invoice, { companyId: number; formData: FormData }>({
                query: ({ companyId, formData }) => ({
                    url: `/companies/${companyId}/invoices`,
                    method: "POST",
                    body: formData,
                }),

                transformResponse: (response: any): Invoice =>
                    response.data ?? response,

                invalidatesTags: (_result, _err, { companyId }) => [
                    { type: "Invoice", id: `LIST-${companyId}` },
                ],
            }),

            // ── Update (FormData for file uploads) ───────────────────────────
            updateInvoice: builder.mutation<
                Invoice,
                { companyId: number; invoiceId: number; formData: FormData }
            >({
                query: ({ companyId, invoiceId, formData }) => ({
                    url: `/companies/${companyId}/invoices/${invoiceId}`,
                    method: "POST", // PHP multipart workaround
                    body: formData,
                }),

                transformResponse: (response: any): Invoice =>
                    response.data ?? response,

                invalidatesTags: (_result, _err, { companyId, invoiceId }) => [
                    { type: "Invoice", id: invoiceId },
                    { type: "Invoice", id: `LIST-${companyId}` },
                ],
            }),

            // ── Status only ──────────────────────────────────────────────────
            updateInvoiceStatus: builder.mutation<
                Invoice,
                { companyId: number; invoiceId: number; status: InvoiceStatus }
            >({
                query: ({ companyId, invoiceId, status }) => ({
                    url: `/companies/${companyId}/invoices/${invoiceId}/status`,
                    method: "PATCH",
                    body: { status },
                }),

                transformResponse: (response: any): Invoice =>
                    response.data ?? response,

                invalidatesTags: (_result, _err, { companyId, invoiceId }) => [
                    { type: "Invoice", id: invoiceId },
                    { type: "Invoice", id: `LIST-${companyId}` },
                ],
            }),

            // ── Delete ───────────────────────────────────────────────────────
            deleteInvoice: builder.mutation<
                { message: string },
                { companyId: number; invoiceId: number }
            >({
                query: ({ companyId, invoiceId }) => ({
                    url: `/companies/${companyId}/invoices/${invoiceId}`,
                    method: "DELETE",
                }),

                invalidatesTags: (_result, _err, { companyId, invoiceId }) => [
                    { type: "Invoice", id: invoiceId },
                    { type: "Invoice", id: `LIST-${companyId}` },
                ],
            }),
        }),
    });

export const {
    useGetInvoicesQuery,
    useGetInvoiceQuery,
    useCreateInvoiceMutation,
    useUpdateInvoiceMutation,
    useUpdateInvoiceStatusMutation,
    useDeleteInvoiceMutation,
} = mainInvoiceApi;