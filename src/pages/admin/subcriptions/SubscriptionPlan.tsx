import React, { useState } from "react";
import { Plus, Search, SlidersHorizontal, Pencil, Trash2, X, Loader2 } from "lucide-react";
import {
    useGetSubscriptionPlansQuery,
    useCreateSubscriptionPlanMutation,
    useUpdateSubscriptionPlanMutation,
    useDeleteSubscriptionPlanMutation,
} from "../../../store/subscriptionPlansApi";

import type {
    SubscriptionPlan,
    SubscriptionPlanPayload,
} from "../../../store/subscriptionPlansApi";

// ─── Types ───────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";

export interface PlanFeaturePayload {
    feature_name: string;
}

export interface SubscriptionPlanPayload {
    name: string;
    price: string;
    customer_limit: number;
    product_limit: number;
    invoice_limit: number;
    trial_days: number;
    is_active: boolean;
    features: PlanFeaturePayload[];
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface PlanModalProps {
    mode: ModalMode;
    initial: SubscriptionPlanPayload;
    planId?: number;
    onClose: () => void;
}

const PlanModal: React.FC<PlanModalProps> = ({ mode, initial, planId, onClose }) => {
    const [form, setForm] = useState<SubscriptionPlanPayload>(initial);
    const [featureInput, setFeatureInput] = useState("");

    const [createPlan, { isLoading: creating }] = useCreateSubscriptionPlanMutation();
    const [updatePlan, { isLoading: updating }] = useUpdateSubscriptionPlanMutation();

    const isLoading = creating || updating;

    const set = (key: keyof SubscriptionPlanPayload, value: any) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const addFeature = () => {
        const trimmed = featureInput.trim();
        if (!trimmed) return;
        set("features", [...(form.features ?? []), trimmed]);
        setFeatureInput("");
    };

    const removeFeature = (index: number) =>
        set(
            "features",
            (form.features ?? []).filter((_, i) => i !== index)
        );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (mode === "create") {
                await createPlan(form).unwrap();
            } else if (planId !== undefined) {
                await updatePlan({ id: planId, data: form }).unwrap();
            }
            onClose();
        } catch (err) {
            console.error("Failed to save plan:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800">
                        {mode === "create" ? "Add Subscription Plan" : "Edit Subscription Plan"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Plan Name</label>
                        <input
                            required
                            type="text"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g. Gold Plus"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => set("price", e.target.value)}
                            placeholder="0.00"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                        />
                    </div>

                    {/* Limits row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Customer Limit</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={form.customer_limit}
                                onChange={(e) => set("customer_limit", Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Product Limit</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={form.product_limit}
                                onChange={(e) => set("product_limit", Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Invoice Limit</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={form.invoice_limit}
                                onChange={(e) => set("invoice_limit", Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                    </div>

                    {/* Trial days + is_active row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Trial Days</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={form.trial_days}
                                onChange={(e) => set("trial_days", Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select
                                value={form.is_active ? "active" : "inactive"}
                                onChange={(e) => set("is_active", e.target.value === "active")}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Features</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addFeature();
                                    }
                                }}
                                placeholder="Type a feature and press Enter"
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                className="px-3 py-2 bg-[#2D8A75] text-white rounded-lg text-sm hover:bg-[#246F5E] transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        {(form.features ?? []).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {(form.features ?? []).map((f, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 bg-[#E8F5F1] text-[#2D8A75] text-xs px-2.5 py-1 rounded-full font-medium"
                                    >
                                        {f}
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(i)}
                                            className="hover:text-red-500 transition-colors"
                                        >
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit as any}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#2D8A75] text-white rounded-lg hover:bg-[#246F5E] disabled:opacity-60 transition-colors"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {mode === "create" ? "Create Plan" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

interface DeleteModalProps {
    plan: SubscriptionPlan;
    onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ plan, onClose }) => {
    const [deletePlan, { isLoading }] = useDeleteSubscriptionPlanMutation();

    const handleDelete = async () => {
        try {
            await deletePlan(plan.id).unwrap();
            onClose();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-2">Delete Plan</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete{" "}
                    <span className="font-medium text-gray-700">{plan.name}</span>? This action cannot be undone.
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

const ITEMS_PER_PAGE = 7;

const SubscriptionPlansPage: React.FC = () => {
    const { data: plans = [], isLoading, isError } = useGetSubscriptionPlansQuery();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [modal, setModal] = useState<
        | { type: "create" }
        | { type: "edit"; plan: SubscriptionPlan }
        | { type: "delete"; plan: SubscriptionPlan }
        | null
    >(null);

    // ── Filtering ──
    const filtered = plans.filter((plan) => {
        const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterActive === "all" ||
            (filterActive === "active" && plan.is_active) ||
            (filterActive === "inactive" && !plan.is_active);
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

    const formatPrice = (price: string) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(price));

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6 font-sans text-[#333333]">

            {/* Breadcrumb */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">
                    Subscription Plans
                </h1>
                <div className="text-xs text-gray-500">
                    <span className="text-gray-400">Admin</span>
                    <span className="mx-1">&gt;</span>
                    <span className="font-medium text-gray-700">Subscription Plans</span>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => setModal({ type: "create" })}
                    className="flex items-center gap-2 bg-[#2D8A75] hover:bg-[#246F5E] text-white px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors"
                >
                    <Plus size={16} />
                    Add Plan
                </button>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search plans..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border border-gray-200 bg-white pl-9 pr-4 py-2 rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400"
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
                                setFilterActive(tab);
                                setCurrentPage(1);
                            }}
                            className={`pb-3 px-4 text-sm font-medium capitalize transition-all relative ${
                                filterActive === tab
                                    ? "text-[#2D8A75] font-semibold"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            {tab}
                            {filterActive === tab && (
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
                                <th className="py-3 px-4">Plan Name</th>
                                <th className="py-3 px-4">Price</th>
                                <th className="py-3 px-4">Customers</th>
                                <th className="py-3 px-4">Products</th>
                                <th className="py-3 px-4">Invoices</th>
                                <th className="py-3 px-4">Trial Days</th>
                                <th className="py-3 px-4">Features</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px] text-gray-700">

                            {isLoading && (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center text-gray-400">
                                        <Loader2 className="inline animate-spin" size={20} />
                                        <span className="ml-2">Loading plans...</span>
                                    </td>
                                </tr>
                            )}

                            {isError && (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center text-red-400 text-sm">
                                        Failed to load subscription plans.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="py-16 text-center text-gray-400 text-sm">
                                        No plans found.
                                    </td>
                                </tr>
                            )}

                            {!isLoading &&
                                paginated.map((plan, index) => (
                                    <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3.5 px-6 text-gray-400 font-medium">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-900 font-semibold">{plan.name}</td>
                                        <td className="py-3.5 px-4 text-gray-800 font-semibold">
                                            {formatPrice(plan.price)}
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-600">
                                            {plan.customer_limit.toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-600">
                                            {plan.product_limit.toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-600">
                                            {plan.invoice_limit.toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-600">{plan.trial_days}d</td>
                                        <td className="py-3.5 px-4">
                                            {plan.features.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {plan.features.slice(0, 2).map((f, i) => (
                                                        <span
                                                            key={i}
                                                            className="bg-[#E8F5F1] text-[#2D8A75] text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                                        >
                                                            {typeof f === "string" ? f : f.name}
                                                        </span>
                                                    ))}
                                                    {plan.features.length > 2 && (
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            +{plan.features.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                                    plan.is_active
                                                        ? "bg-[#DCFCE7] text-[#16A34A]"
                                                        : "bg-[#FFE4E6] text-[#F43F5E]"
                                                }`}
                                            >
                                                {plan.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setModal({ type: "edit", plan })}
                                                    className="p-1.5 bg-[#E0ECFB] hover:bg-blue-100 text-[#4A90E2] rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setModal({ type: "delete", plan })}
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
                <PlanModal
                    mode="create"
                    initial={EMPTY_FORM}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "edit" && (
                <PlanModal
                    mode="edit"
                    planId={modal.plan.id}
                    initial={{
                        name: modal.plan.name,
                        price: modal.plan.price,
                        customer_limit: modal.plan.customer_limit,
                        product_limit: modal.plan.product_limit,
                        invoice_limit: modal.plan.invoice_limit,
                        trial_days: modal.plan.trial_days,
                        is_active: modal.plan.is_active,
                        features: modal.plan.features.map((f) =>
                            typeof f === "string" ? f : f.name
                        ),
                    }}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "delete" && (
                <DeleteModal
                    plan={modal.plan}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default SubscriptionPlansPage;