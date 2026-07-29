import React, { useState } from "react";
import {
    Search, Plus, Loader2,
    FileText, TrendingUp, Clock, CheckCircle, XCircle,
} from "lucide-react";
import { useGetInvoicesQuery, useUpdateInvoiceStatusMutation, type Invoice, type InvoiceStatus } from "../../../store/mainInvoiceApi";
import { InvoiceDeleteModal } from "./InvoiceDeleteModal";
import { InvoiceActionsMenu } from "./InvoiceActionsMenu";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS: Array<InvoiceStatus | "all"> = [
    "all", "draft", "sent", "viewed", "paid", "partial", "overdue", "cancelled",
];

const STATUS_STYLES: Record<InvoiceStatus, string> = {
    draft:     "bg-[#F3F4F6] text-[#6B7280]",
    sent:      "bg-[#EFF6FF] text-[#3B82F6]",
    viewed:    "bg-[#F5F3FF] text-[#7C3AED]",
    paid:      "bg-[#DCFCE7] text-[#16A34A]",
    partial:   "bg-[#FEF9C3] text-[#CA8A04]",
    overdue:   "bg-[#FFE4E6] text-[#F43F5E]",
    cancelled: "bg-[#F3F4F6] text-[#9CA3AF]",
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
    draft:     "Draft",
    sent:      "Sent",
    viewed:    "Viewed",
    paid:      "Paid",
    partial:   "Partial",
    overdue:   "Overdue",
    cancelled: "Cancelled",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface InvoicesPageProps {
    companyId: number;
    onCreateInvoice: () => void;
    onEditInvoice: (invoice: Invoice) => void;
}

// ─── Delete Modal State ───────────────────────────────────────────────────────

type ModalState =
    | { type: "delete"; invoice: Invoice }
    | null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (amount: string | number, symbol = "$") =>
    `${symbol}${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── Page ─────────────────────────────────────────────────────────────────────

const InvoiceListPage: React.FC<InvoicesPageProps> = ({
    companyId,
    onCreateInvoice,
    onEditInvoice,
}) => {
    const [page, setPage]               = useState(1);
    const [searchQuery, setSearch]      = useState("");
    const [filterStatus, setFilter]     = useState<InvoiceStatus | "all">("all");
    const [modal, setModal]             = useState<ModalState>(null);
    const [sortBy, setSortBy]           = useState("created_at");
    const [sortDir, setSortDir]         = useState<"asc" | "desc">("desc");

    // ── RTK Query ──
    const { data, isLoading, isError, isFetching } = useGetInvoicesQuery({
        companyId,
        page,
        per_page: 15,
        status: filterStatus,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
    });

    const [updateStatus] = useUpdateInvoiceStatusMutation();

    const invoices = data?.data ?? [];
    const meta     = data?.meta;

    // ── Summary counts from meta totals ──
    const totalPaid    = invoices.filter(i => i.status === "paid").length;
    const totalOverdue = invoices.filter(i => i.status === "overdue").length;
    const totalDraft   = invoices.filter(i => i.status === "draft").length;

    // ── Sort toggle ──
    const handleSort = (col: string) => {
        if (sortBy === col) {
            setSortDir(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortBy(col);
            setSortDir("desc");
        }
    };

    const SortIcon = ({ col }: { col: string }) => (
        <span className={`ml-1 text-[9px] ${sortBy === col ? "text-[#2D8A75]" : "text-gray-300"}`}>
            {sortBy === col ? (sortDir === "asc" ? "▲" : "▼") : "▼"}
        </span>
    );

    // ── Pagination ──
    const goToPage = (p: number) => {
        if (!meta) return;
        if (p >= 1 && p <= meta.last_page) setPage(p);
    };

    const pageNumbers = (): (number | "…")[] => {
        if (!meta) return [];
        const { last_page, current_page } = meta;
        if (last_page <= 7) return Array.from({ length: last_page }, (_, i) => i + 1);
        const pages: (number | "…")[] = [1];
        if (current_page > 3) pages.push("…");
        for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) pages.push(i);
        if (current_page < last_page - 2) pages.push("…");
        pages.push(last_page);
        return pages;
    };

    // ── Quick status change ──
    const handleStatusChange = async (invoice: Invoice, status: InvoiceStatus) => {
        await updateStatus({ companyId, invoiceId: invoice.id, status });
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
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Total</p>
                        <FileText size={14} className="text-[#2D8A75]" />
                    </div>
                    <p className="text-2xl font-bold text-[#2D8A75]">{meta?.total ?? 0}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Paid</p>
                        <CheckCircle size={14} className="text-[#16A34A]" />
                    </div>
                    <p className="text-2xl font-bold text-[#16A34A]">{totalPaid}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Overdue</p>
                        <Clock size={14} className="text-[#F43F5E]" />
                    </div>
                    <p className="text-2xl font-bold text-[#F43F5E]">{totalOverdue}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Draft</p>
                        <TrendingUp size={14} className="text-[#6B7280]" />
                    </div>
                    <p className="text-2xl font-bold text-[#6B7280]">{totalDraft}</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Top bar — status tabs + search + add */}
                <div className="flex items-center justify-between px-6 pt-4 pb-0">
                    <div className="flex overflow-x-auto">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setFilter(tab); setPage(1); }}
                                className={`pb-3 px-3 text-[12px] font-medium capitalize whitespace-nowrap transition-all relative ${
                                    filterStatus === tab
                                        ? "text-[#2D8A75] font-semibold"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab}
                                {filterStatus === tab && (
                                    <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#2D8A75]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pb-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search invoice no, customer..."
                                value={searchQuery}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="border border-gray-200 bg-white pl-9 pr-4 py-2 rounded text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <button
                            onClick={onCreateInvoice}
                            className="flex items-center gap-1.5 px-3 py-2 bg-[#2D8A75] text-white text-sm font-medium rounded hover:bg-[#256d5e] transition-colors whitespace-nowrap"
                        >
                            <Plus size={14} />
                            New Invoice
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-100" />

                {/* Table */}
                <div className={`overflow-x-auto transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8F9FA] border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-700 uppercase">
                                <th className="py-3 px-6">#</th>
                                <th
                                    className="py-3 px-4 cursor-pointer select-none hover:text-[#2D8A75]"
                                    onClick={() => handleSort("invoice_no")}
                                >
                                    Invoice No <SortIcon col="invoice_no" />
                                </th>
                                <th className="py-3 px-4">Customer</th>
                                <th
                                    className="py-3 px-4 cursor-pointer select-none hover:text-[#2D8A75]"
                                    onClick={() => handleSort("invoice_date")}
                                >
                                    Date <SortIcon col="invoice_date" />
                                </th>
                                <th
                                    className="py-3 px-4 cursor-pointer select-none hover:text-[#2D8A75]"
                                    onClick={() => handleSort("due_date")}
                                >
                                    Due Date <SortIcon col="due_date" />
                                </th>
                                <th
                                    className="py-3 px-4 cursor-pointer select-none hover:text-[#2D8A75] text-right"
                                    onClick={() => handleSort("grand_total")}
                                >
                                    Amount <SortIcon col="grand_total" />
                                </th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
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

                            {!isLoading && !isError && invoices.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <XCircle size={32} className="mx-auto mb-2 text-gray-200" />
                                        <p className="text-gray-400 text-sm">No invoices found.</p>
                                        {filterStatus !== "all" || searchQuery ? (
                                            <button
                                                onClick={() => { setFilter("all"); setSearch(""); }}
                                                className="mt-2 text-xs text-[#2D8A75] hover:underline"
                                            >
                                                Clear filters
                                            </button>
                                        ) : (
                                            <button
                                                onClick={onCreateInvoice}
                                                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D8A75] text-white text-xs font-medium rounded hover:bg-[#256d5e]"
                                            >
                                                <Plus size={12} /> Create your first invoice
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}

                            {!isLoading && invoices.map((invoice, index) => {
                                const currencySymbol = invoice.currency?.symbol ?? "$";
                                const isOverdue = invoice.status === "overdue";

                                return (
                                    <tr
                                        key={invoice.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        {/* Row No */}
                                        <td className="py-3.5 px-6 text-gray-400 font-medium text-xs">
                                            {meta ? (meta.current_page - 1) * meta.per_page + index + 1 : index + 1}
                                        </td>

                                        {/* Invoice No */}
                                        <td className="py-3.5 px-4">
                                            <span className="font-mono font-bold text-xs tracking-widest text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                                {invoice.invoice_no}
                                            </span>
                                        </td>

                                        {/* Customer */}
                                        <td className="py-3.5 px-4">
                                            <p className="font-semibold text-gray-800 text-xs leading-tight">
                                                {invoice.customer_name}
                                            </p>
                                            {invoice.customer_email && (
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {invoice.customer_email}
                                                </p>
                                            )}
                                        </td>

                                        {/* Invoice Date */}
                                        <td className="py-3.5 px-4 text-xs text-gray-600">
                                            {fmtDate(invoice.invoice_date)}
                                        </td>

                                        {/* Due Date */}
                                        <td className="py-3.5 px-4 text-xs">
                                            <span className={isOverdue ? "text-[#F43F5E] font-semibold" : "text-gray-600"}>
                                                {fmtDate(invoice.due_date)}
                                            </span>
                                        </td>

                                        {/* Amount */}
                                        <td className="py-3.5 px-4 text-right">
                                            <p className="font-bold text-[13px] text-gray-800">
                                                {fmt(invoice.grand_total, currencySymbol)}
                                            </p>
                                            {Number(invoice.discount_total) > 0 && (
                                                <p className="text-[10px] text-gray-400 line-through">
                                                    {fmt(Number(invoice.grand_total) + Number(invoice.discount_total), currencySymbol)}
                                                </p>
                                            )}
                                        </td>

                                        {/* Status — clickable dropdown for quick change */}
                                        <td className="py-3.5 px-4">
                                            <select
                                                value={invoice.status}
                                                onChange={(e) => handleStatusChange(invoice, e.target.value as InvoiceStatus)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold border-0 cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-[#2D8A75] ${STATUS_STYLES[invoice.status]}`}
                                            >
                                                {(Object.keys(STATUS_LABELS) as InvoiceStatus[]).map((s) => (
                                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Actions — 3-dot dropdown menu */}
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center justify-center">
                                                <InvoiceActionsMenu
                                                    invoice={invoice}
                                                    companyId={companyId}
                                                    onView={() => onEditInvoice(invoice)}
                                                    onEdit={() => onEditInvoice(invoice)}
                                                    onDelete={() => setModal({ type: "delete", invoice })}
                                                />
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
                        {meta ? (
                            <>
                                Showing{" "}
                                <span className="font-bold text-gray-800">{meta.from} to {meta.to}</span>{" "}
                                of <span className="font-bold text-gray-800">{meta.total}</span> results
                            </>
                        ) : (
                            <span>Loading...</span>
                        )}
                    </div>

                    {meta && meta.last_page > 1 && (
                        <div className="flex items-center gap-1 text-xs font-semibold">
                            <button
                                onClick={() => goToPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                Previous
                            </button>

                            {pageNumbers().map((p, i) =>
                                p === "…" ? (
                                    <span key={`e-${i}`} className="w-7 text-center text-gray-400">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => goToPage(p)}
                                        className={`w-7 h-7 flex items-center justify-center rounded font-bold transition-colors ${
                                            p === page
                                                ? "bg-[#2D8A75] text-white"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => goToPage(page + 1)}
                                disabled={page === meta.last_page}
                                className="px-3 py-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {modal?.type === "delete" && (
                <InvoiceDeleteModal
                    invoice={modal.invoice}
                    companyId={companyId}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default InvoiceListPage;