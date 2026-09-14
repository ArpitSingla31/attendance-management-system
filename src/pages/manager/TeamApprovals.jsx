import React, { useState } from 'react';

export default function TeamApprovals() {
  const [items, setItems] = useState([
    { id: 1, name: 'Arpit Singla', role: 'Software Engineer', initials: 'AS', cat: 'Casual Leave', dates: '14 Sep - 15 Sep 2026', days: '2 Days', quota: '8 / 12 Days', reason: 'Family function ceremony', status: 'Pending' },
    { id: 2, name: 'Nitin Kumar', role: 'Frontend Developer', initials: 'NK', cat: 'Sick Leave', dates: '11 Sep 2026', days: '1 Day', quota: '5 / 7 Days', reason: 'Fever & doctor consult', status: 'Pending' },
    { id: 3, name: 'Rahul Verma', role: 'Backend Engineer', initials: 'RV', cat: 'Sick Leave', dates: '04 Sep 2026', days: '1 Day', quota: '6 / 7 Days', reason: 'Doctor appointment', status: 'Approved' },
    { id: 4, name: 'Priya Sharma', role: 'UI/UX Designer', initials: 'PS', cat: 'Casual Leave', dates: '01 Sep - 03 Sep 2026', days: '3 Days', quota: '10 / 12 Days', reason: 'Personal road trip', status: 'Rejected' },
  ]);

  const approve = (id) => setItems(items.map(i => i.id === id ? { ...i, status: 'Approved' } : i));
  const reject = (id) => setItems(items.map(i => i.id === id ? { ...i, status: 'Rejected' } : i));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Team Leave Requests & Approvals</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review employee leave justifications, quota balances, and authorize requests.</p>
        </div>
        <button
          onClick={() => setItems(items.map(i => ({ ...i, status: 'Approved' })))}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
        >
          ✓ Approve All Pending
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Pending Decisions</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">2 <span className="text-xs font-normal text-slate-400">Applications</span></p>
          <p className="text-[11px] text-amber-600 mt-1">Requires your review</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Approved This Month</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">12 <span className="text-xs font-normal text-slate-400">Requests</span></p>
          <p className="text-[11px] text-slate-400 mt-1">Synced with payroll</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Team Floor Impact</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">94.2% <span className="text-xs font-normal text-slate-400">Capacity</span></p>
          <p className="text-[11px] text-emerald-600 mt-1">Within healthy band</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Avg. Turnaround</span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">4.2h <span className="text-xs font-normal text-slate-400">Avg Response</span></p>
          <p className="text-[11px] text-slate-400 mt-1">Faster than 24h SLA</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
            <button className="px-2.5 py-0.5 rounded bg-white font-semibold text-slate-800 shadow-xs">All (4)</button>
            <button className="px-2.5 py-0.5 rounded text-slate-500 hover:text-slate-800">Pending (2)</button>
            <button className="px-2.5 py-0.5 rounded text-slate-500 hover:text-slate-800">Approved (1)</button>
            <button className="px-2.5 py-0.5 rounded text-slate-500 hover:text-slate-800">Rejected (1)</button>
          </div>
          <span className="text-xs text-slate-400">Department: Engineering (September 2026)</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Leave Category</th>
              <th className="py-3 px-4">Requested Dates</th>
              <th className="py-3 px-4">Days</th>
              <th className="py-3 px-4">Quota Remaining</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action / Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {items.map((i) => (
              <tr key={i.id}>
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                    {i.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{i.name}</p>
                    <p className="text-[10px] text-slate-400">{i.role}</p>
                  </div>
                </td>
                <td className="py-3 px-4">{i.cat}</td>
                <td className="py-3 px-4">{i.dates}</td>
                <td className="py-3 px-4">{i.days}</td>
                <td className="py-3 px-4 text-slate-500">{i.quota}</td>
                <td className="py-3 px-4 text-slate-500">{i.reason}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    i.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    i.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                    'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {i.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-1.5">
                  {i.status === 'Pending' ? (
                    <>
                      <button onClick={() => reject(i.id)} className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-xs font-semibold">
                        Reject
                      </button>
                      <button onClick={() => approve(i.id)} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold">
                        Approve
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400">Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}