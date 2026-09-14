import React, { useState } from 'react';

export default function ApplyLeave({ onDone }) {
  const [category, setCategory] = useState('Casual Leave (Personal / Family)');
  const [fromDate, setFromDate] = useState('2026-09-14');
  const [toDate, setToDate] = useState('2026-09-15');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Leave request submitted successfully for manager sign-off!');
    if (onDone) onDone();
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Apply for Time Off</h1>
        <p className="text-xs text-slate-500 mt-0.5">Submit planned absences, sick leaves, or emergency time-off for managerial sign-off.</p>
      </div>

      {/* 3 Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>CASUAL LEAVES</span>
            <span className="text-[10px] text-indigo-600 font-semibold">Available</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">8 <span className="text-xs font-normal text-slate-400">/ 12 Days</span></p>
          <div className="w-full h-1 bg-indigo-600 rounded-full mt-3"></div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>MEDICAL / SICK</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Available</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">5 <span className="text-xs font-normal text-slate-400">/ 7 Days</span></p>
          <div className="w-full h-1 bg-emerald-500 rounded-full mt-3"></div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>EARNED / ANNUAL</span>
            <span className="text-[10px] text-purple-600 font-semibold">Carried Over</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">14 <span className="text-xs font-normal text-slate-400">/ 18 Days</span></p>
          <div className="w-full h-1 bg-purple-600 rounded-full mt-3"></div>
        </div>
      </div>

      {/* Main Grid: Form + Right Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">LEAVE APPLICATION FORM</h2>
          <p className="text-[10px] text-slate-400 mb-5">Fill in request details for review and attendance deduction</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option>Casual Leave (Personal / Family)</option>
                <option>Medical / Sick Leave</option>
                <option>Earned / Annual Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">From Date *</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">To Date *</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">Computed Duration:</span>
              <span className="font-bold text-slate-900">2 Working Days</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Justification *</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide context for manager review..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supporting Document (Optional for Sick Leave)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400 hover:bg-slate-50 cursor-pointer">
                Click to upload doctor prescription or certificate (PDF, PNG up to 5MB)
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setReason('')} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
                Clear
              </button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm">
                Submit Application
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Section */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase text-slate-700 mb-3">YOUR SUBMITTED LEAVES</h3>
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800">Casual Leave</span>
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold border border-amber-200">Pending</span>
                </div>
                <p className="text-[11px] text-slate-400">14 Sep 2026 - 15 Sep 2026 (2 Days)</p>
                <p className="text-[11px] text-slate-500 mt-1">Reason: Family function</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800">Sick Leave</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold border border-emerald-200">Approved</span>
                </div>
                <p className="text-[11px] text-slate-400">04 Sep 2026 (1 Day)</p>
                <p className="text-[11px] text-slate-500 mt-1">By Harsh Suri</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-xs">
            <h3 className="font-bold text-slate-700 mb-2">Attendance Policy Guidelines</h3>
            <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
              <li>Casual leaves are credited on the 1st of every quarter.</li>
              <li>Unused sick leaves carry over up to 14 days per calendar year.</li>
              <li>Weekend days are excluded from time-off deductions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}