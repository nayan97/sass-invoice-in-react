import React, { useState } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import {
    useCreateSubscriptionPlanMutation,
    useUpdateSubscriptionPlanMutation,
} from "../../../store/subscriptionPlansApi";
import type { SubscriptionPlanPayload, Feature } from "../../../store/subscriptionPlansApi";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";

type FeatureRow = Pick<Feature, "feature_name" | "feature_value">;

export interface PlanModalProps {
    mode: ModalMode;
    initial: SubscriptionPlanPayload;
    planId?: number;
    onClose: () => void;
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export const EMPTY_PLAN_FORM: SubscriptionPlanPayload = {
    name: "",
    price: "",
    customer_limit: 0,
    product_limit: 0,
    invoice_limit: 0,
    trial_days: 0,
    is_active: true,
    features: [],
};

// ─── Numeric input helper ─────────────────────────────────────────────────────
// Stores value as string internally so the user can clear/type freely,
// but converts to number before submitting.

interface NumericInputProps {
    value: number;
    onChange: (val: number) => void;
    placeholder?: string;
    min?: number;
    className?: string;
}

const NumericInput: React.FC<NumericInputProps> = ({
    value,
    onChange,
    placeholder = "0",
    min = 0,
    className = "",
}) => {
    const [raw, setRaw] = useState<string>(value === 0 ? "" : String(value));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        // Allow only digits
        if (!/^\d*$/.test(input)) return;
        setRaw(input);
        onChange(input === "" ? 0 : parseInt(input, 10));
    };

    const handleBlur = () => {
        // Normalise on blur: empty → show "0"
        if (raw === "" || raw === undefined) {
            setRaw("0");
            onChange(0);
        } else {
            // Remove leading zeros
            const normalised = String(parseInt(raw, 10));
            setRaw(normalised);
            onChange(parseInt(normalised, 10));
        }
    };

    // Keep in sync when parent resets the form
    React.useEffect(() => {
        setRaw(value === 0 ? "0" : String(value));
    }, [value]);

    return (
        <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={raw}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            min={min}
            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] ${className}`}
        />
    );
};

// ─── Component ────────────────────────────────────────────────────────────────

const PlanModal: React.FC<PlanModalProps> = ({ mode, initial, planId, onClose }) => {
    const [form, setForm] = useState<SubscriptionPlanPayload>(initial);

    const [createPlan, { isLoading: creating }] = useCreateSubscriptionPlanMutation();
    const [updatePlan, { isLoading: updating }] = useUpdateSubscriptionPlanMutation();

    const isLoading = creating || updating;

    // ── Field helpers ──
    const set = <K extends keyof SubscriptionPlanPayload>(
        key: K,
        value: SubscriptionPlanPayload[K]
    ) => setForm((prev) => ({ ...prev, [key]: value }));

    // ── Feature helpers ──
    const addFeature = () =>
        set("features", [
            ...form.features,
            { feature_name: "", feature_value: null },
        ]);

    const updateFeature = (
        index: number,
        field: keyof FeatureRow,
        value: string | null
    ) =>
        set(
            "features",
            form.features.map((f, i) =>
                i === index ? { ...f, [field]: value } : f
            )
        );

    const removeFeature = (index: number) =>
        set("features", form.features.filter((_, i) => i !== index));

    // ── Submit ──
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
                            type="text"
                            inputMode="decimal"
                            value={form.price}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*\.?\d*$/.test(val)) set("price", val);
                            }}
                            onBlur={() => {
                                const n = parseFloat(form.price);
                                set("price", isNaN(n) ? "0.00" : n.toFixed(2));
                            }}
                            placeholder="0.00"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                        />
                    </div>

                    {/* Limits */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Customer Limit</label>
                            <NumericInput
                                value={form.customer_limit}
                                onChange={(v) => set("customer_limit", v)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Product Limit</label>
                            <NumericInput
                                value={form.product_limit}
                                onChange={(v) => set("product_limit", v)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Invoice Limit</label>
                            <NumericInput
                                value={form.invoice_limit}
                                onChange={(v) => set("invoice_limit", v)}
                            />
                        </div>
                    </div>

                    {/* Trial Days + Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Trial Days</label>
                            <NumericInput
                                value={form.trial_days}
                                onChange={(v) => set("trial_days", v)}
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
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-medium text-gray-600">Features</label>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="flex items-center gap-1 text-xs text-[#2D8A75] hover:text-[#246F5E] font-medium transition-colors"
                            >
                                <Plus size={12} />
                                Add Feature
                            </button>
                        </div>

                        {form.features.length === 0 ? (
                            <p className="text-xs text-gray-400 py-2 text-center border border-dashed border-gray-200 rounded-lg">
                                No features yet. Click "Add Feature" to add one.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {/* Column headers */}
                                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-1">Feature Name</span>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-1">Value (optional)</span>
                                    <span />
                                </div>

                                {form.features.map((f, i) => (
                                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                        <input
                                            type="text"
                                            value={f.feature_name}
                                            onChange={(e) => updateFeature(i, "feature_name", e.target.value)}
                                            placeholder="e.g. Unlimited Customers"
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                                        />
                                        <input
                                            type="text"
                                            value={f.feature_value ?? ""}
                                            onChange={(e) =>
                                                updateFeature(
                                                    i,
                                                    "feature_value",
                                                    e.target.value === "" ? null : e.target.value
                                                )
                                            }
                                            placeholder="e.g. 500 / Unlimited"
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(i)}
                                            className="p-1.5 bg-[#FFE4E6] hover:bg-red-100 text-[#F43F5E] rounded transition-colors"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
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

export default PlanModal;