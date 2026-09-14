import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useIsMobile } from './hooks/useMediaQuery';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import ProfileUpdate from './pages/ProfileUpdate';

function MainApp() {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile(768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Modal State for Provisioning New Staff
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({
    fullName: '',
    empId: '',
    department: 'Engineering',
    role: 'Employee',
    biometricId: '',
    workEmail: ''
  });

  // Approval Queue State with real-time status transitions and slide animation
  const [approvalRequests, setApprovalRequests] = useState([
    {
      id: 'REQ-101',
      name: 'Arpit Singla',
      role: 'Software Engineer',
      empId: 'EMP-1042',
      initials: 'AS',
      avatarBg: '#EEF2FF',
      avatarColor: '#4F46E5',
      type: 'Casual Leave',
      duration: 'Sep 18 - Sep 19 (2 Days)',
      reason: 'Personal work / Family function',
      status: 'pending',
      animating: false
    },
    {
      id: 'REQ-102',
      name: 'Priya Sharma',
      role: 'UI/UX Designer',
      empId: 'EMP-1048',
      initials: 'PS',
      avatarBg: '#ECFDF5',
      avatarColor: '#059669',
      type: 'Sick Leave',
      duration: 'Sep 22 (1 Day)',
      reason: 'Routine medical checkup',
      status: 'pending',
      animating: false
    }
  ]);

  const [approvalFilter, setApprovalFilter] = useState('pending');

  const handleDecision = (id, newStatus) => {
    setApprovalRequests(prev =>
      prev.map(r => r.id === id ? { ...r, animating: true } : r)
    );

    setTimeout(() => {
      setApprovalRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status: newStatus, animating: false } : r)
      );
    }, 250);
  };

  if (!currentUser) {
    return <Login />;
  }

  const isManager = currentUser.role === 'Manager';

  const handleTabSelect = (tab) => {
    setCurrentTab(tab);
    if (isMobile) setMobileMenuOpen(false);
  };

  const renderContent = () => {
    // Universal Profile Tab
    if (currentTab === 'profile') {
      return <ProfileUpdate />;
    }

    // Manager Console Screens
    if (isManager) {
      switch (currentTab) {
        case 'manager-dashboard': {
          const pendingCount = approvalRequests.filter(r => r.status === 'pending').length;
          return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Manager Operations Console</h1>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Engineering &amp; Tech Ops — Live Shift Monitoring &amp; Floor Capacity</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabSelect('team-approvals')}
                  style={{
                    padding: '9px 18px',
                    backgroundColor: '#4F46E5',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Review {pendingCount} Pending {pendingCount === 1 ? 'Leave' : 'Leaves'}</span>
                  <span>→</span>
                </button>
              </div>

              {/* Metric Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>On-Floor Today</p>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 0 3px #D1FAE5' }}></span>
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '8px 0 0 0' }}>45 <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>/ 48</span></p>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>● 93.8% Floor Presence</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>On Planned Leave</p>
                  <p style={{ fontSize: '28px', fontWeight: 800, color: '#F59E0B', margin: '8px 0 0 0' }}>2 <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>Staff</span></p>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>1 Medical, 1 Casual</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Pending Requests</p>
                  <p style={{ fontSize: '28px', fontWeight: 800, color: pendingCount > 0 ? '#4F46E5' : '#10B981', margin: '8px 0 0 0' }}>
                    {pendingCount} <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>Actionable</span>
                  </p>
                  <span style={{ fontSize: '11px', color: pendingCount > 0 ? '#4F46E5' : '#10B981', fontWeight: 600 }}>
                    {pendingCount > 0 ? 'Awaiting your review' : 'All caught up!'}
                  </span>
                </div>
              </div>

              {/* Live Team Presence Roster (Directly following the metrics) */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>LIVE TEAM PRESENCE ROSTER</h3>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>Direct biometric punch synchronization from office hardware</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '11px', backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>45 Present</span>
                    <span style={{ fontSize: '11px', backgroundColor: '#FEF3C7', color: '#D97706', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>2 On Leave</span>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', minWidth: '650px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Staff Member</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Role</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Punch In</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Hardware Gate</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>AS</div>
                            <div>
                              <span style={{ fontWeight: 600, color: '#0F172A' }}>Arpit Singla</span>
                              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>EMP-1042</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>Software Engineer</td>
                        <td style={{ padding: '12px 14px', color: '#10B981', fontWeight: 600 }}>09:30 AM</td>
                        <td style={{ padding: '12px 14px', color: '#64748B', fontFamily: 'monospace' }}>GATE-01 (Turnstile A)</td>
                        <td style={{ padding: '12px 14px' }}><span style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>● In Office</span></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>PS</div>
                            <div>
                              <span style={{ fontWeight: 600, color: '#0F172A' }}>Priya Sharma</span>
                              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>EMP-1048</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>UI/UX Designer</td>
                        <td style={{ padding: '12px 14px', color: '#10B981', fontWeight: 600 }}>09:15 AM</td>
                        <td style={{ padding: '12px 14px', color: '#64748B', fontFamily: 'monospace' }}>GATE-02 (Turnstile B)</td>
                        <td style={{ padding: '12px 14px' }}><span style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>● In Office</span></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>RV</div>
                            <div>
                              <span style={{ fontWeight: 600, color: '#0F172A' }}>Rahul Verma</span>
                              <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>EMP-1045</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748B' }}>QA Specialist</td>
                        <td style={{ padding: '12px 14px', color: '#94A3B8' }}>--</td>
                        <td style={{ padding: '12px 14px', color: '#94A3B8' }}>--</td>
                        <td style={{ padding: '12px 14px' }}><span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>● On Casual Leave</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        }

        case 'team-approvals': {
          const currentFiltered = approvalRequests.filter(r => r.status === approvalFilter);
          const pendingRemaining = approvalRequests.filter(r => r.status === 'pending').length;

          return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Leave Approval Queue</h1>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Verify or reject submitted time-off applications with instant status synchronization.</p>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setApprovalFilter('pending')}
                  style={{
                    padding: '7px 16px',
                    backgroundColor: approvalFilter === 'pending' ? '#EEF2FF' : 'transparent',
                    color: approvalFilter === 'pending' ? '#4F46E5' : '#64748B',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: approvalFilter === 'pending' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Pending ({pendingRemaining})
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalFilter('approved')}
                  style={{
                    padding: '7px 16px',
                    backgroundColor: approvalFilter === 'approved' ? '#ECFDF5' : 'transparent',
                    color: approvalFilter === 'approved' ? '#059669' : '#64748B',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: approvalFilter === 'approved' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Approved ({approvalRequests.filter(r => r.status === 'approved').length})
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalFilter('rejected')}
                  style={{
                    padding: '7px 16px',
                    backgroundColor: approvalFilter === 'rejected' ? '#FEF2F2' : 'transparent',
                    color: approvalFilter === 'rejected' ? '#DC2626' : '#64748B',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: approvalFilter === 'rejected' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Rejected ({approvalRequests.filter(r => r.status === 'rejected').length})
                </button>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                {currentFiltered.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '18px' }}>
                      ✓
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', margin: 0 }}>No records found in this queue</h4>
                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      {approvalFilter === 'pending'
                        ? 'You are all caught up! There are currently no pending leave applications awaiting review.'
                        : `No applications have been moved to ${approvalFilter} yet.`}
                    </p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Employee</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Leave Category</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Duration</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Justification</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Resolution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentFiltered.map((req) => (
                        <tr
                          key={req.id}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            opacity: req.animating ? 0 : 1,
                            transform: req.animating ? 'scale(0.96) translateX(20px)' : 'scale(1) translateX(0)',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: req.avatarBg, color: req.avatarColor, fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {req.initials}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, color: '#0F172A' }}>{req.name}</p>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>{req.role} • {req.empId}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ backgroundColor: req.type.includes('Sick') ? '#ECFDF5' : '#EEF2FF', color: req.type.includes('Sick') ? '#059669' : '#4F46E5', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>
                             {req.type}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 500 }}>{req.duration}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B', maxWidth: '200px' }}>{req.reason}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            {req.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDecision(req.id, 'approved')}
                                  style={{
                                    padding: '7px 16px',
                                    backgroundColor: '#10B981',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)'
                                  }}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDecision(req.id, 'rejected')}
                                  style={{
                                    padding: '7px 16px',
                                    backgroundColor: '#FEE2E2',
                                    color: '#DC2626',
                                    border: '1px solid #FECACA',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            ) : req.status === 'approved' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px' }}>
                                ✓ Approved
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF2F2', color: '#DC2626', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '11px' }}>
                                ✕ Rejected
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        }

        case 'employee-admin':
          return (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Staff Directory &amp; Biometric Cluster</h1>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>48 Active Biometric Profiles Registered</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    backgroundColor: '#4F46E5',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(79, 70, 229, 0.25)'
                  }}
                >
                  <span>+</span> Onboard New Member
                </button>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Employee</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Emp ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Department</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Biometric Reader</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>Arpit Singla</td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>EMP-1042</td>
                      <td style={{ padding: '14px 16px', color: '#334155' }}>Engineering</td>
                      <td style={{ padding: '14px 16px', color: '#4F46E5', fontFamily: 'monospace' }}>BIO-88319</td>
                      <td style={{ padding: '14px 16px' }}><span style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>● In Office</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>Priya Sharma</td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>EMP-1048</td>
                      <td style={{ padding: '14px 16px', color: '#334155' }}>Product Design</td>
                      <td style={{ padding: '14px 16px', color: '#4F46E5', fontFamily: 'monospace' }}>BIO-88325</td>
                      <td style={{ padding: '14px 16px' }}><span style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>● In Office</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>Rahul Verma</td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>EMP-1045</td>
                      <td style={{ padding: '14px 16px', color: '#334155' }}>Quality Assurance</td>
                      <td style={{ padding: '14px 16px', color: '#4F46E5', fontFamily: 'monospace' }}>BIO-88320</td>
                      <td style={{ padding: '14px 16px' }}><span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>● On Leave</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );

        default:
          return <ProfileUpdate />;
      }
    }

    // Employee Portal Screens
    switch (currentTab) {
      case 'dashboard':
        return (
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Overview Dashboard</h1>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                Real-time attendance summaries, shift punch metrics, and quota utilization.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Present Today</p>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: '8px 0 0 0' }}>118 <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>/ 120 Total</span></p>
                <p style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, margin: '4px 0 0 0' }}>98.3% Attendance rate</p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>On Leave</p>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#F59E0B', margin: '8px 0 0 0' }}>2 <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Employees</span></p>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>1 Planned • 1 Sick Leave</p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>On-Time Streak</p>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#4F46E5', margin: '8px 0 0 0' }}>14 <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Days</span></p>
                <p style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 600, margin: '4px 0 0 0' }}>Top 5% punctual on floor</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>LEAVE APPLICATIONS</h3>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>Showing recent requests and status records</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabSelect('apply-leave')}
                  style={{ padding: '7px 14px', backgroundColor: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Apply New Leave
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Employee</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Leave Type</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Dates</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>AS</div>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>Arpit Singla</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: '#475569' }}>Casual Leave</td>
                      <td style={{ padding: '12px', color: '#64748B' }}>Sep 18 - Sep 19 (2d)</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>Pending Review</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>RV</div>
                          <span style={{ fontWeight: 600, color: '#0F172A' }}>Rahul Verma</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: '#475569' }}>Sick Leave</td>
                      <td style={{ padding: '12px', color: '#64748B' }}>Sep 10 - Sep 11 (2d)</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>Approved</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Biometric Attendance Log</h1>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', marginBottom: '20px' }}>Daily clock-in, clock-out, and overtime records.</p>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Punch In</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Punch Out</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Work Duration</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>Today (Sep 14)</td>
                    <td style={{ padding: '14px 16px', color: '#10B981', fontWeight: 600 }}>09:30 AM</td>
                    <td style={{ padding: '14px 16px', color: '#64748B' }}>--</td>
                    <td style={{ padding: '14px 16px', color: '#334155' }}>In Progress</td>
                    <td style={{ padding: '14px 16px' }}><span style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '11px' }}>On Time</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'apply-leave':
      case 'leaves':
        return (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Apply for Time-Off</h1>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', marginBottom: '20px' }}>Submit planned absence requests for managerial sign-off.</p>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <form onSubmit={(e) => { e.preventDefault(); alert('Leave request submitted to Harsh Suri!'); handleTabSelect('dashboard'); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Leave Category *</label>
                  <select style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', outline: 'none' }}>
                    <option>Casual Leave (Paid) — 8 Days Available</option>
                    <option>Sick / Medical Leave — 5 Days Available</option>
                    <option>Compensatory Off</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>From Date *</label>
                    <input type="date" required style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>To Date *</label>
                    <input type="date" required style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Reason / Justification *</label>
                  <textarea rows={3} required placeholder="Provide brief context for your reporting manager..." style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => handleTabSelect('dashboard')} style={{ padding: '9px 16px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Submit Request →</button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      <Header
        activeTab={currentTab}
        onNavigate={handleTabSelect}
        isMobile={isMobile}
        onToggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Mobile Backdrop Overlay */}
        {isMobile && mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              zIndex: 40,
              backdropFilter: 'blur(2px)'
            }}
          />
        )}

        {/* Sidebar */}
        <div style={{
          position: isMobile ? 'fixed' : 'static',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: isMobile ? 50 : 'auto',
          transform: isMobile && !mobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isMobile && mobileMenuOpen ? '4px 0 20px rgba(0,0,0,0.15)' : 'none'
        }}>
          <Sidebar currentTab={currentTab} setCurrentTab={handleTabSelect} />
        </div>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          padding: isMobile ? '16px' : '24px 32px',
          minWidth: 0,
          overflowX: 'auto'
        }}>
          {renderContent()}
        </main>
      </div>

      {/* Onboard / Add Member Modal */}
      {showAddMemberModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Provision New Member</h3>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>Assign corporate credentials and biometric hardware</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                style={{ border: 'none', background: 'transparent', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Member ${newMember.fullName || 'User'} (${newMember.empId}) successfully onboarded and mapped to biometric hardware!`);
                setShowAddMemberModal(false);
                setNewMember({
                  fullName: '',
                  empId: '',
                  department: 'Engineering',
                  role: 'Employee',
                  biometricId: '',
                  workEmail: ''
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newMember.fullName}
                    onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-1052"
                    value={newMember.empId}
                    onChange={(e) => setNewMember({ ...newMember, empId: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Corporate Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya.sharma@company.com"
                  value={newMember.workEmail}
                  onChange={(e) => setNewMember({ ...newMember, workEmail: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Department</label>
                  <select
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="DevOps / Cloud">DevOps / Cloud</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Hardware Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BIO-99201"
                    value={newMember.biometricId}
                    onChange={(e) => setNewMember({ ...newMember, biometricId: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  style={{ padding: '8px 14px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}