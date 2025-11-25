import apiClient from '../api/client';

export async function restoreSession() {
  const token = localStorage.getItem('access_token');
  if (!token) return { authed: false, me: null };
  
  try {
    const { data } = await apiClient.get('/auth/me');
    return { authed: true, me: data ?? null };
  } catch {
    // interceptor already clears storage/redirects on 401
    return { authed: false, me: null };
  }
}