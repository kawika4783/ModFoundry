export type Profile = { id: string; edition: string; gameVersion: string; loader: string | null; loaderVersion: string | null; status: string; capabilities: Record<string, boolean>; limitations: string[] };
export type DraftDocument = { kind: 'block'; identifier: string; displayName: string; lightLevel: number; hardness: number } | { kind: 'item'; identifier: string; displayName: string; stackSize: number };
export type Project = { id: string; name: string; status: string; targets: Array<{ id: string; documentVersion: number; document: DraftDocument; profile: Profile }> };
export type Identity = { user: { id: string; email: string }; tenantId: string; role: string };

function csrfToken() {
  return decodeURIComponent(document.cookie.split('; ').find(cookie => cookie.startsWith('modfoundry_csrf='))?.split('=')[1] ?? '');
}
export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch('/api/v1' + path, {
    method: options.method ?? 'GET', credentials: 'same-origin',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.method && options.method !== 'GET' && path !== '/auth/register' && path !== '/auth/login' ? { 'X-CSRF-Token': csrfToken() } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({ message: 'Unexpected server response' }));
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Request failed');
  return data as T;
}
