import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useDeleteInvoiceMutation, type Invoice } from "../../../store/mainInvoiceApi";

interface Props {
    invoice: Invoice;
    companyId: number;
    onClose: () => void;
}

export const InvoiceDeleteModal: React.FC<Props> = ({ invoice, companyId, onClose }) => {
    const [deleteInvoice, { isLoading }] = useDeleteInvoiceMutation();

    const handleDelete = async () => {
        try {
            await deleteInvoice({ companyId, invoiceId: invoice.id }).unwrap();
            onClose();
        } catch {
            // errors handled by RTK Query / global error handler
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">

                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFE4E6] mx-auto mb-4">
                    <Trash2 size={20} className="text-[#F43F5E]" />
                </div>

                {/* Title */}
                <h2 className="text-base font-bold text-gray-800 text-center mb-1">
                    Delete Invoice
                </h2>
                <p className="text-sm text-gray-500 text-center mb-1">
                    Are you sure you want to delete invoice
                </p>
                <p className="text-sm font-bold text-gray-700 text-center mb-5">
                    {invoice.invoice_no} — {invoice.customer_name}?
                </p>
                <p className="text-xs text-gray-400 text-center mb-6">
                    This action cannot be undone.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-[#F43F5E] text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete Invoice"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};