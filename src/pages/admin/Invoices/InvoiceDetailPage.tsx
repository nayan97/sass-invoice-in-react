import React, { useRef } from "react";
import {
    ArrowLeft, Printer, Download, Loader2,
    MapPin, Mail, Globe, Phone, Hash,
    Calendar, Clock, CheckCircle,
} from "lucide-react";
import { useGetInvoiceQuery } from "../../../store/mainInvoiceApi";
import type { InvoiceStatus } from "../../../store/mainInvoiceApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<InvoiceStatus, { pill: string; label: string }> = {
    draft:     { pill: "bg-[#F3F4F6] text-[#6B7280] border border-gray-200",       label: "Draft" },
    sent:      { pill: "bg-[#EFF6FF] text-[#3B82F6] border border-blue-100",        label: "Sent" },
    viewed:    { pill: "bg-[#F5F3FF] text-[#7C3AED] border border-purple-100",      label: "Viewed" },
    paid:      { pill: "bg-[#DCFCE7] text-[#16A34A] border border-green-200",       label: "Paid" },
    partial:   { pill: "bg-[#FEF9C3] text-[#CA8A04] border border-yellow-200",      label: "Partial" },
    overdue:   { pill: "bg-[#FFE4E6] text-[#F43F5E] border border-red-200",         label: "Overdue" },
    cancelled: { pill: "bg-[#F3F4F6] text-[#9CA3AF] border border-gray-200",        label: "Cancelled" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (amount: string | number, symbol = "$") =>
    `${symbol}${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (date: string | null) =>
    date
        ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow: React.FC<{ icon: React.ReactNode; text: string | null }> = ({ icon, text }) =>
    text ? (
        <div className="flex items-start gap-2 text-xs text-gray-600">
            <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>
            <span>{text}</span>
        </div>
    ) : null;

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{children}</p>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    companyId: number;
    invoiceId: number;
    onBack: () => void;
    onEdit?: (invoiceId: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const InvoiceDetailPage: React.FC<Props> = ({ companyId, invoiceId, onBack, onEdit }) => {
    const printRef = useRef<HTMLDivElement>(null);

    const { data: invoice, isLoading, isError } = useGetInvoiceQuery({ companyId, invoiceId });

    const handlePrint = () => window.print();

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Loader2 size={28} className="animate-spin text-[#2D8A75]" />
                    <p className="text-sm">Loading invoice...</p>
                </div>
            </div>
        );
    }

    // ── Error ──
    if (isError || !invoice) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-sm mb-3">Failed to load invoice.</p>
                    <button onClick={onBack} className="text-xs text-[#2D8A75] hover:underline">
                        ← Go back
                    </button>
                </div>
            </div>
        );
    }

    const currencySymbol = invoice.currency?.symbol ?? "$";
    const statusStyle    = STATUS_STYLES[invoice.status];
    const isDraft        = invoice.status === "draft";

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#333333] max-w-5xl mx-auto">

            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500">
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">
                        Invoice Details
                    </h1>
                </div>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Invoice</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Invoice Details</span>
                </div>
            </div>

            {/* Main Card */}
            <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* ── Top: Invoice title + Meta + Company ── */}
                <div className="p-8 border-b border-gray-100">
                    <div className="flex items-start justify-between">

                        {/* Left: Title + Meta */}
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-800 mb-4">
                                Invoice: <span className="text-[#2D8A75]">{invoice.invoice_no}</span>
                            </h2>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                                <div>
                                    <SectionLabel>Invoice No</SectionLabel>
                                    <p className="font-mono font-bold text-sm text-gray-700">{invoice.invoice_no}</p>
                                </div>
                                <div>
                                    <SectionLabel>Date</SectionLabel>
                                    <p className="text-sm text-gray-700">{fmtDate(invoice.invoice_date)}</p>
                                </div>
                                <div>
                                    <SectionLabel>Payment Status</SectionLabel>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${statusStyle.pill}`}>
                                        {invoice.status === "paid" && <CheckCircle size={10} />}
                                        {statusStyle.label}
                                    </span>
                                </div>
                                <div>
                                    <SectionLabel>Total Amount</SectionLabel>
                                    <p className="text-sm font-bold text-gray-800">
                                        {fmt(invoice.grand_total, currencySymbol)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Company info + Total highlight */}
                        <div className="text-right">
                            <p className="text-base font-black text-gray-800 mb-3">{invoice.company_name}</p>
                            <div className="space-y-1.5 text-right">
                                <InfoRow icon={<MapPin size={11} />} text={invoice.company_address} />
                                <InfoRow icon={<Hash size={11} />} text={invoice.company_business_number} />
                                <InfoRow icon={<Mail size={11} />} text={invoice.company_email} />
                                <InfoRow icon={<Globe size={11} />} text={null} />
                                <InfoRow icon={<Phone size={11} />} text={invoice.company_phone} />
                            </div>

                            {/* Total highlight block */}
                            <div className="mt-5 bg-[#F0FDF8] border border-[#2D8A75]/20 rounded-xl px-6 py-4 text-right">
                                <SectionLabel>Total Amount</SectionLabel>
                                <p className="text-3xl font-black text-[#2D8A75]">
                                    {fmt(invoice.grand_total, currencySymbol)}
                                </p>
                                {invoice.due_date && (
                                    <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[10px] font-bold ${
                                        invoice.status === "overdue"
                                            ? "bg-[#FFE4E6] text-[#F43F5E]"
                                            : "bg-[#FEF9C3] text-[#CA8A04]"
                                    }`}>
                                        <Clock size={9} />
                                        Due: {fmtDate(invoice.due_date)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bill To / Ship To ── */}
                <div className="px-8 py-6 border-b border-gray-100 grid grid-cols-2 gap-8">
                    <div>
                        <SectionLabel>Billing Address</SectionLabel>
                        <p className="font-bold text-sm text-gray-800 mb-2">{invoice.customer_name}</p>
                        {invoice.customer_address && (
                            <p className="text-xs text-gray-600 mb-2 whitespace-pre-line">{invoice.customer_address}</p>
                        )}
                        <div className="space-y-1">
                            {invoice.customer_phone  && <p className="text-xs text-gray-500">Phone: {invoice.customer_phone}</p>}
                            {invoice.customer_mobile && <p className="text-xs text-gray-500">Mobile: {invoice.customer_mobile}</p>}
                            {invoice.customer_fax    && <p className="text-xs text-gray-500">Fax: {invoice.customer_fax}</p>}
                            {invoice.customer_email  && <p className="text-xs text-gray-500">Email: {invoice.customer_email}</p>}
                        </div>
                    </div>

                    <div>
                        <SectionLabel>Invoice Info</SectionLabel>
                        <div className="space-y-2">
                            {invoice.terms && (
                                <div className="flex items-center gap-2">
                                    <Calendar size={11} className="text-gray-400" />
                                    <span className="text-xs text-gray-600">Terms: <span className="font-medium text-gray-700">{invoice.terms}</span></span>
                                </div>
                            )}
                            {invoice.invoice_date && (
                                <div className="flex items-center gap-2">
                                    <Calendar size={11} className="text-gray-400" />
                                    <span className="text-xs text-gray-600">Invoice Date: <span className="font-medium text-gray-700">{fmtDate(invoice.invoice_date)}</span></span>
                                </div>
                            )}
                            {invoice.due_date && (
                                <div className="flex items-center gap-2">
                                    <Clock size={11} className="text-gray-400" />
                                    <span className="text-xs text-gray-600">Due Date: <span className="font-medium text-gray-700">{fmtDate(invoice.due_date)}</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Line Items Table ── */}
                <div className="px-8 py-6 border-b border-gray-100">
                    <SectionLabel>Items</SectionLabel>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <th className="pb-3 w-8">#</th>
                                <th className="pb-3">Product Details</th>
                                <th className="pb-3 text-right">Rate</th>
                                <th className="pb-3 text-center">Qty</th>
                                <th className="pb-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(invoice.items ?? []).map((item, idx) => (
                                <tr key={item.id} className="text-sm">
                                    <td className="py-3.5 pr-4 text-xs font-bold text-gray-400">
                                        {String(idx + 1).padStart(2, "0")}
                                    </td>
                                    <td className="py-3.5">
                                        <p className="font-semibold text-gray-800 text-[13px]">{item.description}</p>
                                        {item.additional_details && (
                                            <p className="text-[11px] text-gray-400 mt-0.5">{item.additional_details}</p>
                                        )}
                                    </td>
                                    <td className="py-3.5 text-right text-gray-700">
                                        {fmt(item.unit_price, currencySymbol)}
                                    </td>
                                    <td className="py-3.5 text-center text-gray-700 font-medium">
                                        {String(item.qty).padStart(2, "0")}
                                    </td>
                                    <td className="py-3.5 text-right font-bold text-gray-800">
                                        {fmt(item.line_total, currencySymbol)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Totals ── */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-end">
                    <div className="w-72 space-y-2.5">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Sub Total</span>
                            <span className="font-medium">{fmt(invoice.subtotal, currencySymbol)}</span>
                        </div>
                        {Number(invoice.tax_total) > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>
                                    Tax{" "}
                                    {invoice.tax_type === "percent"
                                        ? `(${invoice.tax_rate}%)`
                                        : "(fixed)"}
                                </span>
                                <span className="font-medium">{fmt(invoice.tax_total, currencySymbol)}</span>
                            </div>
                        )}
                        {Number(invoice.discount_total) > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>
                                    Discount{" "}
                                    {invoice.discount_type === "percent"
                                        ? `(${invoice.discount_value}%)`
                                        : "(fixed)"}
                                </span>
                                <span className="font-medium text-[#F43F5E]">
                                    −{fmt(invoice.discount_total, currencySymbol)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-black text-gray-800 pt-3 border-t-2 border-[#2D8A75]/20">
                            <span>Total Amount</span>
                            <span className="text-[#2D8A75]">{fmt(invoice.grand_total, currencySymbol)}</span>
                        </div>
                    </div>
                </div>

                {/* ── Notes ── */}
                {invoice.notes && (
                    <div className="px-8 py-6 border-b border-gray-100">
                        <SectionLabel>Notes</SectionLabel>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                            <p className="text-xs text-gray-600 leading-relaxed">
                                <span className="font-bold text-gray-700">NOTES: </span>
                                {invoice.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Signatures ── */}
                {(invoice.authority_name || invoice.receiver_name) && (
                    <div className="px-8 py-6 border-b border-gray-100 grid grid-cols-2 gap-8">
                        {invoice.authority_name && (
                            <div>
                                <SectionLabel>Authorized Signatory</SectionLabel>
                                <div className="border-t-2 border-gray-300 pt-2 mt-8">
                                    <p className="text-sm font-semibold text-gray-700">{invoice.authority_name}</p>
                                </div>
                            </div>
                        )}
                        {invoice.receiver_name && (
                            <div>
                                <SectionLabel>Receiver</SectionLabel>
                                <div className="border-t-2 border-gray-300 pt-2 mt-8">
                                    <p className="text-sm font-semibold text-gray-700">{invoice.receiver_name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Action Bar ── */}
                <div className="px-8 py-4 bg-gray-50/50 flex items-center justify-between print:hidden">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Invoices
                    </button>

                    <div className="flex items-center gap-3">
                        {isDraft && onEdit && (
                            <button
                                onClick={() => onEdit(invoice.id)}
                                className="px-4 py-2.5 border border-[#2D8A75] text-[#2D8A75] text-sm font-medium rounded-lg hover:bg-[#2D8A75]/5 transition-colors"
                            >
                                Edit Invoice
                            </button>
                        )}
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Printer size={14} /> Print
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#2D8A75] text-white text-sm font-medium rounded-lg hover:bg-[#256d5e] transition-colors"
                        >
                            <Download size={14} /> Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailPage;