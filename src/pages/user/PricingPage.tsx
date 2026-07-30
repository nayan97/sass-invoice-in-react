import React, { useState } from "react";
import { Check, Loader2, X, Tag, ArrowRight, ChevronRight, Zap, Shield, Sparkles, BarChart3, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { useGetSubscriptionPlanQuery, useCreateSubscriptionMutation } from "../../store/homeApi";
import { useCreateCompanyMutation } from "../../store/companyApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { Navbar } from "../../components/user/Navbar";

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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-5 border-b">
                    <div>
                        <StepIndicator step={2} label="Confirm your subscription" />
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Selected Plan</p>
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
                            <div className="mt-3 text-xs text-green-700 bg-green-100 font-medium rounded-full px-3 py-1 inline-block">
                                {plan.trial_days} days free trial included
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Tag className="w-3.5 h-3.5 inline mr-1 text-gray-500" />
                            Coupon Code <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={couponCode}
                                onChange={(e) => {
                                    setCouponCode(e.target.value ? e.target.value : "");
                                    setError("");
                                }}
                                placeholder="SAVE50"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest uppercase"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                        <span>Start Date</span>
                        <span className="font-medium text-gray-800">{startDate}</span>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
                            <Check className="w-4 h-4" /> Subscription created! Redirecting...
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 transition">
                        Back
                    </button>
                    <button
                        onClick={handleSubscribe}
                        disabled={isLoading || success}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
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

// ─── Main Landing Page Component ──────────────────────────────────────────────

const PricingPage: React.FC = () => {
    const navigate = useNavigate();

    const isAuthenticated = useSelector((state: RootState) => !!state.auth.access_token);
    const companyId = useSelector((state: RootState) => state.auth.company_id);

    const { data: plans = [], isLoading, isError } = useGetSubscriptionPlanQuery();

    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [modal, setModal] = useState<"company" | "subscription" | null>(null);
    const [resolvedCompanyId, setResolvedCompanyId] = useState<number | null>(null);

    const handleGetStarted = (plan: Plan) => {
        if (!isAuthenticated) {
            navigate(`/login?redirect=/`);
            return;
        }

        setSelectedPlan(plan);

        if (!companyId) {
            setModal("company");
            return;
        }

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
        navigate("/dashboard");
    };

    const closeAll = () => {
        setModal(null);
        setSelectedPlan(null);
        setResolvedCompanyId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-600">
            {/* TOP NAVIGATION BAR */}
            <Navbar />

            {/* ── SECTION 1: HERO SECTION ── */}
            <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-white via-slate-50 to-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6 shadow-sm">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        Streamline Your SaaS Operations Today
                    </div>
                    
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 max-w-4xl mx-auto leading-tight">
                        Manage your invoicing & business operations <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">effortlessly</span>.
                    </h1>
                    
                    <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Scale your workflow with powerful customer limits, automated billing pipelines, and custom invoicing—all unified in one clean platform.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="#pricing"
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                        >
                            View All Plans <ArrowRight className="w-5 h-5" />
                        </a>
                        <a
                            href="#features"
                            className="w-full sm:w-auto bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition shadow-sm flex items-center justify-center"
                        >
                            Explore Features
                        </a>
                    </div>
                </div>
            </section>

            {/* ── SECTION 2: FEATURES SECTION ── */}
            <section id="features" className="py-20 bg-white border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-xs sm:text-sm font-bold tracking-widest text-blue-600 uppercase">Built for Growth</h2>
                        <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Everything you need to manage business billing
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 transition-all hover:shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-6">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Management</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Efficiently organize subscriber information and assign tiered access levels smoothly.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 transition-all hover:shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-6">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Quotas</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Control customer, product, and invoice limits automatically mapped directly to your subscription plans.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 transition-all hover:shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Currency Ready</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Invoice clients worldwide in BDT, USD, EUR, or GBP seamlessly with built-in timezone management.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 3: PRICING SECTION ── */}
            <section id="pricing" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Simple, Transparent Pricing</h2>
                        <p className="mt-4 text-gray-600 max-w-xl mx-auto">
                            No hidden fees. Choose a plan tailored to your business scale and upgrade anytime.
                        </p>
                    </div>

                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    )}

                    {isError && (
                        <div className="text-center py-10 text-red-500 font-medium bg-red-50 border border-red-200 rounded-xl max-w-lg mx-auto">
                            Failed to load subscription plans. Please try again later.
                        </div>
                    )}

                    {!isLoading && !isError && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Plan Header */}
                                        <div className="p-8 border-b border-gray-100">
                                            <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                                            <div className="mt-4 flex items-baseline">
                                                <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">
                                                    ৳{Number(plan.price).toLocaleString()}
                                                </span>
                                                <span className="text-gray-500 ml-2 font-medium">/month</span>
                                            </div>
                                            {plan.trial_days > 0 && (
                                                <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                    {plan.trial_days} Days Free Trial
                                                </div>
                                            )}
                                        </div>

                                        {/* Limits & Features */}
                                        <div className="p-8 space-y-6">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Plan Usage Limits</p>
                                                <ul className="space-y-3 text-sm text-gray-700">
                                                    <li className="flex justify-between items-center">
                                                        <span>Customers</span>
                                                        <span className="font-semibold text-gray-900">{plan.customer_limit}</span>
                                                    </li>
                                                    <li className="flex justify-between items-center">
                                                        <span>Products</span>
                                                        <span className="font-semibold text-gray-900">{plan.product_limit}</span>
                                                    </li>
                                                    <li className="flex justify-between items-center">
                                                        <span>Invoices</span>
                                                        <span className="font-semibold text-gray-900">{plan.invoice_limit}</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            {plan.features && plan.features.length > 0 && (
                                                <div className="pt-4 border-t border-gray-100">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Features</p>
                                                    <ul className="space-y-3">
                                                        {plan.features.map((feature) => (
                                                            <li key={feature.id} className="flex items-start gap-3">
                                                                <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-800">{feature.feature_name}</p>
                                                                    {feature.feature_value && (
                                                                        <p className="text-xs text-gray-500">{feature.feature_value}</p>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-8 pt-0">
                                        <button
                                            onClick={() => handleGetStarted(plan)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/10"
                                        >
                                            Get Started <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── MODALS ── */}
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
        </div>
    );
};

export default PricingPage;