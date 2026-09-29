import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';
import { haryanaHolidays2026 } from '../data/haryanaHolidays2026';

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function rosterDayForTime(now, timeZone, startTime, endTime) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  let date = `${values.year}-${values.month}-${values.day}`;
  let weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const [hour, minute] = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now).split(':').map(Number);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  if (endHour * 60 + endMinute <= startHour * 60 + startMinute && hour * 60 + minute <= endHour * 60 + endMinute) {
    const previous = new Date(`${date}T00:00:00Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    date = previous.toISOString().slice(0, 10);
    weekday = (weekday + 6) % 7;
  }
  return { date, weekday };
}

function timestamp(value, timeZone) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(new Date(value));
}
function duration(start, end) {
  if (!start || !end) return 'In progress';
  const minutes = Math.max(0, Math.floor((new Date(end) - new Date(start)) / 60000));
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
function overtimeMinutes(record) {
  if (!record.checkInAt || !record.checkOutAt || !record.scheduledStartTime || !record.scheduledEndTime) return 0;
  const minutes = (value) => { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute; };
  const planned = (minutes(record.scheduledEndTime) - minutes(record.scheduledStartTime) + 1440) % 1440;
  const actual = Math.max(0, Math.floor((new Date(record.checkOutAt) - new Date(record.checkInAt)) / 60000));
  return Math.max(0, actual - planned);
}
function durationLabel(minutes) { return `${Math.floor(minutes / 60)}h ${minutes % 60}m`; }
function statusAtTime(date, timeZone, shiftStartTime, shiftEndTime, graceMinutes) {
  const clock = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  const [hour, minute] = clock.split(':').map(Number);
  const [startHour, startMinute] = shiftStartTime.split(':').map(Number);
  const [endHour, endMinute] = shiftEndTime.split(':').map(Number);
  const current = hour * 60 + minute;
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const overnight = end <= start;
  if (!overnight) {
    if (current < start) return 'Before shift';
    if (current >= end) return 'After shift';
  } else if (current > end && current < start) return 'Before shift';
  let elapsed;
  if (overnight) elapsed = current >= start ? current - start : 1440 - start + current;
  else elapsed = current - start;
  if (elapsed <= 0) return 'On time';
  if (elapsed <= graceMinutes) return 'Slightly late';
  return 'Late';
}

export default function AttendanceCenter({ mode = 'attendance' }) {
  const { currentUser, apiRequest } = useAuth();
  const [records, setRecords] = useState([]);
  const [today, setToday] = useState(null);
  const [activePunch, setActivePunch] = useState(null);
  const [holidays, setHolidays] = useState(haryanaHolidays2026);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  const [shiftStartTime, setShiftStartTime] = useState('09:30');
  const [shiftEndTime, setShiftEndTime] = useState('18:00');
  const [workDays, setWorkDays] = useState([1, 2, 3, 4, 5]);
  const [shiftSource, setShiftSource] = useState('Organization default');
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(() => new Date());
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [data, holidayResult, leaveResult] = await Promise.all([
        apiRequest('/attendance'), apiRequest('/holidays'), apiRequest('/leaves')
      ]);
      setRecords(data.records || []); setToday(data.today || null); setActivePunch(data.active || null); setWorkDate(data.workDate || ''); setSelectedDate((current) => current || data.workDate || dateKey(new Date())); setTimeZone(data.timeZone || 'Asia/Kolkata'); setShiftStartTime(data.shiftStartTime || '09:30'); setShiftEndTime(data.shiftEndTime || '18:00'); setWorkDays(data.workDays || [1, 2, 3, 4, 5]); setGraceMinutes(data.graceMinutes ?? 15); setShiftSource(data.shiftSource || 'Organization default');
      const holidayMap = new Map(haryanaHolidays2026.map((holiday) => [`${holiday.name}-${holiday.date}`, holiday]));
      for (const holiday of holidayResult.holidays || []) holidayMap.set(`${holiday.name}-${holiday.date}`, holiday);
      setHolidays([...holidayMap.values()]); setLeaveRequests(leaveResult.requests || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [apiRequest]);
  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener('attendance-updated', refresh);
    return () => window.removeEventListener('attendance-updated', refresh);
  }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function mark(action) {
    setBusy(true); setError(''); setNotice('');
    try {
      await apiRequest(`/attendance/${action}`, { method: 'POST', body: JSON.stringify({}) });
      setNotice(action === 'check-in' ? 'Check-in recorded.' : 'Check-out recorded.');
      window.dispatchEvent(new Event('attendance-updated'));
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  const heading = mode === 'overtime' ? 'Overtime summary' : mode === 'reports' ? 'Attendance reports' : currentUser.role === 'Employee' ? 'My attendance' : 'Team attendance';
  const visibleRecords = mode === 'overtime' ? records.filter((record) => overtimeMinutes(record) > 0) : records;
  const totalOvertime = visibleRecords.reduce((total, record) => total + overtimeMinutes(record), 0);
  const isEmployeeCalendar = currentUser.role === 'Employee' && mode === 'attendance';
  const currentDateKey = workDate || dateKey(new Date());
  const calendarStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const calendarOffset = calendarStart.getDay();
  const calendarDays = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarCells = [...Array(calendarOffset).fill(null), ...Array.from({ length: calendarDays }, (_, index) => index + 1)];
  while (calendarCells.length % 7) calendarCells.push(null);
  const recordsByDate = new Map(records.map((record) => [record.workDate, record]));
  const holidaysByDate = new Map(holidays.map((holiday) => [holiday.date, holiday]));
  const approvedLeaveForDate = (date) => leaveRequests.find((leave) => leave.status === 'Approved' && leave.startDate <= date && leave.endDate >= date);
  const currentPunch = activePunch || today;
  const selectedRecord = recordsByDate.get(selectedDate);
  const selectedHoliday = holidaysByDate.get(selectedDate);
  const selectedLeave = approvedLeaveForDate(selectedDate);
  const selectedDateDay = selectedDate ? new Date(`${selectedDate}T00:00:00`).getDay() : -1;
  const selectedIsAbsent = Boolean(selectedDate && selectedDate < currentDateKey && workDays.includes(selectedDateDay) && !selectedRecord && !selectedHoliday && !selectedLeave);
  function downloadReport() {
    const rows = [['Employee', 'Work date', 'Check in', 'Check out', 'Hours', 'Punctuality']];
    for (const record of records) rows.push([record.employeeId?.name || currentUser.name || 'Employee', record.workDate, timestamp(record.checkInAt, timeZone), timestamp(record.checkOutAt, timeZone), duration(record.checkInAt, record.checkOutAt), record.punctualityStatus || '']);
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `attendance-report-${workDate || 'records'}.csv`; link.click(); URL.revokeObjectURL(url);
  }
  const liveShiftStatus = statusAtTime(now, timeZone, shiftStartTime, shiftEndTime, graceMinutes);
  const rosterDay = rosterDayForTime(now, timeZone, shiftStartTime, shiftEndTime);
  const officeClosed = !workDays.includes(rosterDay.weekday) || holidaysByDate.has(rosterDay.date) || Boolean(approvedLeaveForDate(rosterDay.date));
  const effectivePunctuality = officeClosed ? 'Office closed' : liveShiftStatus === 'After shift' && activePunch?.checkInAt ? 'Overtime' : ['Before shift', 'After shift'].includes(liveShiftStatus) ? liveShiftStatus : (currentPunch?.checkInAt ? currentPunch.punctualityStatus || liveShiftStatus : liveShiftStatus);
  const punctualityColor = effectivePunctuality === 'Late' ? '#BE123C' : effectivePunctuality === 'Slightly late' ? '#B45309' : effectivePunctuality === 'On time' ? '#15803D' : effectivePunctuality === 'Overtime' ? '#7C3AED' : '#64748B';
  const punctualityBackground = effectivePunctuality === 'Late' ? '#FFF1F2' : effectivePunctuality === 'Slightly late' ? '#FFFBEB' : effectivePunctuality === 'On time' ? '#F0FDF4' : effectivePunctuality === 'Overtime' ? '#F5F3FF' : '#F1F5F9';
  const workDayLabels = workDays.map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ');
  const punchAction = currentPunch?.checkInAt ? (currentPunch.checkOutAt ? null : 'check-out') : 'check-in';
  return <section style={{ width: '100%', maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 18 }}>
    <header className="dashboard-hero"><p style={{ color: '#C7D2FE', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', margin: '0 0 7px' }}>Time and attendance</p><h1 style={{ color: '#FFFFFF', fontSize: 27, margin: 0 }}>{heading}</h1><p style={{ color: '#E0E7FF', fontSize: 13, margin: '8px 0 0' }}>{shiftSource} · Work date: {workDate || '—'} · {timeZone} · Scheduled {shiftStartTime}–{shiftEndTime} · Workdays {workDayLabels}</p><p style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 21, margin: '13px 0 0', display: 'flex', alignItems: 'center', gap: 8 }}><span title={effectivePunctuality} style={{ width: 9, height: 9, borderRadius: '50%', background: punctualityColor, display: 'inline-block' }} /><button type="button" disabled={loading || busy || !punchAction} onClick={() => punchAction && mark(punchAction)} title={punchAction === 'check-in' ? 'Click the time to punch in' : punchAction === 'check-out' ? 'Click the time to punch out' : 'Today’s attendance is complete'} aria-label={`${punchAction === 'check-in' ? 'Click the time to punch in' : punchAction === 'check-out' ? 'Click the time to punch out' : 'Today’s attendance is complete'}. Current time ${now.toLocaleTimeString([], { timeZone, hour: '2-digit', minute: '2-digit' })}`} style={{ border: 0, borderRadius: 6, padding: '2px 5px', margin: '-2px 0', background: 'transparent', color: '#FFFFFF', font: 'inherit', cursor: punchAction && !loading && !busy ? 'pointer' : 'default', opacity: busy ? .65 : 1 }}>{now.toLocaleTimeString([], { timeZone, hour: '2-digit', minute: '2-digit' })}</button><span style={{ color: '#C7D2FE', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>Live · {effectivePunctuality}</span>{mode === 'reports' && <button onClick={downloadReport} style={{ marginLeft: 'auto', border: '1px solid rgba(255,255,255,.45)', borderRadius: 8, background: 'rgba(255,255,255,.13)', color: '#fff', padding: '9px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Download CSV</button>}</p></header>
    {error && <p role="alert" style={{ margin: 0, padding: 12, color: '#9F1239', background: '#FFF1F2', borderRadius: 10 }}>{error}</p>}
    {notice && <p role="status" style={{ margin: 0, padding: 12, color: '#166534', background: '#F0FDF4', borderRadius: 10 }}>{notice}</p>}
    <div className="surface-card" style={{ border: '1px solid #E2E8F0', borderRadius: 15, padding: 20, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div><p style={{ margin: '0 0 5px', color: '#64748B', fontSize: 13 }}>Today’s status</p><strong style={{ color: '#0F172A', fontSize: 18 }}>{loading ? 'Loading…' : !currentPunch ? 'Not checked in' : currentPunch.checkOutAt ? 'Shift completed' : 'Checked in'}</strong>{currentPunch && <><p style={{ margin: '7px 0 0', color: '#64748B', fontSize: 13 }}>In {timestamp(currentPunch.checkInAt, timeZone)}{currentPunch.checkOutAt ? ` · Out ${timestamp(currentPunch.checkOutAt, timeZone)}` : ''}</p><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '5px 9px', borderRadius: 999, color: punctualityColor, background: punctualityBackground, fontSize: 12, fontWeight: 700 }}><i style={{ width: 7, height: 7, borderRadius: '50%', background: punctualityColor }} />{effectivePunctuality}</span></>}</div>
      {!currentPunch ? <button disabled={busy || loading} onClick={() => mark('check-in')} style={{ border: 0, borderRadius: 9, background: '#4F46E5', color: '#FFFFFF', fontWeight: 700, padding: '11px 16px', cursor: 'pointer', opacity: busy || loading ? .6 : 1 }}>{busy ? 'Saving…' : 'Check in'}</button> : !currentPunch.checkOutAt ? <button disabled={busy || loading} onClick={() => mark('check-out')} style={{ border: 0, borderRadius: 9, background: '#0F172A', color: '#FFFFFF', fontWeight: 700, padding: '11px 16px', cursor: 'pointer', opacity: busy || loading ? .6 : 1 }}>{busy ? 'Saving…' : 'Check out'}</button> : <span style={{ color: '#15803D', fontWeight: 700 }}>Done for today</span>}
    </div>
    {mode === 'overtime' && <div className="surface-card" style={{ border: '1px solid #E2E8F0', borderRadius: 14, background: '#FFFFFF', padding: 17 }}><p style={{ margin: 0, color: '#64748B', fontSize: 11, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase' }}>Recorded time beyond scheduled shift</p><strong style={{ display: 'block', marginTop: 6, color: '#0F172A', fontSize: 24 }}>{loading ? '…' : durationLabel(totalOvertime)}</strong><p style={{ margin: '5px 0 0', color: '#64748B', fontSize: 11 }}>Calculated from completed punch records. This is an estimate and does not represent approved or payable overtime.</p></div>}
    {isEmployeeCalendar ? <section className="surface-card" style={{ border: '1px solid #E2E8F0', borderRadius: 15, padding: 18, background: '#FFFFFF', display: 'grid', gap: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div><h2 style={{ fontSize: 17, margin: 0, color: '#0F172A' }}>Attendance calendar</h2><p style={{ margin: '5px 0 0', color: '#64748B', fontSize: 12 }}>Present days are green; missed rostered workdays are red. Unscheduled days, holidays, and approved leave are excluded.</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><button type="button" aria-label="Previous month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} style={{ width: 34, height: 34, border: '1px solid #E2E8F0', borderRadius: 9, background: '#FFFFFF', color: '#334155', cursor: 'pointer' }}>‹</button><strong style={{ minWidth: 124, textAlign: 'center', color: '#1E293B', fontSize: 13 }}>{calendarMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}</strong><button type="button" aria-label="Next month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} style={{ width: 34, height: 34, border: '1px solid #E2E8F0', borderRadius: 9, background: '#FFFFFF', color: '#334155', cursor: 'pointer' }}>›</button></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 5 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day} style={{ padding: '5px 0', textAlign: 'center', color: '#94A3B8', fontSize: 10, fontWeight: 800 }}>{day}</span>)}
        {calendarCells.map((day, index) => {
          if (!day) return <span key={`blank-${index}`} />;
          const date = dateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
          const record = recordsByDate.get(date);
          const holiday = holidaysByDate.get(date);
          const leave = approvedLeaveForDate(date);
          const weekday = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day).getDay();
          const past = date < currentDateKey;
          const absent = !record && !holiday && !leave && workDays.includes(weekday) && past;
          const present = Boolean(record);
          const selected = selectedDate === date;
          const background = present ? '#DCFCE7' : absent ? '#FFE4E6' : leave ? '#EDE9FE' : holiday ? '#FEF3C7' : '#F8FAFC';
          const foreground = present ? '#166534' : absent ? '#BE123C' : leave ? '#6D28D9' : holiday ? '#92400E' : '#475569';
          return <button key={date} type="button" aria-label={`${date}: ${present ? 'Present' : absent ? 'Absent' : leave ? 'Approved leave' : holiday ? holiday.name : date === currentDateKey ? 'Today' : 'No attendance scheduled'}`} onClick={() => setSelectedDate(date)} style={{ position: 'relative', minWidth: 0, minHeight: 43, border: selected ? '2px solid #4F46E5' : '1px solid transparent', borderRadius: 10, background, color: foreground, fontSize: 12, fontWeight: present || absent ? 800 : 600, cursor: 'pointer' }}>{day}{date === currentDateKey && <span style={{ position: 'absolute', width: 4, height: 4, borderRadius: 9, background: '#4F46E5', bottom: 4, left: 'calc(50% - 2px)' }} />}</button>;
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: '#64748B', fontSize: 11 }}><span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 9, background: '#22C55E', marginRight: 5 }} />Present</span><span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 9, background: '#F43F5E', marginRight: 5 }} />Absent</span><span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 9, background: '#A78BFA', marginRight: 5 }} />Approved leave</span><span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 9, background: '#FBBF24', marginRight: 5 }} />Holiday</span></div>
      {selectedDate && <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}><div><strong style={{ color: '#0F172A', fontSize: 13 }}>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString([], { dateStyle: 'full' })}</strong><p style={{ margin: '5px 0 0', color: selectedRecord ? '#15803D' : selectedLeave ? '#6D28D9' : selectedHoliday ? '#92400E' : selectedIsAbsent ? '#BE123C' : '#64748B', fontSize: 12, fontWeight: 700 }}>{selectedRecord ? `${timestamp(selectedRecord.checkInAt, timeZone)}${selectedRecord.checkOutAt ? ` – ${timestamp(selectedRecord.checkOutAt, timeZone)}` : ' · In progress'}` : selectedLeave ? 'Approved leave' : selectedHoliday ? selectedHoliday.name : selectedIsAbsent ? 'Absent / no punch record' : selectedDate < currentDateKey ? 'Scheduled day off' : 'No attendance record yet'}</p></div>{selectedRecord?.punctualityStatus && <span style={{ color: selectedRecord.punctualityStatus === 'Late' ? '#BE123C' : selectedRecord.punctualityStatus === 'Slightly late' ? '#B45309' : '#15803D', fontSize: 11, fontWeight: 800 }}>{selectedRecord.punctualityStatus}</span>}</div>}
    </section> : <div style={{ display: 'grid', gap: 10 }}><h2 style={{ fontSize: 17, margin: '2px 0', color: '#0F172A' }}>{mode === 'overtime' ? 'Completed shifts with extra recorded time' : 'Recent team records'}</h2>{loading ? <p style={{ color: '#64748B' }}>Loading attendance…</p> : visibleRecords.length === 0 ? <div className="dashboard-empty">{mode === 'overtime' ? 'No completed shifts currently show time beyond their scheduled length.' : 'No attendance records yet.'}</div> : visibleRecords.map((record) => <article className="surface-card" key={record._id} style={{ border: '1px solid #E2E8F0', borderRadius: 13, padding: 16, background: '#FFFFFF', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', alignItems: 'center', gap: 10 }}><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><ProfileAvatar person={record.employeeId} size={34} /><div><p style={{ margin: 0, color: '#0F172A', fontWeight: 700 }}>{record.employeeId?.name || (record.employeeId?._id === currentUser.id ? currentUser.name : 'Employee')}</p><p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 12 }}>{record.employeeId?.designation || record.employeeId?.department || 'Staff'}</p></div></div><div><p style={{ margin: 0, color: '#64748B', fontSize: 11 }}>Work date</p><strong style={{ color: '#334155', fontSize: 13 }}>{record.workDate}</strong></div><div><p style={{ margin: 0, color: '#64748B', fontSize: 11 }}>Check in / out</p><strong style={{ color: '#334155', fontSize: 13 }}>{timestamp(record.checkInAt, timeZone)}<br />{timestamp(record.checkOutAt, timeZone)}</strong></div><div><p style={{ margin: 0, color: '#64748B', fontSize: 11 }}>{mode === 'overtime' ? 'Extra time' : 'Hours'}</p><strong style={{ color: '#334155', fontSize: 13 }}>{mode === 'overtime' ? durationLabel(overtimeMinutes(record)) : duration(record.checkInAt, record.checkOutAt)}</strong><p style={{ margin: '4px 0 0', color: record.punctualityStatus === 'Late' ? '#BE123C' : record.punctualityStatus === 'Slightly late' ? '#B45309' : '#15803D', fontSize: 12, fontWeight: 700 }}>{record.punctualityStatus || 'On time'}</p></div></article>)}</div>}
  </section>;
}
