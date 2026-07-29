import React, { useEffect, useRef, useState } from "react";
import {
    MoreHorizontal, Eye, Pencil, Send, RotateCw, Trash2, Loader2,
} from "lucide-react";
import {
    useSendInvoiceMutation,
    useResendInvoiceMutation,
    type Invoice,
} from "../../../store/mainInvoiceApi";

// ─── Props ────────────────────────────────────────────────────────────────────

interface InvoiceActionsMenuProps {
    invoice: Invoice;
    companyId: number;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const InvoiceActionsMenu: React.FC<InvoiceActionsMenuProps> = ({
    invoice,
    companyId,
    onView,
    onEdit,
    onDelete,
}) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const [sendInvoice, { isLoading: isSending }]     = useSendInvoiceMutation();
    const [resendInvoice, { isLoading: isResending }] = useResendInvoiceMutation();

    const isDraft       = invoice.status === "draft";
    const isCancelled    = invoice.status === "cancelled";
    const hasBeenSent    = Boolean(invoice.email_sent_at);
    const canSendEmail   = !hasBeenSent && Boolean(invoice.customer_email) && !isCancelled;
    const canResendEmail = hasBeenSent && Boolean(invoice.customer_email) && !isCancelled;
    const isBusy         = isSending || isResending;

    // ── Close on outside click ──
    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // ── Close on Escape ──
    useEffect(() => {
        if (!open) return;
        const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [open]);

    const closeAnd = (fn: () => void) => {
        setOpen(false);
        fn();
    };

    const handleSend = async () => {
        try {
            await sendInvoice({ companyId, invoiceId: invoice.id }).unwrap();
            setOpen(false);
        } catch {
            // RTK Query error state can be surfaced via toast in the parent if needed
            setOpen(false);
        }
    };

    const handleResend = async () => {
        try {
            await resendInvoice({ companyId, invoiceId: invoice.id }).unwrap();
            setOpen(false);
        } catch {
            setOpen(false);
        }
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            {/* Trigger */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                title="Actions"
            >
                <MoreHorizontal size={16} />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute right-0 z-20 mt-1 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden"
                >
                    <div className="py-1">
                        {/* View */}
                        <button
                            onClick={() => closeAnd(onView)}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Eye size={14} className="text-[#16A34A]" />
                            View
                        </button>

                        {/* Edit — only draft */}
                        {isDraft && (
                            <button
                                onClick={() => closeAnd(onEdit)}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Pencil size={14} className="text-[#4A90E2]" />
                                Edit
                            </button>
                        )}

                        {/* Send Email — never sent before */}
                        {canSendEmail && (
                            <button
                                onClick={handleSend}
                                disabled={isBusy}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {isSending ? (
                                    <Loader2 size={14} className="text-[#3B82F6] animate-spin" />
                                ) : (
                                    <Send size={14} className="text-[#3B82F6]" />
                                )}
                                {isSending ? "Sending..." : "Send Email"}
                            </button>
                        )}

                        {/* Resend Email — already sent once */}
                        {canResendEmail && (
                            <button
                                onClick={handleResend}
                                disabled={isBusy}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {isResending ? (
                                    <Loader2 size={14} className="text-[#7C3AED] animate-spin" />
                                ) : (
                                    <RotateCw size={14} className="text-[#7C3AED]" />
                                )}
                                {isResending ? "Resending..." : "Resend Email"}
                            </button>
                        )}

                        <div className="my-1 border-t border-gray-100" />

                        {/* Delete */}
                        <button
                            onClick={() => closeAnd(onDelete)}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#F43F5E] hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};