import React, { useState } from "react";
import { Plus, Search, SlidersHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import {
    useGetCouponsQuery,
    useDeleteCouponMutation,
} from "../../../store/couponApi";
import type { Coupon } from "../../../store/couponApi";
import CouponModal, { EMPTY_COUPON_FORM } from "./CouponModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 7;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const isExpired = (iso: string) => new Date(iso) < new Date();

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteModalProps {
    coupon: Coupon;
    onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ coupon, onClose }) => {
    const [deleteCoupon, { isLoading }] = useDeleteCouponMutation();

    const handleDelete = async () => {
        try {
            await deleteCoupon(coupon.id).unwrap();
            onClose();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-2">Delete Coupon</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete coupon{" "}
                    <span className="font-mono font-semibold text-gray-700">{coupon.code}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
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

const CouponsPage: React.FC = () => {
    const { data: coupons = [], isLoading, isError } = useGetCouponsQuery();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [modal, setModal] = useState<
        | { type: "create" }
        | { type: "edit"; coupon: Coupon }
        | { type: "delete"; coupon: Coupon }
        | null
    >(null);

    // ── Filtering ──
    const filtered = coupons.filter((c) => {
        const matchesSearch =
            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.min_plan?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const active = Boolean(c.is_active);
        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && active) ||
            (filterStatus === "inactive" && !active);
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
                    Coupons
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Coupons</span>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => setModal({ type: "create" })}
                    className="flex items-center gap-2 bg-[#2D8A75] hover:bg-[#246F5E] text-white px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors"
                >
                    <Plus size={16} />
                    Add Coupon
                </button>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by code or plan..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border border-gray-200 bg-white pl-9 pr-4 py-2 rounded text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400"
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

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6 pt-4">
                    {(["all", "active", "inactive"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setFilterStatus(tab);
                                setCurrentPage(1);
                            }}
                            className={`pb-3 px-4 text-sm font-medium capitalize transition-all relative ${
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
                                <th className="py-3 px-4">Code</th>
                                <th className="py-3 px-4">Discount</th>
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4">Uses</th>
                                <th className="py-3 px-4">Min Plan</th>
                                <th className="py-3 px-4">Expires</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading coupons...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load coupons.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400 text-sm">
                                        No coupons found.
                                    </td>
                                </tr>
                            )}

                            {!isLoading &&
                                paginated.map((coupon, index) => {
                                    const expired = isExpired(coupon.expires_at);
                                    const active = Boolean(coupon.is_active);
                                    const usagePercent = coupon.max_uses > 0
                                        ? Math.min((coupon.used_count / coupon.max_uses) * 100, 100)
                                        : 0;

                                    return (
                                        <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3.5 px-6 text-gray-400 font-medium">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>

                                            {/* Code */}
                                            <td className="py-3.5 px-4">
                                                <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs tracking-widest">
                                                    {coupon.code}
                                                </span>
                                            </td>

                                            {/* Discount */}
                                            <td className="py-3.5 px-4 font-semibold text-gray-800">
                                                {coupon.type === "percent"
                                                    ? `${parseFloat(coupon.discount).toFixed(0)}%`
                                                    : `$${parseFloat(coupon.discount).toFixed(2)}`}
                                            </td>

                                            {/* Type */}
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    coupon.type === "percent"
                                                        ? "bg-[#EDE9FE] text-[#7C3AED]"
                                                        : "bg-[#FEF3C7] text-[#D97706]"
                                                }`}>
                                                    {coupon.type === "percent" ? "Percent" : "Fixed"}
                                                </span>
                                            </td>

                                            {/* Uses with progress bar */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2 min-w-[80px]">
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                usagePercent >= 100
                                                                    ? "bg-red-400"
                                                                    : usagePercent >= 70
                                                                    ? "bg-amber-400"
                                                                    : "bg-[#2D8A75]"
                                                            }`}
                                                            style={{ width: `${usagePercent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {coupon.used_count}/{coupon.max_uses}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Min Plan */}
                                            <td className="py-3.5 px-4">
                                                {coupon.min_plan ? (
                                                    <span className="bg-[#E8F5F1] text-[#2D8A75] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                                        {coupon.min_plan.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">—</span>
                                                )}
                                            </td>

                                            {/* Expires */}
                                            <td className="py-3.5 px-4">
                                                <span className={`text-xs font-medium ${expired ? "text-red-400" : "text-gray-600"}`}>
                                                    {formatDate(coupon.expires_at)}
                                                    {expired && (
                                                        <span className="ml-1 text-[10px] bg-red-50 text-red-400 px-1.5 py-0.5 rounded font-bold">
                                                            Expired
                                                        </span>
                                                    )}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                                    active
                                                        ? "bg-[#DCFCE7] text-[#16A34A]"
                                                        : "bg-[#FFE4E6] text-[#F43F5E]"
                                                }`}>
                                                    {active ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-6">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setModal({ type: "edit", coupon })}
                                                        className="p-1.5 bg-[#E0ECFB] hover:bg-blue-100 text-[#4A90E2] rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => setModal({ type: "delete", coupon })}
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

                {/* Pagination Footer */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-white">
                    <div className="text-xs text-gray-500 font-medium">
                        Showing{" "}
                        <span className="font-bold text-gray-800">
                            {filtered.length === 0
                                ? 0
                                : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                            to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
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
                <CouponModal
                    mode="create"
                    initial={EMPTY_COUPON_FORM}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "edit" && (
                <CouponModal
                    mode="edit"
                    couponId={modal.coupon.id}
                    initial={{
                        code: modal.coupon.code,
                        discount: modal.coupon.discount,
                        type: modal.coupon.type,
                        max_uses: modal.coupon.max_uses,
                        min_plan_id: modal.coupon.min_plan_id,
                        expires_at: modal.coupon.expires_at.split("T")[0],
                        is_active: Boolean(modal.coupon.is_active),
                    }}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "delete" && (
                <DeleteModal
                    coupon={modal.coupon}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default CouponsPage;