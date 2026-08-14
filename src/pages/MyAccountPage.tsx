import { User, MapPin, ShoppingBag, Tag, Settings, Calendar } from "lucide-react";

export default function MyAccountPage() {
  return (
    <div className="bg-[#F4F5F7] text-slate-800 min-h-screen antialiased">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-slate-500 font-medium mb-6 gap-2">
          <a href="/" className="hover:text-slate-800 transition-colors">
            Homepage
          </a>
          <span>/</span>
          <span className="text-[#1877F2]">My Account</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Account</h1>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Navigation */}
          <aside className="md:col-span-3 space-y-1">
            {/* Active Link */}
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#E7F0FC] text-[#1877F2] font-semibold text-sm transition-colors"
            >
              <User className="w-4 h-4" />
              My details
            </a>

            {/* Inactive Links */}
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-200/50 font-medium text-sm transition-colors"
            >
              <MapPin className="w-4 h-4 text-slate-500" />
              My address book
            </a>

            <a
              href="/my-invoices"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-200/50 font-medium text-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              My Invoices
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-200/50 font-medium text-sm transition-colors"
            >
              <Tag className="w-4 h-4 text-slate-500" />
              My newsletters
            </a>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-200/50 font-medium text-sm transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              Account settings
            </a>
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-9 bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-10">
            {/* Main Section Title */}
            <h2 className="text-2xl font-bold text-slate-900">My details</h2>

            {/* Personal Information Section */}
            <section className="space-y-6">
              <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
              <hr className="border-slate-200" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Info Text */}
                <div className="lg:col-span-5 text-sm text-slate-500 leading-relaxed">
                  Assertively utilize adaptive customer service for future-proof platforms.
                  Completely drive optimal markets.
                </div>

                {/* Right Form Fields */}
                <form
                  className="lg:col-span-7 space-y-5"
                  onSubmit={(e) => e.preventDefault()}
                >
                  {/* First Name & Second Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 tracking-wider uppercase mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Mateusz"
                        className="w-full bg-[#F2F4F7] border border-slate-200 rounded-md px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1877F2] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 tracking-wider uppercase mb-1.5">
                        Second Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Wierzbicki"
                        className="w-full bg-[#F2F4F7] border border-slate-200 rounded-md px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1877F2] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div className="sm:w-1/2">
                    <label className="block text-[11px] font-bold text-slate-800 tracking-wider uppercase mb-1.5">
                      Birth Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="dd/mm/yy"
                        className="w-full bg-[#F2F4F7] border border-slate-200 rounded-md pl-3.5 pr-10 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1877F2] transition-colors"
                      />
                      <Calendar className="w-4 h-4 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 tracking-wider uppercase mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      defaultValue="123456789"
                      className="w-full bg-[#F2F4F7] border border-slate-200 rounded-md px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1877F2] transition-colors"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Keep 9-digit format with no spaces and dashes.
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-md transition-colors shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* E-mail Address Section */}
            <section className="space-y-6 pt-4">
              <h3 className="text-base font-bold text-slate-900">E-mail address</h3>
              <hr className="border-slate-200" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Info Text */}
                <div className="lg:col-span-5 text-sm text-slate-500 leading-relaxed">
                  Assertively utilize adaptive customer service for future-proof platforms.
                  Completely drive optimal markets.
                </div>

                {/* Right Form Fields */}
                <form
                  className="lg:col-span-7 space-y-5"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 tracking-wider uppercase mb-1.5">
                      E-Mail Address
                    </label>
                    <input
                      type="email"
                      defaultValue="email@example.pl"
                      className="w-full bg-[#F2F4F7] border border-slate-200 rounded-md px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1877F2] transition-colors"
                    />
                  </div>
                </form>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}