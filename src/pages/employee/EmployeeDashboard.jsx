import React from 'react';

export default function EmployeeDashboard({ onApplyLeave }) {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Overview Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time attendance summaries, shift punch metrics, and active leaves.</p>
        </div>
        <button
          onClick={onApplyLeave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
        >
          <span>+</span> Apply for Leave
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Present Today</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">118 <span className="text-xs font-normal text-slate-400">/ 120 Total</span></p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">98.3% Attendance rate</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>On Leave</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">2 <span className="text-xs font-normal text-slate-400">Employees</span></p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">1 Planned • 1 Sick Leave</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Late Arrivals</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">1 <span className="text-xs font-normal text-slate-400">Flagged</span></p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Punch after 09:30 AM</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Avg. Check-In</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">09:12 AM</p>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">On-time streak active</p>
        </div>
      </div>

      {/* Leave Applications Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">LEAVE APPLICATIONS</h2>
            <p className="text-[10px] text-slate-400">Showing recent requests and status records</p>
          </div>
          <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-slate-600 font-medium">
            Sorted by Date
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Date Range</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">AS</span>
                  <span>Arpit Singla</span>
                </td>
                <td className="py-3 px-4">Casual Leave</td>
                <td className="py-3 px-4">14 Sep 2026 - 15 Sep 2026</td>
                <td className="py-3 px-4">2 Days</td>
                <td className="py-3 px-4">
                  <span className="bg-amber-50 text-amber-600 font-semibold text-[10px] px-2 py-0.5 rounded-full border border-amber-200">
                    Pending
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-indigo-600 font-medium cursor-pointer hover:underline">Details</td>
              </tr>
              <tr>
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">RV</span>
                  <span>Rahul Verma</span>
                </td>
                <td className="py-3 px-4">Sick Leave</td>
                <td className="py-3 px-4">08 Sep 2026</td>
                <td className="py-3 px-4">1 Day</td>
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
    </div>
  );
}