import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, Loader2, ChevronDown, UserPlus } from "lucide-react";
import {
    useGetCustomersQuery,
    useCreateCustomerMutation,
    type Customer,
} from "../../../store/customerApi";

// ─── Shared style tokens (kept identical to AddInvoicePage) ───────────────────

const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D8A75]/30 focus:border-[#2D8A75] transition-colors bg-white";

const labelCls = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1";

// ─── Debounce helper ───────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay = 350): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CustomerSelectProps {
    companyId: number;
    value: Customer | null;
    onChange: (customer: Customer) => void;
    error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CustomerSelect: React.FC<CustomerSelectProps> = ({ companyId, value, onChange, error }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const debouncedQuery = useDebounce(query);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { data, isFetching } = useGetCustomersQuery(
        { companyId, search: debouncedQuery, per_page: 10 },
        { skip: !open || showAddForm }
    );

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
                setShowAddForm(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const select = (c: Customer) => {
        onChange(c);
        setQuery("");
        setOpen(false);
        setShowAddForm(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <label className={labelCls}>
                Customer <span className="text-red-400">*</span>
            </label>

            {value && !open ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white hover:border-[#2D8A75] transition-colors"
                >
                    <span>
                        <span className="font-semibold text-gray-700">{value.name}</span>
                        {(value.email || value.phone) && (
                            <span className="text-xs text-gray-400 ml-2">
                                {[value.email, value.phone].filter(Boolean).join(" · ")}
                            </span>
                        )}
                    </span>
                    <ChevronDown size={14} className="text-gray-400 shrink-0" />
                </button>
            ) : (
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        autoFocus={open}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setOpen(true)}
                        placeholder="Search customer by name, email, phone..."
                        className={inputCls + " pl-8"}
                    />
                </div>
            )}

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            {open && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {showAddForm ? (
                        <QuickAddCustomer
                            companyId={companyId}
                            initialName={query}
                            onCreated={select}
                            onCancel={() => setShowAddForm(false)}
                        />
                    ) : (
                        <>
                            {isFetching && (
                                <div className="flex items-center justify-center py-4 text-gray-400 text-sm gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Searching...
                                </div>
                            )}

                            {!isFetching && data?.data.length === 0 && (
                                <div className="px-4 py-3 text-sm text-gray-400">No customers found.</div>
                            )}

                            {!isFetching &&
                                data?.data.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => select(c)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <p className="text-sm font-semibold text-gray-700">{c.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {[c.email, c.phone].filter(Boolean).join(" · ") || "No contact info"}
                                        </p>
                                    </button>
                                ))}

                            <button
                                type="button"
                                onClick={() => setShowAddForm(true)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#2D8A75] hover:bg-[#2D8A75]/5 transition-colors border-t border-gray-100"
                            >
                                <UserPlus size={14} />
                                Add "{query.trim() || "New Customer"}" as new customer
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Inline Quick-Add Form ─────────────────────────────────────────────────────

interface QuickAddProps {
    companyId: number;
    initialName: string;
    onCreated: (c: Customer) => void;
    onCancel: () => void;
}

const QuickAddCustomer: React.FC<QuickAddProps> = ({ companyId, initialName, onCreated, onCancel }) => {
    const [createCustomer, { isLoading }] = useCreateCustomerMutation();
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [err, setErr] = useState("");

    const submit = async () => {
        if (!name.trim()) {
            setErr("Name is required.");
            return;
        }
        const fd = new FormData();
        fd.append("name", name.trim());
        if (email) fd.append("email", email);
        if (phone) fd.append("phone", phone);
        fd.append("status", "1");

        try {
            const customer = await createCustomer({ companyId, formData: fd }).unwrap();
            onCreated(customer);
        } catch {
            setErr("Failed to create customer.");
        }
    };

    return (
        <div className="p-3 space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">New Customer</p>
            <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Customer name *"
                className={inputCls}
            />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className={inputCls}
            />
            <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className={inputCls}
            />
            {err && <p className="text-xs text-red-500">{err}</p>}
            <div className="flex gap-2 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={submit}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-[#2D8A75] text-white rounded-lg hover:bg-[#256d5e] transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                    Create
                </button>
            </div>
        </div>
    );
};

export default CustomerSelect;