import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { Identity } from '../auth/auth.service';
import { PrismaService } from '../database/prisma.service';
import { parseDocument } from './document';
import { generateFabric1211Source } from './fabric-1211-source';
export { parseDocument } from './document';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const assertId = (id: string) => { if (!uuid.test(id)) throw new BadRequestException('Invalid identifier'); };
const editorRoles = ['OWNER', 'ADMIN', 'EDITOR'];

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private editor(identity: Identity) {
    if (!editorRoles.includes(identity.role)) throw new ForbiddenException('Editor permission required');
  }

  list(identity: Identity) {
    return this.prisma.project.findMany({
      where: { tenantId: identity.tenantId, status: { not: 'DELETED' } },
      orderBy: { updatedAt: 'desc' },
      include: { targets: { include: { profile: { select: { edition: true, gameVersion: true, loader: true, status: true, capabilities: true } } } } },
    });
  }

  async create(identity: Identity, body: Record<string, unknown>) {
    this.editor(identity);
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 80) throw new BadRequestException('Project name must be 1–80 characters');
    if (typeof body.profileId !== 'string') throw new BadRequestException('Select a compatibility profile');
    assertId(body.profileId);
    const profile = await this.prisma.compatibilityProfile.findUnique({ where: { id: body.profileId } });
    if (!profile || profile.status === 'DISABLED' || profile.status === 'DEPRECATED') throw new BadRequestException('Compatibility profile is unavailable');
    const document = parseDocument(body.document);
    try {
      return await this.prisma.$transaction(async tx => {
        const subscription = await tx.subscription.findFirst({
          where: { tenantId: identity.tenantId, status: { in: ['FREE', 'TRIALING', 'ACTIVE'] } },
          include: { planVersion: true }, orderBy: { currentPeriodStart: 'desc' },
        });
        const limits = subscription?.planVersion.entitlements as { activeProjects?: number } | undefined;
        const limit = limits?.activeProjects;
        if (!Number.isInteger(limit) || (limit as number) < 0) throw new ForbiddenException('No active project entitlement');
        const count = await tx.project.count({ where: { tenantId: identity.tenantId, status: 'ACTIVE' } });
        if (count >= (limit as number)) throw new ForbiddenException('Active project limit reached');
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'project';
        return tx.project.create({
          data: {
            tenantId: identity.tenantId, name, slug: slug + '-' + randomBytes(4).toString('hex'),
            targets: { create: { tenantId: identity.tenantId, profileId: profile.id, name: 'Main', document } },
          },
          include: { targets: true },
        });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) throw new ConflictException('Project creation conflicted; please retry');
      throw error;
    }
  }

  async get(identity: Identity, id: string) {
    assertId(id);
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId: identity.tenantId, status: { not: 'DELETED' } },
      include: { targets: { include: { profile: { select: { edition: true, gameVersion: true, loader: true, status: true, capabilities: true, limitations: true } } } } },
    });
    if (!project) throw new NotFoundException();
    return project;
  }

  async source(identity: Identity, projectId: string, targetId: string) {
    assertId(targetId);
    const project = await this.get(identity, projectId);
    const target = project.targets.find(value => value.id === targetId);
    if (!target) throw new NotFoundException();
    const profile = await this.prisma.compatibilityProfile.findUniqueOrThrow({ where: { id: target.profileId } });
    return { documentVersion: target.documentVersion, ...generateFabric1211Source(profile, project.slug, target.document) };
  }

  async rename(identity: Identity, id: string, body: Record<string, unknown>) {
    this.editor(identity);
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 80) throw new BadRequestException('Project name must be 1–80 characters');
    await this.get(identity, id);
    return this.prisma.project.update({ where: { id }, data: { name } });
  }

  async setStatus(identity: Identity, id: string, status: ProjectStatus) {
    this.editor(identity);
    const project = await this.get(identity, id);
    try {
      return await this.prisma.$transaction(async tx => {
        if (status === 'ACTIVE' && project.status !== 'ACTIVE') {
          const subscription = await tx.subscription.findFirst({ where: { tenantId: identity.tenantId, status: { in: ['FREE','TRIALING','ACTIVE'] } }, include: { planVersion: true } });
          const limit = (subscription?.planVersion.entitlements as {activeProjects?: number} | undefined)?.activeProjects ?? 0;
          const count = await tx.project.count({ where: { tenantId: identity.tenantId, status: 'ACTIVE' } });
          if (count >= limit) throw new ForbiddenException('Active project limit reached');
        }
        const updated = await tx.project.updateMany({ where: { id, tenantId: identity.tenantId, status: project.status }, data: { status } });
        if (!updated.count) throw new ConflictException('Project changed; reload and retry');
        return tx.project.findUniqueOrThrow({ where: { id } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') throw new ConflictException('Project changed; retry');
      throw error;
    }
  }

  async saveTarget(identity: Identity, projectId: string, targetId: string, body: Record<string, unknown>) {
    this.editor(identity);
    assertId(targetId);
    const project = await this.get(identity, projectId);
    if (project.status !== 'ACTIVE') throw new ConflictException('Restore project before editing');
    if (!Number.isInteger(body.documentVersion) || (body.documentVersion as number) < 1) throw new BadRequestException('Document version required');
    const document = parseDocument(body.document);
    const result = await this.prisma.projectTarget.updateMany({
      where: { id: targetId, projectId, tenantId: identity.tenantId, documentVersion: body.documentVersion as number },
      data: { document, documentVersion: { increment: 1 } },
    });
    if (!result.count) throw new ConflictException('Document changed or target is unavailable; reload before saving');
    return this.prisma.projectTarget.findUniqueOrThrow({ where: { id: targetId } });
  }
}
