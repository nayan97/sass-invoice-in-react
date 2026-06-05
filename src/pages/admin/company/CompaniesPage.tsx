import React, { useState } from "react";
import { Search, SlidersHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import {
    useGetAllCompaniesQuery,
    useDeleteCompanyMutation,
} from "../../../store/companyApi";
import type { Company } from "../../../store/companyApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const STATUS_STYLES: Record<string, string> = {
    active:   "bg-[#DCFCE7] text-[#16A34A]",
    inactive: "bg-[#F3F4F6] text-[#6B7280]",
};

const PLAN_STYLES: Record<string, string> = {
    trial:      "bg-[#FEF3C7] text-[#D97706]",
    basic:      "bg-[#DBEAFE] text-[#2563EB]",
    pro:        "bg-[#EDE9FE] text-[#7C3AED]",
    enterprise: "bg-[#DCFCE7] text-[#16A34A]",
};

const PLAN_TABS: ("all" | string)[] = ["all", "trial", "basic", "pro", "enterprise"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
    });

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteModalProps {
    company: Company;
    onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ company, onClose }) => {
    const [deleteCompany, { isLoading }] = useDeleteCompanyMutation();

    const handle = async () => {
        try {
            await deleteCompany(company.id).unwrap();
            onClose();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-2">Delete Company</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-700">{company.name}</span>?
                    This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Email</span>
                        <span className="text-gray-700">{company.email}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Plan</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${PLAN_STYLES[company.plan] ?? "bg-gray-100 text-gray-600"}`}>
                            {company.plan}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Status</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${company.status ? STATUS_STYLES.active : STATUS_STYLES.inactive}`}>
                            {company.status ? "Active" : "Inactive"}
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
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const CompaniesPage: React.FC = () => {
    const { data: companies = [], isLoading, isError } = useGetAllCompaniesQuery();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterPlan, setFilterPlan]   = useState<"all" | string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    type ModalState =
        | { type: "delete"; company: Company }
        | null;

    const [modal, setModal] = useState<ModalState>(null);

    // ── Filtering ──
    const filtered = companies.filter((c) => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchQuery.toLowerCase())   ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase())  ||
            c.phone?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlan = filterPlan === "all" || c.plan === filterPlan;
        return matchesSearch && matchesPlan;
    });

    // ── Summary totals ──
    const totalActive   = companies.filter((c) => c.status).length;
    const totalInactive = companies.filter((c) => !c.status).length;
    const totalTrial    = companies.filter((c) => c.plan === "trial").length;

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
                    Companies
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Companies</span>
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
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">On Trial</p>
                    <p className="text-2xl font-bold text-[#D97706]">{totalTrial}</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Top bar */}
                <div className="flex items-center justify-between px-6 pt-4 pb-0">
                    <div className="flex overflow-x-auto">
                        {PLAN_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setFilterPlan(tab); setCurrentPage(1); }}
                                className={`pb-3 px-4 text-sm font-medium capitalize whitespace-nowrap transition-all relative ${
                                    filterPlan === tab
                                        ? "text-[#2D8A75] font-semibold"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab}
                                {filterPlan === tab && (
                                    <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#2D8A75]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pb-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search name, email, phone..."
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
                                <th className="py-3 px-4">Company</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Phone</th>
                                <th className="py-3 px-4">Plan</th>
                                <th className="py-3 px-4">Currency</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Joined</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading companies...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load companies.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400 text-sm">
                                        No companies found.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && paginated.map((company, index) => (
                                <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">

                                    <td className="py-3.5 px-6 text-gray-400 font-medium">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2.5">
                                            {company.logo ? (
                                                <img
                                                    src={company.logo}
                                                    alt={company.name}
                                                    className="w-7 h-7 rounded-full object-cover border border-gray-100"
                                                />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-[#E0ECFB] flex items-center justify-center text-[10px] font-bold text-[#4A90E2]">
                                                    {company.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-800 text-xs">{company.name}</p>
                                                <p className="text-[10px] text-gray-400">{company.tax_number}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                        {company.email}
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                        {company.phone ?? "—"}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold capitalize ${PLAN_STYLES[company.plan] ?? "bg-gray-100 text-gray-600"}`}>
                                            {company.plan}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">
                                        {company.currency}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${company.status ? STATUS_STYLES.active : STATUS_STYLES.inactive}`}>
                                            {company.status ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                        {formatDate(company.created_at)}
                                    </td>

                                    <td className="py-3.5 px-6">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                className="p-1.5 bg-[#E0ECFB] hover:bg-blue-100 text-[#4A90E2] rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => setModal({ type: "delete", company })}
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
            {modal?.type === "delete" && (
                <DeleteModal
                    company={modal.company}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default CompaniesPage;