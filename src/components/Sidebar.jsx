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
  const isManager = currentUser?.role !== 'Employee';
  const isAdmin = ['Organization Admin', 'Application Admin'].includes(currentUser?.role);

  const btnStyle = (isActive) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    minHeight: '38px',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#4F46E5' : '#475569',
    background: isActive ? 'linear-gradient(100deg, #EEF2FF 0%, #F5F7FF 100%)' : 'transparent',
    border: isActive ? '1px solid #DDE3FF' : '1px solid transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease'
  });

  return (
    <aside className="app-sidebar" style={{
      width: '252px',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFF 100%)',
      borderRight: '1px solid #E2E8F0',
      padding: '18px 14px 14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexShrink: 0,
      height: '100%',
      minHeight: 'calc(100vh - 64px)',
      boxSizing: 'border-box'
    }}>
      <div className="sidebar-scroll-area">
        <p className="sidebar-section-heading">
          {isManager ? `${currentUser?.role?.toUpperCase()} PORTAL` : 'MAIN NAVIGATION'}
        </p>

        {!isManager ? (
          <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <button onClick={() => setCurrentTab('dashboard')} style={btnStyle(currentTab === 'dashboard')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DashboardIcon size={18} color={currentTab === 'dashboard' ? '#4F46E5' : '#64748B'} />
                <span>Dashboard Overview</span>
              </div>
            </button>

            <button onClick={() => setCurrentTab('attendance')} style={btnStyle(currentTab === 'attendance')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ClockIcon size={18} color={currentTab === 'attendance' ? '#4F46E5' : '#64748B'} />
                <span>Attendance &amp; Schedule</span>
              </div>
            </button>

            <button onClick={() => setCurrentTab('overtime')} style={btnStyle(currentTab === 'overtime')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ClockIcon size={18} color={currentTab === 'overtime' ? '#4F46E5' : '#64748B'} /><span>Overtime</span></div>
            </button>

            <button onClick={() => setCurrentTab('reports')} style={btnStyle(currentTab === 'reports')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><DashboardIcon size={18} color={currentTab === 'reports' ? '#4F46E5' : '#64748B'} /><span>Reports</span></div>
            </button>

            <button onClick={() => setCurrentTab('apply-leave')} style={btnStyle(currentTab === 'apply-leave' || currentTab === 'leaves')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ClipboardIcon size={18} color={(currentTab === 'apply-leave' || currentTab === 'leaves') ? '#4F46E5' : '#64748B'} />
                <span>Apply for Leave</span>
              </div>
            </button>

            <button onClick={() => setCurrentTab('holiday-calendar')} style={btnStyle(currentTab === 'holiday-calendar')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ClipboardIcon size={18} color={currentTab === 'holiday-calendar' ? '#4F46E5' : '#64748B'} /><span>Holiday Calendar</span></div>
            </button>

            <button onClick={() => setCurrentTab('settings')} style={btnStyle(currentTab === 'settings')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserIcon size={18} color={currentTab === 'settings' ? '#4F46E5' : '#64748B'} />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        ) : (
          <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <button onClick={() => setCurrentTab('manager-dashboard')} style={btnStyle(currentTab === 'manager-dashboard')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DashboardIcon size={18} color={currentTab === 'manager-dashboard' ? '#4F46E5' : '#64748B'} />
                <span>{isAdmin ? 'Admin Dashboard' : 'Manager Dashboard'}</span>
              </div>
            </button>

            <button onClick={() => setCurrentTab('team-approvals')} style={btnStyle(currentTab === 'team-approvals')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckSquareIcon size={18} color={currentTab === 'team-approvals' ? '#4F46E5' : '#64748B'} />
                <span>Team Approvals</span>
              </div>
            </button>

            <button onClick={() => setCurrentTab('attendance')} style={btnStyle(currentTab === 'attendance')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ClockIcon size={18} color={currentTab === 'attendance' ? '#4F46E5' : '#64748B'} /><span>Attendance</span></div>
            </button>

            {currentUser?.role === 'Manager' && <button onClick={() => setCurrentTab('shifts')} style={btnStyle(currentTab === 'shifts')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ClockIcon size={18} color={currentTab === 'shifts' ? '#4F46E5' : '#64748B'} /><span>Team &amp; Shift Roster</span></div>
            </button>}

            {isAdmin && <button onClick={() => setCurrentTab('access-admin')} style={btnStyle(currentTab === 'access-admin')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UsersIcon size={18} color={currentTab === 'access-admin' ? '#4F46E5' : '#64748B'} />
                <span>Staff &amp; access</span>
              </div>
            </button>}

            <button onClick={() => setCurrentTab('overtime')} style={btnStyle(currentTab === 'overtime')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ClockIcon size={18} color={currentTab === 'overtime' ? '#4F46E5' : '#64748B'} /><span>Overtime</span></div>
            </button>

            <button onClick={() => setCurrentTab('reports')} style={btnStyle(currentTab === 'reports')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><DashboardIcon size={18} color={currentTab === 'reports' ? '#4F46E5' : '#64748B'} /><span>Reports</span></div>
            </button>

            <button onClick={() => setCurrentTab('holiday-calendar')} style={btnStyle(currentTab === 'holiday-calendar')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ClipboardIcon size={18} color={currentTab === 'holiday-calendar' ? '#4F46E5' : '#64748B'} /><span>Holiday Calendar</span></div>
            </button>

            <button onClick={() => setCurrentTab('settings')} style={btnStyle(currentTab === 'settings')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserIcon size={18} color={currentTab === 'settings' ? '#4F46E5' : '#64748B'} />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        )}

      </div>

      <div className="sidebar-footer">
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#E11D48',
            backgroundColor: '#FFF1F2',
            border: '1px solid #FFE4E6',
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
