import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
} from "../../../store/subscriptionApi";
import { useGetSubscriptionPlansQuery } from "../../../store/subscriptionPlansApi";
import { useGetCouponsQuery } from "../../../store/couponApi";
import type { SubscriptionPayload, SubscriptionStatus } from "../../../store/subscriptionApi";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";

export interface SubscriptionModalProps {
    mode: ModalMode;
    initial: SubscriptionPayload;
    subscriptionId?: number;
    onClose: () => void;
}

export const EMPTY_SUBSCRIPTION_FORM: SubscriptionPayload = {
    company_id: 0,
    plan_id: 0,
    coupon_id: null,
    start_date: new Date().toISOString().split("T")[0],
    end_date: null,
    status: "trial",
};

const STATUS_OPTIONS: SubscriptionStatus[] = [
    "trial", "active", "pending", "cancelled", "expired",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateInput = (iso: string | null) => (iso ? iso.split("T")[0] : "");
const toISO = (d: string) => (d ? new Date(d).toISOString() : "");

// ─── Numeric Input ────────────────────────────────────────────────────────────

interface NumericInputProps {
    value: number;
    onChange: (v: number) => void;
    placeholder?: string;
    className?: string;
}

const NumericInput: React.FC<NumericInputProps> = ({
    value, onChange, placeholder = "0", className = "",
}) => {
    const [raw, setRaw] = useState(value === 0 ? "" : String(value));

    React.useEffect(() => {
        setRaw(value === 0 ? "" : String(value));
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
                const n = raw === "" ? "0" : String(parseInt(raw, 10));
                setRaw(n);
                onChange(parseInt(n, 10));
            }}
            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] ${className}`}
        />
    );
};

// ─── Component ────────────────────────────────────────────────────────────────

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
    mode, initial, subscriptionId, onClose,
}) => {
    const [form, setForm] = useState<SubscriptionPayload>(initial);

    const { data: plans = [], isLoading: plansLoading } = useGetSubscriptionPlansQuery();
    const { data: coupons = [], isLoading: couponsLoading } = useGetCouponsQuery();
    const [createSubscription, { isLoading: creating }] = useCreateSubscriptionMutation();
    const [updateSubscription, { isLoading: updating }] = useUpdateSubscriptionMutation();

    const isLoading = creating || updating;

    const set = <K extends keyof SubscriptionPayload>(
        key: K, value: SubscriptionPayload[K]
    ) => setForm((prev) => ({ ...prev, [key]: value }));

    // ── Price preview ──
    const selectedPlan = plans.find((p) => p.id === form.plan_id);
    const selectedCoupon = coupons.find((c) => c.id === form.coupon_id);
    const basePrice = selectedPlan ? parseFloat(selectedPlan.price) : null;
    let finalPrice: number | null = basePrice;
    if (basePrice !== null && selectedCoupon) {
        finalPrice = selectedCoupon.type === "percent"
            ? basePrice * (1 - parseFloat(selectedCoupon.discount) / 100)
            : basePrice - parseFloat(selectedCoupon.discount);
        finalPrice = Math.max(0, finalPrice);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: SubscriptionPayload = {
            ...form,
            start_date: toISO(form.start_date),
            end_date: form.end_date ? toISO(form.end_date) : null,
        };
        try {
            if (mode === "create") {
                await createSubscription(payload).unwrap();
            } else if (subscriptionId !== undefined) {
                await updateSubscription({ id: subscriptionId, data: payload }).unwrap();
            }
            onClose();
        } catch (err) {
            console.error("Failed to save subscription:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800">
                        {mode === "create" ? "Create Subscription" : "Edit Subscription"}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

                    {/* Company ID */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Company ID</label>
                        <NumericInput
                            value={form.company_id}
                            onChange={(v) => set("company_id", v)}
                            placeholder="e.g. 42"
                        />
                    </div>

                    {/* Plan */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
                        <select
                            required
                            value={form.plan_id || ""}
                            onChange={(e) => {
                                set("plan_id", Number(e.target.value));
                                // reset coupon when plan changes
                                set("coupon_id", null);
                            }}
                            disabled={plansLoading}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] bg-white"
                        >
                            <option value="" disabled>
                                {plansLoading ? "Loading plans..." : "Select a plan"}
                            </option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — ${parseFloat(p.price).toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Coupon */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Coupon <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <select
                            value={form.coupon_id ?? ""}
                            onChange={(e) =>
                                set("coupon_id", e.target.value === "" ? null : Number(e.target.value))
                            }
                            disabled={couponsLoading}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] bg-white"
                        >
                            <option value="">
                                {couponsLoading ? "Loading coupons..." : "No coupon"}
                            </option>
                            {coupons
                                .filter((c) => Boolean(c.is_active))
                                .map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.code} —{" "}
                                        {c.type === "percent"
                                            ? `${parseFloat(c.discount).toFixed(0)}% off`
                                            : `$${parseFloat(c.discount).toFixed(2)} off`}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Price preview */}
                    {selectedPlan && (
                        <div className="bg-[#F0FAF7] border border-[#B7E4D7] rounded-lg px-4 py-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-[#2D8A75]">Price Preview</span>
                            <div className="flex items-center gap-2">
                                {selectedCoupon && (
                                    <span className="text-xs text-gray-400 line-through">
                                        ${basePrice?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                )}
                                <span className="text-sm font-bold text-[#2D8A75]">
                                    ${finalPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </span>
                                {selectedCoupon && (
                                    <span className="text-[10px] bg-[#2D8A75] text-white px-1.5 py-0.5 rounded font-bold">
                                        {selectedCoupon.type === "percent"
                                            ? `${parseFloat(selectedCoupon.discount).toFixed(0)}% OFF`
                                            : `$${parseFloat(selectedCoupon.discount).toFixed(2)} OFF`}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Start + End Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                            <input
                                required
                                type="date"
                                value={toDateInput(form.start_date)}
                                onChange={(e) => set("start_date", e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                End Date <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                type="date"
                                value={toDateInput(form.end_date)}
                                onChange={(e) => set("end_date", e.target.value || null)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => set("status", e.target.value as SubscriptionStatus)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] bg-white"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                            ))}
                        </select>
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
                        {mode === "create" ? "Create Subscription" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;