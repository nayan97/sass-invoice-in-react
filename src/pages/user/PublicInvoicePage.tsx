import React, { useState } from "react";
import { Link, useParams } from "react-router";

import { Loader2, FileX, CheckCircle2, Copy, Check, CreditCard } from "lucide-react";
import { useGetPublicInvoiceQuery, useCreateStripeCheckoutSessionMutation } from "../../store/publicInvoiceApi";

const fmt = (n: number | string) =>
    Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_STYLES: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-600",
    partial: "bg-blue-100 text-blue-700",
    sent: "bg-amber-100 text-amber-700",
    draft: "bg-gray-100 text-gray-500",
    cancelled: "bg-gray-100 text-gray-400",
};

const formatDateWithoutTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const date = new Date(datePart);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const PublicInvoicePage: React.FC = () => {
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [payError, setPayError] = useState<string | null>(null);

    const { token } = useParams<{ token: string }>();
    const { data: invoice, isLoading, isError } = useGetPublicInvoiceQuery(token!, { skip: !token });
    const [createStripeCheckoutSession, { isLoading: isRedirecting }] = useCreateStripeCheckoutSessionMutation();

    const primaryColor = invoice?.color || "#2D8A75";

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <Loader2 className="animate-spin" style={{ color: primaryColor }} size={28} />
            </div>
        );
    }

    if (isError || !invoice) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] text-gray-400 gap-2">
                <FileX size={32} />
                <p className="text-sm">This invoice link is invalid or has expired.</p>
            </div>
        );
    }

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const isPayable = invoice.status !== "paid" && invoice.status !== "cancelled";

    const handlePayWithStripe = async () => {
        if (!token) return;
        setPayError(null);
        try {
            const res = await createStripeCheckoutSession(token).unwrap();
            window.location.href = res.checkout_url;
        } catch (e) {
            setPayError("Could not start payment. Please try again.");
        }
    };

    const methods = Array.isArray(invoice.payment_method) ? invoice.payment_method : [];

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#333333]">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 space-y-8">

                    {/* ── Header ── */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{invoice.title || "Invoice"}</p>
                            <h1 className="text-xl font-bold text-gray-800">{invoice.invoice_no}</h1>
                            {invoice.invoice_date && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Issued: {formatDateWithoutTime(invoice.invoice_date)}
                                    {invoice.due_date && (
                                        <> &nbsp;·&nbsp; Due: {formatDateWithoutTime(invoice.due_date)}</>
                                    )}
                                </p>
                            )}
                            {invoice.terms && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Terms: <span className="font-semibold text-gray-600">{invoice.terms}</span>
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[invoice.status] ?? "bg-gray-100 text-gray-500"}`}>
                                {invoice.status}
                            </span>
                            {invoice.logo && (
                                <img
                                    src={invoice.logo}
                                    alt={`${invoice.company_name} Logo`}
                                    className="max-h-16 max-w-[180px] object-contain rounded border border-gray-100 p-1 bg-white"
                                />
                            )}
                        </div>
                    </div>

                    {/* ── Paid banner ── */}
                    {invoice.status === "paid" && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg px-4 py-3">
                            <CheckCircle2 size={16} className="shrink-0" />
                            This invoice has been paid in full — thank you!
                        </div>
                    )}

                    {/* ── From / Bill To ── */}
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">From</p>
                            <p className="font-semibold text-gray-700">{invoice.company_name}</p>
                            {invoice.company_address && (
                                <p className="text-gray-500 whitespace-pre-line">{invoice.company_address}</p>
                            )}
                            {invoice.company_business_number && (
                                <p className="text-gray-500">Business No: {invoice.company_business_number}</p>
                            )}
                            {invoice.company_email && <p className="text-gray-500">{invoice.company_email}</p>}
                            {invoice.company_phone && <p className="text-gray-500">{invoice.company_phone}</p>}
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
                            <p className="font-semibold text-gray-700">{invoice.customer_name}</p>
                            {invoice.customer_address && (
                                <p className="text-gray-500 whitespace-pre-line">{invoice.customer_address}</p>
                            )}
                            {invoice.customer_email && <p className="text-gray-500">{invoice.customer_email}</p>}
                            {invoice.customer_phone && <p className="text-gray-500">Phone: {invoice.customer_phone}</p>}
                            {invoice.customer_mobile && <p className="text-gray-500">Mobile: {invoice.customer_mobile}</p>}
                            {invoice.customer_fax && <p className="text-gray-500">Fax: {invoice.customer_fax}</p>}
                        </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* ── Line items ── */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-[#F8F9FA] border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500 px-4 py-3">
                            <span>Description</span>
                            <span className="text-right">Rate</span>
                            <span className="text-center">Qty</span>
                            <span className="text-right">Amount</span>
                        </div>
                        {invoice.items.map((item) => (
                            <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 border-b border-gray-50 last:border-0 text-sm">
                                <div>
                                    <p className="font-medium text-gray-700">{item.description}</p>
                                    {item.additional_details && (
                                        <p className="text-xs text-gray-400 mt-0.5">{item.additional_details}</p>
                                    )}
                                </div>
                                <span className="text-right text-gray-600 self-center">${fmt(item.unit_price)}</span>
                                <span className="text-center text-gray-600 self-center">{item.qty}</span>
                                <span className="text-right font-semibold text-gray-700 self-center">
                                    ${fmt(Number(item.qty) * Number(item.unit_price))}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* ── Totals ── */}
                    <div className="flex justify-end">
                        <div className="w-72 space-y-2">
                            <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t-2" style={{ borderTopColor: `${primaryColor}20` }}>
                                <span>Sub Total</span>
                                <span style={{ color: primaryColor }}>${fmt(invoice.subtotal)}</span>
                            </div>
                            {invoice.discount_type && invoice.discount_type !== "none" && Number(invoice.discount_total) > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Discount {invoice.discount_value && Number(invoice.discount_value) > 0 ? `(${invoice.discount_value}%)` : ""}</span>
                                    <span className="font-medium text-[#F43F5E]">−${fmt(invoice.discount_total ?? 0)}</span>
                                </div>
                            )}
                            {invoice.tax_type && invoice.tax_type !== "none" && Number(invoice.tax_total) > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Tax {invoice.tax_rate && Number(invoice.tax_rate) > 0 ? `(${invoice.tax_rate}%)` : ""}</span>
                                    <span className="font-medium">${fmt(invoice.tax_total ?? 0)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t-2" style={{ borderTopColor: `${primaryColor}20` }}>
                                <span>Total Due</span>
                                <span style={{ color: primaryColor }}>${fmt(invoice.grand_total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── QR Code ── */}
                    {invoice.qr_code && (
                        <>
                            <div className="border-t border-gray-100" />
                            <div className="flex flex-col items-center gap-2 py-2">
                                <img
                                    src={invoice.qr_code}
                                    alt="Invoice QR Code"
                                    className="w-28 h-28"
                                />
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                    Scan to view this invoice
                                </p>
                            </div>
                        </>
                    )}
                    {/* ── Payment Methods ── */}
                    {methods.length > 0 && (
                        <>
                            <div className="border-t border-gray-100" />
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    Payment Methods
                                </p>
                                <div className="space-y-2">
                                    {methods.map((method: Record<string, string>, idx: number) => {
                                        // Stripe is an online gateway — "Pay Now" replaces the copy row,
                                        // no account value to display or copy for it.
                                        if (method.name === "stripe") {
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between bg-[#F8F9FA] rounded-lg px-4 py-3 text-sm"
                                                >
                                                    <span className="font-semibold text-gray-700">Pay with Card (Stripe)</span>
                                                    {isPayable ? (
                                                        <button
                                                            onClick={handlePayWithStripe}
                                                            disabled={isRedirecting}
                                                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors disabled:opacity-60"
                                                            style={{ backgroundColor: primaryColor }}
                                                        >
                                                            {isRedirecting ? (
                                                                <Loader2 size={13} className="animate-spin" />
                                                            ) : (
                                                                <CreditCard size={13} />
                                                            )}
                                                            {isRedirecting ? "Redirecting…" : "Pay Now"}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Not payable</span>
                                                    )}
                                                </div>
                                            );
                                        }

                                        const value = method.account_email ?? method.account_number ?? "";
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between bg-[#F8F9FA] rounded-lg px-4 py-3 text-sm"
                                            >
                                                <span className="font-semibold text-gray-700 capitalize">{method.name}</span>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <span>{value}</span>
                                                    <button
                                                        onClick={() => handleCopy(value, idx)}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                        title="Copy"
                                                    >
                                                        {copiedIdx === idx
                                                            ? <Check size={14} className="text-green-500" />
                                                            : <Copy size={14} />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {payError && (
                                    <p className="text-xs text-red-500 mt-2">{payError}</p>
                                )}
                            </div>
                        </>
                    )}
                    {/* ── Payment Schedule ── */}
                    {invoice.payment_schedule && (
                        <>
                            <div className="border-t border-gray-100" />
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Schedule</p>
                                <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.payment_schedule}</p>
                            </div>
                        </>
                    )}

                    {/* ── Notes ── */}
                    {invoice.notes && (
                        <>
                            <div className="border-t border-gray-100" />
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</p>
                                <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.notes}</p>
                            </div>
                        </>
                    )}

                    {/* ── Terms & Conditions ── */}
                    {invoice.terms_conditions && (
                        <>
                            <div className="border-t border-gray-100" />
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Terms & Conditions</p>
                                <p className="text-xs text-gray-400 whitespace-pre-line">{invoice.terms_conditions}</p>
                            </div>
                        </>
                    )}

                    {/* ── Signature ── */}
                    {(invoice.authority_name || invoice.receiver_name || invoice.signature_image) && (
                        <>
                            <div className="border-t border-gray-100" />
                            <div className="grid grid-cols-2 gap-8 text-sm">
                                {invoice.authority_name || invoice.signature_image ? (
                                    <div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Authorized By</p>
                                        {invoice.signature_image && (
                                            <img
                                                src={invoice.signature_image}
                                                alt="Signature"
                                                className="max-h-12 object-contain mb-2"
                                            />
                                        )}
                                        {invoice.authority_name && (
                                            <p className="font-medium text-gray-700">{invoice.authority_name}</p>
                                        )}
                                    </div>
                                ) : null}
                                {invoice.receiver_name && (
                                    <div className="flex flex-col justify-end">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Receiver</p>
                                        <p className="font-medium text-gray-700">{invoice.receiver_name}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ── Invoice Metadata / Audit info ── */}
                    {(invoice.created_at || invoice.updated_at || invoice.email_sent_at || invoice.paid_at) && (
                        <>
                            <div className="border-t border-gray-100" />
                            <div className="flex flex-wrap justify-between gap-4 text-[11px] text-gray-400 pt-2">
                                <div className="space-y-1">
                                    {invoice.created_at && (
                                        <p>Created: <span className="font-medium text-gray-500">{formatDateWithoutTime(invoice.created_at)}</span></p>
                                    )}
                                    {invoice.updated_at && (
                                        <p>Last Updated: <span className="font-medium text-gray-500">{formatDateWithoutTime(invoice.updated_at)}</span></p>
                                    )}
                                </div>
                                <div className="space-y-1 text-right">
                                    {invoice.email_sent_at && (
                                        <p>Email Sent: <span className="font-medium text-gray-500">{formatDateWithoutTime(invoice.email_sent_at)}</span></p>
                                    )}
                                    {invoice.paid_at && (
                                        <p>Paid At: <span className="font-medium text-gray-500">{formatDateWithoutTime(invoice.paid_at)}</span></p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

             {invoice.customer_email && (
                <Link
                        to={`/customer/${invoice.company_id}/login?email=${encodeURIComponent(invoice.customer_email)}`}
                        className="text-sm text-[#2D8A75] font-medium hover:underline"
                    >
                        Manage my profile & saved addresses
                    </Link>
                )}

                </div>
            </div>
        </div>
    );
};

export default PublicInvoicePage;