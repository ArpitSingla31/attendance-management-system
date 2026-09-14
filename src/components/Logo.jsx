import React from 'react';
import { BrandIcon } from './Icons';

export default function Logo({ isPro = false, subtitle = "Leave & Attendance System" }) {
  return (
    <div className="flex items-center gap-3">
      {/* Exact rounded gradient purple-blue square */}
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm shrink-0">
        <BrandIcon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-slate-900 text-sm tracking-tight">
            StaffSync
          </span>
          {isPro && (
            <span className="font-extrabold text-indigo-600 text-sm tracking-tight">
              Pro
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 leading-tight font-medium">{subtitle}</p>
      </div>
    </div>
  );
}