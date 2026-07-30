import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Check authentication state
    const isAuthenticated = useSelector((state: RootState) => !!state.auth?.access_token);

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* LEFT: Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            SaaSify
                        </span>
                    </div>

                    {/* MIDDLE: Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#features" className="hover:text-blue-600 transition-colors">
                            Features
                        </a>
                        <a href="#pricing" className="hover:text-blue-600 transition-colors">
                            Pricing
                        </a>
                        <a href="#faq" className="hover:text-blue-600 transition-colors">
                            FAQ
                        </a>
                    </nav>

                    {/* RIGHT: Login / Dashboard Button */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm hover:shadow flex items-center gap-1.5"
                            >
                                Dashboard <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition"
                                >
                                    Customer Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4.5 py-2 rounded-lg transition shadow-sm hover:shadow"
                                >
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none p-1"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-gray-100 bg-white px-4 pt-2 pb-4 space-y-3">
                    <a
                        href="#features"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-base font-medium text-gray-600 hover:text-blue-600"
                    >
                        Features
                    </a>
                    <a
                        href="#pricing"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-base font-medium text-gray-600 hover:text-blue-600"
                    >
                        Pricing
                    </a>
                    <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                        {isAuthenticated ? (
                            <button
                                onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-center"
                            >
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full text-center py-2 text-gray-700 font-medium"
                                >
                                    Customer Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-center"
                                >
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};