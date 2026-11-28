import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { parseDocument, ProjectsService } from './projects.service';

const owner = { user: { id: 'u', email: 'a@example.com', username: null, mustChangePassword: false }, tenantId: 'tenant-a', role: 'OWNER' };
const id = '11111111-1111-4111-8111-111111111111';

describe('project drafts', () => {
  it('rejects arbitrary fields and invalid Minecraft values', () => {
    expect(() => parseDocument({ kind: 'block', identifier: 'test_block', displayName: 'Test', lightLevel: 16, hardness: 1 })).toThrow(BadRequestException);
    expect(parseDocument({ kind: 'item', identifier: 'test_item', displayName: ' Test ', stackSize: 64, executable: 'unsafe' }))
      .toEqual({ kind: 'item', identifier: 'test_item', displayName: 'Test', stackSize: 64 });
  });

  it('restricts reads to the authenticated tenant', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const service = new ProjectsService({ project: { findFirst } } as never);
    await expect(service.get(owner, id)).rejects.toThrow(NotFoundException);
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id, tenantId: 'tenant-a', status: { not: 'DELETED' } },
    }));
  });

  it('enforces the active project entitlement in the same serializable transaction', async () => {
    const transaction = vi.fn(async (action: (tx: unknown) => Promise<unknown>, options: unknown) => {
      expect(options).toEqual({ isolationLevel: 'Serializable' });
      return action({
        subscription: { findFirst: vi.fn().mockResolvedValue({ planVersion: { entitlements: { activeProjects: 2 } } }) },
        project: { count: vi.fn().mockResolvedValue(2), create: vi.fn() },
      });
    });
    const service = new ProjectsService({
      compatibilityProfile: { findUnique: vi.fn().mockResolvedValue({ id, status: 'CANDIDATE' }) },
      $transaction: transaction,
    } as never);
    await expect(service.create(owner, { name: 'Lamp', profileId: id, document: { kind: 'block', identifier: 'lamp', displayName: 'Lamp', lightLevel: 0, hardness: 1 } }))
      .rejects.toThrow(ForbiddenException);
  });
});
