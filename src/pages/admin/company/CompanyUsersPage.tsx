import React, { useState } from "react";
import { useParams } from "react-router";
import { Search, UserPlus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useGetCompanyUsersQuery } from "../../../store/companyUsersApi";
import type { CompanyUser } from "../../../store/companyUsersApi";
import { CompanyUserModal, DeleteCompanyUserModal } from "./CompanyUserModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const ROLE_STYLES: Record<string, string> = {
    admin:  "bg-[#EDE9FE] text-[#7C3AED]",
    member: "bg-[#DBEAFE] text-[#2563EB]",
    viewer: "bg-[#F3F4F6] text-[#6B7280]",
};

const STATUS_STYLES = {
    active:   "bg-[#DCFCE7] text-[#16A34A]",
    inactive: "bg-[#F3F4F6] text-[#6B7280]",
};

const ROLE_TABS = ["all", "admin", "member", "viewer"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
    });

// ─── Page ─────────────────────────────────────────────────────────────────────

const CompanyUsersPage: React.FC = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const id = Number(companyId);

    const { data: users = [], isLoading, isError } = useGetCompanyUsersQuery(id);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole]   = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    type ModalState =
        | { type: "add" }
        | { type: "edit";   user: CompanyUser }
        | { type: "delete"; user: CompanyUser }
        | null;

    const [modal, setModal] = useState<ModalState>(null);

    // ── Filtering ──
    const filtered = users.filter((u) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            u.user?.name?.toLowerCase().includes(q)  ||
            u.user?.email?.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q);
        const matchesRole = filterRole === "all" || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    // ── Summary totals ──
    const totalActive   = users.filter((u) => u.is_active).length;
    const totalInactive = users.filter((u) => !u.is_active).length;
    const totalAdmins   = users.filter((u) => u.role === "admin").length;

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
                    Company Users
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="text-gray-400">Companies</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Users</span>
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
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Admins</p>
                    <p className="text-2xl font-bold text-[#7C3AED]">{totalAdmins}</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Top bar */}
                <div className="flex items-center justify-between px-6 pt-4 pb-0">
                    <div className="flex overflow-x-auto">
                        {ROLE_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setFilterRole(tab); setCurrentPage(1); }}
                                className={`pb-3 px-4 text-sm font-medium capitalize whitespace-nowrap transition-all relative ${
                                    filterRole === tab
                                        ? "text-[#2D8A75] font-semibold"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab}
                                {filterRole === tab && (
                                    <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#2D8A75]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pb-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search name, email, role..."
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
                            <UserPlus size={14} />
                            Add User
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
                                <th className="py-3 px-4">User</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Role</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Joined</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading users...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load users.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-400 text-sm">
                                        No users found.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && paginated.map((u, index) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">

                                    <td className="py-3.5 px-6 text-gray-400 font-medium">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-2.5">
                                            {u.user?.avatar ? (
                                                <img
                                                    src={u.user.avatar}
                                                    alt={u.user.name}
                                                    className="w-7 h-7 rounded-full object-cover border border-gray-100"
                                                />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[10px] font-bold text-[#7C3AED]">
                                                    {u.user?.name?.charAt(0).toUpperCase() ?? "?"}
                                                </div>
                                            )}
                                            <p className="font-semibold text-gray-800 text-xs">
                                                {u.user?.name ?? `User #${u.user_id}`}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                        {u.user?.email ?? "—"}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold capitalize ${ROLE_STYLES[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                                            {u.role}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${u.is_active ? STATUS_STYLES.active : STATUS_STYLES.inactive}`}>
                                            {u.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">
                                        {formatDate(u.joined_at)}
                                    </td>

                                    <td className="py-3.5 px-6">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => setModal({ type: "edit", user: u })}
                                                className="p-1.5 bg-[#E0ECFB] hover:bg-blue-100 text-[#4A90E2] rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => setModal({ type: "delete", user: u })}
                                                className="p-1.5 bg-[#FFE4E6] hover:bg-red-100 text-[#F43F5E] rounded transition-colors"
                                                title="Remove"
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
                <CompanyUserModal
                    companyId={id}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.type === "edit" && (
                <CompanyUserModal
                    companyId={id}
                    user={modal.user}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.type === "delete" && (
                <DeleteCompanyUserModal
                    companyId={id}
                    user={modal.user}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default CompanyUsersPage;