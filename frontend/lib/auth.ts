export const setToken = (token: string) => {
  localStorage.setItem('token', token);
  // Also set cookie for middleware
  document.cookie = `token=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  // Clear cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const getUserFromToken = (): { id: number; email: string; role: string } | null => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};
