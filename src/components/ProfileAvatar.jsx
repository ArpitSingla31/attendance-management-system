import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export function resolveAvatarUrl(value) {
  if (!value || value.startsWith('data:') || value.startsWith('blob:') || /^https?:\/\//i.test(value)) return value || '';
  return `${API_URL.replace(/\/$/, '')}${value.startsWith('/') ? value : `/${value}`}`;
}

export default function ProfileAvatar({ person, size = 38 }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = person?.initials || person?.name?.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';
  const imageUrl = resolveAvatarUrl(person?.avatarUrl);
  useEffect(() => setImageFailed(false), [imageUrl]);

  return <span role="img" aria-label={`${person?.name || 'Employee'} profile picture`} style={{ width: size, height: size, flex: `0 0 ${size}px`, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: '50%', border: '1px solid #DBEAFE', background: '#EEF2FF', color: '#4338CA', fontSize: Math.max(10, Math.round(size * .34)), fontWeight: 800 }}>
    {imageUrl && !imageFailed ? <img src={imageUrl} alt="" crossOrigin="use-credentials" onError={() => setImageFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : initials}
  </span>;
}
