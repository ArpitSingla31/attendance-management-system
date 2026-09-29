import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ProfileAvatar from './ProfileAvatar';
import { haryanaHolidays2026 } from '../data/haryanaHolidays2026';
import { useAttendanceStatus } from '../hooks/useAttendanceStatus';

export default function Header({ onNavigate, activeTab, isMobile, onToggleMenu }) {
  const { currentUser, apiRequest } = useAuth();
  const { now, timeZone, today, isReady: clockReady, status: punctuality, color: punctualityColor } = useAttendanceStatus();
  const isManager = currentUser?.role !== 'Employee';
  const isAdmin = ['Organization Admin', 'Application Admin'].includes(currentUser?.role);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsBusy, setNotificationsBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchItems, setSearchItems] = useState([]);
  const [clockBusy, setClockBusy] = useState(false);
  const [clockMessage, setClockMessage] = useState('');
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const punchAction = today?.checkInAt ? (today.checkOutAt ? null : 'check-out') : 'check-in';
  // The API records a punch for the signed-in account, so expose the shared
  // clock consistently across every authenticated role dashboard.
  const canUseClock = Boolean(currentUser);
  const togglePunch = async () => {
    if (!canUseClock || !clockReady || !punchAction || clockBusy) return;
    setClockBusy(true);
    setClockMessage('');
    try {
      await apiRequest(`/attendance/${punchAction}`, { method: 'POST', body: JSON.stringify({}) });
      setClockMessage(punchAction === 'check-in' ? 'Punch in recorded.' : 'Punch out recorded.');
      window.dispatchEvent(new Event('attendance-updated'));
    } catch (error) {
      setClockMessage(error.message || 'Could not record attendance.');
    } finally {
      setClockBusy(false);
      window.setTimeout(() => setClockMessage(''), 4000);
    }
  };

  const loadNotifications = useCallback(async () => {
    setNotificationsBusy(true);
    try {
    const [leaveResult, holidayResult] = await Promise.allSettled([apiRequest('/leaves'), apiRequest('/holidays')]);
    const items = [];
    if (leaveResult.status === 'fulfilled') {
      for (const request of leaveResult.value.requests || []) {
        if (currentUser?.role === 'Employee') {
          items.push({ id: request._id, title: `Leave ${request.status.toLowerCase()}`, detail: `${request.category} · ${request.startDate} – ${request.endDate}`, date: request.decisionAt || request.createdAt, tab: 'apply-leave', avatarUrl: request.employeeId?.avatarUrl, name: request.employeeId?.name });
        } else {
          const title = request.status === 'Pending' ? 'Leave request needs review' : `Leave request ${request.status.toLowerCase()}`;
          items.push({ id: request._id, title, detail: `${request.employeeId?.name || 'Employee'} · ${request.category}`, date: request.decisionAt || request.createdAt, tab: 'team-approvals', avatarUrl: request.employeeId?.avatarUrl, name: request.employeeId?.name });
        }
      }
    }
    if (holidayResult.status === 'fulfilled') {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: holidayResult.value.timeZone || 'Asia/Kolkata' });
      const byNameAndDate = new Map(haryanaHolidays2026.map((holiday) => [`${holiday.name}-${holiday.date}`, holiday]));
      for (const holiday of holidayResult.value.holidays || []) byNameAndDate.set(`${holiday.name}-${holiday.date}`, holiday);
      for (const holiday of [...byNameAndDate.values()].filter((entry) => entry.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)) {
        items.push({ id: `holiday-${holiday._id || holiday.date}`, title: `Upcoming holiday: ${holiday.name}`, detail: holiday.date, date: holiday.date, tab: 'holiday-calendar' });
      }
    }
    items.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    setNotifications(items);
    } finally { setNotificationsBusy(false); }
  }, [apiRequest, currentUser?.role]);

  const loadSearchItems = useCallback(async () => {
    if (searchLoaded || searchBusy) return;
    setSearchBusy(true);
    const elevated = ['Organization Admin', 'Application Admin'].includes(currentUser?.role);
    const [attendanceResult, leavesResult, holidaysResult, peopleResult] = await Promise.allSettled([
      apiRequest('/attendance'), apiRequest('/leaves'), apiRequest('/holidays'),
      elevated ? apiRequest('/admin/users') : currentUser?.role === 'Manager' ? apiRequest('/manager/team-shifts') : Promise.resolve({})
    ]);
    const entries = [
      { id: 'nav-dashboard', title: 'Dashboard', detail: 'Overview and daily activity', tab: elevated || currentUser?.role === 'Manager' ? 'manager-dashboard' : 'dashboard', type: 'Page' },
      { id: 'nav-attendance', title: 'Attendance', detail: 'Attendance log and shift records', tab: 'attendance', type: 'Page' },
      { id: 'nav-overtime', title: 'Overtime', detail: 'Completed shifts and time beyond schedule', tab: 'overtime', type: 'Page' },
      { id: 'nav-reports', title: 'Reports', detail: 'Download attendance records as CSV', tab: 'reports', type: 'Page' },
      { id: 'nav-leave', title: elevated || currentUser?.role === 'Manager' ? 'Team approvals' : 'My leave requests', detail: 'Leave requests and decisions', tab: elevated || currentUser?.role === 'Manager' ? 'team-approvals' : 'apply-leave', type: 'Page' },
      { id: 'nav-holidays', title: 'Holiday calendar', detail: 'Upcoming holidays', tab: 'holiday-calendar', type: 'Page' },
      { id: 'nav-profile', title: 'My profile', detail: 'Personal details and preferences', tab: 'profile', type: 'Page' },
      { id: 'nav-settings', title: 'Settings', detail: 'Role-specific account and workspace links', tab: 'settings', type: 'Page' },
    ];
    if (elevated) entries.push({ id: 'nav-access', title: 'Staff & access', detail: 'Roles, reporting managers, and employee access', tab: 'access-admin', type: 'Page' });
    const people = peopleResult.status === 'fulfilled' ? (peopleResult.value.users || peopleResult.value.employees || []) : [];
    people.forEach((person) => entries.push({ id: `person-${person._id || person.id}`, title: person.name || person.email || 'Staff member', detail: [person.designation, person.department, person.employeeCode].filter(Boolean).join(' · ') || person.email || 'Staff record', tab: elevated ? 'access-admin' : 'manager-dashboard', type: 'People', avatarUrl: person.avatarUrl, name: person.name }));
    if (attendanceResult.status === 'fulfilled') (attendanceResult.value.records || []).forEach((record) => {
      const person = record.employeeId || {};
      entries.push({ id: `attendance-${record._id}`, title: `${person.name || 'Attendance'} · ${record.workDate || ''}`, detail: [person.designation, record.punctualityStatus || record.status, record.checkInAt ? new Date(record.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''].filter(Boolean).join(' · '), tab: 'attendance', type: 'Attendance', avatarUrl: person.avatarUrl, name: person.name });
    });
    if (leavesResult.status === 'fulfilled') (leavesResult.value.requests || []).forEach((request) => {
      const person = request.employeeId || {};
      entries.push({ id: `leave-${request._id}`, title: `${person.name || 'Leave'} · ${request.category}`, detail: `${request.status} · ${request.startDate} – ${request.endDate}`, tab: currentUser?.role === 'Employee' ? 'apply-leave' : 'team-approvals', type: 'Leave', avatarUrl: person.avatarUrl, name: person.name });
    });
    if (holidaysResult.status === 'fulfilled') (holidaysResult.value.holidays || []).forEach((holiday) => entries.push({ id: `holiday-${holiday._id}`, title: holiday.name, detail: `${holiday.date} · Holiday`, tab: 'holiday-calendar', type: 'Holiday' }));
    setSearchItems(entries);
    setSearchLoaded(true);
    setSearchBusy(false);
  }, [apiRequest, currentUser?.role, searchBusy, searchLoaded]);

  const filteredSearchItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return [];
    return searchItems.filter((item) => `${item.title} ${item.detail} ${item.type}`.toLocaleLowerCase().includes(query)).slice(0, 8);
  }, [searchItems, searchQuery]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!notificationRef.current?.contains(event.target)) setNotificationsOpen(false);
      if (!searchRef.current?.contains(event.target)) setSearchOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { setNotificationsOpen(false); setSearchOpen(false); }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown); };
  }, []);

  useEffect(() => { setSearchLoaded(false); setSearchItems([]); }, [currentUser?.id, currentUser?.role]);

  useEffect(() => { if (notificationsOpen) loadNotifications(); }, [notificationsOpen, loadNotifications]);
  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  return (
    <header className="app-header" style={{
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 16px' : '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile Hamburger Toggle Button */}
        {isMobile && (
          <button
            type="button"
            onClick={onToggleMenu}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#334155'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}

        <Logo isPro={!isMobile} subtitle={isMobile ? '' : isManager ? "Engineering & Tech Ops" : (currentUser?.branch || "Panchkula Branch")} />
        
        {!isMobile && (
          <span style={{ fontSize: '10px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
            {activeTab === 'profile' ? 'Profile View' : isAdmin ? 'Admin Console' : isManager ? 'Manager Console' : 'Dashboard'}
          </span>
        )}
      </div>

      {/* Global Search (Hidden on Mobile) */}
      {!isMobile && (
        <div ref={searchRef} style={{ flex: 1, maxWidth: '420px', margin: '0 20px', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => { setSearchOpen(true); loadSearchItems(); }}
              onKeyDown={(event) => { if (event.key === 'Enter' && filteredSearchItems[0]) { onNavigate(filteredSearchItems[0].tab); setSearchOpen(false); } }}
              aria-label="Search app records"
              aria-expanded={searchOpen}
              aria-controls="global-search-results"
              placeholder={isManager ? "Search direct report, role, or log..." : "Search records, status, or session..."}
              className="app-search-input"
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
          {searchOpen && searchQuery.trim() && <div id="global-search-results" role="listbox" className="app-search-results">
            {searchBusy ? <p className="app-search-message">Searching your workspace…</p> : filteredSearchItems.length ? filteredSearchItems.map((item) => <button key={item.id} type="button" role="option" className="app-search-result" onClick={() => { onNavigate(item.tab); setSearchOpen(false); setSearchQuery(''); }}><span style={{ display: 'flex', minWidth: 0, alignItems: 'center', gap: 9 }}>{item.name && <ProfileAvatar person={item} size={30} />}<span className="app-search-result-copy"><strong>{item.title}</strong><small>{item.detail}</small></span></span><span className="app-search-type">{item.type}</span></button>) : <p className="app-search-message">No matching people, records, or pages.</p>}
          </div>}
        </div>
      )}

      {/* Right User Target */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '14px' }}>
        {!isMobile && (
          <button type="button" disabled={!canUseClock || !clockReady || !punchAction || clockBusy} onClick={togglePunch} title={clockMessage || (punchAction === 'check-in' ? 'Click to punch in' : punchAction === 'check-out' ? 'Click to punch out' : 'Today’s attendance is complete')} aria-label={`${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone })}. ${clockMessage || punctuality || 'Attendance status unavailable'}. ${punchAction === 'check-in' ? 'Click to punch in' : punchAction === 'check-out' ? 'Click to punch out' : 'Attendance complete'}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: '#475569', backgroundColor: '#F8FAFC', padding: '5px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', whiteSpace: 'nowrap', cursor: canUseClock && clockReady && punchAction && !clockBusy ? 'pointer' : 'default', opacity: clockBusy ? .65 : 1 }}>
            <span title={punctuality || 'Attendance status unavailable'} style={{ width: 8, height: 8, borderRadius: '50%', background: punctualityColor, flexShrink: 0 }} />
            <span>{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone })}</span>
          </button>
        )}

        {isMobile && <button type="button" disabled={!canUseClock || !clockReady || !punchAction || clockBusy} onClick={togglePunch} title={clockMessage || (punchAction === 'check-in' ? 'Tap to punch in' : punchAction === 'check-out' ? 'Tap to punch out' : 'Today’s attendance is complete')} aria-label={`${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone })}. ${clockMessage || punctuality || 'Attendance status unavailable'}. ${punchAction === 'check-in' ? 'Tap to punch in' : punchAction === 'check-out' ? 'Tap to punch out' : 'Attendance complete'}`} style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 58, justifyContent: 'center', height: 36, padding: '0 7px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155', fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', cursor: canUseClock && clockReady && punchAction && !clockBusy ? 'pointer' : 'default', opacity: clockBusy ? .65 : 1 }}><span style={{ width: 7, height: 7, flexShrink: 0, borderRadius: '50%', background: punctualityColor }} /><span>{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone })}</span></button>}
        <span aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>{clockMessage}</span>

        <div ref={notificationRef} style={{ position: 'relative' }}>
          <button type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)} style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 12, border: '1px solid #E2E8F0', background: notificationsOpen ? '#EEF2FF' : '#FFFFFF', color: '#475569', cursor: 'pointer', boxShadow: '0 2px 7px rgba(15,23,42,.05)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
            {notifications.length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, display: 'grid', placeItems: 'center', borderRadius: 99, background: '#E11D48', color: 'white', fontSize: 9, fontWeight: 800, padding: '0 4px' }}>{notifications.length > 99 ? '99+' : notifications.length}</span>}
          </button>
          {notificationsOpen && <div style={{ position: 'absolute', right: 0, top: 46, width: 'min(360px, calc(100vw - 24px))', maxHeight: 'min(70vh, 520px)', overflowY: 'auto', zIndex: 50, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, boxShadow: '0 16px 40px rgba(15,23,42,.18)' }}>
            <div style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}><strong style={{ color: '#0F172A', fontSize: 14 }}>Notifications</strong><button onClick={loadNotifications} disabled={notificationsBusy} style={{ border: 0, background: 'none', color: '#4F46E5', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{notificationsBusy ? 'Updating…' : 'Refresh'}</button></div>
            {notificationsBusy && notifications.length === 0 ? <p style={{ padding: 14, margin: 0, color: '#64748B', fontSize: 13 }}>Loading notifications…</p> : notifications.length === 0 ? <p style={{ padding: 14, margin: 0, color: '#64748B', fontSize: 13 }}>You’re all caught up. New leave activity and upcoming holidays will appear here.</p> : notifications.map((item) => <button key={item.id} onClick={() => { setNotificationsOpen(false); onNavigate(item.tab); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: '12px 15px', border: 0, borderBottom: '1px solid #F1F5F9', background: '#FFFFFF', cursor: 'pointer' }}>{item.name && <ProfileAvatar person={item} size={32} />}<span><strong style={{ display: 'block', color: '#0F172A', fontSize: 13 }}>{item.title}</strong><span style={{ display: 'block', marginTop: 4, color: '#64748B', fontSize: 12 }}>{item.detail}</span></span></button>)}
          </div>}
        </div>

        {/* User DP Avatar Target Button */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          title="Click to view & update profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '8px'
          }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: currentUser?.avatarBg === 'purple' ? '#FAF5FF' : '#EEF2FF',
            color: currentUser?.avatarBg === 'purple' ? '#7E22CE' : '#4F46E5',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #C7D2FE',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {currentUser?.avatarUrl ? <img src={currentUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (currentUser?.initials || currentUser?.name?.slice(0, 2).toUpperCase() || '?')}
          </div>
          {!isMobile && (
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B', margin: 0 }}>
                {currentUser?.name || 'Account'}
              </p>
              <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>
                {currentUser?.designation || currentUser?.role || ''}
              </p>
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
