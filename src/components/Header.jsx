import React from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Header({ onNavigate, activeTab }) {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'Manager';

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '280px' }}>
        <Logo isPro={true} subtitle={isManager ? "Engineering & Tech Ops" : (currentUser?.branch || "Panchkula Branch")} />
        <span style={{ fontSize: '10px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
          {activeTab === 'profile' ? 'Profile View' : isManager ? 'Manager Console' : 'Dashboard'}
        </span>
      </div>

      {/* Global Search */}
      <div style={{ flex: 1, maxWidth: '440px', margin: '0 24px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '12px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            placeholder={isManager ? "Search direct report, role, or log..." : "Search records, status, or session..."}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px 12px 8px 34px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#0F172A',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Right User Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: '#475569', backgroundColor: '#F8FAFC', padding: '5px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
          <span>09:30 AM</span>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            {isManager ? 'Live Team Roster' : 'In Office'}
          </span>
        </div>

        {!isManager && (
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #A7F3D0',
            backgroundColor: '#ECFDF5',
            color: '#047857',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            <span>🕒</span> Clock In
          </button>
        )}

        {/* Clickable Profile DP Avatar Target */}
        <button
          onClick={() => onNavigate('profile')}
          title="Click to view & update profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px'
          }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: currentUser?.avatarBg?.includes('purple') ? '#FAF5FF' : '#EEF2FF',
            color: currentUser?.avatarBg?.includes('purple') ? '#7E22CE' : '#4F46E5',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #C7D2FE'
          }}>
            {currentUser?.initials || 'AS'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B', margin: 0 }}>
              {currentUser?.name || 'Arpit Singla'}
            </p>
            <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>
              {currentUser?.designation || 'Software Engineer'}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}