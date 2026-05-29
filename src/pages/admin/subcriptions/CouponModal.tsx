import React, { useState, useEffect } from "react";
import { X, Loader2, RefreshCw } from "lucide-react";
import {
    useCreateCouponMutation,
    useUpdateCouponMutation,
} from "../../../store/couponApi";
import { useGetSubscriptionPlansQuery } from "../../../store/subscriptionPlansApi";
import type { CouponPayload } from "../../../store/couponApi";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";

export interface CouponModalProps {
    mode: ModalMode;
    initial: CouponPayload;
    couponId?: number;
    onClose: () => void;
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export const EMPTY_COUPON_FORM: CouponPayload = {
    code: "",
    discount: "",
    type: "percent",
    max_uses: 0,
    min_plan_id: 0,
    expires_at: "",
    is_active: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

const toDateInputValue = (iso: string) => {
    if (!iso) return "";
    return iso.split("T")[0];
};

const toISOString = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString();
};

// ─── Numeric Input ────────────────────────────────────────────────────────────

interface NumericInputProps {
    value: number;
    onChange: (val: number) => void;
    placeholder?: string;
    className?: string;
}

const NumericInput: React.FC<NumericInputProps> = ({
    value,
    onChange,
    placeholder = "0",
    className = "",
}) => {
    const [raw, setRaw] = useState(value === 0 ? "" : String(value));

    useEffect(() => {
        setRaw(value === 0 ? "0" : String(value));
    }, [value]);

    return (
        <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={raw}
            placeholder={placeholder}
            onChange={(e) => {
                const v = e.target.value;
                if (!/^\d*$/.test(v)) return;
                setRaw(v);
                onChange(v === "" ? 0 : parseInt(v, 10));
            }}
            onBlur={() => {
                const normalised = raw === "" ? "0" : String(parseInt(raw, 10));
                setRaw(normalised);
                onChange(parseInt(normalised, 10));
            }}
            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] ${className}`}
        />
    );
};

// ─── Component ────────────────────────────────────────────────────────────────

const CouponModal: React.FC<CouponModalProps> = ({ mode, initial, couponId, onClose }) => {
    const [form, setForm] = useState<CouponPayload>(initial);

    const { data: plans = [], isLoading: plansLoading } = useGetSubscriptionPlansQuery();
    const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
    const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation();

    const isLoading = creating || updating;

    const set = <K extends keyof CouponPayload>(key: K, value: CouponPayload[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: CouponPayload = {
            ...form,
            expires_at: toISOString(form.expires_at),
        };
        try {
            if (mode === "create") {
                await createCoupon(payload).unwrap();
            } else if (couponId !== undefined) {
                await updateCoupon({ id: couponId, data: payload }).unwrap();
            }
            onClose();
        } catch (err) {
            console.error("Failed to save coupon:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800">
                        {mode === "create" ? "Create Coupon" : "Edit Coupon"}
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

                    {/* Code */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Coupon Code</label>
                        <div className="flex gap-2">
                            <input
                                required
                                type="text"
                                value={form.code}
                                onChange={(e) => set("code", e.target.value.toUpperCase())}
                                placeholder="e.g. SAVE50"
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                            <button
                                type="button"
                                onClick={() => set("code", generateCode())}
                                title="Generate random code"
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={13} />
                                Generate
                            </button>
                        </div>
                    </div>

                    {/* Discount + Type */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Discount</label>
                            <input
                                required
                                type="text"
                                inputMode="decimal"
                                value={form.discount}
                                onChange={(e) => {
                                    if (/^\d*\.?\d*$/.test(e.target.value))
                                        set("discount", e.target.value);
                                }}
                                onBlur={() => {
                                    const n = parseFloat(form.discount);
                                    set("discount", isNaN(n) ? "0.00" : n.toFixed(2));
                                }}
                                placeholder="0.00"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
                            <select
                                value={form.type}
                                onChange={(e) => set("type", e.target.value as "percent" | "fixed")}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] bg-white"
                            >
                                <option value="percent">Percent (%)</option>
                                <option value="fixed">Fixed ($)</option>
                            </select>
                        </div>
                    </div>

                    {/* Max Uses + Expires At */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Max Uses</label>
                            <NumericInput
                                value={form.max_uses}
                                onChange={(v) => set("max_uses", v)}
                                placeholder="e.g. 100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Expires At</label>
                            <input
                                required
                                type="date"
                                value={toDateInputValue(form.expires_at)}
                                onChange={(e) => set("expires_at", e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                    </div>

                    {/* Min Plan + Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Minimum Plan</label>
                            <select
                                required
                                value={form.min_plan_id || ""}
                                onChange={(e) => set("min_plan_id", Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] bg-white"
                                disabled={plansLoading}
                            >
                                <option value="" disabled>
                                    {plansLoading ? "Loading plans..." : "Select a plan"}
                                </option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name}
                                    </option>
                                ))}
                            </select>
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
                        {mode === "create" ? "Create Coupon" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CouponModal;