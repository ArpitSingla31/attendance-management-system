import React, { useState } from 'react';

export default function ManagerDashboard({ onReviewRequests }) {
  const [requests, setRequests] = useState([
    { id: 1, name: 'Arpit Singla', role: 'Software Engineer', type: 'Casual Leave', range: '14 Sep 2026 - 15 Sep 2026', days: '2 Days', reason: 'Family function ceremony', initials: 'AS' },
    { id: 2, name: 'Priya Sharma', role: 'UI/UX Designer', type: 'Earned Leave', range: '18 Sep 2026 - 22 Sep 2026', days: '5 Days', reason: 'Planned vacation / travel', initials: 'PS' }
  ]);

  const handleDecision = (id) => setRequests(requests.filter(r => r.id !== id));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Department Workforce Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time attendance stats, live roster status, and pending manager approvals.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-medium">
            Department: Engineering
          </span>
          <button
            onClick={onReviewRequests}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
          >
            Review Requests ({requests.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Total Supervised</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">48 <span className="text-xs font-normal text-slate-400">Direct Staff</span></p>
          <p className="text-[11px] text-slate-400 mt-1">4 Active Squads</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Checked-In Today</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">45 <span className="text-xs font-normal text-slate-400">/ 48 Present</span></p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">93.7% Floor Coverage</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Scheduled Time-Off</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">3 <span className="text-xs font-normal text-slate-400">On Leave</span></p>
          <p className="text-[11px] text-amber-600 mt-1">2 Casual • 1 Medical</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Late Punch Alerts</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">2 <span className="text-xs font-normal text-slate-400">Flagged</span></p>
          <p className="text-[11px] text-rose-500 mt-1">Passed grace limit</p>
        </div>
      </div>

      {/* Priority Approval Queue */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">PRIORITY APPROVAL QUEUE</h2>
            <p className="text-[10px] text-slate-400">Pending employee leave applications awaiting your decision</p>
          </div>
          <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200">
            {requests.length} Pending Action
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Leave Type</th>
              <th className="py-3 px-4">Date Range</th>
              <th className="py-3 px-4">Days</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4 text-right">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                    {r.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{r.name}</p>
                    <p className="text-[10px] text-slate-400">{r.role}</p>
                  </div>
                </td>
                <td className="py-3 px-4">{r.type}</td>
                <td className="py-3 px-4">{r.range}</td>
                <td className="py-3 px-4">{r.days}</td>
                <td className="py-3 px-4 text-slate-500">{r.reason}</td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button onClick={() => handleDecision(r.id)} className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded font-medium">
                    Reject
                  </button>
                  <button onClick={() => handleDecision(r.id)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium">
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}