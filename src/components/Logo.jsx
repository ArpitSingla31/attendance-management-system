import React from 'react';
import { BrandIcon } from './Icons';

export default function Logo({ isPro = false, subtitle = "Leave & Attendance System" }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
        flexShrink: 0
      }}>
        <BrandIcon size={20} color="#FFFFFF" />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px', letterSpacing: '-0.02em' }}>
            StaffSync
          </span>
          {isPro && (
            <span style={{ fontWeight: 800, color: '#4F46E5', fontSize: '15px', letterSpacing: '-0.02em' }}>
              Pro
            </span>
          )}
        </div>
        <p style={{ fontSize: '10px', color: '#64748B', margin: 0, fontWeight: 500, lineHeight: 1.1 }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}