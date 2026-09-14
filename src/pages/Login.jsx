import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function Login() {
  const { login } = useAuth();
  const isMobile = useIsMobile(860);

  const [email, setEmail] = useState('arpit.singla@company.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Activation Request Modal State
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationData, setActivationData] = useState({
    empId: '',
    fullName: '',
    workEmail: '',
    department: 'Engineering',
    customDepartment: ''
  });
  const [activationSubmitted, setActivationSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.toLowerCase().includes('harsh') || email.toLowerCase().includes('manager')) {
      login('manager');
    } else {
      login('employee');
    }
  };

  const handleActivationSubmit = (e) => {
    e.preventDefault();
    setActivationSubmitted(true);
    setTimeout(() => {
      setActivationSubmitted(false);
      setShowActivationModal(false);
      setActivationData({
        empId: '',
        fullName: '',
        workEmail: '',
        department: 'Engineering',
        customDepartment: ''
      });
      alert('Activation request submitted! Your reporting director will verify and activate your account.');
    }, 1600);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Top Navbar */}
      <header style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 32px'
      }}>
        <Logo subtitle="Leave & Attendance System" />
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              <span style={{ color: '#334155' }}>SSO Active</span>
            </div>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span style={{ cursor: 'pointer' }}>Helpdesk Support</span>
          </div>
        )}
      </header>

      {/* Main Responsive Body Split */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: 1 }}>
        
        {/* Left Informational Panel */}
        <div style={{
          flex: isMobile ? 'none' : '1.2',
          backgroundColor: '#F3F6FA',
          borderRight: isMobile ? 'none' : '1px solid #E2E8F0',
          borderBottom: isMobile ? '1px solid #E2E8F0' : 'none',
          padding: isMobile ? '32px 20px' : '60px 72px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ maxWidth: '560px' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#4F46E5',
              backgroundColor: '#EEF2FF',
              border: '1px solid #E0E7FF',
              padding: '4px 12px',
              borderRadius: '9999px',
              textTransform: 'uppercase'
            }}>
              Enterprise Portal
            </span>

            <h1 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.25,
              marginTop: '20px',
              letterSpacing: '-0.02em'
            }}>
              Streamlined biometric tracking &amp; seamless leave management.
            </h1>

            <p style={{
              fontSize: '13px',
              color: '#64748B',
              lineHeight: 1.6,
              marginTop: '14px'
            }}>
              Clock in with one click, submit time-off requests, and monitor your personal leaves and overtime balances in real-time.
            </p>

            {/* Feature Cards */}
            <div style={{ marginTop: isMobile ? '28px' : '48px', display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '420px' }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"></circle>
                    <polyline points="12 7 12 12 15 14"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                    Automated Daily Shift Tracking
                  </h4>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Real-time attendance stamping with grace period verification.
                  </p>
                </div>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#EEF2FF',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                    Live Quota Balancing
                  </h4>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '3px 0 0 0' }}>
                    Instant casual and medical leave approvals with history logs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!isMobile && (
            <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '40px' }}>
              Version 2.4.0 • Privacy &amp; Security Compliance
            </p>
          )}
        </div>

        {/* Right Form Panel */}
        <div style={{
          flex: isMobile ? 'none' : '0.8',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '36px 20px' : '40px 60px'
        }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Welcome Back</h2>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', marginBottom: '24px' }}>
              Sign in to access your attendance and leave account.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Work Email / Employee ID
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px 10px 34px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password with Eye Visibility Toggle */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Password</label>
                  <span style={{ fontSize: '11px', color: '#64748B', cursor: 'pointer' }}>Forgot?</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 36px 10px 34px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      padding: '4px',
                      color: showPassword ? '#4F46E5' : '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="rem" defaultChecked style={{ accentColor: '#4F46E5', cursor: 'pointer' }} />
                <label htmlFor="rem" style={{ fontSize: '12px', color: '#475569', cursor: 'pointer' }}>Remember on this computer</label>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
                }}
              >
                Sign In →
              </button>

              {/* Instant Access Quick Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => login('employee')}
                  style={{
                    padding: '8px',
                    backgroundColor: '#EEF2FF',
                    border: '1px solid #C7D2FE',
                    borderRadius: '6px',
                    color: '#4338CA',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Quick: Employee
                </button>
                <button
                  type="button"
                  onClick={() => login('manager')}
                  style={{
                    padding: '8px',
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    borderRadius: '6px',
                    color: '#7E22CE',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Quick: Manager
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#E2E8F0' }}>
              <div style={{ flex: 1, borderTop: '1px solid #E2E8F0' }}></div>
              <span style={{ margin: '0 10px', fontSize: '10px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em' }}>OR SIGN IN WITH</span>
              <div style={{ flex: 1, borderTop: '1px solid #E2E8F0' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => login('employee')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <span style={{ color: '#EA4335', fontWeight: 700 }}>G</span> Google
              </button>
              <button
                type="button"
                onClick={() => login('manager')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>▦</span> Office 365
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '11px', color: '#64748B', marginTop: '22px' }}>
              New team member?{' '}
              <span
                onClick={() => setShowActivationModal(true)}
                style={{ color: '#4F46E5', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Request account activation
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: Account Activation Request */}
      {showActivationModal && (
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
            maxWidth: '440px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Request Portal Activation</h3>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Provide your company details to link your biometric reader profile.
                </p>
              </div>
              <button
                onClick={() => setShowActivationModal(false)}
                style={{ border: 'none', background: 'transparent', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {activationSubmitted ? (
              <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '28px', color: '#059669', marginBottom: '8px' }}>✓</div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#065F46', margin: 0 }}>Request Dispatched</h4>
                <p style={{ fontSize: '11px', color: '#047857', marginTop: '6px' }}>
                  Your details have been mapped to your reporting director's provisioning queue.
                </p>
              </div>
            ) : (
              <form onSubmit={handleActivationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Assigned Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-1049"
                    value={activationData.empId}
                    onChange={(e) => setActivationData({ ...activationData, empId: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aman Gupta"
                    value={activationData.fullName}
                    onChange={(e) => setActivationData({ ...activationData, fullName: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Corporate Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aman.gupta@company.com"
                    value={activationData.workEmail}
                    onChange={(e) => setActivationData({ ...activationData, workEmail: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Department *
                  </label>
                  <select
                    value={activationData.department}
                    onChange={(e) => setActivationData({ ...activationData, department: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Design">Product Design</option>
                    <option value="DevOps / Cloud">DevOps / Cloud</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Other">Other...</option>
                  </select>

                 
                  {activationData.department === 'Other' && (
                    <input
                      type="text"
                      required
                      placeholder="Please specify your department..."
                      value={activationData.customDepartment}
                      onChange={(e) => setActivationData({ ...activationData, customDepartment: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        marginTop: '8px',
                        padding: '8px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #4F46E5',
                        borderRadius: '6px',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowActivationModal(false)}
                    style={{ padding: '8px 14px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 16px', backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Submit Activation Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}