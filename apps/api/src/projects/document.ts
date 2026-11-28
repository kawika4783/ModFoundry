import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const identifier = /^[a-z][a-z0-9_]{1,63}$/;

export function parseDocument(input: unknown): Prisma.InputJsonObject {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new BadRequestException('Invalid editor document');
  const value = input as Record<string, unknown>;
  if (value.kind !== 'block' && value.kind !== 'item') throw new BadRequestException('Only block and item drafts are accepted');
  if (typeof value.identifier !== 'string' || !identifier.test(value.identifier)) throw new BadRequestException('Use a lowercase identifier with letters, digits and underscores');
  if (typeof value.displayName !== 'string' || value.displayName.trim().length < 1 || value.displayName.length > 80) throw new BadRequestException('Invalid display name');
  if (value.kind === 'block') {
    const lightLevel = value.lightLevel, hardness = value.hardness;
    if (!Number.isInteger(lightLevel) || (lightLevel as number) < 0 || (lightLevel as number) > 15 ||
        typeof hardness !== 'number' || !Number.isFinite(hardness) || hardness < 0 || hardness > 50) {
      throw new BadRequestException('Block light must be 0–15 and hardness 0–50');
    }
    return { kind: 'block', identifier: value.identifier, displayName: value.displayName.trim(), lightLevel, hardness } as Prisma.InputJsonObject;
  }
  const stackSize = value.stackSize;
  if (!Number.isInteger(stackSize) || (stackSize as number) < 1 || (stackSize as number) > 64) throw new BadRequestException('Item stack size must be 1–64');
  return { kind: 'item', identifier: value.identifier, displayName: value.displayName.trim(), stackSize } as Prisma.InputJsonObject;
}
