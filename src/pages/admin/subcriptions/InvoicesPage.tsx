import React, { useState } from "react";
import { Search, SlidersHorizontal, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
    useGetAllInvoicesQuery,
    useMarkInvoicePaidMutation,
    useCancelInvoiceMutation,
} from "../../../store/invoiceApi";
import type { Invoice, InvoiceStatus } from "../../../store/invoiceApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const STATUS_STYLES: Record<InvoiceStatus, string> = {
    unpaid:    "bg-[#FEF3C7] text-[#D97706]",
    paid:      "bg-[#DCFCE7] text-[#16A34A]",
    overdue:   "bg-[#FFE4E6] text-[#F43F5E]",
    cancelled: "bg-[#F3F4F6] text-[#6B7280]",
};

const STATUS_TABS: ("all" | InvoiceStatus)[] = [
    "all", "unpaid", "paid", "overdue", "cancelled",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
    });

const isDueOverdue = (due: string, status: InvoiceStatus) =>
    status === "unpaid" && new Date(due) < new Date();

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
    invoice: Invoice;
    action: "mark-paid" | "cancel";
    onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ invoice, action, onClose }) => {
    const [markPaid,  { isLoading: isPaying   }] = useMarkInvoicePaidMutation();
    const [cancelInv, { isLoading: isCancelling }] = useCancelInvoiceMutation();

    const isLoading = isPaying || isCancelling;
    const isPaid    = action === "mark-paid";

    const handle = async () => {
        try {
            if (isPaid) await markPaid(invoice.id).unwrap();
            else        await cancelInv(invoice.id).unwrap();
            onClose();
        } catch (err) {
            console.error("Action failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-2">
                    {isPaid ? "Mark as Paid" : "Cancel Invoice"}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    Are you sure you want to{" "}
                    <span className="font-semibold text-gray-700">
                        {isPaid ? "mark" : "cancel"}
                    </span>{" "}
                    invoice{" "}
                    <span className="font-mono font-semibold text-gray-700">
                        {invoice.invoice_number}
                    </span>
                    {isPaid ? " as paid?" : "? This cannot be undone."}
                </p>

                <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Amount</span>
                        <span className="font-bold text-gray-800">
                            ${parseFloat(invoice.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Company</span>
                        <span className="text-gray-700">{invoice.subscription?.company?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Plan</span>
                        <span className="text-gray-700">{invoice.subscription?.plan?.name ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Status</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${STATUS_STYLES[invoice.status]}`}>
                            {invoice.status}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handle}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-60 transition-colors ${
                            isPaid
                                ? "bg-[#16A34A] hover:bg-green-700"
                                : "bg-red-500 hover:bg-red-600"
                        }`}
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {isPaid ? "Mark Paid" : "Cancel Invoice"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const InvoicesPage: React.FC = () => {
    const { data: invoices = [], isLoading, isError } = useGetAllInvoicesQuery();

    const [searchQuery, setSearchQuery]   = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | InvoiceStatus>("all");
    const [currentPage, setCurrentPage]   = useState(1);

type ModalState =
    | { type: "mark-paid"; invoice: Invoice }
    | { type: "cancel"; invoice: Invoice }
    | null;

const [modal, setModal] = useState<ModalState>(null);

    // ── Filtering ──
    const filtered = invoices.filter((inv) => {
        const matchesSearch =
            inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.subscription?.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.amount.includes(searchQuery);
        const matchesStatus = filterStatus === "all" || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // ── Summary totals ──
    const totalPaid    = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + parseFloat(i.amount), 0);
    const totalUnpaid  = invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + parseFloat(i.amount), 0);
    const totalOverdue = invoices.filter((i) => i.status === "overdue").length;

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
                    Invoices
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Invoices</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-[#16A34A]">
                        ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Total Unpaid</p>
                    <p className="text-2xl font-bold text-[#D97706]">
                        ${totalUnpaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Overdue</p>
                    <p className="text-2xl font-bold text-[#F43F5E]">{totalOverdue}</p>
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
                                placeholder="Search invoice, company, amount..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="border border-gray-200 bg-white pl-9 pr-4 py-2 rounded text-sm w-72 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <button className="p-2 border border-gray-200 bg-[#E0ECFB] rounded hover:bg-blue-100 text-[#4A90E2] transition-colors">
                            <SlidersHorizontal size={16} />
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-100" />

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8F9FA] border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-700 uppercase">
                                <th className="py-3 px-6">#</th>
                                <th className="py-3 px-4">Invoice No.</th>
                                <th className="py-3 px-4">Company</th>
                                <th className="py-3 px-4">Plan</th>
                                <th className="py-3 px-4">Amount</th>
                                <th className="py-3 px-4">Billing Date</th>
                                <th className="py-3 px-4">Due Date</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading invoices...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load invoices.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400 text-sm">
                                        No invoices found.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && paginated.map((inv, index) => {
                                const overdue  = isDueOverdue(inv.due_date, inv.status);
                                const canPay   = inv.status === "unpaid" || inv.status === "overdue";
                                const canCancel = inv.status === "unpaid" || inv.status === "overdue";

                                return (
                                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">

                                        <td className="py-3.5 px-6 text-gray-400 font-medium">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded tracking-wide">
                                                {inv.invoice_number}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-gray-700 font-medium">
                                            {inv.subscription?.company?.name ?? "—"}
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-gray-600">
                                            {inv.subscription?.plan?.name ?? "—"}
                                        </td>

                                        <td className="py-3.5 px-4 font-bold text-gray-900">
                                            ${parseFloat(inv.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-gray-600">
                                            {formatDate(inv.billing_date)}
                                        </td>

                                        <td className="py-3.5 px-4 text-xs">
                                            <span className={overdue ? "text-[#F43F5E] font-semibold" : "text-gray-600"}>
                                                {formatDate(inv.due_date)}
                                            </span>
                                            {overdue && (
                                                <span className="ml-1.5 text-[10px] bg-[#FFE4E6] text-[#F43F5E] px-1.5 py-0.5 rounded font-bold">
                                                    Overdue
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold capitalize ${STATUS_STYLES[inv.status]}`}>
                                                {inv.status}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setModal({ type: "mark-paid", invoice: inv })}
                                                    disabled={!canPay}
                                                    className="p-1.5 bg-[#DCFCE7] hover:bg-green-100 text-[#16A34A] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Mark as Paid"
                                                >
                                                    <CheckCircle size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setModal({ type: "cancel", invoice: inv })}
                                                    disabled={!canCancel}
                                                    className="p-1.5 bg-[#FFE4E6] hover:bg-red-100 text-[#F43F5E] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Cancel Invoice"
                                                >
                                                    <XCircle size={13} />
                                                </button>
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

            {/* Modals */}
            {(modal?.type === "mark-paid" || modal?.type === "cancel") && (
                <ConfirmModal
                    invoice={modal.invoice}
                    action={modal.type}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default InvoicesPage;