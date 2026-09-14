import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileUpdate() {
  const { currentUser, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '+91 98765 43210',
    designation: currentUser?.designation || '',
    department: currentUser?.department || '',
    biometricId: currentUser?.biometricId || '',
    avatarBg: currentUser?.avatarBg || 'indigo'
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '+91 98765 43210',
        designation: currentUser.designation || '',
        department: currentUser.department || '',
        biometricId: currentUser.biometricId || '',
        avatarBg: currentUser.avatarBg || 'indigo'
      });
    }
  }, [currentUser]);

  const computeInitials = (nameStr) => {
    if (!nameStr) return '??';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const previewInitials = computeInitials(formData.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      ...formData,
      initials: previewInitials
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
          User Profile Settings
        </h1>
        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
          Manage your personal identity, avatar branding, biometric hardware sync, and contact coordinates.
        </p>
      </div>

      {saved && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          fontSize: '12px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✓</span> Profile settings and avatar initials updated successfully!
        </div>
      )}

      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        
        {/* Dynamic Avatar Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: formData.avatarBg === 'purple' ? '#FAF5FF' : '#EEF2FF',
            color: formData.avatarBg === 'purple' ? '#7E22CE' : '#4F46E5',
            border: '2px solid #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 800,
            flexShrink: 0,
            transition: 'all 0.2s'
          }}>
            {previewInitials}
          </div>

          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              {formData.name || 'Unnamed Employee'}
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
              {currentUser?.role} • {formData.department}
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: '6px',
              fontSize: '10px',
              fontWeight: 600,
              color: '#4F46E5',
              backgroundColor: '#EEF2FF',
              border: '1px solid #E0E7FF',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              Biometric Hardware ID: {formData.biometricId}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Corporate Work Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Designation / Title
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Assigned Department (System Locked)
              </label>
              <input
                type="text"
                disabled
                value={formData.department}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', color: '#64748B', cursor: 'not-allowed' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Biometric Reader ID (Hardware Locked)
              </label>
              <input
                type="text"
                disabled
                value={formData.biometricId}
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', color: '#64748B', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(79, 70, 229, 0.25)'
              }}
            >
              Save Profile Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}