import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import {
    useAddCompanyUserMutation,
    useUpdateCompanyUserMutation,
    useRemoveCompanyUserMutation,
} from "../../../store/companyUsersApi";
import type { CompanyUser, CompanyUserPayload } from "../../../store/companyUsersApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = ["admin", "member", "viewer"];

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface CompanyUserModalProps {
    companyId: number;
    user?: CompanyUser;          // present → Edit mode
    onClose: () => void;
}

export const CompanyUserModal: React.FC<CompanyUserModalProps> = ({
    companyId,
    user,
    onClose,
}) => {
    const isEdit = !!user;

    const [addUser,    { isLoading: isAdding  }] = useAddCompanyUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateCompanyUserMutation();
    const isLoading = isAdding || isUpdating;

    const [form, setForm] = useState<CompanyUserPayload>({
        user_id:   user?.user_id   ?? 0,
        role:      user?.role      ?? "member",
        is_active: user?.is_active ?? true,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CompanyUserPayload, string>>>({});

    useEffect(() => {
        if (user) {
            setForm({ user_id: user.user_id, role: user.role, is_active: user.is_active });
        }
    }, [user]);

    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!isEdit && (!form.user_id || form.user_id <= 0)) e.user_id = "User ID is required.";
        if (!form.role) e.role = "Role is required.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            if (isEdit) {
                await updateUser({ companyId, userId: user!.user_id, data: { role: form.role, is_active: form.is_active } }).unwrap();
            } else {
                await addUser({ companyId, data: form }).unwrap();
            }
            onClose();
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-800">
                        {isEdit ? "Edit Company User" : "Add User to Company"}
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

                    {/* User ID — only on Add */}
                    {!isEdit && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                User ID <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                value={form.user_id || ""}
                                onChange={(e) => setForm((f) => ({ ...f, user_id: Number(e.target.value) }))}
                                placeholder="Enter user ID"
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] ${
                                    errors.user_id ? "border-red-400" : "border-gray-200"
                                }`}
                            />
                            {errors.user_id && (
                                <p className="text-xs text-red-400 mt-1">{errors.user_id}</p>
                            )}
                        </div>
                    )}

                    {/* Role */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Role <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] bg-white capitalize ${
                                errors.role ? "border-red-400" : "border-gray-200"
                            }`}
                        >
                            {ROLES.map((r) => (
                                <option key={r} value={r} className="capitalize">{r}</option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="text-xs text-red-400 mt-1">{errors.role}</p>
                        )}
                    </div>

                    {/* Active toggle — only on Edit */}
                    {isEdit && (
                        <div className="flex items-center justify-between py-1">
                            <span className="text-xs font-semibold text-gray-600">Active</span>
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                                className={`relative w-10 h-5 rounded-full transition-colors ${
                                    form.is_active ? "bg-[#2D8A75]" : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                        form.is_active ? "translate-x-5" : ""
                                    }`}
                                />
                            </button>
                        </div>
                    )}
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
                        {isEdit ? "Save Changes" : "Add User"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteUserModalProps {
    companyId: number;
    user: CompanyUser;
    onClose: () => void;
}

export const DeleteCompanyUserModal: React.FC<DeleteUserModalProps> = ({
    companyId,
    user,
    onClose,
}) => {
    const [removeUser, { isLoading }] = useRemoveCompanyUserMutation();

    const handle = async () => {
        try {
            await removeUser({ companyId, userId: user.user_id }).unwrap();
            onClose();
        } catch (err) {
            console.error("Remove failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-2">Remove User</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Are you sure you want to remove{" "}
                    <span className="font-semibold text-gray-700">{user.user?.name ?? `User #${user.user_id}`}</span>{" "}
                    from this company? This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Email</span>
                        <span className="text-gray-700">{user.user?.email ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Role</span>
                        <span className="text-gray-700 capitalize">{user.role}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Status</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            user.is_active
                                ? "bg-[#DCFCE7] text-[#16A34A]"
                                : "bg-[#F3F4F6] text-[#6B7280]"
                        }`}>
                            {user.is_active ? "Active" : "Inactive"}
                        </span>
                    </div>
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
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
};