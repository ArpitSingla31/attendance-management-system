import React from 'react';

export default function EmployeeAdmin({ onAddEmployee }) {
  const staff = [
    { name: 'Arpit Singla', email: 'arpit.singla@company.com', id: 'EMP-1042', dept: 'Engineering', role: 'Software Engineer', shift: '09:00 - 18:00', status: 'Active', initials: 'AS' },
    { name: 'Priya Sharma', email: 'priya.sharma@company.com', id: 'EMP-1038', dept: 'Product Design', role: 'UI/UX Designer', shift: '09:00 - 18:00', status: 'On Leave', initials: 'PS' },
    { name: 'Nitin Kumar', email: 'nitin.k@company.com', id: 'EMP-1051', dept: 'Engineering', role: 'Frontend Developer', shift: '09:00 - 18:00', status: 'Active', initials: 'NK' },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff & Employee Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage personnel records, department mappings, roles, and status flags.</p>
        </div>
        <button
          onClick={onAddEmployee}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
        >
          <span>+</span> Add New Employee
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase text-slate-700">ALL ACTIVE PERSONNEL</h2>
          <span className="text-xs text-slate-400">Total: 48 Team Members</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Employee ID</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Shift Model</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {staff.map((s, idx) => (
              <tr key={idx}>
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                    {s.initials}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4 font-medium text-slate-500">{s.id}</td>
                <td className="py-3 px-4">{s.dept}</td>
                <td className="py-3 px-4">{s.role}</td>
                <td className="py-3 px-4 text-slate-500">{s.shift}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    s.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-indigo-600 font-medium cursor-pointer hover:underline">
                  Edit Log
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}