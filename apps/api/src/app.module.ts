import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';
import { CompatibilityModule } from './compatibility/compatibility.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
@Module({imports:[ConfigModule.forRoot({isGlobal:true}),DatabaseModule,CompatibilityModule,AuthModule,ProjectsModule],controllers:[HealthController]})
export class AppModule {}
