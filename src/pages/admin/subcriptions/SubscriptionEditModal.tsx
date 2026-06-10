import React, { useState } from "react";
import { X, Loader2, Tag, Calendar, Building2, CreditCard, BadgeCheck } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "trial" | "active" | "pending" | "cancelled" | "expired";

/**
 * coupon_id is number | null:
 *   - number  → a coupon is applied
 *   - null    → no coupon
 *
 * Previously typed as string | undefined which caused:
 *   "Argument of type 'number | null' is not assignable to parameter of type 'string | undefined'"
 */
export interface SubscriptionPayload {
    company_id: number;
    plan_id: number;
    coupon_id: number | null;       // ← fixed: was string | undefined
    start_date: string;
    end_date: string | null;
    status: SubscriptionStatus;
}

export interface Plan {
    id: number;
    name: string;
    price: string;
}

export interface Coupon {
    id: number;
    code: string;
    type: "percent" | "fixed";
    discount: string;
    is_active: boolean | number;
}

export interface SubscriptionEditModalProps {
    subscriptionId: number;
    initial: SubscriptionPayload;
    plans: Plan[];
    coupons: Coupon[];
    isSubmitting?: boolean;
    onSave: (id: number, data: SubscriptionPayload) => Promise<void>;
    onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: SubscriptionStatus[] = [
    "trial", "active", "pending", "cancelled", "expired",
];

const STATUS_META: Record<SubscriptionStatus, { label: string; dot: string }> = {
    trial:     { label: "Trial",     dot: "bg-blue-400" },
    active:    { label: "Active",    dot: "bg-emerald-400" },
    pending:   { label: "Pending",   dot: "bg-amber-400" },
    cancelled: { label: "Cancelled", dot: "bg-red-400" },
    expired:   { label: "Expired",   dot: "bg-gray-400" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateInput = (iso: string | null) => (iso ? iso.split("T")[0] : "");

const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldProps { label: string; hint?: string; icon?: React.ReactNode; children: React.ReactNode }
const Field: React.FC<FieldProps> = ({ label, hint, icon, children }) => (
    <div>
        <div className="flex items-center gap-1.5 mb-1.5">
            {icon && <span className="text-[#2D8A75]">{icon}</span>}
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
            {hint && <span className="text-xs text-gray-400 normal-case font-normal">({hint})</span>}
        </div>
        {children}
    </div>
);

const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/25 focus:border-[#2D8A75] " +
    "transition-all placeholder:text-gray-300";

interface NumericInputProps { value: number; onChange: (v: number) => void; placeholder?: string }
const NumericInput: React.FC<NumericInputProps> = ({ value, onChange, placeholder = "0" }) => {
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
            className={inputCls}
        />
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SubscriptionEditModal: React.FC<SubscriptionEditModalProps> = ({
    subscriptionId,
    initial,
    plans,
    coupons,
    isSubmitting = false,
    onSave,
    onClose,
}) => {
    const [form, setForm] = useState<SubscriptionPayload>(initial);

    const set = <K extends keyof SubscriptionPayload>(
        key: K,
        value: SubscriptionPayload[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }));

    // ── Derived price preview ──────────────────────────────────────────────────
    const selectedPlan   = plans.find((p) => p.id === form.plan_id);
    const selectedCoupon = coupons.find((c) => c.id === form.coupon_id);   // coupon_id is now number | null — no type error
    const basePrice      = selectedPlan ? parseFloat(selectedPlan.price) : null;

    let finalPrice: number | null = basePrice;
    if (basePrice !== null && selectedCoupon) {
        finalPrice = selectedCoupon.type === "percent"
            ? basePrice * (1 - parseFloat(selectedCoupon.discount) / 100)
            : basePrice - parseFloat(selectedCoupon.discount);
        finalPrice = Math.max(0, finalPrice);
    }

    const discountAmount = (basePrice !== null && finalPrice !== null && selectedCoupon)
        ? basePrice - finalPrice
        : null;

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        await onSave(subscriptionId, form);
    };

    const statusMeta = STATUS_META[form.status];

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E8F6F2] flex items-center justify-center">
                            <CreditCard size={15} className="text-[#2D8A75]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 leading-tight">Edit Subscription</h2>
                            <p className="text-xs text-gray-400">#{subscriptionId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* ── Body ── */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
                >
                    {/* Company ID */}
                    <Field label="Company" icon={<Building2 size={13} />}>
                        <NumericInput
                            value={form.company_id}
                            onChange={(v) => set("company_id", v)}
                            placeholder="e.g. 42"
                        />
                    </Field>

                    {/* Plan */}
                    <Field label="Plan" icon={<BadgeCheck size={13} />}>
                        <select
                            required
                            value={form.plan_id || ""}
                            onChange={(e) => {
                                set("plan_id", Number(e.target.value));
                                set("coupon_id", null);
                            }}
                            className={inputCls}
                        >
                            <option value="" disabled>Select a plan…</option>
                            {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — ${parseFloat(p.price).toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* Coupon */}
                    <Field label="Coupon" hint="optional" icon={<Tag size={13} />}>
                        <select
                            value={form.coupon_id ?? ""}
                            onChange={(e) =>
                                // parse to number | null — coupon_id is now correctly typed
                                set("coupon_id", e.target.value === "" ? null : Number(e.target.value))
                            }
                            className={inputCls}
                        >
                            <option value="">No coupon</option>
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
                    </Field>

                    {/* Price preview */}
                    {selectedPlan && (
                        <div className="rounded-xl border border-[#B7E4D7] bg-gradient-to-br from-[#F0FAF7] to-[#E8F6F1] px-4 py-3.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-[#2D8A75] uppercase tracking-wide">
                                    Price preview
                                </span>
                                <div className="flex items-center gap-2">
                                    {selectedCoupon && (
                                        <span className="text-xs text-gray-400 line-through">${fmt(basePrice!)}</span>
                                    )}
                                    <span className="text-base font-bold text-[#2D8A75]">
                                        ${fmt(finalPrice!)}
                                    </span>
                                </div>
                            </div>

                            {selectedCoupon && discountAmount !== null && (
                                <div className="mt-2.5 pt-2.5 border-t border-[#B7E4D7] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#2D8A75] text-white px-2 py-0.5 rounded-full">
                                            <Tag size={9} />
                                            {selectedCoupon.code}
                                        </span>
                                        <span className="text-xs text-[#2D8A75]">applied</span>
                                    </div>
                                    <span className="text-xs font-semibold text-[#246F5E]">
                                        −${fmt(discountAmount)}
                                        {selectedCoupon.type === "percent" &&
                                            ` (${parseFloat(selectedCoupon.discount).toFixed(0)}%)`}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Start date" icon={<Calendar size={13} />}>
                            <input
                                required
                                type="date"
                                value={toDateInput(form.start_date)}
                                onChange={(e) => set("start_date", e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="End date" hint="optional" icon={<Calendar size={13} />}>
                            <input
                                type="date"
                                value={toDateInput(form.end_date)}
                                onChange={(e) => set("end_date", e.target.value || null)}
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    {/* Status */}
                    <Field label="Status">
                        <div className="relative">
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${statusMeta.dot}`} />
                            <select
                                value={form.status}
                                onChange={(e) => set("status", e.target.value as SubscriptionStatus)}
                                className={`${inputCls} pl-7`}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{STATUS_META[s].label}</option>
                                ))}
                            </select>
                        </div>
                    </Field>
                </form>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
                    <p className="text-[11px] text-gray-400">
                        Subscription <span className="font-medium text-gray-500">#{subscriptionId}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleSubmit()}
                            disabled={isSubmitting}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#2D8A75] text-white rounded-lg hover:bg-[#246F5E] disabled:opacity-60 transition-colors shadow-sm shadow-[#2D8A75]/20"
                        >
                            {isSubmitting
                                ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                                : "Save changes"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SubscriptionEditModal;