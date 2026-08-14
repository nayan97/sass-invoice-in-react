import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Search, Receipt, Loader2, CreditCard, CheckCircle2, XCircle, X } from "lucide-react";
import { useGetMyInvoicesQuery } from "../../../store/subscriptionInvoicesApi";
import type { SubscriptionInvoice } from "../../../store/subscriptionInvoicesApi";
import { PayInvoiceModal } from "./PayInvoiceModal";

// ─── Payment status banner ──────────────────────────────────────────────────
// Shown when redirected back from Stripe Checkout (?payment=success|cancelled).
// The webhook that actually flips the invoice to "paid" can lag a second or
// two behind this redirect, so on "success" we poll a few times instead of
// trusting a single refetch.

const PaymentStatusBanner: React.FC<{
    status: "success" | "cancelled";
    onDismiss: () => void;
}> = ({ status, onDismiss }) => {
    const isSuccess = status === "success";

    return (
        <div
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border mb-6 ${
                isSuccess
                    ? "bg-[#DCFCE7] border-[#16A34A]/20"
                    : "bg-[#FFE4E6] border-[#F43F5E]/20"
            }`}
        >
            <div className="flex items-center gap-2.5">
                {isSuccess ? (
                    <CheckCircle2 className="text-[#16A34A]" size={18} />
                ) : (
                    <XCircle className="text-[#F43F5E]" size={18} />
                )}
                <p className={`text-sm font-semibold ${isSuccess ? "text-[#16A34A]" : "text-[#F43F5E]"}`}>
                    {isSuccess
                        ? "Payment successful — your invoice will update in a moment."
                        : "Payment was cancelled. You can try again anytime."}
                </p>
            </div>
            <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
            </button>
        </div>
    );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const STATUS_STYLES: Record<string, string> = {
    paid:      "bg-[#DCFCE7] text-[#16A34A]",
    unpaid:    "bg-[#FEF3C7] text-[#D97706]",
    overdue:   "bg-[#FFE4E6] text-[#F43F5E]",
    cancelled: "bg-[#F3F4F6] text-[#6B7280]",
};

const STATUS_TABS = ["all", "unpaid", "overdue", "paid", "cancelled"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
    });

const formatAmount = (amount: string) =>
    Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Page ─────────────────────────────────────────────────────────────────────

const MySubscriptionInvoicesPage: React.FC = () => {
    const { data: invoices = [], isLoading, isError, refetch } = useGetMyInvoicesQuery();

    const [searchQuery, setSearchQuery]   = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage]   = useState(1);
    const [payingInvoice, setPayingInvoice] = useState<SubscriptionInvoice | null>(null);

    // ── Payment redirect handling (?payment=success | cancelled) ──
    const [searchParams, setSearchParams] = useSearchParams();
    const paymentStatus = searchParams.get("payment") as "success" | "cancelled" | null;
    const [showBanner, setShowBanner] = useState(!!paymentStatus);
    const pollCountRef = useRef(0);

    const dismissBanner = () => {
        setShowBanner(false);
        const next = new URLSearchParams(searchParams);
        next.delete("payment");
        setSearchParams(next, { replace: true });
    };

    useEffect(() => {
        if (paymentStatus !== "success") return;

        // Webhook may take a moment to flip the invoice to "paid" — poll a
        // few times (every 2s, up to 5 tries) instead of a single refetch.
        pollCountRef.current = 0;
        const interval = setInterval(() => {
            pollCountRef.current += 1;
            refetch();
            if (pollCountRef.current >= 5) clearInterval(interval);
        }, 2000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentStatus]);

    // ── Filtering ──
    const filtered = invoices.filter((inv) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            inv.invoice_number.toLowerCase().includes(q) ||
            inv.subscription?.plan?.name?.toLowerCase().includes(q);
        const matchesStatus = filterStatus === "all" || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // ── Summary totals ──
    const totalUnpaid  = invoices.filter((i) => i.status === "unpaid" || i.status === "overdue").length;
    const totalPaid    = invoices.filter((i) => i.status === "paid").length;
    const totalDueAmount = invoices
        .filter((i) => i.status === "unpaid" || i.status === "overdue")
        .reduce((sum, i) => sum + Number(i.amount), 0);

    // ── Pagination ──
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#333333]">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">
                    My Invoices
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Account</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Invoices</span>
                </div>
            </div>

            {/* Payment redirect banner */}
            {showBanner && paymentStatus && (
                <PaymentStatusBanner status={paymentStatus} onDismiss={dismissBanner} />
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Due Now</p>
                    <p className="text-2xl font-bold text-[#D97706]">{totalUnpaid}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Paid</p>
                    <p className="text-2xl font-bold text-[#16A34A]">{totalPaid}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Outstanding Amount</p>
                    <p className="text-2xl font-bold text-slate-800">{formatAmount(String(totalDueAmount))}</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Top bar */}
                <div className="flex items-center justify-between px-6 pt-4 pb-0">
                    <div className="flex overflow-x-auto">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setFilterStatus(tab); setCurrentPage(1); }}
                                className={`pb-3 px-4 text-sm font-medium capitalize whitespace-nowrap transition-all relative ${
                                    filterStatus === tab
                                        ? "text-[#2D8A75] font-semibold"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab}
                                {filterStatus === tab && (
                                    <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#2D8A75]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pb-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search invoice number, plan..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="border border-gray-200 bg-white pl-9 pr-4 py-2 rounded text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-100" />

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8F9FA] border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-700 uppercase">
                                <th className="py-3 px-6">#</th>
                                <th className="py-3 px-4">Invoice</th>
                                <th className="py-3 px-4">Plan</th>
                                <th className="py-3 px-4">Amount</th>
                                <th className="py-3 px-4">Billing Date</th>
                                <th className="py-3 px-4">Due Date</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-6 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading invoices...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load invoices.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-gray-400 text-sm">
                                        <Receipt className="inline mb-2" size={22} />
                                        <div>No invoices found.</div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && paginated.map((inv, index) => {
                                const payable = inv.status === "unpaid" || inv.status === "overdue";
                                return (
                                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">

                                        <td className="py-3.5 px-6 text-gray-400 font-medium">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <p className="font-semibold text-gray-800 text-xs">{inv.invoice_number}</p>
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-gray-600">
                                            {inv.subscription?.plan?.name ?? "—"}
                                        </td>

                                        <td className="py-3.5 px-4 text-xs font-semibold text-gray-800">
                                            ৳{formatAmount(inv.amount)}
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-gray-600">
                                            {formatDate(inv.billing_date)}
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-gray-600">
                                            {formatDate(inv.due_date)}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold capitalize ${STATUS_STYLES[inv.status] ?? "bg-gray-100 text-gray-600"}`}>
                                                {inv.status}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center justify-center">
                                                {payable ? (
                                                    <button
                                                        onClick={() => setPayingInvoice(inv)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2D8A75] text-white text-xs font-semibold rounded hover:bg-[#256d5e] transition-colors"
                                                    >
                                                        <CreditCard size={13} />
                                                        Pay Now
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-white">
                    <div className="text-xs text-gray-500 font-medium">
                        Showing{" "}
                        <span className="font-bold text-gray-800">
                            {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                        </span>{" "}
                        of <span className="font-bold text-gray-800">{filtered.length}</span> results
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1 text-xs font-semibold">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`w-7 h-7 flex items-center justify-center rounded font-bold transition-colors ${
                                        page === currentPage
                                            ? "bg-[#2D8A75] text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Pay Modal */}
            {payingInvoice && (
                <PayInvoiceModal
                    invoice={payingInvoice}
                    onClose={() => setPayingInvoice(null)}
                />
            )}
        </div>
    );
};

export default MySubscriptionInvoicesPage;