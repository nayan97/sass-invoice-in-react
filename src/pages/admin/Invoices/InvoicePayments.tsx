import React, { useState } from "react";
import { Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import {
    useGetInvoicePaymentsQuery,
    useRecordInvoicePaymentMutation,
    useDeleteInvoicePaymentMutation,
} from "../../../store/mainInvoiceApi";

// ─── Style tokens (kept identical to the rest of the invoice module) ──────────

const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] transition-colors bg-white";

const labelCls = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1";

const GATEWAYS = [
    { key: "cash", label: "Cash" },
    { key: "bank_transfer", label: "Bank Transfer" },
    { key: "paypal", label: "PayPal" },
    { key: "stripe", label: "Stripe" },
    { key: "bkash", label: "bKash" },
    { key: "other", label: "Other" },
];

const fmt = (n: number | string) =>
    Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
    companyId: number;
    invoiceId: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const InvoicePayments: React.FC<Props> = ({ companyId, invoiceId }) => {
    const { data, isLoading } = useGetInvoicePaymentsQuery({ companyId, invoiceId });
    const [recordPayment, { isLoading: isRecording }] = useRecordInvoicePaymentMutation();
    const [deletePayment] = useDeleteInvoicePaymentMutation();

    const [showForm, setShowForm] = useState(false);
    const [gateway, setGateway] = useState("cash");
    const [reference, setReference] = useState("");
    const [amount, setAmount] = useState("");
    const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
    const [note, setNote] = useState("");
    const [error, setError] = useState("");

    const balanceDue = Number(data?.meta.balance_due ?? 0);

    const openForm = () => {
        setAmount(balanceDue > 0 ? balanceDue.toFixed(2) : "");
        setShowForm(true);
    };

    const submit = async () => {
        setError("");
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            setError("Enter a valid amount.");
            return;
        }

        try {
            await recordPayment({
                companyId,
                invoiceId,
                payload: { gateway, reference: reference || undefined, amount: numAmount, paid_at: paidAt, note: note || undefined },
            }).unwrap();

            setShowForm(false);
            setReference("");
            setAmount("");
            setNote("");
        } catch {
            setError("Failed to record payment.");
        }
    };

    const remove = async (paymentId: number) => {
        if (!confirm("Remove this payment record? Invoice status will be recalculated.")) return;
        await deletePayment({ companyId, invoiceId, paymentId });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 size={18} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="border border-gray-100 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                    <p className="text-base font-bold text-gray-800">${fmt(data?.meta.total_amount ?? 0)}</p>
                </div>
                <div className="border border-gray-100 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid</p>
                    <p className="text-base font-bold text-[#2D8A75]">${fmt(data?.meta.total_paid ?? 0)}</p>
                </div>
                <div className="border border-gray-100 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance Due</p>
                    <p className={`text-base font-bold ${balanceDue > 0 ? "text-[#F43F5E]" : "text-gray-400"}`}>
                        ${fmt(balanceDue)}
                    </p>
                </div>
            </div>

            {/* Payment list */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-[#F8F9FA] border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500 px-4 py-3">
                    Payment History
                </div>

                {data?.data.length === 0 && (
                    <div className="px-4 py-4 text-sm text-gray-400">No payments recorded yet.</div>
                )}

                {data?.data.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                        <div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={13} className="text-[#2D8A75]" />
                                <span className="text-sm font-semibold text-gray-700 capitalize">
                                    {p.gateway.replace("_", " ")}
                                </span>
                                <span className="text-sm font-bold text-gray-800">${fmt(p.amount)}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(p.paid_at).toLocaleDateString()}
                                {p.reference && ` · Ref: ${p.reference}`}
                                {p.recorded_by && ` · by ${p.recorded_by.name}`}
                            </p>
                            {p.note && <p className="text-xs text-gray-400 mt-0.5">{p.note}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={() => remove(p.id)}
                            className="p-1.5 bg-[#FFE4E6] hover:bg-red-100 text-[#F43F5E] rounded-lg transition-colors shrink-0"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Record payment form */}
            {showForm ? (
                <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Payment Method</label>
                            <select value={gateway} onChange={(e) => setGateway(e.target.value)} className={inputCls}>
                                {GATEWAYS.map((g) => (
                                    <option key={g.key} value={g.key}>{g.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Amount</label>
                            <input
                                type="number"
                                min={0.01}
                                step={0.01}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Reference (optional)</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="Transaction ID, check no., etc."
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Date Received</label>
                            <input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Note (optional)</label>
                        <textarea
                            rows={2}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. Verified via bKash statement"
                            className={inputCls + " resize-none"}
                        />
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex gap-2 justify-end pt-1">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={isRecording}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#2D8A75] text-white rounded-lg hover:bg-[#256d5e] transition-colors disabled:opacity-50"
                        >
                            {isRecording ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            Verify &amp; Record
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={openForm}
                    className="flex items-center gap-1.5 text-sm text-[#2D8A75] font-medium hover:text-[#256d5e] transition-colors"
                >
                    <Plus size={14} /> Record Payment
                </button>
            )}
        </div>
    );
};

export default InvoicePayments;