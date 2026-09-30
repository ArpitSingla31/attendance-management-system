import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { haryanaHolidays2026 } from '../data/haryanaHolidays2026';

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 11px', border: '1px solid #CBD5E1', borderRadius: 9, background: '#FFFFFF', color: '#0F172A', font: 'inherit' };
const pad2 = (value) => String(value).padStart(2, '0');
const localMonth = () => { const now = new Date(); return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`; };
const localDate = () => { const now = new Date(); return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`; };

export default function HolidayCalendar() {
  const { currentUser, apiRequest } = useAuth();
  const [month, setMonth] = useState(localMonth);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', date: '', description: '' });
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const isAdmin = ['Organization Admin', 'Application Admin'].includes(currentUser?.role);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await apiRequest('/holidays'); setHolidays(data.holidays || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [apiRequest]);
  useEffect(() => { load(); }, [load]);

  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const days = new Date(year, monthNumber, 0).getDate();
  const firstDay = new Date(year, monthNumber - 1, 1).getDay();
  const combinedHolidays = useMemo(() => {
    const byDateAndName = new Map(haryanaHolidays2026.map((holiday) => [`${holiday.date}-${holiday.name}`, holiday]));
    for (const holiday of holidays) byDateAndName.set(`${holiday.date}-${holiday.name}`, holiday);
    return [...byDateAndName.values()];
  }, [holidays]);
  const holidayMap = useMemo(() => new Map(combinedHolidays.map((holiday) => [holiday.date, holiday])), [combinedHolidays]);
  const yearHolidays = combinedHolidays.filter((holiday) => Number(holiday.date.slice(0, 4)) === year).sort((a, b) => a.date.localeCompare(b.date));
  const upcomingHolidays = yearHolidays.filter((holiday) => holiday.date >= localDate());
  const visibleUpcomingHolidays = showAllUpcoming ? upcomingHolidays : upcomingHolidays.slice(0, 5);
  const currentYear = new Date().getFullYear();
  const availableYears = [...new Set([year, ...Array.from({ length: 11 }, (_, index) => currentYear + index), ...holidays.map((holiday) => Number(holiday.date.slice(0, 4)))])].sort((a, b) => a - b);

  async function addHoliday(event) {
    event.preventDefault(); setError(''); setNotice('');
    try {
      await apiRequest('/holidays', { method: 'POST', body: JSON.stringify(form) });
      setNotice('Holiday added to the shared calendar.'); setForm({ name: '', date: '', description: '' }); await load();
    } catch (err) { setError(err.message); }
  }
  async function removeHoliday(id) {
    setError('');
    try { await apiRequest(`/holidays/${id}`, { method: 'DELETE' }); await load(); }
    catch (err) { setError(err.message); }
  }
  function moveMonth(delta) {
    const next = new Date(year, monthNumber - 1 + delta, 1);
    setShowAllUpcoming(false);
    setMonth(`${next.getFullYear()}-${pad2(next.getMonth() + 1)}`);
  }

  return <section className="holiday-calendar-page" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 18 }}>
    <header className="dashboard-hero"><p style={{ color: '#C7D2FE', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', margin: '0 0 7px' }}>Company dates</p><h1 style={{ color: '#FFFFFF', fontSize: 27, margin: 0 }}>Holiday calendar</h1><p style={{ color: '#E0E7FF', fontSize: 13, lineHeight: 1.6, margin: '8px 0 0' }}>Browse holidays by year. Organization admins can add confirmed dates for upcoming years, and they will appear for everyone in that year’s calendar.</p><a href="https://csharyana.gov.in/WriteReadData/Notifications-%26-Orders/Human-Resources-I/15669.pdf" target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10, color: '#FFFFFF', fontSize: 12, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>View Haryana Government 2026 notification</a></header>
    {error && <p role="alert" style={{ margin: 0, padding: 12, color: '#9F1239', background: '#FFF1F2', borderRadius: 10 }}>{error}</p>}
    {notice && <p role="status" style={{ margin: 0, padding: 12, color: '#166534', background: '#F0FDF4', borderRadius: 10 }}>{notice}</p>}
    {isAdmin && <form onSubmit={addHoliday} className="surface-card" style={{ border: '1px solid #E2E8F0', borderRadius: 15, padding: 19, display: 'grid', gap: 11, background: '#FFFFFF' }}>
      <strong style={{ color: '#0F172A' }}>Add a company holiday</strong>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}><label style={{ display: 'grid', gap: 5, color: '#475569', fontSize: 13 }}>Holiday name<input required minLength={2} maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} /></label><label style={{ display: 'grid', gap: 5, color: '#475569', fontSize: 13 }}>Date<input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} /></label><label style={{ display: 'grid', gap: 5, color: '#475569', fontSize: 13 }}>Details (optional)<input maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} /></label></div>
      <button style={{ justifySelf: 'start', padding: '9px 14px', color: 'white', background: '#4F46E5', border: 0, borderRadius: 9, fontWeight: 700, cursor: 'pointer' }}>Add holiday</button>
    </form>}
    <div className="calendar-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, .85fr)', gap: 16, alignItems: 'start' }}>
      <div className="surface-card calendar-widget" style={{ border: '1px solid #E2E8F0', borderRadius: 15, padding: 18, background: '#FFFFFF' }}>
        <div className="calendar-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 13 }}><button aria-label="Previous month" onClick={() => moveMonth(-1)} style={{ border: '1px solid #E2E8F0', background: 'white', borderRadius: 9, padding: '7px 12px', cursor: 'pointer', color: '#475569', fontSize: 18 }}>‹</button><div className="calendar-title"><strong style={{ color: '#0F172A' }}>{new Date(year, monthNumber - 1, 1).toLocaleDateString(undefined, { month: 'long' })}</strong><select aria-label="Calendar year" value={year} onChange={(event) => { setShowAllUpcoming(false); setMonth(`${event.target.value}-${pad2(monthNumber)}`); }} style={{ ...inputStyle, width: 'auto', minHeight: 38, padding: '6px 9px', fontSize: 13, fontWeight: 700 }}>{availableYears.map((availableYear) => <option key={availableYear} value={availableYear}>{availableYear}</option>)}</select></div><button aria-label="Next month" onClick={() => moveMonth(1)} style={{ border: '1px solid #E2E8F0', background: 'white', borderRadius: 9, padding: '7px 12px', cursor: 'pointer', color: '#475569', fontSize: 18 }}>›</button></div>
        <div className="calendar-weekdays" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4, textAlign: 'center', color: '#64748B', fontSize: 11, fontWeight: 700 }}>{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <div key={day} style={{ padding: 5 }}>{day}</div>)}</div>
        <div className="calendar-days" role="grid" aria-label={`${new Date(year, monthNumber - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4 }}>{Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} aria-hidden="true" />)}{Array.from({ length: days }, (_, i) => { const n = i + 1; const key = `${month}-${pad2(n)}`; const holiday = holidayMap.get(key); return <div key={key} role="gridcell" aria-label={`${key}${holiday ? `, ${holiday.name}` : ''}`} title={holiday?.name} className={holiday ? 'calendar-day is-holiday' : 'calendar-day'}>{n}{holiday && <span aria-hidden="true" className="calendar-holiday-dot" />}</div>; })}</div>
        <div className="calendar-legend"><span className="calendar-holiday-dot" /> Holiday <span className="calendar-legend-count">{yearHolidays.length} dates this year</span></div>
      </div>
      <div className="holiday-agenda"><div className="holiday-agenda-heading"><div><h2 style={{ fontSize: 17, margin: 0, color: '#0F172A' }}>Upcoming holidays in {year}</h2><p style={{ color: '#64748B', fontSize: 11, marginTop: 4 }}>Next company dates, in order</p></div><span className="holiday-count">{upcomingHolidays.length}</span></div>{loading ? <p style={{ color: '#64748B' }}>Loading calendar…</p> : upcomingHolidays.length === 0 ? <div className="dashboard-empty">{yearHolidays.length ? `There are no upcoming holidays left in ${year}.` : `No holidays are configured for ${year} yet. Ask your organization admin to add confirmed dates; they’ll appear here for everyone.`}</div> : <>{visibleUpcomingHolidays.map((holiday) => <article key={holiday._id || `${holiday.name}-${holiday.date}`} className="surface-card holiday-row"><span className="holiday-date-badge"><strong>{Number(holiday.date.slice(8, 10))}</strong><small>{new Date(`${holiday.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</small></span><div className="holiday-copy"><strong>{holiday.name}</strong><p>{new Date(`${holiday.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>{holiday.description && <small>{holiday.description}</small>}</div>{isAdmin && !holiday.isReference && <button className="holiday-remove" aria-label={`Remove ${holiday.name}`} onClick={() => removeHoliday(holiday._id)}>Remove</button>}</article>)}{upcomingHolidays.length > 5 && <button type="button" className="holiday-see-more" onClick={() => setShowAllUpcoming((shown) => !shown)}>{showAllUpcoming ? 'Show less' : `See more (${upcomingHolidays.length - 5} more)`}</button>}</>}</div>
    </div>
  </section>;
}
