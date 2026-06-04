import React from "react";
import { Check, Loader2 } from "lucide-react";
import { useGetSubscriptionPlansQuery } from "../../store/subscriptionPlansApi";

const PricingPage: React.FC = () => {
    const {
        data: plans = [],
        isLoading,
        isError,
    } = useGetSubscriptionPlansQuery();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin" />
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
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-14">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Choose Your Plan
                    </h1>
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
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {plan.name}
                                </h2>

                                <div className="mt-4">
                                    <span className="text-5xl font-bold">
                                        ৳{Number(plan.price).toLocaleString()}
                                    </span>
                                    <span className="text-gray-500 ml-2">
                                        /month
                                    </span>
                                </div>

                                {plan.trial_days > 0 && (
                                    <div className="mt-3 inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                                        {plan.trial_days} Days Free Trial
                                    </div>
                                )}
                            </div>

                            {/* Limits */}
                            <div className="p-8">
                                <h3 className="font-semibold mb-4">
                                    Plan Limits
                                </h3>

                                <ul className="space-y-3 text-sm text-gray-700">
                                    <li className="flex justify-between">
                                        <span>Customers</span>
                                        <span className="font-medium">
                                            {plan.customer_limit}
                                        </span>
                                    </li>

                                    <li className="flex justify-between">
                                        <span>Products</span>
                                        <span className="font-medium">
                                            {plan.product_limit}
                                        </span>
                                    </li>

                                    <li className="flex justify-between">
                                        <span>Invoices</span>
                                        <span className="font-medium">
                                            {plan.invoice_limit}
                                        </span>
                                    </li>
                                </ul>

                                {/* Features */}
                                {plan.features?.length > 0 && (
                                    <>
                                        <h3 className="font-semibold mt-8 mb-4">
                                            Features
                                        </h3>

                                        <ul className="space-y-3">
                                            {plan.features.map((feature) => (
                                                <li
                                                    key={feature.id}
                                                    className="flex items-start gap-3"
                                                >
                                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />

                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {
                                                                feature.feature_name
                                                            }
                                                        </p>

                                                        {feature.feature_value && (
                                                            <p className="text-sm text-gray-500">
                                                                {
                                                                    feature.feature_value
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                <button
                                    className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingPage;