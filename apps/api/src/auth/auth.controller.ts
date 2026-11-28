import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() body: Record<string, unknown>, @Res({ passthrough: true }) response: Response) { return this.auth.register(body, response); }
  @Post('login') login(@Body() body: Record<string, unknown>, @Res({ passthrough: true }) response: Response) { return this.auth.login(body, response); }
  @Get('me') me(@Req() request: Request) { return this.auth.requireIdentity(request); }
  @Post('logout') logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) { return this.auth.logout(request, response); }
}
