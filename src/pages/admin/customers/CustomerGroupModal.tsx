import React, { useState, useEffect } from "react";
import { X, Loader2, Users } from "lucide-react";
import {
    useCreateCustomerGroupMutation,
    useUpdateCustomerGroupMutation,
    useDeleteCustomerGroupMutation,
} from "../../../store/customerGroupApi";
import type { CustomerGroup, CustomerGroupPayload } from "../../../store/customerGroupApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_FORM: CustomerGroupPayload = {
    name:          "",
    description:   "",
    discount_rate: "",
};

const inputCls = (hasError?: boolean) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] ${
        hasError ? "border-red-400" : "border-gray-200"
    }`;

// Colour palette for group avatars — cycles by id
const GROUP_COLORS = [
    { bg: "bg-[#EDE9FE]", text: "text-[#7C3AED]" },
    { bg: "bg-[#DBEAFE]", text: "text-[#2563EB]" },
    { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" },
    { bg: "bg-[#FEF9C3]", text: "text-[#A16207]" },
    { bg: "bg-[#FFE4E6]", text: "text-[#F43F5E]" },
];

export const groupColor = (id: number) => GROUP_COLORS[id % GROUP_COLORS.length];

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

interface CustomerGroupModalProps {
    companyId: number;
    group?: CustomerGroup;
    onClose: () => void;
}

export const CustomerGroupModal: React.FC<CustomerGroupModalProps> = ({
    companyId,
    group,
    onClose,
}) => {
    const isEdit = !!group;

    const [createGroup, { isLoading: isCreating }] = useCreateCustomerGroupMutation();
    const [updateGroup, { isLoading: isUpdating  }] = useUpdateCustomerGroupMutation();
    const isLoading = isCreating || isUpdating;

    const [apiError, setApiError] = useState<string | null>(null);
    const [form, setForm]         = useState<CustomerGroupPayload>(EMPTY_FORM);
    const [errors, setErrors]     = useState<Partial<Record<keyof CustomerGroupPayload, string>>>({});

    useEffect(() => {
        if (group) {
            setForm({
                name:          group.name,
                description:   group.description ?? "",
                discount_rate: group.discount_rate,
            });
        }
    }, [group]);

    const set = <K extends keyof CustomerGroupPayload>(key: K, value: CustomerGroupPayload[K]) => {
        setApiError(null);
        setForm((f) => ({ ...f, [key]: value }));
    };

    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = "Group name is required.";
        const rate = Number(form.discount_rate);
        if (form.discount_rate === "" || isNaN(rate))
            e.discount_rate = "Discount rate is required.";
        else if (rate < 0 || rate > 100)
            e.discount_rate = "Must be between 0 and 100.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setApiError(null);
        try {
            const payload: CustomerGroupPayload = {
                ...form,
                discount_rate: Number(form.discount_rate),
            };
            if (isEdit) {
                await updateGroup({ companyId, groupId: group!.id, data: payload }).unwrap();
            } else {
                await createGroup({ companyId, data: payload }).unwrap();
            }
            onClose();
        } catch (err: any) {
            const msg =
                err?.data?.message ||
                err?.data?.error   ||
                "Something went wrong. Please try again.";
            setApiError(msg);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-800">
                            {isEdit ? "Edit Customer Group" : "Create Customer Group"}
                        </h2>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            {isEdit ? `Editing: ${group!.name}` : "Group customers for targeted discounts."}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">

                    {apiError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                            <p className="text-xs text-red-600 font-medium">{apiError}</p>
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Group Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g. VIP, Wholesale, Retail"
                            className={inputCls(!!errors.name)}
                        />
                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                    </div>

                    {/* Discount rate */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Discount Rate <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={form.discount_rate}
                                onChange={(e) => set("discount_rate", e.target.value)}
                                placeholder="0.00"
                                className={`w-full border rounded-lg pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] ${
                                    errors.discount_rate ? "border-red-400" : "border-gray-200"
                                }`}
                            />
                            <span className="absolute right-3 top-2 text-sm text-gray-400 font-medium select-none">%</span>
                        </div>
                        {errors.discount_rate
                            ? <p className="text-xs text-red-400 mt-1">{errors.discount_rate}</p>
                            : <p className="text-[10px] text-gray-400 mt-1">Percentage discount applied to all customers in this group.</p>
                        }
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Description{" "}
                            <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={form.description ?? ""}
                            onChange={(e) => set("description", e.target.value)}
                            placeholder="Brief description of this group..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#2D8A75] text-white rounded-lg hover:bg-[#256d5e] disabled:opacity-60 transition-colors"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {isEdit ? "Save Changes" : "Create Group"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteCustomerGroupModalProps {
    companyId: number;
    group: CustomerGroup;
    onClose: () => void;
}

export const DeleteCustomerGroupModal: React.FC<DeleteCustomerGroupModalProps> = ({
    companyId,
    group,
    onClose,
}) => {
    const [deleteGroup, { isLoading }] = useDeleteCustomerGroupMutation();
    const [apiError, setApiError]      = useState<string | null>(null);

    const color = groupColor(group.id);
    const count = Number(group.customers_count);

    const handle = async () => {
        try {
            await deleteGroup({ companyId, groupId: group.id }).unwrap();
            onClose();
        } catch (err: any) {
            const msg =
                err?.data?.message ||
                err?.data?.error   ||
                "Failed to delete group.";
            setApiError(msg);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-2">Delete Customer Group</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-700">{group.name}</span>?
                    {" "}This action cannot be undone.
                </p>

                {/* Has customers warning */}
                {count > 0 && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                        <Users size={13} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 font-medium">
                            This group has {count} customer{count > 1 ? "s" : ""} assigned. Deleting it may affect their discount settings.
                        </p>
                    </div>
                )}

                {apiError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4">
                        <p className="text-xs text-red-600 font-medium">{apiError}</p>
                    </div>
                )}

                {/* Group preview */}
                <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-100 mb-2">
                        <div className={`w-10 h-10 rounded-lg ${color.bg} flex items-center justify-center shrink-0`}>
                            <span className={`${color.text} font-bold text-sm`}>
                                {group.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-700">{group.name}</p>
                            {group.description && (
                                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{group.description}</p>
                            )}
                        </div>
                    </div>
                    {[
                        { label: "Discount Rate", value: `${Number(group.discount_rate).toFixed(2)}%` },
                        { label: "Customers",     value: group.customers_count },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-xs py-0.5">
                            <span className="text-gray-400">{label}</span>
                            <span className="text-gray-700 font-medium">{value}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handle}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
