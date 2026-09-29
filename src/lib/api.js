const API_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(API_URL + '/api' + path, {
      ...options,
      credentials: 'include',
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
    });
  } catch {
    throw new Error('Cannot reach the Attendance API. Start it with “npm run server” and check the project .env.');
  }
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    if (!payload?.message && response.status === 404) throw new Error('The API route was not found. Restart the server after updating the project.');
    throw new Error(payload?.message || 'The Attendance API returned HTTP ' + response.status + '.');
  }
  return payload;
}
