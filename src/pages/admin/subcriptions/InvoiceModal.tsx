import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
    useCreateInvoiceMutation,
    useUpdateInvoiceMutation,
} from "../../../store/invoiceApi";
import type { InvoicePayload, InvoiceStatus } from "../../../store/invoiceApi";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";

export interface InvoiceModalProps {
    mode: ModalMode;
    subscriptionId: number;
    initial: InvoicePayload;
    invoiceId?: number;
    onClose: () => void;
}

export const EMPTY_INVOICE_FORM: InvoicePayload = {
    amount: "",
    billing_date: new Date().toISOString().split("T")[0],
    due_date: "",
    status: "unpaid",
};

const STATUS_OPTIONS: { value: InvoiceStatus; label: string; styles: string }[] = [
    { value: "unpaid",    label: "Unpaid",    styles: "border-[#D97706] bg-[#FEF3C7] text-[#D97706]" },
    { value: "paid",      label: "Paid",      styles: "border-[#16A34A] bg-[#DCFCE7] text-[#16A34A]" },
    { value: "overdue",   label: "Overdue",   styles: "border-[#F43F5E] bg-[#FFE4E6] text-[#F43F5E]" },
    { value: "cancelled", label: "Cancelled", styles: "border-gray-400  bg-gray-100  text-gray-500"   },
];

const INACTIVE = "border-gray-200 bg-white text-gray-500 hover:bg-gray-50";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateInput = (iso: string) => (iso ? iso.split("T")[0] : "");
const toISO       = (d: string)   => (d   ? new Date(d).toISOString() : "");

// ─── Component ────────────────────────────────────────────────────────────────

const InvoiceModal: React.FC<InvoiceModalProps> = ({
    mode, subscriptionId, initial, invoiceId, onClose,
}) => {
    const [form, setForm] = useState<InvoicePayload>(initial);

    const [createInvoice, { isLoading: creating }] = useCreateInvoiceMutation();
    const [updateInvoice, { isLoading: updating }] = useUpdateInvoiceMutation();

    const isLoading = creating || updating;

    const set = <K extends keyof InvoicePayload>(
        key: K, value: InvoicePayload[K]
    ) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: InvoicePayload = {
            ...form,
            billing_date: toISO(form.billing_date),
            due_date:     toISO(form.due_date),
        };
        try {
            if (mode === "create") {
                await createInvoice({ subscriptionId, data: payload }).unwrap();
            } else if (invoiceId !== undefined) {
                await updateInvoice({ subscriptionId, invoiceId, data: payload }).unwrap();
            }
            onClose();
        } catch (err) {
            console.error("Failed to save invoice:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">
                            {mode === "create" ? "Create Invoice" : "Edit Invoice"}
                        </h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            Subscription #{subscriptionId}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium">$</span>
                            <input
                                required
                                type="text"
                                inputMode="decimal"
                                value={form.amount}
                                onChange={(e) => {
                                    if (/^\d*\.?\d*$/.test(e.target.value))
                                        set("amount", e.target.value);
                                }}
                                onBlur={() => {
                                    const n = parseFloat(form.amount);
                                    set("amount", isNaN(n) ? "0.00" : n.toFixed(2));
                                }}
                                placeholder="0.00"
                                className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                    </div>

                    {/* Billing Date + Due Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Billing Date</label>
                            <input
                                required
                                type="date"
                                value={toDateInput(form.billing_date)}
                                onChange={(e) => set("billing_date", e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                            <input
                                required
                                type="date"
                                value={toDateInput(form.due_date)}
                                onChange={(e) => set("due_date", e.target.value)}
                                min={toDateInput(form.billing_date)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75]"
                            />
                        </div>
                    </div>

                    {/* Status toggle */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Status</label>
                        <div className="grid grid-cols-4 gap-2">
                            {STATUS_OPTIONS.map(({ value, label, styles }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => set("status", value)}
                                    className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                                        form.status === value ? styles : INACTIVE
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
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
                        {mode === "create" ? "Create Invoice" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;