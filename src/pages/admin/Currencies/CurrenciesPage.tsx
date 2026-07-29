import React, { useState } from "react";
import { Search, Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";
import { useGetCurrenciesQuery } from "../../../store/currencyApi";
import type { Currency } from "../../../store/currencyApi";
import { CurrencyModal, DeleteCurrencyModal } from "./CurrencyModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = ["all", "active", "inactive"];

const STATUS_STYLES = {
    active:   "bg-[#DCFCE7] text-[#16A34A]",
    inactive: "bg-[#F3F4F6] text-[#6B7280]",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const CurrenciesPage: React.FC = () => {
    const [page, setPage]           = useState(1);
    const [searchQuery, setSearch]  = useState("");
    const [filterStatus, setFilter] = useState("all");

    const { data, isLoading, isError } = useGetCurrenciesQuery({ page, per_page: 15 });

    const currencies: Currency[] = data?.data ?? [];
    const meta = data?.meta;

    type ModalState =
        | { type: "add" }
        | { type: "edit";   currency: Currency }
        | { type: "delete"; currency: Currency }
        | null;

    const [modal, setModal] = useState<ModalState>(null);

    // ── Client-side filter on current page ──
    const filtered = currencies.filter((c) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            c.name.toLowerCase().includes(q)   ||
            c.code.toLowerCase().includes(q)   ||
            c.symbol.toLowerCase().includes(q);
        const matchesStatus =
            filterStatus === "all"
                ? true
                : filterStatus === "active"
                ? c.is_active
                : !c.is_active;
        return matchesSearch && matchesStatus;
    });

    // ── Summary totals (current page) ──
    const totalActive   = currencies.filter((c) => c.is_active).length;
    const totalInactive = currencies.filter((c) => !c.is_active).length;
    // const totalDefault  = currencies.filter((c) => c.is_default).length;

    const goToPage = (p: number) => {
        if (!meta) return;
        if (p >= 1 && p <= meta.last_page) setPage(p);
    };

    // Build page number array with ellipsis logic
    const pageNumbers = (): (number | "…")[] => {
        if (!meta) return [];
        const { last_page, current_page } = meta;
        if (last_page <= 7) return Array.from({ length: last_page }, (_, i) => i + 1);
        const pages: (number | "…")[] = [1];
        if (current_page > 3) pages.push("…");
        for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
            pages.push(i);
        }
        if (current_page < last_page - 2) pages.push("…");
        pages.push(last_page);
        return pages;
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#333333]">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">
                    Currencies
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Currencies</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Active</p>
                    <p className="text-2xl font-bold text-[#16A34A]">{totalActive}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Inactive</p>
                    <p className="text-2xl font-bold text-[#6B7280]">{totalInactive}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Total</p>
                    <p className="text-2xl font-bold text-[#2D8A75]">{meta?.total ?? 0}</p>
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
                                onClick={() => setFilter(tab)}
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
                                placeholder="Search name, code, symbol..."
                                value={searchQuery}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border border-gray-200 bg-white pl-9 pr-4 py-2 rounded text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <button
                            onClick={() => setModal({ type: "add" })}
                            className="flex items-center gap-1.5 px-3 py-2 bg-[#2D8A75] text-white text-sm font-medium rounded hover:bg-[#256d5e] transition-colors"
                        >
                            <Plus size={14} />
                            Add Currency
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
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Code</th>
                                <th className="py-3 px-4">Symbol</th>
                                <th className="py-3 px-4">Decimals</th>
                                <th className="py-3 px-4">Exchange Rate</th>
                                <th className="py-3 px-4">Default</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading currencies...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load currencies.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400 text-sm">
                                        No currencies found.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && filtered.map((currency, index) => (
                                <tr key={currency.id} className="hover:bg-gray-50/50 transition-colors">

                                    <td className="py-3.5 px-6 text-gray-400 font-medium">
                                        {meta ? (meta.current_page - 1) * meta.per_page + index + 1 : index + 1}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <p className="font-semibold text-gray-800 text-xs">{currency.name}</p>
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className="font-mono font-bold text-xs tracking-widest text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                            {currency.code}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4 text-sm font-medium text-gray-700">
                                        {currency.symbol}
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                        {currency.decimal_places}
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">
                                        {currency.exchange_rate.toFixed(4)}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        {currency.is_default ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#D97706]">
                                                <Star size={10} className="fill-[#D97706]" />
                                                Default
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-gray-400">—</span>
                                        )}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                            currency.is_active ? STATUS_STYLES.active : STATUS_STYLES.inactive
                                        }`}>
                                            {currency.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-6">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => setModal({ type: "edit", currency })}
                                                className="p-1.5 bg-[#E0ECFB] hover:bg-blue-100 text-[#4A90E2] rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => setModal({ type: "delete", currency })}
                                                className="p-1.5 bg-[#FFE4E6] hover:bg-red-100 text-[#F43F5E] rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
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
                            {meta ? (meta.current_page - 1) * meta.per_page + 1 : 0} to{" "}
                            {meta ? Math.min(meta.current_page * meta.per_page, meta.total) : 0}
                        </span>{" "}
                        of <span className="font-bold text-gray-800">{meta?.total ?? 0}</span> results
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
                                    <span key={`ellipsis-${i}`} className="w-7 text-center text-gray-400">
                                        …
                                    </span>
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

            {/* Modals */}
            {modal?.type === "add" && (
                <CurrencyModal onClose={() => setModal(null)} />
            )}
            {modal?.type === "edit" && (
                <CurrencyModal currency={modal.currency} onClose={() => setModal(null)} />
            )}
            {modal?.type === "delete" && (
                <DeleteCurrencyModal currency={modal.currency} onClose={() => setModal(null)} />
            )}
        </div>
    );
};

export default CurrenciesPage;