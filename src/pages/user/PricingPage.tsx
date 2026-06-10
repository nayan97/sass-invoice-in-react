import React, { useState } from "react";
import { Check, Loader2, X, Tag, ArrowRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useGetSubscriptionPlanQuery, useCreateSubscriptionMutation } from "../../store/homeApi";
import { useCreateCompanyMutation } from "../../store/companyApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
    id: number;
    feature_name: string;
    feature_value: string | null;
}

interface Plan {
    id: number;
    name: string;
    price: string | number;
    trial_days: number;
    customer_limit: number;
    product_limit: number;
    invoice_limit: number;
    features?: Feature[];
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ step: 1 | 2; label: string }> = ({ step, label }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
            {step}
        </div>
        <span className="text-gray-500 text-sm font-medium">{label}</span>
    </div>
);

// ─── Company Setup Modal ──────────────────────────────────────────────────────

interface CompanyModalProps {
    plan: Plan;
    onClose: () => void;
    onSuccess: (companyId: number) => void;
}

const CompanySetupModal: React.FC<CompanyModalProps> = ({ plan, onClose, onSuccess }) => {
    const [createCompany, { isLoading }] = useCreateCompanyMutation();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        tax_number: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: "BDT",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = "Company name is required.";
        if (!form.email.trim()) newErrors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email.";
        return newErrors;
    };

    const handleSubmit = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }

        try {
            const company = await createCompany(form).unwrap();
            onSuccess(company.id);
        } catch (err: any) {
            const serverErrors = err?.data?.errors || {};
            const mapped: Record<string, string> = {};
            for (const key in serverErrors) {
                mapped[key] = serverErrors[key][0];
            }
            setErrors(Object.keys(mapped).length ? mapped : { name: err?.data?.message || "Failed to create company." });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b">
                    <div>
                        <StepIndicator step={1} label="Set up your company" />
                        <p className="text-xs text-gray-400 -mt-4 ml-11">
                            This will be linked to the <span className="font-semibold text-blue-600">{plan.name}</span> plan
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <Field label="Company Name *" error={errors.name}>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Acme Corp"
                            className={inputClass(errors.name)}
                        />
                    </Field>

                    <Field label="Business Email *" error={errors.email}>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="hello@company.com"
                            className={inputClass(errors.email)}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Phone" error={errors.phone}>
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+880..."
                                className={inputClass(errors.phone)}
                            />
                        </Field>
                        <Field label="Tax Number" error={errors.tax_number}>
                            <input
                                name="tax_number"
                                value={form.tax_number}
                                onChange={handleChange}
                                placeholder="Optional"
                                className={inputClass(errors.tax_number)}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Currency">
                            <select name="currency" value={form.currency} onChange={handleChange} className={inputClass()}>
                                <option value="BDT">BDT (৳)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </Field>
                        <Field label="Timezone">
                            <input
                                name="timezone"
                                value={form.timezone}
                                onChange={handleChange}
                                className={inputClass()}
                            />
                        </Field>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Continue <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Subscription Confirmation Modal ─────────────────────────────────────────

interface SubscriptionModalProps {
    plan: Plan;
    companyId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ plan, companyId, onClose, onSuccess }) => {
    const [createSubscription, { isLoading }] = useCreateSubscriptionMutation();
    const [couponCode, setCouponCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const startDate = new Date().toISOString().split("T")[0];

    const handleSubscribe = async () => {
        setError("");
        try {
            await createSubscription({
                company_id: companyId,
                plan_id: plan.id,
                coupon_code: couponCode || undefined,
                start_date: startDate,
                end_date: null,
                status: "trial"
            }).unwrap();
            setSuccess(true);
            setTimeout(onSuccess, 1500);
        } catch (err: any) {
            setError(err?.data?.message || "Failed to create subscription.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b">
                    <div>
                        <StepIndicator step={2} label="Confirm your subscription" />
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Plan Summary */}
                <div className="px-6 py-5 space-y-5">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Selected Plan</p>
                                <p className="text-xl font-bold text-gray-900 mt-0.5">{plan.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">
                                    ৳{Number(plan.price).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400">/month</p>
                            </div>
                        </div>
                        {plan.trial_days > 0 && (
                            <div className="mt-3 text-xs text-green-700 bg-green-100 rounded-full px-3 py-1 inline-block">
                                {plan.trial_days} days free trial included
                            </div>
                        )}
                    </div>

                    {/* Coupon */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Tag className="w-3.5 h-3.5 inline mr-1" />
                            Coupon Code <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={couponCode}
                                onChange={(e) => {
                                    setCouponCode(e.target.value ? e.target.value : "")
                                    setError("");
                                }}
                                placeholder=""
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono tracking-widest"
                            />
                        </div>
                    </div>

                    {/* Start Date */}
                    <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
                        <span>Start Date</span>
                        <span className="font-medium text-gray-800">{startDate}</span>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Subscription created! Redirecting...
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 transition">
                        Back
                    </button>
                    <button
                        onClick={handleSubscribe}
                        disabled={isLoading || success}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Subscribe Now <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Helper Components ────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        {children}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const inputClass = (error?: string) =>
    `w-full border ${error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition`;

// ─── Main Page ────────────────────────────────────────────────────────────────

const PricingPage: React.FC = () => {
    const navigate = useNavigate();

    // Redux auth state — adjust selector to match your store shape
    const isAuthenticated = useSelector((state: RootState) => !!state.auth.access_token);
    // const user = useSelector((state: RootState) => state.auth.user);
    const companyId = useSelector((state: RootState) => state.auth.company_id);

    console.log("Company ID:", companyId);

    const { data: plans = [], isLoading, isError } = useGetSubscriptionPlanQuery();

    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [modal, setModal] = useState<"company" | "subscription" | null>(null);
    const [resolvedCompanyId, setResolvedCompanyId] = useState<number | null>(null);

    const handleGetStarted = (plan: Plan) => {
        // 1. Not logged in → redirect to login
        if (!isAuthenticated) {
            navigate(`/login?redirect=/`);
            return;
        }

        setSelectedPlan(plan);

        // const companyId = user?.company_id ?? null; // or user?.company?.id

        // 2. No company → show company setup first
        if (!companyId) {
            setModal("company");
            return;
        }

        // 3. Has company → go straight to subscription
        setResolvedCompanyId(companyId);
        setModal("subscription");
    };

    const handleCompanyCreated = (companyId: number) => {
        setResolvedCompanyId(companyId);
        setModal("subscription");
    };

    const handleSubscriptionSuccess = () => {
        setModal(null);
        setSelectedPlan(null);
        navigate("/dashboard"); // adjust to your post-subscription route
    };

    const closeAll = () => {
        setModal(null);
        setSelectedPlan(null);
        setResolvedCompanyId(null);
    };

    // ── Render ──

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-20 text-red-500">
                Failed to load subscription plans.
            </div>
        );
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
                        <p className="mt-4 text-gray-600">
                            Select the perfect subscription for your business.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition"
                            >
                                {/* Header */}
                                <div className="p-8 border-b">
                                    <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                                    <div className="mt-4">
                                        <span className="text-5xl font-bold">
                                            ৳{Number(plan.price).toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 ml-2">/month</span>
                                    </div>
                                    {plan.trial_days > 0 && (
                                        <div className="mt-3 inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                                            {plan.trial_days} Days Free Trial
                                        </div>
                                    )}
                                </div>

                                {/* Limits */}
                                <div className="p-8">
                                    <h3 className="font-semibold mb-4">Plan Limits</h3>
                                    <ul className="space-y-3 text-sm text-gray-700">
                                        <li className="flex justify-between">
                                            <span>Customers</span>
                                            <span className="font-medium">{plan.customer_limit}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Products</span>
                                            <span className="font-medium">{plan.product_limit}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Invoices</span>
                                            <span className="font-medium">{plan.invoice_limit}</span>
                                        </li>
                                    </ul>

                                    {plan.features?.length > 0 && (
                                        <>
                                            <h3 className="font-semibold mt-8 mb-4">Features</h3>
                                            <ul className="space-y-3">
                                                {plan.features.map((feature) => (
                                                    <li key={feature.id} className="flex items-start gap-3">
                                                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-medium text-gray-800">{feature.feature_name}</p>
                                                            {feature.feature_value && (
                                                                <p className="text-sm text-gray-500">{feature.feature_value}</p>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}

                                    <button
                                        onClick={() => handleGetStarted(plan)}
                                        className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                    >
                                        Get Started <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
            {modal === "company" && selectedPlan && (
                <CompanySetupModal
                    plan={selectedPlan}
                    onClose={closeAll}
                    onSuccess={handleCompanyCreated}
                />
            )}

            {modal === "subscription" && selectedPlan && resolvedCompanyId && (
                <SubscriptionModal
                    plan={selectedPlan}
                    companyId={resolvedCompanyId}
                    onClose={closeAll}
                    onSuccess={handleSubscriptionSuccess}
                />
            )}
        </>
    );
};

export default PricingPage;