import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { haryanaHolidays2026 } from '../data/haryanaHolidays2026';

function formatShiftTime(value) {
  if (!value) return '—';
  const [hour, minute] = value.split(':').map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function EmployeeDashboard({ onNavigate }) {
  const { currentUser, apiRequest } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [workDate, setWorkDate] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [attendanceData, leaveData, holidayData] = await Promise.all([apiRequest('/attendance'), apiRequest('/leaves'), apiRequest('/holidays')]);
      setAttendance(attendanceData.today || null); setWorkDate(attendanceData.workDate || ''); setLeaves(leaveData.requests || []);
      setSchedule({ start: attendanceData.shiftStartTime, end: attendanceData.shiftEndTime, workDays: attendanceData.workDays || [1, 2, 3, 4, 5], graceMinutes: attendanceData.graceMinutes, source: attendanceData.shiftSource || 'Assigned roster', timeZone: attendanceData.timeZone || 'Asia/Kolkata' });
      const today = attendanceData.workDate || new Date().toISOString().slice(0, 10);
      const dates = new Map(haryanaHolidays2026.map((holiday) => [`${holiday.name}-${holiday.date}`, holiday]));
      for (const holiday of holidayData.holidays || []) dates.set(`${holiday.name}-${holiday.date}`, holiday);
      setHolidays([...dates.values()].filter((holiday) => holiday.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [apiRequest]);
  useEffect(() => { load(); }, [load]);
  const pending = leaves.filter((leave) => leave.status === 'Pending').length;
  const status = !attendance ? 'Not checked in' : attendance.checkOutAt ? 'Shift completed' : 'Checked in';
  return <section className="employee-dashboard" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 18 }}>
    <header className="dashboard-hero"><p style={{ color: '#C7D2FE', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', margin: '0 0 7px' }}>Employee workspace</p><h1 style={{ color: '#FFFFFF', fontSize: 27, margin: 0 }}>Good to see you, {currentUser.name.split(' ')[0]}</h1><p style={{ color: '#E0E7FF', fontSize: 13, margin: '8px 0 0' }}>{currentUser.designation || 'Employee'}{currentUser.department ? ` · ${currentUser.department}` : ''} · {workDate || 'Today'}</p><div className="dashboard-hero-actions"><button onClick={() => onNavigate('attendance')}>Open attendance</button><button onClick={() => onNavigate('apply-leave')}>Request time off</button></div></header>
    {error && <p role="alert" style={{ margin: 0, padding: 12, color: '#9F1239', background: '#FFF1F2', borderRadius: 10 }}>{error}</p>}
    <div className="employee-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      <button className="surface-card dashboard-action-card employee-attendance-card" onClick={() => onNavigate('attendance')} style={{ textAlign: 'left', border: '1px solid #E2E8F0', borderRadius: 15, padding: 19, background: '#FFFFFF', cursor: 'pointer' }}><span style={{ color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Today’s attendance</span><strong style={{ display: 'block', marginTop: 11, color: '#0F172A', fontSize: 21 }}>{loading ? 'Loading…' : status}</strong><span style={{ display: 'block', marginTop: 8, color: '#4F46E5', fontSize: 12, fontWeight: 700 }}>{attendance?.checkInAt ? `Checked in at ${new Date(attendance.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Open attendance log →'}</span></button>
      <button className="surface-card dashboard-action-card" onClick={() => onNavigate('shifts')} style={{ textAlign: 'left', border: '1px solid #E2E8F0', borderRadius: 15, padding: 19, background: '#FFFFFF', cursor: 'pointer' }}><span style={{ color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Your assigned shift</span><strong style={{ display: 'block', marginTop: 11, color: '#0F172A', fontSize: 20 }}>{loading ? 'Loading…' : schedule ? `${formatShiftTime(schedule.start)} – ${formatShiftTime(schedule.end)}` : 'No schedule available'}</strong><span style={{ display: 'block', marginTop: 7, color: '#64748B', fontSize: 11 }}>{schedule?.source || 'Manager roster'} · {schedule?.graceMinutes ?? 15} min grace</span><span style={{ display: 'block', marginTop: 5, color: '#64748B', fontSize: 10 }}>Working days: {schedule?.workDays?.map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ') || 'Mon–Fri'}</span><span style={{ display: 'block', marginTop: 5, color: '#4F46E5', fontSize: 11, fontWeight: 700 }}>View schedule & attendance →</span></button>
      <button className="surface-card dashboard-action-card" onClick={() => onNavigate('apply-leave')} style={{ textAlign: 'left', border: '1px solid #E2E8F0', borderRadius: 15, padding: 19, background: '#FFFFFF', cursor: 'pointer' }}><span style={{ color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Pending leave requests</span><strong style={{ display: 'block', marginTop: 11, color: '#B45309', fontSize: 30 }}>{loading ? '—' : pending}</strong><span style={{ display: 'block', marginTop: 8, color: '#4F46E5', fontSize: 12, fontWeight: 700 }}>View request status →</span></button>
      <button className="surface-card dashboard-action-card" onClick={() => onNavigate('holiday-calendar')} style={{ textAlign: 'left', border: '1px solid #E2E8F0', borderRadius: 15, padding: 19, background: '#FFFFFF', cursor: 'pointer' }}><span style={{ color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>Next company holiday</span><strong style={{ display: 'block', marginTop: 11, color: '#0F172A', fontSize: 19 }}>{loading ? 'Loading…' : holidays[0]?.name || 'No upcoming dates'}</strong><span style={{ display: 'block', marginTop: 8, color: '#4F46E5', fontSize: 12, fontWeight: 700 }}>{holidays[0]?.date || 'Open calendar →'}</span></button>
    </div>
    <div className="surface-card" style={{ border: '1px solid #E2E8F0', borderRadius: 15, padding: 19, background: '#FFFFFF' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}><div><h2 style={{ margin: 0, fontSize: 16, color: '#0F172A' }}>Recent leave requests</h2><p style={{ color: '#94A3B8', fontSize: 11, marginTop: 4 }}>Follow each request from submission through approval</p></div><button onClick={() => onNavigate('apply-leave')} style={{ border: 0, background: '#EEF2FF', borderRadius: 8, padding: '8px 10px', color: '#4F46E5', fontWeight: 700, cursor: 'pointer' }}>Apply for leave</button></div>{loading ? <p style={{ color: '#64748B', padding: 10 }}>Loading…</p> : leaves.slice(0, 4).length === 0 ? <div className="dashboard-empty">You have no leave requests yet. Use Apply for leave when you need time off.</div> : leaves.slice(0, 4).map((leave) => <div key={leave._id} style={{ borderTop: '1px solid #F1F5F9', padding: '13px 2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, color: '#334155', fontSize: 13 }}><span><strong style={{ color: '#0F172A' }}>{leave.category}</strong><small style={{ display: 'block', marginTop: 4, color: '#64748B' }}>{leave.startDate} to {leave.endDate}</small></span><strong style={{ color: leave.status === 'Approved' ? '#15803D' : leave.status === 'Rejected' ? '#BE123C' : '#B45309', fontSize: 11, padding: '5px 9px', borderRadius: 99, background: leave.status === 'Approved' ? '#DCFCE7' : leave.status === 'Rejected' ? '#FFE4E6' : '#FEF3C7' }}>{leave.status}</strong></div>)}</div>
  </section>;
}
