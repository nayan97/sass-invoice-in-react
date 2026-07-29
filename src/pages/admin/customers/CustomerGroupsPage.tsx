import React, { useState } from "react";
import { useParams } from "react-router";
import { Search, Plus, Pencil, Trash2, Loader2, Users} from "lucide-react";
import { useGetCustomerGroupsQuery } from "../../../store/customerGroupApi";
import type { CustomerGroup } from "../../../store/customerGroupApi";
import { CustomerGroupModal, DeleteCustomerGroupModal, groupColor } from "./CustomerGroupModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
    });

// ─── Page ─────────────────────────────────────────────────────────────────────

const CustomerGroupsPage: React.FC = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const cId = Number(companyId);

    const [searchQuery, setSearchQuery] = useState("");

    const { data: groups = [], isLoading, isError } = useGetCustomerGroupsQuery({ companyId: cId });

    type ModalState =
        | { type: "add" }
        | { type: "edit";   group: CustomerGroup }
        | { type: "delete"; group: CustomerGroup }
        | null;

    const [modal, setModal] = useState<ModalState>(null);

    // Client-side search
    const filtered = groups.filter((g) => {
        const q = searchQuery.toLowerCase();
        return (
            g.name.toLowerCase().includes(q) ||
            (g.description ?? "").toLowerCase().includes(q)
        );
    });

    // Summary
    const totalCustomers  = groups.reduce((sum, g) => sum + Number(g.customers_count), 0);
    const avgDiscount     = groups.length
        ? (groups.reduce((sum, g) => sum + Number(g.discount_rate), 0) / groups.length).toFixed(1)
        : "0.0";
    const highestDiscount = groups.length
        ? Math.max(...groups.map((g) => Number(g.discount_rate)))
        : 0;

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#333333]">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">
                    Customer Groups
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="text-gray-400">Companies</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Customer Groups</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Total Groups</p>
                    <p className="text-2xl font-bold text-[#2D8A75]">{groups.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Total Customers</p>
                    <p className="text-2xl font-bold text-[#2563EB]">{totalCustomers}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Avg. Discount</p>
                    <p className="text-2xl font-bold text-[#7C3AED]">{avgDiscount}%</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-1">Highest Discount</p>
                    <p className="text-2xl font-bold text-[#F43F5E]">{highestDiscount}%</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        All Groups
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold normal-case">
                            {filtered.length}
                        </span>
                    </p>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-gray-200 bg-white pl-9 pr-4 py-2 rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <button
                            onClick={() => setModal({ type: "add" })}
                            className="flex items-center gap-1.5 px-3 py-2 bg-[#2D8A75] text-white text-sm font-medium rounded hover:bg-[#256d5e] transition-colors"
                        >
                            <Plus size={14} />
                            Add Group
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
                                <th className="py-3 px-4">Group</th>
                                <th className="py-3 px-4">Description</th>
                                <th className="py-3 px-4">Discount Rate</th>
                                <th className="py-3 px-4">Customers</th>
                                <th className="py-3 px-4">Created</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading groups...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load customer groups.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-400 text-sm">
                                        No customer groups found.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && filtered.map((g, index) => {
                                const color = groupColor(g.id);
                                const count = Number(g.customers_count);

                                return (
                                    <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">

                                        <td className="py-3.5 px-6 text-gray-400 font-medium">
                                            {index + 1}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center shrink-0`}>
                                                    <span className={`${color.text} font-bold text-xs`}>
                                                        {g.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-gray-800 text-xs">{g.name}</p>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-gray-500 max-w-[220px]">
                                            {g.description
                                                ? <span className="line-clamp-1">{g.description}</span>
                                                : <span className="text-gray-300">—</span>
                                            }
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                                                    Number(g.discount_rate) === 0
                                                        ? "bg-gray-100 text-gray-500"
                                                        : Number(g.discount_rate) >= 20
                                                        ? "bg-[#FFE4E6] text-[#F43F5E]"
                                                        : Number(g.discount_rate) >= 10
                                                        ? "bg-[#FEF9C3] text-[#A16207]"
                                                        : "bg-[#DCFCE7] text-[#16A34A]"
                                                }`}>
                                                    {Number(g.discount_rate).toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Users size={12} className="text-gray-400" />
                                                <span className="font-medium">{count}</span>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-gray-600">
                                            {formatDate(g.created_at)}
                                        </td>

                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setModal({ type: "edit", group: g })}
                                                    className="p-1.5 bg-[#E0ECFB] hover:bg-blue-100 text-[#4A90E2] rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setModal({ type: "delete", group: g })}
                                                    className="p-1.5 bg-[#FFE4E6] hover:bg-red-100 text-[#F43F5E] rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer — no pagination needed (plain array) */}
                <div className="px-6 py-4 border-t border-gray-100 bg-white">
                    <p className="text-xs text-gray-400">
                        Showing <span className="font-bold text-gray-700">{filtered.length}</span> of{" "}
                        <span className="font-bold text-gray-700">{groups.length}</span> groups
                    </p>
                </div>
            </div>

            {/* Modals */}
            {modal?.type === "add" && (
                <CustomerGroupModal
                    companyId={cId}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.type === "edit" && (
                <CustomerGroupModal
                    companyId={cId}
                    group={modal.group}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.type === "delete" && (
                <DeleteCustomerGroupModal
                    companyId={cId}
                    group={modal.group}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default CustomerGroupsPage;
