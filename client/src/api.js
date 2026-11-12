// In development Vite proxies /api to Express. In production set VITE_API_URL
// to the deployed API origin, e.g. https://inventory-api.onrender.com
const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api`;

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: body && JSON.stringify(body),
  });

  // Expired or missing token on a protected route: send the user back to login
  if (res.status === 401 && !path.startsWith('/auth')) {
    localStorage.removeItem('token');
    window.location.assign('/login');
  }

  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}
