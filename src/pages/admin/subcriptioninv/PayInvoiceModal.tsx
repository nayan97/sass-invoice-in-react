import React, { useState } from "react";
import { X, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { useInitiateInvoicePaymentMutation } from "../../../store/subscriptionInvoicesApi";
import type { SubscriptionInvoice } from "../../../store/subscriptionInvoicesApi";

// ─── Gateway registry ───────────────────────────────────────────────────────
// Static for now — only Stripe is wired on the backend. Add bKash/Nagad here
// once their controllers/webhooks exist; "enabled: false" ones show as
// disabled ("Coming soon") instead of being hidden, so the UI doesn't need
// to change shape later.

const GATEWAYS = [
    {
        code: "STRIPE",
        name: "Card Payment",
        description: "Pay with debit/credit card via Stripe",
        icon: CreditCard,
        enabled: true,
    },
    {
        code: "BKASH",
        name: "bKash",
        description: "Coming soon",
        icon: CreditCard,
        enabled: false,
    },
    {
        code: "NAGAD",
        name: "Nagad",
        description: "Coming soon",
        icon: CreditCard,
        enabled: false,
    },
];

const formatAmount = (amount: string) =>
    Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Modal ──────────────────────────────────────────────────────────────────

interface PayInvoiceModalProps {
    invoice: SubscriptionInvoice;
    onClose: () => void;
}

export const PayInvoiceModal: React.FC<PayInvoiceModalProps> = ({ invoice, onClose }) => {
    const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
    const [initiatePayment, { isLoading, error }] = useInitiateInvoicePaymentMutation();

    const handlePay = async () => {
        if (!selectedGateway) return;

        try {
            const result = await initiatePayment({
                invoiceId: invoice.id,
                gateway_code: selectedGateway,
            }).unwrap();

            // Stripe returns checkout_url; redirect the browser there.
            window.location.href = (result as any).checkout_url ?? result.redirect_url;
        } catch {
            // error state below handles display
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Pay Invoice
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                {/* Invoice summary */}
                <div className="px-6 py-4 bg-[#F8F9FA] border-b border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Invoice</span>
                        <span className="font-semibold text-gray-800">{invoice.invoice_number}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Amount Due</span>
                        <span className="font-bold text-slate-800 text-sm">৳{formatAmount(invoice.amount)}</span>
                    </div>
                </div>

                {/* Gateway selection */}
                <div className="px-6 py-4 space-y-2">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide mb-2">
                        Select Payment Method
                    </p>

                    {GATEWAYS.map((gw) => {
                        const Icon = gw.icon;
                        const isSelected = selectedGateway === gw.code;

                        return (
                            <button
                                key={gw.code}
                                onClick={() => gw.enabled && setSelectedGateway(gw.code)}
                                disabled={!gw.enabled}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                                    !gw.enabled
                                        ? "border-gray-100 opacity-50 cursor-not-allowed"
                                        : isSelected
                                            ? "border-[#2D8A75] bg-[#EAF6F3]"
                                            : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className={`p-2 rounded-md ${isSelected ? "bg-[#2D8A75] text-white" : "bg-gray-100 text-gray-500"}`}>
                                    <Icon size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-800">{gw.name}</p>
                                    <p className="text-xs text-gray-400">{gw.description}</p>
                                </div>
                                {isSelected && <CheckCircle2 size={18} className="text-[#2D8A75]" />}
                            </button>
                        );
                    })}
                </div>

                {error && (
                    <div className="px-6 pb-2">
                        <p className="text-xs text-red-500">
                            Failed to start payment. Please try again.
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePay}
                        disabled={!selectedGateway || isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#2D8A75] text-white text-xs font-semibold rounded-md hover:bg-[#256d5e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Redirecting...
                            </>
                        ) : (
                            "Continue to Payment"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayInvoiceModal;