import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { argon2id, hash, verify } from 'argon2';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import { PrismaService } from '../database/prisma.service';

const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const cookieName = process.env.NODE_ENV === 'production' ? '__Host-modfoundry_session' : 'modfoundry_session';
const csrfCookieName = 'modfoundry_csrf';
const cookieOptions = () => ({
  httpOnly: true, secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, path: '/',
});

export type Identity = { user: Pick<User, 'id' | 'email' | 'username' | 'mustChangePassword'>; tenantId: string; role: string };

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private credentials(body: Record<string, unknown>) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = body.password;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        typeof password !== 'string' || password.length < 12 || password.length > 256) {
      throw new BadRequestException('Provide a valid email and a password of 12–256 characters');
    }
    return { email, password };
  }

  async register(body: Record<string, unknown>, response: Response) {
    if (process.env.REGISTRATION_ENABLED !== 'true') throw new ForbiddenException('Registration is not enabled');
    const { email, password } = this.credentials(body);
    const free = await this.prisma.planVersion.findFirst({ where: { code: 'free', active: true }, orderBy: { version: 'desc' } });
    if (!free) throw new Error('Free plan has not been seeded');
    const passwordHash = await hash(password, { type: argon2id });
    const tenantId = randomUUID();
    let user: User;
    try {
      user = await this.prisma.$transaction(async tx => {
        const created = await tx.user.create({ data: { email, passwordHash } });
        await tx.tenant.create({
          data: {
            id: tenantId, name: email.split('@')[0] + "'s workspace", slug: 'workspace-' + tenantId,
            memberships: { create: { userId: created.id, role: 'OWNER' } },
            subscriptions: { create: { planVersionId: free.id, provider: 'MANUAL', status: 'FREE', currentPeriodStart: new Date() } },
          },
        });
        return created;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Email already registered');
      throw error;
    }
    return this.createSession(user, tenantId, 'OWNER', response);
  }

  async login(body: Record<string, unknown>, response: Response) {
    const { email, password } = this.credentials(body);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !await verify(user.passwordHash, password)) throw new UnauthorizedException('Invalid email or password');
    if (user.status !== 'ACTIVE') throw new ForbiddenException('Account is unavailable');
    const membership = await this.prisma.membership.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } });
    if (!membership) throw new ForbiddenException('No workspace membership');
    return this.createSession(user, membership.tenantId, membership.role, response);
  }

  private async createSession(user: User, tenantId: string, role: string, response: Response) {
    const token = randomBytes(32).toString('base64url');
    const csrf = randomBytes(32).toString('base64url');
    const configuredTtl = Number(process.env.SESSION_TTL_HOURS ?? 168);
    const ttlHours = Number.isFinite(configuredTtl) ? Math.min(720, Math.max(1, configuredTtl)) : 168;
    const maxAge = ttlHours * 60 * 60 * 1000;
    await this.prisma.session.create({ data: { userId: user.id, tenantId, tokenHash: digest(token), csrfHash: digest(csrf), expiresAt: new Date(Date.now() + maxAge) } });
    response.cookie(cookieName, token, { ...cookieOptions(), maxAge });
    response.cookie(csrfCookieName, csrf, { ...cookieOptions(), httpOnly: false, maxAge });
    return { user: this.publicUser(user), tenantId, role, csrfToken: csrf };
  }

  private publicUser(user: User) {
    return { id: user.id, email: user.email, username: user.username, mustChangePassword: user.mustChangePassword };
  }

  async requireIdentity(request: Request, mutation = false): Promise<Identity> {
    const token = request.cookies?.[cookieName];
    if (typeof token !== 'string' || token.length > 128) throw new UnauthorizedException();
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: digest(token) }, include: { user: { include: { memberships: true } } },
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.status !== 'ACTIVE') throw new UnauthorizedException();
    if (mutation) {
      const csrf = request.header('x-csrf-token');
      if (!csrf || csrf !== request.cookies?.[csrfCookieName] || digest(csrf) !== session.csrfHash) throw new ForbiddenException('CSRF token required');
    }
    const membership = session.user.memberships.find(value => value.tenantId === session.tenantId);
    if (!membership) throw new ForbiddenException('No workspace membership');
    return { user: this.publicUser(session.user), tenantId: membership.tenantId, role: membership.role };
  }

  async logout(request: Request, response: Response) {
    await this.requireIdentity(request, true);
    await this.prisma.session.updateMany({ where: { tokenHash: digest(request.cookies[cookieName]) }, data: { revokedAt: new Date() } });
    response.clearCookie(cookieName, cookieOptions());
    response.clearCookie(csrfCookieName, { ...cookieOptions(), httpOnly: false });
    return { ok: true };
  }
}
