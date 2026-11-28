import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('session validation', () => {
  const identity = { id: 'user', email: 'person@example.com', username: null, mustChangePassword: false };
  const session = {
    revokedAt: null, expiresAt: new Date(Date.now() + 60000), tenantId: 'tenant-a',
    csrfHash: '', user: { ...identity, status: 'ACTIVE', memberships: [
      { tenantId: 'tenant-b', role: 'VIEWER' }, { tenantId: 'tenant-a', role: 'OWNER' },
    ] },
  };
  it('uses the tenant bound to the session, even with multiple memberships', async () => {
    const service = new AuthService({ session: { findUnique: vi.fn().mockResolvedValue(session) } } as never);
    const request = { cookies: { modfoundry_session: 'valid-token' }, header: vi.fn() };
    const result = await service.requireIdentity(request as never);
    expect(result.tenantId).toBe('tenant-a');
    expect(result.role).toBe('OWNER');
  });
  it('rejects a mutation without the matching CSRF cookie and header', async () => {
    const service = new AuthService({ session: { findUnique: vi.fn().mockResolvedValue(session) } } as never);
    const request = { cookies: { modfoundry_session: 'valid-token' }, header: vi.fn().mockReturnValue('attacker-token') };
    await expect(service.requireIdentity(request as never, true)).rejects.toThrow(ForbiddenException);
  });
  it('rejects expired sessions', async () => {
    const service = new AuthService({ session: { findUnique: vi.fn().mockResolvedValue({ ...session, expiresAt: new Date(0) }) } } as never);
    await expect(service.requireIdentity({ cookies: { modfoundry_session: 'expired-token' } } as never)).rejects.toThrow(UnauthorizedException);
  });
});
