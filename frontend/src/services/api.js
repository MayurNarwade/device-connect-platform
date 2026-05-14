import { API_BASE } from '../utils/constants';

export async function createSession() {
  const res = await fetch(`${API_BASE}/session`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function joinSession(otp) {
  const res = await fetch(`${API_BASE}/session/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Invalid OTP');
  }
  return res.json();
}

export async function getTurnCredentials() {
  const res = await fetch(`${API_BASE}/turn/credentials`);
  if (!res.ok) throw new Error('Failed to fetch TURN credentials');
  return res.json();
}