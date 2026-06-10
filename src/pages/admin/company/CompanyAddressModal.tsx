import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import {
    useCreateCompanyAddressMutation,
    useUpdateCompanyAddressMutation,
    useDeleteCompanyAddressMutation,
} from "../../../store/companyAddressApi";
import type { Address, AddressPayload } from "../../../store/companyAddressApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const ADDRESS_TYPES = ["billing", "shipping", "office", "other"];

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface CompanyAddressModalProps {
    companyId: number;
    address?: Address;
    onClose: () => void;
}

export const CompanyAddressModal: React.FC<CompanyAddressModalProps> = ({
    companyId,
    address,
    onClose,
}) => {
    const isEdit = !!address;

    const [createAddress, { isLoading: isCreating }] = useCreateCompanyAddressMutation();
    const [updateAddress, { isLoading: isUpdating }] = useUpdateCompanyAddressMutation();
    const isLoading = isCreating || isUpdating;

    const EMPTY_FORM: AddressPayload = {
        type:         "billing",
        address_line: "",
        city:         "",
        state:        "",
        zip_code:     "",
        country:      "",
        is_default:   false,
    };

    const [form, setForm] = useState<AddressPayload>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof AddressPayload, string>>>({});

    useEffect(() => {
        if (address) {
            setForm({
                type:         address.type,
                address_line: address.address_line,
                city:         address.city,
                state:        address.state,
                zip_code:     address.zip_code,
                country:      address.country,
                is_default:   address.is_default,
            });
        }
    }, [address]);

    const set = <K extends keyof AddressPayload>(key: K, value: AddressPayload[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!form.type)         e.type         = "Type is required.";
        if (!form.address_line.trim()) e.address_line = "Address line is required.";
        if (!form.city.trim())  e.city          = "City is required.";
        if (!form.state.trim()) e.state         = "State is required.";
        if (!form.zip_code.trim()) e.zip_code   = "Zip code is required.";
        if (!form.country.trim())  e.country    = "Country is required.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            if (isEdit) {
                await updateAddress({ companyId, addressId: address!.id, data: form }).unwrap();
            } else {
                await createAddress({ companyId, data: form }).unwrap();
            }
            onClose();
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    const field = (
        label: string,
        key: keyof AddressPayload,
        placeholder: string,
    ) => (
        <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {label} <span className="text-red-400">*</span>
            </label>
            <input
                type="text"
                value={form[key] as string}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] ${
                    errors[key] ? "border-red-400" : "border-gray-200"
                }`}
            />
            {errors[key] && (
                <p className="text-xs text-red-400 mt-1">{errors[key]}</p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-800">
                        {isEdit ? "Edit Address" : "Add Address"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">

                    {/* Type */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Type <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={form.type}
                            onChange={(e) => set("type", e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#2D8A75] capitalize ${
                                errors.type ? "border-red-400" : "border-gray-200"
                            }`}
                        >
                            {ADDRESS_TYPES.map((t) => (
                                <option key={t} value={t} className="capitalize">{t}</option>
                            ))}
                        </select>
                        {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type}</p>}
                    </div>

                    {/* Address Line */}
                    {field("Address Line", "address_line", "House 12, Road 5, Dhanmondi")}

                    {/* City + State */}
                    <div className="grid grid-cols-2 gap-3">
                        {field("City",  "city",  "Dhaka")}
                        {field("State", "state", "Dhaka")}
                    </div>

                    {/* Zip + Country */}
                    <div className="grid grid-cols-2 gap-3">
                        {field("Zip Code", "zip_code", "1205")}
                        {field("Country",  "country",  "Bangladesh")}
                    </div>

                    {/* Default toggle */}
                    <div className="flex items-center justify-between pt-1">
                        <div>
                            <p className="text-xs font-semibold text-gray-600">Set as Default</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                This address will be used as the primary address.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => set("is_default", !form.is_default)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${
                                form.is_default ? "bg-[#2D8A75]" : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                    form.is_default ? "translate-x-5" : ""
                                }`}
                            />
                        </button>
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
                        {isEdit ? "Save Changes" : "Add Address"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteAddressModalProps {
    companyId: number;
    address: Address;
    onClose: () => void;
}

export const DeleteCompanyAddressModal: React.FC<DeleteAddressModalProps> = ({
    companyId,
    address,
    onClose,
}) => {
    const [deleteAddress, { isLoading }] = useDeleteCompanyAddressMutation();

    const handle = async () => {
        try {
            await deleteAddress({ companyId, addressId: address.id }).unwrap();
            onClose();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-2">Delete Address</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Are you sure you want to delete this address? This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Type</span>
                        <span className="capitalize font-medium text-gray-700">{address.type}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Address</span>
                        <span className="text-gray-700 text-right max-w-[200px]">{address.address_line}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">City</span>
                        <span className="text-gray-700">{address.city}, {address.state}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Country</span>
                        <span className="text-gray-700">{address.country} — {address.zip_code}</span>
                    </div>
                    {address.is_default && (
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Default</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A]">
                                Yes
                            </span>
                        </div>
                    )}
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