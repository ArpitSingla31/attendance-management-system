import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { useIsMobile } from '../hooks/useMediaQuery';

function explainFirebaseError(error) {
  const code = error?.code || error?.message?.match(/auth\/[a-z-]+/)?.[0] || '';
  const messages = {
    'auth/invalid-phone-number': 'Firebase rejected this phone number. Enter it with country code, for example +919876543210.',
    'auth/operation-not-allowed': 'Phone sign-in is disabled. Enable Phone under Firebase Console → Authentication → Sign-in method.',
    'auth/invalid-app-credential': 'Firebase rejected the reCAPTCHA credential. Add localhost to Firebase Authorized domains and check API-key HTTP referrer restrictions.',
    'auth/captcha-check-failed': 'Firebase could not verify reCAPTCHA. Reload the page, allow Google reCAPTCHA scripts, and verify localhost is authorized.',
    'auth/api-key-not-valid': 'The Firebase Web API key is invalid or restricted. Check VITE_FIREBASE_API_KEY in .env and its Google Cloud API restrictions.',
    'auth/unauthorized-domain': 'This website domain is not authorized. Add localhost under Firebase Authentication → Settings → Authorized domains.',
    'auth/quota-exceeded': 'Firebase SMS quota is exhausted for this project. Check Firebase usage and billing limits.',
    'auth/too-many-requests': 'Firebase temporarily blocked verification attempts. Wait before requesting another code.',
    'auth/network-request-failed': 'The Firebase request could not reach Google. Check your internet connection, firewall, and browser extensions.'
  };
  return messages[code] || `Firebase sign-in failed${code ? ` (${code})` : ''}: ${error?.message || 'Check the Firebase Console and try again.'}`;
}
import { GoogleAuthProvider, inMemoryPersistence, RecaptchaVerifier, setPersistence, signInWithPhoneNumber, signInWithPopup, signOut } from 'firebase/auth';
import { firebaseAuth, firebaseConfigured } from '../firebase';

export default function Login() {
  const { login, signup, loginWithFirebase } = useAuth();
  const isMobile = useIsMobile(860);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);
  const [authMethod, setAuthMethod] = useState('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaRef = useRef(null);
  const recaptchaElementRef = useRef(null);
  const [recaptchaKey, setRecaptchaKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => () => {
    recaptchaRef.current?.clear();
    recaptchaRef.current = null;
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setAuthError('');
    try {
      if (isSignup) await signup({ name, email, password, department });
      else await login({ email, password });
    } catch (error) {
      setAuthError(error.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!firebaseConfigured || !firebaseAuth) {
      setAuthError('Google sign-in is not configured yet. Add the Firebase web settings to .env and restart the app.');
      return;
    }
    setGoogleBusy(true);
    setAuthError('');
    try {
      await setPersistence(firebaseAuth, inMemoryPersistence);
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      await loginWithFirebase(await result.user.getIdToken());
    } catch (error) {
      setAuthError(error.code === 'auth/popup-closed-by-user' ? 'Google sign-in was cancelled.' : explainFirebaseError(error));
    } finally {
      if (firebaseAuth) await signOut(firebaseAuth).catch(() => {});
      setGoogleBusy(false);
    }
  };

  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    if (!firebaseConfigured || !firebaseAuth) {
      setAuthError('Phone sign-in is not configured yet. Add the Firebase web settings to .env and restart the app.');
      return;
    }
    if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber.trim())) {
      setAuthError('Enter your mobile number with country code, for example +919876543210.');
      return;
    }
    setGoogleBusy(true);
    setAuthError('');
    try {
      await setPersistence(firebaseAuth, inMemoryPersistence);
      if (!recaptchaRef.current) {
        if (!recaptchaElementRef.current) throw new Error('Phone verification is not ready. Reload the page and try again.');
        recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, recaptchaElementRef.current, { size: 'invisible' });
      }
      await recaptchaRef.current.render();
      const confirmation = await signInWithPhoneNumber(firebaseAuth, phoneNumber.trim(), recaptchaRef.current);
      setConfirmationResult(confirmation);
      setOtp('');
    } catch (error) {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
      setRecaptchaKey((key) => key + 1);
      setAuthError(explainFirebaseError(error));
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!confirmationResult || !/^\d{6}$/.test(otp)) {
      setAuthError('Enter the 6-digit code sent to your phone.');
      return;
    }
    setGoogleBusy(true);
    setAuthError('');
    let verifiedUser;
    try {
      const result = await confirmationResult.confirm(otp);
      verifiedUser = result.user;
      await loginWithFirebase(await result.user.getIdToken(), phoneName.trim());
      setConfirmationResult(null);
    } catch (error) {
      setAuthError(error.code === 'auth/invalid-verification-code' ? 'That code is incorrect. Check the SMS and try again.' : explainFirebaseError(error));
    } finally {
      if (verifiedUser && firebaseAuth) await signOut(firebaseAuth).catch(() => {});
      setGoogleBusy(false);
    }
  };

  const switchAuthMethod = (method) => {
    setAuthMethod(method);
    setAuthError('');
    setOtp('');
    setConfirmationResult(null);
    recaptchaRef.current?.clear();
    recaptchaRef.current = null;
    setRecaptchaKey((key) => key + 1);
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
        <Logo subtitle={isMobile ? 'Attendance' : 'Leave & Attendance System'} />
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              <span style={{ color: '#334155' }}>Secure Sign In</span>
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
          display: isMobile ? 'none' : 'flex',
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
                    Check in and out, then review your saved workday history.
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
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: isMobile ? 1 : '0.8',
          minHeight: isMobile ? 'calc(100vh - 64px)' : 'auto',
          padding: isMobile ? '24px 18px' : '40px 60px'
        }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{authMethod === 'phone' ? confirmationResult ? 'Verify your phone' : 'Sign in with mobile' : isSignup ? 'Create your account' : 'Welcome Back'}</h2>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', marginBottom: '24px' }}>
              {authMethod === 'phone' ? 'We’ll text a one-time code to verify your mobile number.' : isSignup ? 'Create an employee account to access attendance and leave tools.' : 'Sign in to access your attendance and leave account.'}
            </p>

            <div role="tablist" aria-label="Sign-in method" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '4px', background: '#F1F5F9', borderRadius: '10px', marginBottom: '18px' }}>
              {['email', 'phone'].map((method) => <button key={method} type="button" role="tab" aria-selected={authMethod === method} onClick={() => switchAuthMethod(method)} style={{ padding: '9px 8px', border: 0, borderRadius: '7px', background: authMethod === method ? '#FFFFFF' : 'transparent', color: authMethod === method ? '#312E81' : '#64748B', boxShadow: authMethod === method ? '0 1px 3px rgba(15,23,42,.12)' : 'none', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>{method === 'email' ? 'Email & Password' : 'Mobile OTP'}</button>)}
            </div>

            <form onSubmit={authMethod === 'phone' ? confirmationResult ? handleVerifyPhoneOtp : handleSendPhoneOtp : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {authMethod === 'phone' ? <>
                <div>
                  <label htmlFor="phone-name" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Full name</label>
                  <input id="phone-name" type="text" autoComplete="name" required minLength={2} maxLength={100} value={phoneName} onChange={(event) => setPhoneName(event.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', color: '#0F172A' }} />
                </div>
                <div>
                  <label htmlFor="phone-number" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Mobile number</label>
                  <input id="phone-number" type="tel" inputMode="tel" autoComplete="tel" required disabled={Boolean(confirmationResult)} value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+919876543210" pattern="\+[1-9][0-9]{7,14}" title="Use international format with country code, such as +919876543210" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', color: '#0F172A' }} />
                </div>
                {confirmationResult && <div>
                  <label htmlFor="phone-otp" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>6-digit verification code</label>
                  <input id="phone-otp" type="text" inputMode="numeric" autoComplete="one-time-code" required maxLength={6} pattern="[0-9]{6}" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '16px', letterSpacing: '.25em', color: '#0F172A' }} />
                  <button type="button" onClick={() => { setConfirmationResult(null); setOtp(''); setAuthError(''); }} style={{ marginTop: '8px', padding: 0, border: 0, background: 'none', color: '#4F46E5', fontWeight: 600, fontSize: '11px', cursor: 'pointer' }}>Use a different number or resend code</button>
                </div>}
                <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>New phone sign-ins create an Employee account. Enter your name to finish setup.</p>
                <div key={recaptchaKey} id="phone-recaptcha" ref={recaptchaElementRef} />
              </> : <>
              {isSignup && !isMobile && <div>
                <label htmlFor="signup-name" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Full name</label>
                <input id="signup-name" type="text" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', color: '#0F172A' }} />
              </div>}
              {isSignup && <div>
                <label htmlFor="signup-department" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Department (optional)</label>
                <input id="signup-department" type="text" maxLength={80} value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', color: '#0F172A' }} />
              </div>}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  {isSignup ? 'Work Email' : 'Work email or employee ID'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    type={isSignup ? 'email' : 'text'}
                    autoComplete={isSignup ? 'email' : 'username'}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isSignup ? 'name@company.com' : 'Email or employee ID'}
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
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    minLength={isSignup ? 10 : undefined}
                    maxLength={128}
                    required
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
                        <path d="M1,12 C5,4 8,4 12,4 C19,4 23,12 23,12 C19,20 16,20 12,20 C5,20 1,12 1,12 Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {!isSignup && <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>Your session refreshes securely for up to 7 days.</p>}
              </>}

              {authError && <p role="alert" style={{ margin: 0, color: '#BE123C', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', padding: '10px 12px', fontSize: '12px' }}>{authError}</p>}

              <button
                type="submit"
                disabled={busy || googleBusy}
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: busy ? 'wait' : 'pointer',
                  boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)'
                }}
              >
                {busy || googleBusy ? 'Please wait…' : authMethod === 'phone' ? confirmationResult ? 'Verify & Continue →' : 'Send verification code →' : isSignup ? 'Create Employee Account →' : 'Sign In →'}
              </button>
            </form>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 14px', color: '#94A3B8', fontSize: '10px', fontWeight: 700, letterSpacing: '.05em' }}>
              <span style={{ flex: 1, borderTop: '1px solid #E2E8F0' }} /> OR CONTINUE WITH <span style={{ flex: 1, borderTop: '1px solid #E2E8F0' }} />
            </div>
            <button type="button" disabled={busy || googleBusy} onClick={handleGoogleSignIn} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px', border: '1px solid #CBD5E1', borderRadius: '8px', background: '#FFFFFF', color: '#1F2937', fontWeight: 600, fontSize: '13px', cursor: busy || googleBusy ? 'wait' : 'pointer', opacity: busy || googleBusy ? .7 : 1 }}>
              <img src="/google-login.png" alt="" aria-hidden="true" width="26" height="26" style={{ display: 'block', objectFit: 'contain' }} />
              {googleBusy ? 'Connecting to Google…' : 'Continue with Google'}
            </button>
            {authMethod === 'email' ? <p style={{ textAlign: 'center', fontSize: '11px', color: '#64748B', marginTop: '22px' }}>
              {isSignup ? 'Already have an account? ' : 'New team member? '}
              <button type="button" onClick={() => { setIsSignup(!isSignup); setAuthError(''); }} style={{ color: '#4F46E5', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 0, fontSize: 'inherit' }}>
                {isSignup ? 'Sign in' : 'Create an employee account'}
              </button>
            </p> : <p style={{ textAlign: 'center', fontSize: '11px', color: '#64748B', marginTop: '22px' }}>First-time phone sign-ins create an Employee account after verification.</p>}
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
