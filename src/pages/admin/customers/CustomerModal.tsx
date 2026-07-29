import React, { useState, useRef, useEffect } from "react";
import { X, Loader2, User, Camera } from "lucide-react";
import {
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    type Customer,
} from "../../../store/customerApi";
import { useGetCustomerGroupsQuery } from "../../../store/customerGroupApi";

interface CustomerModalProps {
    companyId: number;
    customer:  Customer | null;   // null = create mode
    onClose:   () => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ companyId, customer, onClose }) => {
    const isEdit = !!customer;

    const { data: groups = [] } = useGetCustomerGroupsQuery({ companyId });
    const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
    const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
    const isLoading = isCreating || isUpdating;

    const [name, setName]       = useState(customer?.name ?? "");
    const [email, setEmail]     = useState(customer?.email ?? "");
    const [phone, setPhone]     = useState(customer?.phone ?? "");
    const [groupId, setGroupId] = useState<string>(customer?.group_id ? String(customer.group_id) : "");
    const [status, setStatus]   = useState(customer?.status ?? true);

    const [avatarFile, setAvatarFile]       = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(customer?.avatar ?? null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (avatarFile) URL.revokeObjectURL(avatarPreview ?? "");
        };
    }, [avatarFile, avatarPreview]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setFormError("Image file dite hobe.");
            return;
        }
        setFormError(null);
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Name required.";
        if (email && !/^\S+@\S+\.\S+$/.test(email)) errs.email = "Valid email din.";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setFormError(null);

        const formData = new FormData();
        formData.append("name", name.trim());
        if (email) formData.append("email", email.trim());
        if (phone) formData.append("phone", phone.trim());
        if (groupId) formData.append("group_id", groupId);
        formData.append("status", status ? "1" : "0");
        if (avatarFile) formData.append("avatar", avatarFile);

        try {
            if (isEdit) {
                await updateCustomer({ companyId, customerId: customer!.id, formData }).unwrap();
            } else {
                await createCustomer({ companyId, formData }).unwrap();
            }
            onClose();
        } catch (err: any) {
            if (err?.data?.errors) setErrors(err.data.errors);
            setFormError(err?.data?.message || "Customer save kora gelo na.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-800">{isEdit ? "Edit Customer" : "Add Customer"}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 space-y-4">

                    {formError && (
                        <p className="text-xs text-[#F43F5E] bg-[#FFE4E6] px-3 py-2 rounded-lg">{formError}</p>
                    )}

                    {/* Avatar */}
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-100 hover:border-[#2D8A75] transition-colors"
                        >
                            {avatarPreview
                                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                                : <User size={28} className="text-gray-400" />}
                            <div className="absolute bottom-0 inset-x-0 bg-black/50 py-1 flex justify-center">
                                <Camera size={11} className="text-white" />
                            </div>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={`w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] ${errors.name ? "border-[#F43F5E]" : "border-gray-200"}`}
                            placeholder="Customer name"
                        />
                        {errors.name && <p className="text-[10px] text-[#F43F5E] mt-1">{errors.name}</p>}
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={`w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] ${errors.email ? "border-[#F43F5E]" : "border-gray-200"}`}
                                placeholder="email@example.com"
                            />
                            {errors.email && <p className="text-[10px] text-[#F43F5E] mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75]"
                                placeholder="01XXXXXXXXX"
                            />
                        </div>
                    </div>

                    {/* Group */}
                    <div>
                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Customer Group</label>
                        <select
                            value={groupId}
                            onChange={e => setGroupId(e.target.value)}
                            className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] bg-white"
                        >
                            <option value="">No group</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>
                                    {g.name} ({g.discount_rate}% off)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Active</label>
                        <button
                            type="button"
                            onClick={() => setStatus(!status)}
                            className={`w-10 h-5.5 rounded-full transition-colors relative ${status ? "bg-[#2D8A75]" : "bg-gray-200"}`}
                        >
                            <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${status ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-[#2D8A75] text-white text-sm font-medium rounded-lg hover:bg-[#256d5e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                        {isLoading ? "Saving..." : isEdit ? "Update Customer" : "Add Customer"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerModal;