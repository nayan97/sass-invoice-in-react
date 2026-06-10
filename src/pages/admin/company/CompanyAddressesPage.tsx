import React, { useState } from "react";
import { useParams } from "react-router";
import { Search, MapPin, Pencil, Trash2, Loader2, Star } from "lucide-react";
import { useGetCompanyAddressesQuery } from "../../../store/companyAddressApi";
import type { Address } from "../../../store/companyAddressApi";
import { CompanyAddressModal, DeleteCompanyAddressModal } from "./CompanyAddressModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const TYPE_STYLES: Record<string, string> = {
    billing:  "bg-[#DBEAFE] text-[#2563EB]",
    shipping: "bg-[#EDE9FE] text-[#7C3AED]",
    office:   "bg-[#DCFCE7] text-[#16A34A]",
    other:    "bg-[#F3F4F6] text-[#6B7280]",
};

const TYPE_TABS = ["all", "billing", "shipping", "office", "other"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
    });

// ─── Page ─────────────────────────────────────────────────────────────────────

const CompanyAddressesPage: React.FC = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const id = Number(companyId);

    const { data: addresses = [], isLoading, isError } = useGetCompanyAddressesQuery(id);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType]   = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    type ModalState =
        | { type: "add" }
        | { type: "edit";   address: Address }
        | { type: "delete"; address: Address }
        | null;

    const [modal, setModal] = useState<ModalState>(null);

    // ── Filtering ──
    const filtered = addresses.filter((a) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            a.address_line.toLowerCase().includes(q) ||
            a.city.toLowerCase().includes(q)         ||
            a.state.toLowerCase().includes(q)        ||
            a.country.toLowerCase().includes(q)      ||
            a.zip_code.toLowerCase().includes(q);
        const matchesType = filterType === "all" || a.type === filterType;
        return matchesSearch && matchesType;
    });

    // ── Summary totals ──
    const totalDefault  = addresses.filter((a) => a.is_default).length;
    const totalBilling  = addresses.filter((a) => a.type === "billing").length;
    const totalShipping = addresses.filter((a) => a.type === "shipping").length;

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
                    Company Addresses
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="text-gray-400">Companies</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Addresses</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Billing</p>
                    <p className="text-2xl font-bold text-[#2563EB]">{totalBilling}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Shipping</p>
                    <p className="text-2xl font-bold text-[#7C3AED]">{totalShipping}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Default</p>
                    <p className="text-2xl font-bold text-[#2D8A75]">{totalDefault}</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Top bar */}
                <div className="flex items-center justify-between px-6 pt-4 pb-0">
                    <div className="flex overflow-x-auto">
                        {TYPE_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setFilterType(tab); setCurrentPage(1); }}
                                className={`pb-3 px-4 text-sm font-medium capitalize whitespace-nowrap transition-all relative ${
                                    filterType === tab
                                        ? "text-[#2D8A75] font-semibold"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab}
                                {filterType === tab && (
                                    <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#2D8A75]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pb-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search address, city, country..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="border border-gray-200 bg-white pl-9 pr-4 py-2 rounded text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <button
                            onClick={() => setModal({ type: "add" })}
                            className="flex items-center gap-1.5 px-3 py-2 bg-[#2D8A75] text-white text-sm font-medium rounded hover:bg-[#256d5e] transition-colors"
                        >
                            <MapPin size={14} />
                            Add Address
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
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4">Address</th>
                                <th className="py-3 px-4">City</th>
                                <th className="py-3 px-4">State</th>
                                <th className="py-3 px-4">Zip</th>
                                <th className="py-3 px-4">Country</th>
                                <th className="py-3 px-4">Default</th>
                                <th className="py-3 px-4">Created</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading addresses...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load addresses.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center text-gray-400 text-sm">
                                        No addresses found.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && paginated.map((address, index) => (
                                <tr key={address.id} className="hover:bg-gray-50/50 transition-colors">

                                    <td className="py-3.5 px-6 text-gray-400 font-medium">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold capitalize ${TYPE_STYLES[address.type] ?? "bg-gray-100 text-gray-600"}`}>
                                            {address.type}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600 max-w-[180px] truncate">
                                        {address.address_line}
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                        {address.city}
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                        {address.state}
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">
                                        {address.zip_code}
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                        {address.country}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        {address.is_default ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-[#D97706]">
                                                <Star size={10} className="fill-[#D97706]" />
                                                Default
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-gray-400">—</span>
                                        )}
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                        {formatDate(address.created_at)}
                                    </td>

                                    <td className="py-3.5 px-6">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => setModal({ type: "edit", address })}
                                                className="p-1.5 bg-[#E0ECFB] hover:bg-blue-100 text-[#4A90E2] rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => setModal({ type: "delete", address })}
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
            {modal?.type === "add" && (
                <CompanyAddressModal
                    companyId={id}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.type === "edit" && (
                <CompanyAddressModal
                    companyId={id}
                    address={modal.address}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.type === "delete" && (
                <DeleteCompanyAddressModal
                    companyId={id}
                    address={modal.address}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default CompanyAddressesPage;