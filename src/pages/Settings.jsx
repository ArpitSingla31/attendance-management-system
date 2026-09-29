import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings({ onNavigate }) {
  const { currentUser } = useAuth();
  const isEmployee = currentUser?.role === 'Employee';
  const isAdmin = ['Organization Admin', 'Application Admin'].includes(currentUser?.role);
  const options = [
    { title: 'Account profile', detail: 'Update your name, contact details, and profile photo.', tab: 'profile', icon: '◎', tone: 'violet' },
    ...(isEmployee ? [
      { title: 'My schedule', detail: 'View your assigned shift and attendance status.', tab: 'shifts', icon: '◷', tone: 'blue' },
      { title: 'My leave requests', detail: 'Apply for time off and track request decisions.', tab: 'apply-leave', icon: '▤', tone: 'amber' },
    ] : []),
    ...(currentUser?.role === 'Manager' ? [
      { title: 'Shifts & rosters', detail: 'Set team shift windows and individual schedules.', tab: 'shifts', icon: '◷', tone: 'blue' },
      { title: 'Team approvals', detail: 'Review leave requests assigned to you.', tab: 'team-approvals', icon: '✓', tone: 'amber' },
    ] : []),
    ...(isAdmin ? [
      { title: 'Staff & access', detail: 'Assign roles, reporting managers, and employee details.', tab: 'access-admin', icon: '♧', tone: 'teal' },
      { title: 'Approvals', detail: 'Review organization leave requests.', tab: 'team-approvals', icon: '✓', tone: 'amber' },
    ] : []),
    { title: 'Attendance reports', detail: 'Review attendance history and download a CSV report.', tab: 'reports', icon: '▥', tone: 'green' },
    { title: 'Holiday calendar', detail: 'See upcoming organization holidays.', tab: 'holiday-calendar', icon: '▦', tone: 'orange' },
  ];

  return <section style={{ width: '100%', maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 18 }}>
    <header className="dashboard-hero"><p style={{ color: '#C7D2FE', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', margin: '0 0 7px' }}>Workspace preferences</p><h1 style={{ color: '#FFFFFF', fontSize: 27, margin: 0 }}>Settings</h1><p style={{ color: '#E0E7FF', fontSize: 13, lineHeight: 1.6, margin: '8px 0 0', maxWidth: 650 }}>Quick access to the account and attendance settings available for your {currentUser?.role?.toLowerCase() || 'staff'} role.</p></header>
    <div className="settings-grid">{options.map((option) => <button type="button" key={option.title} className="settings-card surface-card" onClick={() => onNavigate(option.tab)}><span className={`settings-icon settings-icon-${option.tone}`}>{option.icon}</span><span className="settings-card-copy"><strong>{option.title}</strong><small>{option.detail}</small></span></button>)}</div>
    <p style={{ margin: 0, color: '#94A3B8', fontSize: 11 }}>{currentUser?.role === 'Manager' ? 'You manage your team’s shift timings. Organization administrators manage account roles and reporting lines.' : isAdmin ? 'Managers control team shift timings. Use Staff & Access to assign user roles and reporting managers.' : 'Your assigned manager controls shift timings and handles leave approvals.'}</p>
  </section>;
}
