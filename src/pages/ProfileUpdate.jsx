import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '11px 12px', background: '#F8FAFC',
  border: '1px solid #CBD5E1', borderRadius: '9px', color: '#0F172A', fontSize: '14px'
};
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 650, color: '#334155', marginBottom: '7px' };

function initials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length > 1 ? `${words[0][0]}${words.at(-1)[0]}`.toUpperCase() : (words[0] || '?').slice(0, 2).toUpperCase();
}

async function makePhotoDataUrl(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG or WebP image.');
  }
  if (file.size > 8 * 1024 * 1024) throw new Error('Choose an image smaller than 8 MB.');
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = objectUrl;
  try { await image.decode(); }
  catch { URL.revokeObjectURL(objectUrl); throw new Error('This photo could not be opened. Choose another image.'); }
  const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) { URL.revokeObjectURL(objectUrl); throw new Error('Your browser could not process this photo.'); }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(objectUrl);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
  if (dataUrl.length > 1000000) throw new Error('This photo is too large. Choose a smaller image.');
  return dataUrl;
}

export default function ProfileUpdate() {
  const { currentUser, updateProfile } = useAuth();
  const fileInput = useRef(null);
  const [form, setForm] = useState({ name: currentUser?.name || '', designation: currentUser?.designation || '', contactPhone: currentUser?.contactPhone || '' });
  const [photoData, setPhotoData] = useState(undefined);
  const [previewUrl, setPreviewUrl] = useState(currentUser?.avatarUrl || null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const changeField = (field) => (event) => setForm((old) => ({ ...old, [field]: event.target.value }));

  const pickPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    try {
      const dataUrl = await makePhotoDataUrl(file);
      setPhotoData(dataUrl);
      setPreviewUrl(dataUrl);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      event.target.value = '';
    }
  };

  const removePhoto = () => {
    setPhotoData('');
    setPreviewUrl(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const user = await updateProfile({ ...form, ...(photoData !== undefined ? { avatarData: photoData } : {}) });
      setPreviewUrl(user.avatarUrl || null);
      setPhotoData(undefined);
      setMessage({ type: 'success', text: 'Profile changes saved.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ width: '100%', maxWidth: '850px', margin: '0 auto', padding: 'clamp(16px, 4vw, 32px)', boxSizing: 'border-box' }}>
      <header className="dashboard-hero" style={{ marginBottom: '18px' }}>
        <p style={{ color: '#C7D2FE', fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 7 }}>Your account</p>
        <h1 style={{ fontSize: '26px', lineHeight: 1.25, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Profile settings</h1>
        <p style={{ fontSize: '13px', color: '#E0E7FF', margin: '8px 0 0' }}>Update the details and photo your team sees. Your changes are saved to your account.</p>
      </header>

      {message && <div role={message.type === 'error' ? 'alert' : 'status'} style={{ padding: '12px 14px', marginBottom: '16px', borderRadius: '10px', background: message.type === 'error' ? '#FEF2F2' : '#ECFDF5', color: message.type === 'error' ? '#B91C1C' : '#047857', fontSize: '14px' }}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="surface-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: 'clamp(16px, 4vw, 26px)', boxShadow: '0 1px 3px rgba(15,23,42,.04)' }}>
        <section style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', paddingBottom: '22px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ width: '76px', height: '76px', flex: '0 0 76px', borderRadius: '50%', overflow: 'hidden', display: 'grid', placeItems: 'center', background: '#EEF2FF', color: '#4338CA', fontSize: '24px', fontWeight: 750, border: '2px solid #E0E7FF' }}>
            {previewUrl ? <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(form.name)}
          </div>
          <div style={{ flex: '1 1 190px', minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: '16px', color: '#0F172A', overflowWrap: 'anywhere' }}>{form.name || 'Your profile'}</h2>
            <p style={{ margin: '4px 0 10px', fontSize: '13px', color: '#64748B' }}>{currentUser?.role}{currentUser?.department ? ` · ${currentUser.department}` : ''}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => fileInput.current?.click()} style={{ border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#334155', borderRadius: '8px', padding: '8px 11px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Choose photo</button>
              {previewUrl && <button type="button" onClick={removePhoto} style={{ border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', borderRadius: '8px', padding: '8px 11px', fontSize: '13px', cursor: 'pointer' }}>Remove</button>}
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} style={{ display: 'none' }} aria-label="Choose profile photo" />
            </div>
            <p style={{ margin: '7px 0 0', fontSize: '11px', color: '#94A3B8' }}>JPG, PNG or WebP · cropped to a small square for faster loading</p>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '18px 16px', paddingTop: '22px' }}>
          <label style={labelStyle}>Full name
            <input required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={changeField('name')} style={{ ...inputStyle, marginTop: '7px' }} />
          </label>
          <label style={labelStyle}>Account email
            <input readOnly value={currentUser?.email || 'No email on account'} style={{ ...inputStyle, marginTop: '7px', color: '#64748B', background: '#F1F5F9' }} />
          </label>
          <label style={labelStyle}>Contact phone
            <input type="tel" autoComplete="tel" maxLength={30} value={form.contactPhone} onChange={changeField('contactPhone')} placeholder="Add a contact number" style={{ ...inputStyle, marginTop: '7px' }} />
          </label>
          <label style={labelStyle}>Job title
            <input maxLength={80} value={form.designation} onChange={changeField('designation')} placeholder="For example, Software Engineer" style={{ ...inputStyle, marginTop: '7px' }} />
          </label>
          <label style={labelStyle}>Department
            <input readOnly value={currentUser?.department || 'Not assigned'} style={{ ...inputStyle, marginTop: '7px', color: '#64748B', background: '#F1F5F9' }} />
          </label>
          <label style={labelStyle}>Access level
            <input readOnly value={currentUser?.role || ''} style={{ ...inputStyle, marginTop: '7px', color: '#64748B', background: '#F1F5F9' }} />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '22px', marginTop: '22px', borderTop: '1px solid #F1F5F9' }}>
          <button type="submit" disabled={busy} style={{ width: '100%', maxWidth: '200px', padding: '11px 16px', background: busy ? '#818CF8' : '#4F46E5', color: '#FFFFFF', fontWeight: 650, fontSize: '14px', borderRadius: '9px', border: 0, cursor: busy ? 'wait' : 'pointer' }}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </main>
  );
}
