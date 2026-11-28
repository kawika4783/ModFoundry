import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly auth: AuthService, private readonly projects: ProjectsService) {}
  @Get() async list(@Req() req: Request) { return this.projects.list(await this.auth.requireIdentity(req)); }
  @Post() async create(@Req() req: Request, @Body() body: Record<string, unknown>) { return this.projects.create(await this.auth.requireIdentity(req, true), body); }
  @Get(':id') async get(@Req() req: Request, @Param('id') id: string) { return this.projects.get(await this.auth.requireIdentity(req), id); }
  @Patch(':id') async rename(@Req() req: Request, @Param('id') id: string, @Body() body: Record<string, unknown>) { return this.projects.rename(await this.auth.requireIdentity(req, true), id, body); }
  @Post(':id/archive') async archive(@Req() req: Request, @Param('id') id: string) { return this.projects.setStatus(await this.auth.requireIdentity(req, true), id, 'ARCHIVED'); }
  @Post(':id/restore') async restore(@Req() req: Request, @Param('id') id: string) { return this.projects.setStatus(await this.auth.requireIdentity(req, true), id, 'ACTIVE'); }
  @Delete(':id') async remove(@Req() req: Request, @Param('id') id: string) { return this.projects.setStatus(await this.auth.requireIdentity(req, true), id, 'DELETED'); }
  @Patch(':id/targets/:targetId') async save(@Req() req: Request, @Param('id') id: string, @Param('targetId') targetId: string, @Body() body: Record<string, unknown>) {
    return this.projects.saveTarget(await this.auth.requireIdentity(req, true), id, targetId, body);
  }
}
