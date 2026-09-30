import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';
import ExpandableList from '../components/ExpandableList';

const categories = ['Annual leave', 'Sick leave', 'Personal leave', 'Unpaid leave', 'Compensatory time', 'Other'];
const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '11px 12px', border: '1px solid #CBD5E1', borderRadius: 9, background: '#FFFFFF', color: '#0F172A', font: 'inherit' };
const cardStyle = { border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, background: '#FFFFFF' };

function dateLabel(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
}

export default function LeaveCenter({ mode = 'employee' }) {
  const { currentUser, apiRequest } = useAuth();
  const isEmployee = currentUser?.role === 'Employee';
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ category: categories[0], startDate: '', endDate: '', reason: '' });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await apiRequest('/leaves'); setRequests(data.requests || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [apiRequest]);
  useEffect(() => { load(); }, [load]);

  async function submit(event) {
    event.preventDefault(); setError(''); setSuccess(''); setBusyId('submit');
    try {
      const data = await apiRequest('/leaves', { method: 'POST', body: JSON.stringify(form) });
      setSuccess(`Request sent to ${data.request.approverId?.name || currentUser.managerName || 'your manager'}. Request ID: ${data.request._id}`);
      setForm({ category: categories[0], startDate: '', endDate: '', reason: '' });
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusyId(''); }
  }

  async function decide(request, status) {
    setBusyId(request._id); setError(''); setSuccess('');
    try {
      await apiRequest(`/leaves/${request._id}/decision`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setSuccess(`Request ${status.toLowerCase()}.`);
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusyId(''); }
  }

  const canReview = ['Manager', 'Organization Admin', 'Application Admin'].includes(currentUser?.role);
  const heading = canReview && mode === 'manager' ? 'Team leave requests' : 'Leave requests';
  return <section style={{ width: '100%', maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 18 }}>
    <header className="dashboard-hero">
      <p style={{ color: '#C7D2FE', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', margin: '0 0 7px' }}>{canReview && mode === 'manager' ? 'Approvals workspace' : 'Time off workspace'}</p>
      <h1 style={{ color: '#FFFFFF', fontSize: 27, margin: 0 }}>{heading}</h1>
      <p style={{ color: '#E0E7FF', fontSize: 13, lineHeight: 1.6, margin: '8px 0 0' }}>{canReview && mode === 'manager' ? 'Review requests assigned to you and keep employees updated on decisions.' : 'Plan your time away and follow every request from submission to decision.'}</p>
    </header>
    {error && <p role="alert" style={{ margin: 0, padding: 12, color: '#9F1239', background: '#FFF1F2', borderRadius: 10 }}>{error}</p>}
    {success && <p role="status" style={{ margin: 0, padding: 12, color: '#166534', background: '#F0FDF4', borderRadius: 10, overflowWrap: 'anywhere' }}>{success}</p>}
    {isEmployee && <form onSubmit={submit} className="surface-card" style={{ ...cardStyle, display: 'grid', gap: 12, padding: 20 }}>
      <h2 style={{ margin: 0, fontSize: 17, color: '#0F172A' }}>Apply for time off</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6, color: '#475569', fontSize: 13 }}>Leave type<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={fieldStyle}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label style={{ display: 'grid', gap: 6, color: '#475569', fontSize: 13 }}>From<input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={fieldStyle} /></label>
        <label style={{ display: 'grid', gap: 6, color: '#475569', fontSize: 13 }}>To<input type="date" min={form.startDate || undefined} required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={fieldStyle} /></label>
      </div>
      <label style={{ display: 'grid', gap: 6, color: '#475569', fontSize: 13 }}>Reason<textarea required minLength={3} maxLength={1000} rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ ...fieldStyle, resize: 'vertical' }} /></label>
      <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>Approver: {currentUser.managerName || (currentUser.managerId ? 'Your assigned manager (name shown after submission)' : 'Not assigned yet — ask an administrator to assign your manager.')}</p>
      <button disabled={busyId === 'submit' || !currentUser.managerId} style={{ justifySelf: 'start', border: 0, borderRadius: 9, background: '#4F46E5', color: 'white', fontWeight: 700, padding: '10px 16px', cursor: 'pointer', opacity: busyId === 'submit' || !currentUser.managerId ? .6 : 1 }}>{busyId === 'submit' ? 'Sending…' : 'Send leave request'}</button>
    </form>}
    <div style={{ display: 'grid', gap: 10 }}>
      <h2 style={{ margin: '2px 0', fontSize: 17, color: '#0F172A' }}>{canReview && mode === 'manager' ? 'Assigned to you' : 'My requests'}</h2>
      {loading ? <p style={{ color: '#64748B' }}>Loading requests…</p> : requests.length === 0 ? <div style={{ ...cardStyle, color: '#64748B', fontSize: 14 }}>{canReview && mode === 'manager' ? 'No requests have been assigned to you.' : 'No leave requests yet.'}</div> : <ExpandableList items={requests} renderItem={(request) => {
        const employee = request.employeeId || {};
        const approver = request.approverId || {};
        const statusColor = request.status === 'Approved' ? '#15803D' : request.status === 'Rejected' ? '#BE123C' : '#B45309';
        return <article key={request._id} className="surface-card" style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start', padding: 18 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}><strong style={{ color: '#0F172A' }}>{request.category}</strong><span style={{ color: statusColor, background: `${statusColor}12`, padding: '3px 8px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{request.status}</span></div>
            {canReview && mode === 'manager' && <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8, color: '#475569', fontSize: 13 }}><ProfileAvatar person={employee} size={34} /><span>{employee.name} {employee.designation ? `· ${employee.designation}` : ''}</span></div>}
            <p style={{ margin: '7px 0 0', color: '#475569', fontSize: 13 }}>{dateLabel(request.startDate)} – {dateLabel(request.endDate)}</p>
            <p style={{ margin: '7px 0 0', color: '#64748B', fontSize: 13, overflowWrap: 'anywhere' }}>{request.reason}</p>
            {!canReview && <p style={{ margin: '7px 0 0', color: '#64748B', fontSize: 12 }}>Approver: {approver.name || currentUser.managerName || 'Manager'}</p>}
            {request.decisionNote && <p style={{ margin: '7px 0 0', color: '#475569', fontSize: 12 }}>Manager note: {request.decisionNote}</p>}
            <p style={{ margin: '7px 0 0', color: '#94A3B8', fontSize: 11 }}>Request ID: {request._id}</p>
          </div>
          {canReview && mode === 'manager' && request.status === 'Pending' && <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'end', gap: 7 }}><button disabled={Boolean(busyId)} onClick={() => decide(request, 'Approved')} style={{ border: 0, borderRadius: 8, background: '#DCFCE7', color: '#166534', padding: '8px 10px', fontWeight: 700, cursor: 'pointer' }}>Approve</button><button disabled={Boolean(busyId)} onClick={() => decide(request, 'Rejected')} style={{ border: 0, borderRadius: 8, background: '#FFE4E6', color: '#9F1239', padding: '8px 10px', fontWeight: 700, cursor: 'pointer' }}>Reject</button></div>}
        </article>;
      }} />}
    </div>
  </section>;
}
