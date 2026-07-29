import React from "react";
import { Plus, Trash2 } from "lucide-react";

// ─── Gateway Registry ───────────────────────────────────────────────────────
// Add a new gateway: push one object here. Nothing else needs to change.

export interface PaymentGatewayField {
    name: string;
    label: string;
    type?: "text" | "email" | "number";
    placeholder?: string;
    required?: boolean;
}

export interface PaymentGatewayConfig {
    key: string;
    label: string;
    fields: PaymentGatewayField[];
}

export const PAYMENT_GATEWAYS: PaymentGatewayConfig[] = [
    {
        key: "paypal",
        label: "PayPal",
        fields: [
            { name: "account_email", label: "PayPal Email", type: "email", required: true, placeholder: "paypal@paypal.com" },
        ],
    },
    {
        key: "stripe",
        label: "Stripe",
        fields: [
            { name: "account_number", label: "Account Number", required: true, placeholder: "acct_xxxxxxxx" },
        ],
    },
    {
        key: "bank_transfer",
        label: "Bank Transfer",
        fields: [
            { name: "bank_name", label: "Bank Name", required: true, placeholder: "Bank Name" },
            { name: "account_number", label: "Account Number", required: true, placeholder: "Account Number" },
            { name: "routing_number", label: "Routing / Branch Number", placeholder: "Routing Number" },
        ],
    },
    {
        key: "cash",
        label: "Cash",
        fields: [],
    },
       
    {
        key: "bkash",
        label: "BKash",
        fields: [{ name: "account_number", label: "Merchant Number", required: true }],
    },
    {
        key: "custom",
        label: "Custom Gateway",
        fields: [
            { name: "massage_type", label: "Gateway Name", required: true, placeholder: "Gateway Name" },
            { name: "massage", label: "Gateway Number", required: true, placeholder: "Custom Gateway Number" },
          
        ],
    },
   

];

// ─── Row model ──────────────────────────────────────────────────────────────
// `id` is client-side only (for React keys / row targeting) and gets
// stripped before the array is sent to the backend.

export interface PaymentMethodEntry {
    id: string;
    name: string; // gateway key, "" until chosen
    values: Record<string, string>;
}

export const uid = () => Math.random().toString(36).slice(2, 9);

export const emptyPaymentMethod = (): PaymentMethodEntry => ({ id: uid(), name: "", values: {} });

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    methods: PaymentMethodEntry[];
    onChange: (methods: PaymentMethodEntry[]) => void;
    // keyed by `${rowId}_${fieldName}`
    errors?: Record<string, string>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PaymentMethodList: React.FC<Props> = ({ methods, onChange, errors = {} }) => {
    const setGateway = (id: string, key: string) => {
        onChange(methods.map(m => (m.id === id ? { id, name: key, values: {} } : m)));
    };

    const setField = (id: string, fieldName: string, value: string) => {
        onChange(methods.map(m => (m.id === id ? { ...m, values: { ...m.values, [fieldName]: value } } : m)));
    };

    const addMethod = () => onChange([...methods, emptyPaymentMethod()]);

    const removeMethod = (id: string) => onChange(methods.filter(m => m.id !== id));

    return (
        <div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
                {/* Table head */}
                <div className="flex items-center justify-between bg-[#F8F9FA] border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500 px-4 py-3">
                    <span>#&nbsp;&nbsp;Payment Method</span>
                    <span />
                </div>

                {methods.length === 0 && (
                    <div className="px-4 py-4 text-sm text-gray-400">No payment method added.</div>
                )}

                {methods.map((m, idx) => {
                    const gateway = PAYMENT_GATEWAYS.find(g => g.key === m.name);
                    return (
                        <div key={m.id} className="border-b border-gray-50 last:border-0">
                            <div className="flex items-start gap-3 px-4 py-3">
                                <span className="text-[10px] font-bold text-gray-400 w-4 pt-1.5">{idx + 1}</span>

                                <div className="flex-1">
                                    <select
                                        value={m.name}
                                        onChange={e => setGateway(m.id, e.target.value)}
                                        className="w-full border-0 border-b border-gray-200 pb-1 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#2D8A75] bg-transparent"
                                    >
                                        <option value="">Select payment method</option>
                                        {PAYMENT_GATEWAYS.map(g => (
                                            <option key={g.key} value={g.key}>{g.label}</option>
                                        ))}
                                    </select>

                                    {gateway && gateway.fields.length > 0 && (
                                        <div className={`mt-2 grid gap-2 ${gateway.fields.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                                            {gateway.fields.map(f => (
                                                <div key={f.name}>
                                                    <input
                                                        type={f.type ?? "text"}
                                                        value={m.values[f.name] ?? ""}
                                                        onChange={e => setField(m.id, f.name, e.target.value)}
                                                        placeholder={f.placeholder ?? f.label}
                                                        className="w-full text-xs text-gray-500 placeholder-gray-300 border-0 focus:outline-none bg-transparent"
                                                    />
                                                    {errors[`${m.id}_${f.name}`] && (
                                                        <p className="text-[10px] text-red-500 mt-0.5">{errors[`${m.id}_${f.name}`]}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeMethod(m.id)}
                                    className="p-1.5 bg-[#FFE4E6] hover:bg-red-100 text-[#F43F5E] rounded-lg transition-colors shrink-0"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={addMethod}
                className="mt-3 flex items-center gap-1.5 text-sm text-[#2D8A75] font-medium hover:text-[#256d5e] transition-colors"
            >
                <Plus size={14} /> Add Payment Method
            </button>
        </div>
    );
};

export default PaymentMethodList;