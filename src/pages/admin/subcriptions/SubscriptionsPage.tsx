import React, { useState } from "react";
import { Plus, Search, SlidersHorizontal, Pencil, Trash2, Ban, Loader2 } from "lucide-react";
import {
    useGetSubscriptionsQuery,
    useDeleteSubscriptionMutation,
    useCancelSubscriptionMutation,
} from "../../../store/subscriptionApi";
import type { Subscription, SubscriptionStatus } from "../../../store/subscriptionApi";
import SubscriptionModal, { EMPTY_SUBSCRIPTION_FORM } from "./SubscriptionModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 7;

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
    trial:     "bg-[#EDE9FE] text-[#7C3AED]",
    active:    "bg-[#DCFCE7] text-[#16A34A]",
    cancelled: "bg-[#FFE4E6] text-[#F43F5E]",
    expired:   "bg-[#F3F4F6] text-[#6B7280]",
    pending:   "bg-[#FEF3C7] text-[#D97706]",
};

const STATUS_TABS: ("all" | SubscriptionStatus)[] = [
    "all", "trial", "active", "pending", "cancelled", "expired",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string | null) => {
    if (!iso) return <span className="text-gray-300">—</span>;
    return new Date(iso).toLocaleDateString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
    });
};

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

interface CancelModalProps {
    subscription: Subscription;
    onClose: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ subscription, onClose }) => {
    const [cancelSub, { isLoading }] = useCancelSubscriptionMutation();

    const handle = async () => {
        try {
            await cancelSub(subscription.id).unwrap();
            onClose();
        } catch (err) {
            console.error("Cancel failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-2">Cancel Subscription</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Cancel the{" "}
                    <span className="font-semibold text-gray-700">{subscription.plan?.name}</span>{" "}
                    subscription for company{" "}
                    <span className="font-semibold text-gray-700">#{subscription.company_id}</span>?
                </p>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Keep Active
                    </button>
                    <button
                        onClick={handle}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-60 transition-colors"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        Cancel Subscription
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteModalProps {
    subscription: Subscription;
    onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ subscription, onClose }) => {
    const [deleteSub, { isLoading }] = useDeleteSubscriptionMutation();

    const handle = async () => {
        try {
            await deleteSub(subscription.id).unwrap();
            onClose();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-2">Delete Subscription</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Permanently delete the{" "}
                    <span className="font-semibold text-gray-700">{subscription.plan?.name}</span>{" "}
                    subscription for company{" "}
                    <span className="font-semibold text-gray-700">#{subscription.company_id}</span>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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

const SubscriptionsPage: React.FC = () => {
    const { data: subscriptions = [], isLoading, isError } = useGetSubscriptionsQuery();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | SubscriptionStatus>("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [modal, setModal] = useState<
        | { type: "create" }
        | { type: "edit"; sub: Subscription }
        | { type: "cancel"; sub: Subscription }
        | { type: "delete"; sub: Subscription }
        | null
    >(null);

    // ── Filtering ──
    const filtered = subscriptions.filter((s) => {
        const matchesSearch =
            s.plan?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(s.company_id).includes(searchQuery) ||
            s.coupon?.code?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "all" || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // ── Pagination ──
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#333333]">

            {/* Breadcrumb */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">
                    Subscriptions
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Subscriptions</span>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => setModal({ type: "create" })}
                    className="flex items-center gap-2 bg-[#2D8A75] hover:bg-[#246F5E] text-white px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors"
                >
                    <Plus size={16} />
                    Add Subscription
                </button>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by plan, company, coupon..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border border-gray-200 bg-white pl-9 pr-4 py-2 rounded text-sm w-72 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                    <button className="p-2 border border-gray-200 bg-[#E0ECFB] rounded hover:bg-blue-100 text-[#4A90E2] transition-colors">
                        <SlidersHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                {/* Status Tabs */}
                <div className="flex border-b border-gray-100 px-6 pt-4 overflow-x-auto">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setFilterStatus(tab);
                                setCurrentPage(1);
                            }}
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8F9FA] border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-700 uppercase">
                                <th className="py-3 px-6">#</th>
                                <th className="py-3 px-4">Company</th>
                                <th className="py-3 px-4">Plan</th>
                                <th className="py-3 px-4">Coupon</th>
                                <th className="py-3 px-4">Start Date</th>
                                <th className="py-3 px-4">Trial Ends</th>
                                <th className="py-3 px-4">Renews At</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading subscriptions...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load subscriptions.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400 text-sm">
                                        No subscriptions found.
                                    </td>
                                </tr>
                            )}

                            {!isLoading &&
                                paginated.map((sub, index) => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">

                                        {/* # */}
                                        <td className="py-3.5 px-6 text-gray-400 font-medium">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>

                                        {/* Company */}
                                        <td className="py-3.5 px-4 font-semibold text-gray-800">
                                            #{sub.company_id}
                                        </td>

                                        {/* Plan */}
                                        <td className="py-3.5 px-4">
                                            {sub.plan ? (
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-xs leading-tight">
                                                        {sub.plan.name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5">
                                                        ${parseFloat(sub.plan.price).toLocaleString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>

                                        {/* Coupon */}
                                        <td className="py-3.5 px-4">
                                            {sub.coupon ? (
                                                <div>
                                                    <span className="font-mono font-bold text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded tracking-widest">
                                                        {sub.coupon.code}
                                                    </span>
                                                    <div className="text-[11px] text-[#7C3AED] mt-0.5">
                                                        {sub.coupon.type === "percent"
                                                            ? `${parseFloat(sub.coupon.discount).toFixed(0)}% off`
                                                            : `$${parseFloat(sub.coupon.discount).toFixed(2)} off`}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>

                                        {/* Start Date */}
                                        <td className="py-3.5 px-4 text-gray-600 text-xs">
                                            {formatDate(sub.start_date)}
                                        </td>

                                        {/* Trial Ends */}
                                        <td className="py-3.5 px-4 text-xs">
                                            {sub.trial_ends_at ? (
                                                <span className={
                                                    new Date(sub.trial_ends_at) < new Date()
                                                        ? "text-red-400"
                                                        : "text-[#7C3AED]"
                                                }>
                                                    {formatDate(sub.trial_ends_at)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>

                                        {/* Renews At */}
                                        <td className="py-3.5 px-4 text-gray-600 text-xs">
                                            {formatDate(sub.renews_at)}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 px-4">
                                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold capitalize ${STATUS_STYLES[sub.status] ?? "bg-gray-100 text-gray-500"}`}>
                                                {sub.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setModal({ type: "edit", sub })}
                                                    className="p-1.5 bg-[#E0ECFB] hover:bg-blue-100 text-[#4A90E2] rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                {sub.status !== "cancelled" && (
                                                    <button
                                                        onClick={() => setModal({ type: "cancel", sub })}
                                                        className="p-1.5 bg-[#FEF3C7] hover:bg-amber-100 text-[#D97706] rounded transition-colors"
                                                        title="Cancel subscription"
                                                    >
                                                        <Ban size={13} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setModal({ type: "delete", sub })}
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
            {modal?.type === "create" && (
                <SubscriptionModal
                    mode="create"
                    initial={EMPTY_SUBSCRIPTION_FORM}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "edit" && (
                <SubscriptionModal
                    mode="edit"
                    subscriptionId={modal.sub.id}
                    initial={{
                        company_id: modal.sub.company_id,
                        plan_id: modal.sub.plan_id,
                        coupon_id: modal.sub.coupon_id,
                        start_date: modal.sub.start_date.split("T")[0],
                        end_date: modal.sub.end_date ? modal.sub.end_date.split("T")[0] : null,
                        status: modal.sub.status,
                    }}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "cancel" && (
                <CancelModal subscription={modal.sub} onClose={() => setModal(null)} />
            )}

            {modal?.type === "delete" && (
                <DeleteModal subscription={modal.sub} onClose={() => setModal(null)} />
            )}
        </div>
    );
};

export default SubscriptionsPage;