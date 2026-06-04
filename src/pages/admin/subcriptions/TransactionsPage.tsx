import React, { useState } from "react";
import { Search, SlidersHorizontal, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
    useGetAllTransactionsQuery,
    useApproveTransactionMutation,
    useRejectTransactionMutation,
} from "../../../store/transactionApi";
import type { Transaction, TransactionStatus } from "../../../store/transactionApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const STATUS_STYLES: Record<TransactionStatus, string> = {
    paid:     "bg-[#DCFCE7] text-[#16A34A]",
    pending:  "bg-[#FEF3C7] text-[#D97706]",
    failed:   "bg-[#FFE4E6] text-[#F43F5E]",
    refunded: "bg-[#E0ECFB] text-[#4A90E2]",
    approved: "bg-[#DCFCE7] text-[#16A34A]",
    rejected: "bg-[#FFE4E6] text-[#F43F5E]",
};

const METHOD_LABELS: Record<string, string> = {
    paypal:        "PayPal",
    stripe:        "Stripe",
    credit_card:   "Credit Card",
    bank_transfer: "Bank Transfer",
    cash:          "Cash",
    other:         "Other",
};

const STATUS_TABS: ("all" | TransactionStatus)[] = [
    "all", "pending", "approved", "rejected", "paid", "failed", "refunded",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
    });

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
    });

// ─── Confirm Modal ────────────────────────────────────────────────────────────

type ActionType = "approve" | "reject";

interface ConfirmModalProps {
    transaction: Transaction;
    action: ActionType;
    onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ transaction, action, onClose }) => {
    const [approve, { isLoading: approving }] = useApproveTransactionMutation();
    const [reject,  { isLoading: rejecting  }] = useRejectTransactionMutation();

    const isLoading = approving || rejecting;
    const isApprove = action === "approve";

    const handle = async () => {
        try {
            if (isApprove) {
                await approve(transaction.id).unwrap();
            } else {
                await reject(transaction.id).unwrap();
            }
            onClose();
        } catch (err) {
            console.error(`Failed to ${action} transaction:`, err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">

                {/* Icon */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${
                    isApprove ? "bg-[#DCFCE7]" : "bg-[#FFE4E6]"
                }`}>
                    {isApprove
                        ? <CheckCircle size={22} className="text-[#16A34A]" />
                        : <XCircle   size={22} className="text-[#F43F5E]" />
                    }
                </div>

                <h2 className="text-base font-semibold text-gray-800 mb-1">
                    {isApprove ? "Approve Transaction" : "Reject Transaction"}
                </h2>
                <p className="text-sm text-gray-500 mb-1">
                    {isApprove
                        ? "Are you sure you want to approve this transaction?"
                        : "Are you sure you want to reject this transaction?"}
                </p>

                {/* Transaction details */}
                <div className="bg-gray-50 rounded-lg px-4 py-3 mt-3 mb-5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Transaction ID</span>
                        <span className="font-mono font-semibold text-gray-700">
                            {transaction.transaction_id}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Amount</span>
                        <span className="font-bold text-gray-800">
                            ${parseFloat(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Method</span>
                        <span className="text-gray-700">
                            {METHOD_LABELS[transaction.payment_method] ?? transaction.payment_method}
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
                            isApprove
                                ? "bg-[#16A34A] hover:bg-green-700"
                                : "bg-[#F43F5E] hover:bg-red-600"
                        }`}
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {isApprove ? "Approve" : "Reject"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TransactionsPage: React.FC = () => {
    const { data: transactions = [], isLoading, isError } = useGetAllTransactionsQuery();

    const [searchQuery, setSearchQuery]   = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | TransactionStatus>("all");
    const [currentPage, setCurrentPage]   = useState(1);

    const [modal, setModal] = useState<
        | { action: ActionType; transaction: Transaction }
        | null
    >(null);

    // ── Filtering ──
    const filtered = transactions.filter((t) => {
        const matchesSearch =
            t.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(t.subscription_id).includes(searchQuery);
        const matchesStatus = filterStatus === "all" || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // ── Summary totals ──
    const totalPaid     = transactions.filter((t) => t.status === "paid" || t.status === "approved").reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalPending  = transactions.filter((t) => t.status === "pending").length;
    const totalRejected = transactions.filter((t) => t.status === "rejected" || t.status === "failed").length;

    // ── Pagination ──
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Whether a transaction can still be actioned
    const canAction = (status: TransactionStatus) =>
        status === "pending";

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#333333]">

            {/* Breadcrumb */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">
                    Transactions
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Transactions</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">
                        Total Collected
                    </p>
                    <p className="text-2xl font-bold text-[#16A34A]">
                        ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">
                        Pending Review
                    </p>
                    <p className="text-2xl font-bold text-[#D97706]">{totalPending}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">
                        Rejected / Failed
                    </p>
                    <p className="text-2xl font-bold text-[#F43F5E]">{totalRejected}</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Top bar inside card */}
                <div className="flex items-center justify-between px-6 pt-4 pb-0">
                    {/* Status Tabs */}
                    <div className="flex border-b-0 overflow-x-auto">
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

                    {/* Search */}
                    <div className="flex items-center gap-2 pb-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search ID, method, subscription..."
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

                {/* Divider */}
                <div className="border-b border-gray-100" />

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8F9FA] border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-700 uppercase">
                                <th className="py-3 px-6">#</th>
                                <th className="py-3 px-4">Transaction ID</th>
                                <th className="py-3 px-4">Subscription</th>
                                <th className="py-3 px-4">Amount</th>
                                <th className="py-3 px-4">Method</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading transactions...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load transactions.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-gray-400 text-sm">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && paginated.map((txn, index) => (
                                <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">

                                    {/* # */}
                                    <td className="py-3.5 px-6 text-gray-400 font-medium">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>

                                    {/* Transaction ID */}
                                    <td className="py-3.5 px-4">
                                        <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded tracking-wide">
                                            {txn.transaction_id}
                                        </span>
                                    </td>

                                    {/* Subscription */}
                                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                                        #{txn.subscription_id}
                                    </td>

                                    {/* Amount */}
                                    <td className="py-3.5 px-4 font-bold text-gray-900">
                                        ${parseFloat(txn.amount).toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </td>

                                    {/* Method */}
                                    <td className="py-3.5 px-4 text-gray-600">
                                        {METHOD_LABELS[txn.payment_method] ?? txn.payment_method}
                                    </td>

                                    {/* Date */}
                                    <td className="py-3.5 px-4">
                                        <div className="text-xs text-gray-700 font-medium leading-tight">
                                            {formatDate(txn.created_at)}
                                        </div>
                                        <div className="text-[11px] text-gray-400 mt-0.5">
                                            {formatTime(txn.created_at)}
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="py-3.5 px-4">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold capitalize ${STATUS_STYLES[txn.status] ?? "bg-gray-100 text-gray-500"}`}>
                                            {txn.status}
                                        </span>
                                    </td>

                                    {/* Actions — approve / reject only for pending */}
                                    <td className="py-3.5 px-6">
                                        {canAction(txn.status) ? (
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setModal({ action: "approve", transaction: txn })}
                                                    className="flex items-center gap-1 px-2.5 py-1 bg-[#DCFCE7] hover:bg-green-100 text-[#16A34A] rounded text-[11px] font-semibold transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={12} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setModal({ action: "reject", transaction: txn })}
                                                    className="flex items-center gap-1 px-2.5 py-1 bg-[#FFE4E6] hover:bg-red-100 text-[#F43F5E] rounded text-[11px] font-semibold transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircle size={12} />
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center">
                                                <span className="text-[11px] text-gray-300 font-medium">—</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
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

            {/* Confirm Modal */}
            {modal && (
                <ConfirmModal
                    transaction={modal.transaction}
                    action={modal.action}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default TransactionsPage;