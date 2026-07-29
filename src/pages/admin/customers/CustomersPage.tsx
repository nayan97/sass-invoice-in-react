import React, { useState } from "react";
import { useParams } from "react-router";
import {
    Search, Plus, Pencil, Trash2, Loader2,
    Users, CheckCircle, XCircle, Wallet, User,
} from "lucide-react";
import {
    useGetCustomersQuery,
    useDeleteCustomerMutation,
    type Customer,
} from "../../../store/customerApi";
import { useGetCustomerGroupsQuery } from "../../../store/customerGroupApi";
import CustomerModal from "./CustomerModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (amount: string | number) =>
    `৳${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteModalProps {
    customer: Customer;
    companyId: number;
    onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ customer, companyId, onClose }) => {
    const [deleteCustomer, { isLoading }] = useDeleteCustomerMutation();

    const handleDelete = async () => {
        try {
            await deleteCustomer({ companyId, customerId: customer.id }).unwrap();
            onClose();
        } catch { }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFE4E6] mx-auto mb-4">
                    <Trash2 size={20} className="text-[#F43F5E]" />
                </div>
                <h2 className="text-base font-bold text-gray-800 text-center mb-1">Delete Customer</h2>
                <p className="text-sm text-gray-500 text-center mb-1">Are you sure you want to delete</p>
                <p className="text-sm font-bold text-gray-700 text-center mb-2">{customer.name}?</p>
                <p className="text-xs text-gray-400 text-center mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-[#F43F5E] text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                        {isLoading ? "Deleting..." : "Delete Customer"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const CustomersPage: React.FC = () => {
    const { companyId } = useParams<{ companyId: string }>();
    const cId = Number(companyId);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filterGroup, setFilterGroup] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<"active" | "inactive" | "all">("all");

    const [modalCustomer, setModalCustomer] = useState<Customer | null | "new">(null);
    const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

    const { data: groups = [] } = useGetCustomerGroupsQuery({ companyId: cId });

    const { data, isLoading, isError, isFetching } =
        useGetCustomersQuery({
            companyId: cId,
            page,
            per_page: 15,
            search: search || undefined,
            group_id: filterGroup === "all" ? "all" : Number(filterGroup),
            status: filterStatus,
        });
    // console.log("data", data);

    const customers = data?.data ?? [];
    //    console.log("customers", customers);
    const meta = data?.meta;

    // ── Summary (current page) ──
    const totalActive = customers.filter(c => c.status).length;
    const totalInactive = customers.filter(c => !c.status).length;
    const totalDue = customers.reduce((s, c) => s + Number(c.total_due), 0);

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

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#333333]">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">Customers</h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Customers</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Total</p>
                        <Users size={14} className="text-[#2D8A75]" />
                    </div>
                    <p className="text-2xl font-bold text-[#2D8A75]">{meta?.total ?? 0}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Active</p>
                        <CheckCircle size={14} className="text-[#16A34A]" />
                    </div>
                    <p className="text-2xl font-bold text-[#16A34A]">{totalActive}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Inactive</p>
                        <XCircle size={14} className="text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-500">{totalInactive}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Total Due</p>
                        <Wallet size={14} className="text-[#F43F5E]" />
                    </div>
                    <p className="text-2xl font-bold text-[#F43F5E]">{fmt(totalDue)}</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Top Bar */}
                <div className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap">

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Group filter */}
                        <select
                            value={filterGroup}
                            onChange={e => { setFilterGroup(e.target.value); setPage(1); }}
                            className="border border-gray-200 rounded text-xs text-gray-600 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] bg-white"
                        >
                            <option value="all">All Groups</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>

                        {/* Status filter */}
                        <select
                            value={filterStatus}
                            onChange={e => { setFilterStatus(e.target.value as typeof filterStatus); setPage(1); }}
                            className="border border-gray-200 rounded text-xs text-gray-600 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search name, phone, email..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="border border-gray-200 bg-white pl-9 pr-4 py-2 rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
                        </div>
                    </div>

                    {/* Add */}
                    <button
                        onClick={() => setModalCustomer("new")}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#2D8A75] text-white text-sm font-medium rounded hover:bg-[#256d5e] transition-colors whitespace-nowrap"
                    >
                        <Plus size={14} /> Add Customer
                    </button>
                </div>

                <div className="border-b border-gray-100" />

                {/* Table */}
                <div className={`overflow-x-auto transition-opacity duration-150 ${isFetching ? "opacity-60" : "opacity-100"}`}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8F9FA] border-b border-gray-100 text-[10px] font-bold tracking-wider text-gray-600 uppercase">
                                <th className="py-3 px-5 w-8">#</th>
                                <th className="py-3 px-4">Customer</th>
                                <th className="py-3 px-4">Phone</th>
                                <th className="py-3 px-4">Group</th>
                                <th className="py-3 px-4">Total Sales</th>
                                <th className="py-3 px-4">Paid</th>
                                <th className="py-3 px-4">Due</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading customers...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load customers.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && customers.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center">
                                        <Users size={32} className="mx-auto mb-2 text-gray-200" />
                                        <p className="text-gray-400 text-sm">No customers found.</p>
                                        <button
                                            onClick={() => setModalCustomer("new")}
                                            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D8A75] text-white text-xs font-medium rounded hover:bg-[#256d5e]"
                                        >
                                            <Plus size={12} /> Add first customer
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && customers.map((customer, index) => (
                                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">

                                    <td className="py-3.5 px-5 text-gray-400 font-medium text-xs">
                                        {meta ? (meta.current_page - 1) * meta.per_page + index + 1 : index + 1}
                                    </td>

                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                {customer.avatar
                                                    ? <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                                                    : <User size={14} className="text-gray-400" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 text-xs leading-tight">{customer.name}</p>
                                                {customer.email && <p className="text-[10px] text-gray-400">{customer.email}</p>}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-3.5 px-4 text-xs text-gray-600">{customer.phone ?? "—"}</td>

                                    <td className="py-3.5 px-4">
                                        {customer.group ? (
                                            <div>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF2FF] text-[#6366F1]">
                                                    {customer.group.name}
                                                </span>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{customer.group.discount_rate}% off</p>
                                            </div>
                                        ) : <span className="text-[10px] text-gray-400">—</span>}
                                    </td>

                                    <td className="py-3.5 px-4 text-xs font-medium text-gray-700">{fmt(customer.total_sales)}</td>
                                    <td className="py-3.5 px-4 text-xs text-[#16A34A]">{fmt(customer.total_paid)}</td>
                                    <td className="py-3.5 px-4 text-xs font-bold text-[#F43F5E]">{fmt(customer.total_due)}</td>

                                    <td className="py-3.5 px-4">
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${customer.status ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F3F4F6] text-[#6B7280]"
                                            }`}>
                                            {customer.status ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => setModalCustomer(customer)}
                                                className="p-1.5 bg-[#E0ECFB] hover:bg-blue-100 text-[#4A90E2] rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(customer)}
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
                        {meta ? (
                            <>
                                Showing{" "}
                                <span className="font-bold text-gray-800">{meta.from} to {meta.to}</span>{" "}
                                of <span className="font-bold text-gray-800">{meta.total}</span> results
                            </>
                        ) : "Loading..."}
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
                                        className={`w-7 h-7 flex items-center justify-center rounded font-bold transition-colors ${p === page ? "bg-[#2D8A75] text-white" : "text-gray-600 hover:bg-gray-100"
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

            {/* Create/Edit Modal */}
            {modalCustomer && (
                <CustomerModal
                    companyId={cId}
                    customer={modalCustomer === "new" ? null : modalCustomer}
                    onClose={() => setModalCustomer(null)}
                />
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <DeleteModal
                    customer={deleteTarget}
                    companyId={cId}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
};

export default CustomersPage;