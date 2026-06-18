import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import {
    useCreateCurrencyMutation,
    useUpdateCurrencyMutation,
    useDeleteCurrencyMutation,
} from "../../../store/currencyApi";
import type { Currency, CurrencyPayload } from "../../../store/currencyApi";

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface CurrencyModalProps {
    currency?: Currency;
    onClose: () => void;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({ currency, onClose }) => {
    const isEdit = !!currency;

    const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation();
    const [updateCurrency, { isLoading: isUpdating }] = useUpdateCurrencyMutation();
    const isLoading = isCreating || isUpdating;

    const EMPTY_FORM: CurrencyPayload = {
        name:           "",
        code:           "",
        symbol:         "",
        decimal_places: 2,
        exchange_rate:  1,
        is_default:     false,
        is_active:      true,
    };

    const [form, setForm]     = useState<CurrencyPayload>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof CurrencyPayload, string>>>({});

    useEffect(() => {
        if (currency) {
            setForm({
                name:           currency.name,
                code:           currency.code,
                symbol:         currency.symbol,
                decimal_places: currency.decimal_places,
                exchange_rate:  currency.exchange_rate,
                is_default:     currency.is_default,
                is_active:      currency.is_active,
            });
        }
    }, [currency]);

    const set = <K extends keyof CurrencyPayload>(key: K, value: CurrencyPayload[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const validate = (): boolean => {
        const e: typeof errors = {};
        if (!form.name.trim())   e.name   = "Name is required.";
        if (!form.code.trim())   e.code   = "Code is required.";
        if (!form.symbol.trim()) e.symbol = "Symbol is required.";
        if (form.decimal_places === undefined || form.decimal_places < 0)
            e.decimal_places = "Decimal places must be 0 or more.";
        if (!form.exchange_rate || form.exchange_rate <= 0)
            e.exchange_rate = "Exchange rate must be greater than 0.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            if (isEdit) {
                await updateCurrency({ id: currency!.id, data: form }).unwrap();
            } else {
                await createCurrency(form).unwrap();
            }
            onClose();
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    const textField = (
        label: string,
        key: keyof CurrencyPayload,
        placeholder: string,
        type: string = "text",
    ) => (
        <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {label} <span className="text-red-400">*</span>
            </label>
            <input
                type={type}
                value={form[key] as string | number}
                onChange={(e) =>
                    set(key, type === "number" ? Number(e.target.value) : e.target.value)
                }
                placeholder={placeholder}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] ${
                    errors[key] ? "border-red-400" : "border-gray-200"
                }`}
            />
            {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
        </div>
    );

    const toggle = (label: string, sub: string, key: "is_default" | "is_active") => (
        <div className="flex items-center justify-between py-1">
            <div>
                <p className="text-xs font-semibold text-gray-600">{label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
            </div>
            <button
                type="button"
                onClick={() => set(key, !form[key])}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                    form[key] ? "bg-[#2D8A75]" : "bg-gray-300"
                }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        form[key] ? "translate-x-5" : ""
                    }`}
                />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-800">
                        {isEdit ? "Edit Currency" : "Add Currency"}
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

                    {/* Name */}
                    {textField("Name", "name", "US Dollar")}

                    {/* Code + Symbol */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                Code <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={(e) => set("code", e.target.value.toUpperCase())}
                                placeholder="USD"
                                maxLength={4}
                                className={`w-full border rounded-lg px-3 py-2 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-[#2D8A75] ${
                                    errors.code ? "border-red-400" : "border-gray-200"
                                }`}
                            />
                            {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                Symbol <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.symbol}
                                onChange={(e) => set("symbol", e.target.value)}
                                placeholder="$"
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] ${
                                    errors.symbol ? "border-red-400" : "border-gray-200"
                                }`}
                            />
                            {errors.symbol && <p className="text-xs text-red-400 mt-1">{errors.symbol}</p>}
                        </div>
                    </div>

                    {/* Decimal Places + Exchange Rate */}
                    <div className="grid grid-cols-2 gap-3">
                        {textField("Decimal Places", "decimal_places", "2", "number")}
                        {textField("Exchange Rate",  "exchange_rate",  "1.00", "number")}
                    </div>

                    {/* Toggles */}
                    <div className="border-t border-gray-100 pt-3 space-y-3">
                        {toggle("Active", "Allow this currency to be selected.", "is_active")}
                        {toggle("Default", "Set as the system default currency.", "is_default")}
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
                        {isEdit ? "Save Changes" : "Add Currency"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteCurrencyModalProps {
    currency: Currency;
    onClose: () => void;
}

export const DeleteCurrencyModal: React.FC<DeleteCurrencyModalProps> = ({ currency, onClose }) => {
    const [deleteCurrency, { isLoading }] = useDeleteCurrencyMutation();

    const handle = async () => {
        try {
            await deleteCurrency(currency.id).unwrap();
            onClose();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-2">Delete Currency</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-700">{currency.name}</span>?
                    This action cannot be undone.
                </p>

                <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Code</span>
                        <span className="font-mono font-bold text-gray-700">{currency.code}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Symbol</span>
                        <span className="text-gray-700">{currency.symbol}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Exchange Rate</span>
                        <span className="text-gray-700">{currency.exchange_rate}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Status</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            currency.is_active
                                ? "bg-[#DCFCE7] text-[#16A34A]"
                                : "bg-[#F3F4F6] text-[#6B7280]"
                        }`}>
                            {currency.is_active ? "Active" : "Inactive"}
                        </span>
                    </div>
                    {currency.is_default && (
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Default</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
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