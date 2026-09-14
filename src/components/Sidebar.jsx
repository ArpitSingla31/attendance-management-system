import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DashboardIcon,
  ClockIcon,
  ClipboardIcon,
  UserIcon,
  CheckSquareIcon,
  UsersIcon,
  LogoutIcon
} from './Icons';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const { currentUser, logout } = useAuth();
  const isManager = currentUser?.role === 'Manager';

  const btnStyle = (isActive) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#4F46E5' : '#475569',
    backgroundColor: isActive ? '#EEF2FF' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease'
  });

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexShrink: 0,
      height: '100%',
      minHeight: 'calc(100vh - 64px)',
      boxSizing: 'border-box'
    }}>
      <div>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '10px', padding: '0 8px' }}>
          {isManager ? 'MANAGEMENT PORTAL' : 'MAIN NAVIGATION'}
        </p>

        {!isManager ? (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button onClick={() => setCurrentTab('dashboard')} style={btnStyle(currentTab === 'dashboard')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DashboardIcon size={18} color={currentTab === 'dashboard' ? '#4F46E5' : '#64748B'} />
                <span>Dashboard Overview</span>
              </div>
            </button>

            <button onClick={() => setCurrentTab('attendance')} style={btnStyle(currentTab === 'attendance')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ClockIcon size={18} color={currentTab === 'attendance' ? '#4F46E5' : '#64748B'} />
                <span>Attendance Log</span>
              </div>
              <span style={{ fontSize: '10px', backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                Daily
              </span>
            </button>

            <button onClick={() => setCurrentTab('apply-leave')} style={btnStyle(currentTab === 'apply-leave' || currentTab === 'leaves')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ClipboardIcon size={18} color={(currentTab === 'apply-leave' || currentTab === 'leaves') ? '#4F46E5' : '#64748B'} />
                <span>Apply for Leave</span>
              </div>
              <span style={{ fontSize: '10px', backgroundColor: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                New
              </span>
            </button>

            <button onClick={() => setCurrentTab('profile')} style={btnStyle(currentTab === 'profile')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserIcon size={18} color={currentTab === 'profile' ? '#4F46E5' : '#64748B'} />
                <span>My Profile</span>
              </div>
            </button>
          </nav>
        ) : (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button onClick={() => setCurrentTab('manager-dashboard')} style={btnStyle(currentTab === 'manager-dashboard')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DashboardIcon size={18} color={currentTab === 'manager-dashboard' ? '#4F46E5' : '#64748B'} />
                <span>Manager Dashboard</span>
              </div>
              <span style={{ fontSize: '10px', backgroundColor: '#EEF2FF', color: '#4F46E5', padding: '2px 6px', borderRadius: '4px' }}>
                Live
              </span>
            </button>

            <button onClick={() => setCurrentTab('team-approvals')} style={btnStyle(currentTab === 'team-approvals')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckSquareIcon size={18} color={currentTab === 'team-approvals' ? '#4F46E5' : '#64748B'} />
                <span>Team Approvals</span>
              </div>
              <span style={{ fontSize: '10px', backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                2 New
              </span>
            </button>

            <button onClick={() => setCurrentTab('employee-admin')} style={btnStyle(currentTab === 'employee-admin')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UsersIcon size={18} color={currentTab === 'employee-admin' ? '#4F46E5' : '#64748B'} />
                <span>Employee Admin</span>
              </div>
              <span style={{ fontSize: '10px', backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                48 Active
              </span>
            </button>

            <button onClick={() => setCurrentTab('profile')} style={btnStyle(currentTab === 'profile')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserIcon size={18} color={currentTab === 'profile' ? '#4F46E5' : '#64748B'} />
                <span>My Profile</span>
              </div>
            </button>
          </nav>
        )}

        {/* Dynamic Approval Route Card */}
        {!isManager && (currentTab === 'apply-leave' || currentTab === 'leaves') && (
          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
              APPROVAL ROUTE
            </p>
            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FAF5FF', color: '#7E22CE', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  HS
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', margin: 0 }}>Harsh Suri</p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', margin: '2px 0 0 0' }}>Reporting Director</p>
                </div>
              </div>
              <p style={{ fontSize: '10px', color: '#94A3B8', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                Standard turnaround: Within 24 hours
              </p>
            </div>
          </div>
        )}

        {/* Quota Balances */}
        {!isManager && currentTab !== 'apply-leave' && currentTab !== 'leaves' && (
          <div style={{ marginTop: '32px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>
              AVAILABLE QUOTA
            </p>
            <div style={{ padding: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Casual Leave</span>
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>8 / 12 Days</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '66%', height: '100%', backgroundColor: '#4F46E5', borderRadius: '9999px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Sick Leave</span>
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>5 / 7 Days</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '71%', height: '100%', backgroundColor: '#10B981', borderRadius: '9999px' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ paddingTop: '16px' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#E11D48',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <LogoutIcon size={16} color="#E11D48" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}