import React from 'react';

export default function LeaveApplications({ onApplyClick }) {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Leave Applications</h1>
          <p className="text-xs text-slate-500 mt-0.5">Submit formal requests, view status approvals, and check deduction history.</p>
        </div>
        <button
          onClick={onApplyClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
        >
          <span>+</span> Apply for Leave
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>CASUAL LEAVES</span>
            <span className="text-[10px] text-indigo-600 font-semibold">Available</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">8 <span className="text-xs font-normal text-slate-400">/ 12 Total Quota</span></p>
          <p className="text-[10px] text-slate-400 mt-1">Deducted per working day</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>SICK LEAVES</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Available</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">5 <span className="text-xs font-normal text-slate-400">/ 7 Total Quota</span></p>
          <p className="text-[10px] text-slate-400 mt-1">Doctor note needed for &gt; 2 days</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>PENDING REQUESTS</span>
            <span className="text-[10px] text-amber-600 font-semibold">In Review</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">1 <span className="text-xs font-normal text-slate-400">Awaiting Approval</span></p>
          <p className="text-[10px] text-slate-400 mt-1">Average response: 24 hours</p>
        </div>
      </div>

      {/* Submitted Applications */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">SUBMITTED APPLICATIONS</h2>
            <p className="text-[10px] text-slate-400">Records of all requested and processed leaves</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
            <button className="px-2.5 py-0.5 rounded bg-white font-semibold text-slate-800 shadow-xs">All</button>
            <button className="px-2.5 py-0.5 rounded text-slate-500 hover:text-slate-800">Pending</button>
            <button className="px-2.5 py-0.5 rounded text-slate-500 hover:text-slate-800">Approved</button>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Leave Type</th>
              <th className="py-3 px-4">Dates</th>
              <th className="py-3 px-4">Days</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td className="py-3 px-4 flex items-center gap-2 font-medium">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">AS</span>
                Arpit Singla
              </td>
              <td className="py-3 px-4">Casual Leave</td>
              <td className="py-3 px-4">14 Sep 2026 - 15 Sep 2026</td>
              <td className="py-3 px-4">2 Days</td>
              <td className="py-3 px-4 text-slate-500">Personal family occasion</td>
              <td className="py-3 px-4">
                <span className="bg-amber-50 text-amber-600 font-semibold text-[10px] px-2 py-0.5 rounded-full border border-amber-200">
                  Pending
                </span>
              </td>
              <td className="py-3 px-4 text-right text-indigo-600 font-medium cursor-pointer hover:underline">Details</td>
            </tr>
            <tr>
              <td className="py-3 px-4 flex items-center gap-2 font-medium">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">RV</span>
                Rahul Verma
              </td>
              <td className="py-3 px-4">Sick Leave</td>
              <td className="py-3 px-4">04 Sep 2026</td>
              <td className="py-3 px-4">1 Day</td>
              <td className="py-3 px-4 text-slate-500">Viral fever & medication</td>
              <td className="py-3 px-4">
                <span className="bg-emerald-50 text-emerald-600 font-semibold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                  Approved
                </span>
              </td>
              <td className="py-3 px-4 text-right text-indigo-600 font-medium cursor-pointer hover:underline">Details</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}