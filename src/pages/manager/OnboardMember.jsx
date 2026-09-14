import React, { useState } from 'react';

export default function OnboardMember({ onDone }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Frontend Engineer');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Team member ${name || 'Aman Gupta'} provisioned successfully!`);
    if (onDone) onDone();
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Onboard & Provision Team Member</h1>
        <p className="text-xs text-slate-500 mt-0.5">Create employee credentials, configure shift models, and allocate attendance quotas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">MEMBER DETAILS & WORK PROFILE</h2>
              <p className="text-[10px] text-slate-400">Assigned under Harsh Suri's direct supervision</p>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-semibold">Step 1 of 1</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Aman Gupta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Work Email *</label>
                <input
                  type="email"
                  placeholder="e.g. aman.gupta@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Role *</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Squad</label>
                <input
                  type="text"
                  defaultValue="Frontend Squad"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Shift</label>
                <input
                  type="text"
                  defaultValue="General (09:00 - 18:00)"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Biometric Hardware ID</label>
                <input
                  type="text"
                  defaultValue="BIO-88319"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  defaultValue="EMP-1049"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-4">
              <p className="text-[10px] font-bold uppercase text-slate-600">DEFAULT ANNUAL LEAVE ENTITLEMENT</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400">Casual Leave</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">12 Days</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400">Sick / Medical</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">7 Days</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400">Earned Leaves</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">18 Days</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setName('')} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
                Reset Form
              </button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm">
                + Provision Team Member
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Cards */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase text-slate-800">DIRECT REPORTS (HARSH SURI)</h3>
              <span className="text-[10px] text-slate-500 font-bold">48 Total</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">AS</span>
                  <div>
                    <p className="font-semibold text-slate-800">Arpit Singla</p>
                    <p className="text-[10px] text-slate-400">Software Engineer • Frontend</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center">PS</span>
                  <div>
                    <p className="font-semibold text-slate-800">Priya Sharma</p>
                    <p className="text-[10px] text-slate-400">UI/UX Designer • Product</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full border border-amber-200">On Leave</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-xs">
            <h3 className="font-bold text-slate-800 mb-2">Provisioning Governance</h3>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-500 text-[11px]">
              <li>Temporary credentials are dispatched to the work email immediately.</li>
              <li>Biometric enrollment requires first physical verification at Gate 1.</li>
              <li>Direct reports are automatically mapped to Harsh Suri's approval queue.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}