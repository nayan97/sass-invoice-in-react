import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { Loader2, User, MapPin, FileText, LogOut, Plus, Pencil, Trash2, X } from "lucide-react";
import {
  useGetCustomerProfileQuery,
  useUpdateCustomerProfileMutation,
  useCreateCustomerAddressMutation,
  useUpdateCustomerAddressMutation,
  useDeleteCustomerAddressMutation,
  useGetCustomerInvoicesQuery,
  type CustomerAddress,
  type CustomerProfileData,
} from "../../store/customerPortalApi";
import { clearCustomerCredentials } from "../../store/customerAuthSlice";

type Tab = "info" | "addresses" | "invoices";

const CustomerProfile: React.FC = () => {
  const { company } = useParams<{ company: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tab, setTab] = useState<Tab>("info");

  const { data: profile, isLoading: isProfileLoading } = useGetCustomerProfileQuery(
    { company: company! },
    { skip: !company }
  );
  const { data: invoices, isLoading: isInvoicesLoading } = useGetCustomerInvoicesQuery(
    { company: company! },
    { skip: !company || tab !== "invoices" }
  );

  const [updateProfile, { isLoading: isSaving }] = useUpdateCustomerProfileMutation();
  const [createAddress] = useCreateCustomerAddressMutation();
  const [updateAddress] = useUpdateCustomerAddressMutation();
  const [deleteAddress] = useDeleteCustomerAddressMutation();

  if (!company) return null;

  const handleLogout = () => {
    dispatch(clearCustomerCredentials());
    navigate(`/customer/${company}/login`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#333333]">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
            {profile && <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-100 rounded-lg p-1">
          {([
            { key: "info", label: "Personal Info", icon: User },
            { key: "addresses", label: "Addresses", icon: MapPin },
            { key: "invoices", label: "Invoices", icon: FileText },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors ${
                tab === key ? "bg-[#2D8A75] text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {isProfileLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#2D8A75]" />
          </div>
        )}

        {!isProfileLoading && profile && (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">

            {/* Personal Info */}
            {tab === "info" && (
              <PersonalInfoForm
                key={profile.id}
                company={company}
                profile={profile}
                onSave={updateProfile}
                isSaving={isSaving}
              />
            )}

            {/* Addresses */}
            {tab === "addresses" && (
              <AddressSection
                company={company}
                addresses={profile.addresses}
                onCreate={createAddress}
                onUpdate={updateAddress}
                onDelete={deleteAddress}
              />
            )}

            {/* Invoices */}
            {tab === "invoices" && (
              <div>
                {isInvoicesLoading && (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-[#2D8A75]" />
                  </div>
                )}
                {!isInvoicesLoading && invoices?.data.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-10">No invoices yet.</p>
                )}
                <div className="space-y-2">
                  {invoices?.data.map((inv) => (
                    <a
                      key={inv.id}
                      href={`/invoices/${inv.public_token}`}
                      className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{inv.invoice_number}</p>
                        <p className="text-xs text-gray-400">{new Date(inv.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">{inv.total}</p>
                        <span className="text-[10px] uppercase tracking-wide text-gray-400">{inv.status}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Personal info sub-section ────────────────────────────────────────────
// Mounted with key={profile.id} from the parent so initial state is always
// fresh from the loaded profile — no useEffect + setState needed.

interface PersonalInfoFormProps {
  company: string;
  profile: CustomerProfileData;
  onSave: ReturnType<typeof useUpdateCustomerProfileMutation>[0];
  isSaving: boolean;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ company, profile, onSave, isSaving }) => {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone || "");
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(false);
    await onSave({ company, name, phone }).unwrap();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <form onSubmit={handleSaveInfo} className="space-y-5">
      <div>
        <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="w-full border border-gray-200 bg-gray-50 px-4 py-2.5 rounded text-sm text-gray-400 cursor-not-allowed"
        />
        <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed.</p>
      </div>

      <div>
        <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 bg-white px-4 py-2.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700"
        />
      </div>

      <div>
        <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
          Phone Number
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-200 bg-white px-4 py-2.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-[#2D8A75] text-white py-2.5 rounded text-sm font-semibold uppercase tracking-widest hover:bg-[#256d5e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedMsg ? "Saved!" : "Save Changes"}
      </button>
    </form>
  );
};

// ─── Address sub-section ──────────────────────────────────────────────────

interface AddressSectionProps {
  company: string;
  addresses: CustomerAddress[];
  onCreate: ReturnType<typeof useCreateCustomerAddressMutation>[0];
  onUpdate: ReturnType<typeof useUpdateCustomerAddressMutation>[0];
  onDelete: ReturnType<typeof useDeleteCustomerAddressMutation>[0];
}

const emptyForm = { label: "", line1: "", line2: "", city: "", is_default: false };

const AddressSection: React.FC<AddressSectionProps> = ({ company, addresses, onCreate, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (addr: CustomerAddress) => {
    setForm({ label: addr.label, line1: addr.line1, line2: addr.line2 || "", city: addr.city, is_default: addr.is_default });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await onUpdate({ company, id: editingId, ...form }).unwrap();
    } else {
      await onCreate({ company, ...form }).unwrap();
    }
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this address?")) {
      await onDelete({ company, id }).unwrap();
    }
  };

  return (
    <div className="space-y-3">
      {addresses.map((addr) => (
        <div key={addr.id} className="border border-gray-100 rounded-lg px-4 py-3 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">{addr.label}</p>
              {addr.is_default && (
                <span className="text-[10px] uppercase tracking-wide bg-[#2D8A75]/10 text-[#2D8A75] px-1.5 py-0.5 rounded">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => startEdit(addr)} className="text-gray-400 hover:text-[#2D8A75]">
              <Pencil size={14} />
            </button>
            <button onClick={() => handleDelete(addr.id)} className="text-gray-400 hover:text-red-600">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {!showForm && (
        <button
          onClick={startCreate}
          className="w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-200 rounded-lg py-3 text-xs text-gray-500 hover:border-[#2D8A75] hover:text-[#2D8A75] transition-colors"
        >
          <Plus size={14} />
          Add Address
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {editingId ? "Edit Address" : "New Address"}
            </p>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>

          <input
            placeholder="Label (e.g. Home)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            required
            className="w-full border border-gray-200 px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75]"
          />
          <input
            placeholder="Address line 1"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            required
            className="w-full border border-gray-200 px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75]"
          />
          <input
            placeholder="Address line 2 (optional)"
            value={form.line2}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
            className="w-full border border-gray-200 px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75]"
          />
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
            className="w-full border border-gray-200 px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75]"
          />
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              className="accent-[#2D8A75]"
            />
            Set as default address
          </label>

          <button
            type="submit"
            className="w-full bg-[#2D8A75] text-white py-2 rounded text-xs font-semibold uppercase tracking-widest hover:bg-[#256d5e] transition-colors"
          >
            Save Address
          </button>
        </form>
      )}
    </div>
  );
};

export default CustomerProfile;