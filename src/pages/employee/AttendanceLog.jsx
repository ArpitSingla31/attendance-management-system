import React from 'react';

export default function AttendanceLog() {
  const punches = [
    { date: '10 Sep 2026 (Today)', inTime: '09:30 AM', outTime: 'Active now', hours: 'In Session', overtime: '-', status: 'On Time', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { date: '09 Sep 2026', inTime: '09:12 AM', outTime: '06:22 PM', hours: '9h 10m', overtime: '+1h 10m', status: 'Present', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { date: '08 Sep 2026', inTime: '09:05 AM', outTime: '06:05 PM', hours: '9h 00m', overtime: '-', status: 'Present', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { date: '07 Sep 2026', inTime: '09:42 AM', outTime: '06:45 PM', hours: '9h 03m', overtime: '-', status: 'Late Punch', badge: 'bg-rose-50 text-rose-600 border-rose-200' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track shift hours, punch timeline, biometric verification, and late flags.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-medium shadow-xs">
            September 2026
          </span>
          <button className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 shadow-xs">
            <span>📥</span> Export Log (CSV)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Working Days</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">22 <span className="text-xs font-normal text-slate-400">Days Logged</span></p>
          <p className="text-[11px] text-slate-400 mt-1">100% On-schedule</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>On-Time Check-In</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">21 <span className="text-xs font-normal text-slate-400">/ 22 Days</span></p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">95.4% Punctuality</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Late Punch</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">1 <span className="text-xs font-normal text-slate-400">Grace Used</span></p>
          <p className="text-[11px] text-rose-500 font-medium mt-1">12 mins past cutoff</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Avg. Working Hours</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">8h 52m <span className="text-xs font-normal text-slate-400">/ Day</span></p>
          <p className="text-[11px] text-slate-400 mt-1">Normal bandwidth</p>
        </div>
      </div>

      {/* Daily Punch Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">DAILY PUNCH TIMELINE</h2>
          <span className="text-[10px] text-slate-400">Showing September records</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Punch In</th>
              <th className="py-3 px-4">Punch Out</th>
              <th className="py-3 px-4">Total Hours</th>
              <th className="py-3 px-4">Overtime</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {punches.map((p, idx) => (
              <tr key={idx}>
                <td className="py-3 px-4 font-medium">{p.date}</td>
                <td className="py-3 px-4 font-semibold text-emerald-600">{p.inTime}</td>
                <td className="py-3 px-4">{p.outTime}</td>
                <td className="py-3 px-4">{p.hours}</td>
                <td className="py-3 px-4 text-slate-500">{p.overtime}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${p.badge}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}