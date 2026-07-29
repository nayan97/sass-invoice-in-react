import React from "react";
import { CreditCard, Landmark, Wallet, Banknote, ChevronDown } from "lucide-react";

// ─── Gateway Registry ───────────────────────────────────────────────────────────
// To add a new gateway: push one object here. Nothing else in this file
// or in AddInvoicePage.tsx needs to change.

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
    icon: React.ElementType;
    fields: PaymentGatewayField[];
}

export const PAYMENT_GATEWAYS: PaymentGatewayConfig[] = [
    {
        key: "paypal",
        label: "PayPal",
        icon: Wallet,
        fields: [
            { name: "account_email", label: "PayPal Email", type: "email", required: true, placeholder: "you@paypal.com" },
        ],
    },
    {
        key: "stripe",
        label: "Stripe",
        icon: CreditCard,
        fields: [
            { name: "account_number", label: "Account Number", required: true, placeholder: "acct_xxxxxxxx" },
        ],
    },
    {
        key: "bank_transfer",
        label: "Bank Transfer",
        icon: Landmark,
        fields: [
            { name: "bank_name", label: "Bank Name", required: true },
            { name: "account_number", label: "Account Number", required: true },
            { name: "routing_number", label: "Routing / Branch Number" },
        ],
    },
    {
        key: "cash",
        label: "Cash",
        icon: Banknote,
        fields: [],
    },
    // Example of adding another gateway later:
    // {
    //     key: "bkash",
    //     label: "bKash",
    //     icon: Wallet,
    //     fields: [{ name: "merchant_number", label: "Merchant Number", required: true }],
    // },
];

// Shape that gets JSON.stringify'd into the invoice's payment_method column,
// e.g. { "name": "stripe", "account_number": "123456" }
export type PaymentMethodValue = { name: string; [key: string]: string };

// ─── Style tokens (kept identical to AddInvoicePage) ───────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] transition-colors bg-white";

const labelCls = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    value: PaymentMethodValue | null;
    onChange: (v: PaymentMethodValue | null) => void;
    errors?: Record<string, string>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PaymentMethodSelect: React.FC<Props> = ({ value, onChange, errors = {} }) => {
    const activeKey = value?.name ?? "";
    const activeGateway = PAYMENT_GATEWAYS.find((g) => g.key === activeKey);

    const selectGateway = (key: string) => {
        if (!key) {
            onChange(null);
            return;
        }
        // reset fields when switching gateway — old fields don't carry over
        onChange({ name: key });
    };

    const setField = (fieldName: string, fieldValue: string) => {
        if (!value) return;
        onChange({ ...value, [fieldName]: fieldValue });
    };

    return (
        <div className="space-y-3">
            <div>
                <label className={labelCls}>Payment Method</label>
                <div className="relative">
                    <select
                        value={activeKey}
                        onChange={(e) => selectGateway(e.target.value)}
                        className={inputCls + " appearance-none pr-9"}
                    >
                        <option value="">Select payment method</option>
                        {PAYMENT_GATEWAYS.map((g) => (
                            <option key={g.key} value={g.key}>
                                {g.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {activeGateway && activeGateway.fields.length > 0 && (
                <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-100 rounded-lg p-3">
                    {activeGateway.fields.map((f) => (
                        <div key={f.name} className={activeGateway.fields.length === 1 ? "col-span-2" : ""}>
                            <label className={labelCls}>
                                {f.label} {f.required && <span className="text-red-400">*</span>}
                            </label>
                            <input
                                type={f.type ?? "text"}
                                value={value?.[f.name] ?? ""}
                                onChange={(e) => setField(f.name, e.target.value)}
                                placeholder={f.placeholder}
                                className={inputCls}
                            />
                            {errors[f.name] && <p className="text-xs text-red-500 mt-1">{errors[f.name]}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSelect;