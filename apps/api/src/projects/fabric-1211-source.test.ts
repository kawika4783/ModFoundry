import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { generateFabric1211Source } from './fabric-1211-source';
import { ProjectsService } from './projects.service';

const profile = { key: 'java-1.21.1-fabric-candidate', revision: 1, edition: 'JAVA', gameVersion: '1.21.1', loader: 'FABRIC' };
const projectId = '11111111-1111-4111-8111-111111111111';
const targetId = '22222222-2222-4222-8222-222222222222';
const owner = { user: { id: 'u', email: 'owner@example.com', username: null, mustChangePassword: false }, tenantId: 'tenant-a', role: 'OWNER' };

describe('Java 1.21.1 Fabric source preview', () => {
  it('emits deterministic, version-scoped item resources without Java injection', () => {
    const document = { kind: 'item', identifier: 'copper_lantern', displayName: 'Copper "Lantern"\n\u2603', stackSize: 16 };
    const result = generateFabric1211Source(profile, 'copper-lantern-ab12cd34', document);
    expect(result).toEqual(generateFabric1211Source(profile, 'copper-lantern-ab12cd34', document));
    expect(result.status).toBe('UNTESTED_SOURCE');
    expect(result.files['src/main/java/com/modfoundry/generated/ModFoundryMod.java']).toContain('new Item.Settings().maxCount(16)');
    expect(JSON.parse(result.files['src/main/resources/fabric.mod.json']).name).toBe(document.displayName);
    expect(result.files['src/main/java/com/modfoundry/generated/ModFoundryMod.java']).not.toContain(document.displayName);
    expect(Object.keys(result.files)).toContain('src/main/resources/assets/mf_copper_lantern_ab12cd34/models/item/copper_lantern.json');
  });

  it('emits a block model, state and loot table, and rejects unsupported profiles', () => {
    const result = generateFabric1211Source(profile, 'lamp-abcdef12', { kind: 'block', identifier: 'lamp', displayName: 'Lamp', hardness: 2.5, lightLevel: 12 });
    expect(result.files['src/main/java/com/modfoundry/generated/ModFoundryMod.java']).toContain('strength(2.5f).luminance(state -> 12)');
    expect(JSON.parse(result.files['src/main/resources/assets/mf_lamp_abcdef12/blockstates/lamp.json']).variants[''].model).toBe('mf_lamp_abcdef12:block/lamp');
    expect(JSON.parse(result.files['src/main/resources/data/mf_lamp_abcdef12/loot_table/blocks/lamp.json']).type).toBe('minecraft:block');
    expect(() => generateFabric1211Source({ ...profile, gameVersion: '1.20.1' }, 'lamp-abcdef12', { kind: 'item', identifier: 'lamp', displayName: 'Lamp', stackSize: 1 })).toThrow(BadRequestException);
  });

  it('restricts source reads to an owned project target', async () => {
    const findFirst = vi.fn().mockResolvedValue({ id: projectId, slug: 'lamp-abcdef12', targets: [] });
    const findProfile = vi.fn();
    const service = new ProjectsService({ project: { findFirst }, compatibilityProfile: { findUniqueOrThrow: findProfile } } as never);
    await expect(service.source(owner, projectId, targetId)).rejects.toThrow(NotFoundException);
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: projectId, tenantId: 'tenant-a', status: { not: 'DELETED' } } }));
    expect(findProfile).not.toHaveBeenCalled();
  });
});
