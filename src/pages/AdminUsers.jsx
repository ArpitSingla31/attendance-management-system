import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileAvatar from '../components/ProfileAvatar';

const API_URL = import.meta.env.VITE_API_URL || '';
const roleOptions = {
  'Organization Admin': ['Employee', 'Manager'],
  'Application Admin': ['Employee', 'Manager', 'Organization Admin', 'Application Admin']
};

export default function AdminUsers() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [savedRows, setSavedRows] = useState({});
  const [workProfiles, setWorkProfiles] = useState({});
  const [userSearch, setUserSearch] = useState('');
  const [showMoreUsers, setShowMoreUsers] = useState(false);
  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Daily wage', 'Intern', 'Support staff'];

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, { credentials: 'include' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to load users.');
      setUsers(payload.users);
    } catch (loadError) { setError(loadError.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function updateRole(userId, role) {
    setSavingId(userId);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to update role.');
      setUsers((current) => current.map((user) => user.id === userId ? payload.user : user));
      setSavedRows((current) => ({ ...current, [userId]: 'Role updated' }));
    } catch (updateError) { setError(updateError.message); }
    finally { setSavingId(''); }
  }

  async function updateWorkProfile(userId) {
    setSavingId(userId); setError('');
    try {
      const profile = workProfiles[userId] || {};
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/work-profile`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to save work profile.');
      setUsers((current) => current.map((user) => user.id === userId ? payload.user : user));
      setWorkProfiles((current) => { const next = { ...current }; delete next[userId]; return next; });
      setSavedRows((current) => ({ ...current, [userId]: 'Changes saved' }));
    } catch (updateError) { setError(updateError.message); }
    finally { setSavingId(''); }
  }

  function workValue(user, key) {
    const draft = workProfiles[user.id] || {};
    return Object.hasOwn(draft, key) ? draft[key] : (key === 'managerId' ? user.managerId || '' : user[key] || '');
  }
  function setWorkValue(user, key, value) {
    setWorkProfiles((current) => ({ ...current, [user.id]: { ...current[user.id], [key]: value } }));
  }

  const managers = users.filter((user) => ['Manager', 'Organization Admin', 'Application Admin'].includes(user.role));
  const unassigned = users.filter((user) => user.role === 'Employee' && !user.managerId).length;
  const matchingUsers = users.filter((user) => `${user.name} ${user.email || ''} ${user.employeeCode || ''} ${user.department || ''}`.toLocaleLowerCase().includes(userSearch.trim().toLocaleLowerCase()));
  const visibleUsers = showMoreUsers ? matchingUsers : matchingUsers.slice(0, 5);

  return <section className="staff-access-page" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
    <div style={{ padding: '24px 26px', borderRadius: '18px', background: 'linear-gradient(120deg, #172554 0%, #3730A3 55%, #6366F1 100%)', color: '#FFFFFF', boxShadow: '0 16px 36px rgba(49,46,129,.18)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 210, height: 210, borderRadius: '50%', right: -54, top: -105, background: 'rgba(255,255,255,.08)' }} />
      <p style={{ color: '#C7D2FE', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '8px' }}>{currentUser.role} workspace</p>
      <h1 style={{ fontSize: '27px', lineHeight: 1.2, margin: 0 }}>Staff &amp; access</h1>
      <p style={{ color: '#E0E7FF', fontSize: '13px', lineHeight: 1.6, marginTop: '9px', maxWidth: '720px' }}>Manage job details, account permissions, and reporting lines. New signups start as employees; assign each employee a manager before they submit leave.</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
      {[["Team members", loading ? '—' : users.length, 'Accounts in your access scope', '#4F46E5'], ['Managers', loading ? '—' : managers.length, 'Available as approvers', '#0891B2'], ['Need a manager', loading ? '—' : unassigned, 'Employees to assign', '#D97706']].map(([label, value, caption, color]) => <article key={label} style={{ padding: '17px 18px', border: '1px solid #E5EAF3', borderRadius: '14px', background: '#FFFFFF', boxShadow: '0 5px 18px rgba(15,23,42,.035)' }}><p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>{label}</p><strong style={{ display: 'block', color, fontSize: '25px', marginTop: '7px' }}>{value}</strong><small style={{ color: '#94A3B8', fontSize: '11px' }}>{caption}</small></article>)}
    </div>
    <div style={{ display: 'flex', gap: '12px', padding: '14px 16px', border: '1px solid #C7D2FE', borderRadius: '13px', background: '#EEF2FF', color: '#3730A3', fontSize: '12px', lineHeight: 1.55 }}><span aria-hidden="true" style={{ fontSize: 18 }}>ⓘ</span><div><strong>Assigning a manager</strong><div>First change an account’s Role to <b>Manager</b>. Then select that person in an employee’s Reporting manager field and click Save. The manager will receive new leave requests in Team Approvals.</div></div></div>
    {error && <div role="alert" style={{ padding: '12px 14px', margin: 0, color: '#9F1239', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', fontSize: '13px' }}>{error}<button type="button" onClick={loadUsers} style={{ marginLeft: 12, border: 0, background: 'transparent', color: '#9F1239', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}>Reload accounts</button></div>}
    <div className="staff-access-panel" style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '15px', background: '#FFFFFF', boxShadow: '0 8px 24px rgba(15,23,42,.04)' }}>
      <div className="staff-access-toolbar" style={{ padding: '17px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><div><strong style={{ display: 'block', color: '#0F172A', fontSize: 14 }}>People and reporting lines</strong><span style={{ color: '#64748B', fontSize: 11 }}>Role changes save immediately. Save the other work details on each person’s card.</span></div><label className="staff-search"><span className="staff-search-label">Find staff</span><input type="search" value={userSearch} onChange={(event) => { setUserSearch(event.target.value); setShowMoreUsers(false); }} placeholder="Search name, email, code…" aria-label="Search staff and access records" /></label><span className="staff-account-count">{loading ? 'Loading' : `${visibleUsers.length}${matchingUsers.length > visibleUsers.length ? ` of ${matchingUsers.length}` : ''} accounts`}</span></div>
      <table style={{ width: '100%', minWidth: '1040px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead><tr style={{ color: '#64748B', background: '#F8FAFC' }}>
          {['Name / email', 'Department', 'Role', 'Position', 'Employment', 'Employee code', 'Reporting manager', 'Save'].map((heading) => <th key={heading} style={{ padding: '13px 12px', borderBottom: '1px solid #E2E8F0', fontWeight: 700, whiteSpace: 'nowrap' }}>{heading}</th>)}
        </tr></thead>
        <tbody>
          {loading ? <tr><td colSpan="8" style={{ padding: '30px 16px', color: '#64748B' }}>Loading accounts…</td></tr> : visibleUsers.map((user) => <tr key={user.id} style={{ background: user.id === currentUser.id ? '#FAFAFF' : '#FFFFFF' }}>
            <td style={{ padding: '13px 12px', borderBottom: '1px solid #F1F5F9', fontWeight: 700, color: '#0F172A' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><ProfileAvatar person={user} size={36} /><div>{user.name}{user.id === currentUser.id ? ' (you)' : ''}<div style={{ fontSize: 11, color: '#64748B', fontWeight: 400, marginTop: 3 }}>{user.email}</div></div></div></td>
            <td style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9', color: '#475569' }}>{user.department || '—'}</td>
            <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9' }}>
              <select aria-label={`Role for ${user.name}`} value={user.role} disabled={savingId === user.id || user.id === currentUser.id} onChange={(event) => updateRole(user.id, event.target.value)} style={{ maxWidth: '190px', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '8px', background: '#FFFFFF', color: '#334155' }}>
                {[...new Set([user.role, ...(roleOptions[currentUser.role] || [])])].map((role) => <option key={role}>{role}</option>)}
              </select>
            </td>
            <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9' }}><input aria-label={`Position for ${user.name}`} value={workValue(user, 'designation')} onChange={(event) => setWorkValue(user, 'designation', event.target.value)} placeholder="e.g. Care assistant" style={{ width: 145, padding: 8, border: '1px solid #CBD5E1', borderRadius: 8 }} /></td>
            <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9' }}><select aria-label={`Employment type for ${user.name}`} value={workValue(user, 'employmentType')} onChange={(event) => setWorkValue(user, 'employmentType', event.target.value)} style={{ padding: 8, border: '1px solid #CBD5E1', borderRadius: 8 }}>{employmentTypes.map((type) => <option key={type}>{type}</option>)}</select></td>
            <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9' }}><input aria-label={`Employee code for ${user.name}`} value={workValue(user, 'employeeCode')} onChange={(event) => setWorkValue(user, 'employeeCode', event.target.value)} placeholder="Optional" style={{ width: 105, padding: 8, border: '1px solid #CBD5E1', borderRadius: 8 }} /></td>
            <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9' }}><select aria-label={`Manager for ${user.name}`} value={workValue(user, 'managerId')} onChange={(event) => setWorkValue(user, 'managerId', event.target.value)} style={{ maxWidth: 180, padding: 8, border: '1px solid #CBD5E1', borderRadius: 8 }}><option value="">No manager assigned</option>{users.filter((candidate) => candidate.id !== user.id && ['Manager', 'Organization Admin', 'Application Admin'].includes(candidate.role)).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} · {candidate.role}</option>)}</select></td>
            <td style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9' }}><button disabled={savingId === user.id} onClick={() => updateWorkProfile(user.id)} style={{ border: 0, borderRadius: 8, background: savingId === user.id ? '#E2E8F0' : '#4F46E5', color: savingId === user.id ? '#475569' : '#FFFFFF', fontWeight: 700, padding: '9px 13px', cursor: savingId === user.id ? 'wait' : 'pointer' }}>{savingId === user.id ? 'Saving…' : 'Save'}</button>{savedRows[user.id] && <small role="status" style={{ display: 'block', color: '#15803D', fontSize: 10, marginTop: 5 }}>{savedRows[user.id]}</small>}</td>
          </tr>)}
          {!loading && visibleUsers.length === 0 && <tr><td colSpan="8" style={{ padding: '24px 16px', color: '#64748B' }}>{userSearch ? 'No staff match that search.' : 'No accounts found.'}</td></tr>}
        </tbody>
      </table>
      {matchingUsers.length > 5 && <div className="staff-desktop-more"><button type="button" className="see-more-list" aria-expanded={showMoreUsers} onClick={() => setShowMoreUsers((shown) => !shown)}>{showMoreUsers ? 'Show less' : `See more (${matchingUsers.length - 5})`}</button></div>}
      <div className="staff-mobile-list">
        {loading ? <p className="staff-list-message">Loading accounts…</p> : visibleUsers.length === 0 ? <p className="staff-list-message">{userSearch ? 'No staff match that search.' : 'No accounts found.'}</p> : visibleUsers.map((user) => <article key={user.id} className="staff-mobile-card">
          <div className="staff-card-heading"><ProfileAvatar person={user} size={46} /><div className="staff-card-identity"><strong>{user.name}{user.id === currentUser.id ? ' (you)' : ''}</strong><span>{user.email || 'No email on account'}</span><small>{user.department || 'No department assigned'}</small></div></div>
          <div className="staff-card-fields">
            <label>Access role<select aria-label={`Role for ${user.name}`} value={user.role} disabled={savingId === user.id || user.id === currentUser.id} onChange={(event) => updateRole(user.id, event.target.value)}>{[...new Set([user.role, ...(roleOptions[currentUser.role] || [])])].map((role) => <option key={role}>{role}</option>)}</select></label>
            <label>Position<input aria-label={`Position for ${user.name}`} value={workValue(user, 'designation')} onChange={(event) => setWorkValue(user, 'designation', event.target.value)} placeholder="e.g. Care assistant" /></label>
            <label>Employment type<select aria-label={`Employment type for ${user.name}`} value={workValue(user, 'employmentType')} onChange={(event) => setWorkValue(user, 'employmentType', event.target.value)}>{employmentTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label>Employee code<input aria-label={`Employee code for ${user.name}`} value={workValue(user, 'employeeCode')} onChange={(event) => setWorkValue(user, 'employeeCode', event.target.value)} placeholder="Optional" /></label>
            <label className="staff-manager-field">Reporting manager<select aria-label={`Manager for ${user.name}`} value={workValue(user, 'managerId')} onChange={(event) => setWorkValue(user, 'managerId', event.target.value)}><option value="">No manager assigned</option>{users.filter((candidate) => candidate.id !== user.id && ['Manager', 'Organization Admin', 'Application Admin'].includes(candidate.role)).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} · {candidate.role}</option>)}</select></label>
          </div>
          <div className="staff-card-save"><button type="button" disabled={savingId === user.id} onClick={() => updateWorkProfile(user.id)}>{savingId === user.id ? 'Saving…' : 'Save staff details'}</button>{savedRows[user.id] && <small role="status">{savedRows[user.id]}</small>}</div>
        </article>)}
      </div>
      {matchingUsers.length > 5 && <div className="staff-mobile-more"><button type="button" className="see-more-list" aria-expanded={showMoreUsers} onClick={() => setShowMoreUsers((shown) => !shown)}>{showMoreUsers ? 'Show less' : `See more (${matchingUsers.length - 5})`}</button></div>}
    </div>
  </section>;
}
