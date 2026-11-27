import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
@Injectable() export class CompatibilityService {
  constructor(private readonly prisma:PrismaService){}
  list(){return this.prisma.compatibilityProfile.findMany({where:{status:{not:'DISABLED'}},orderBy:[{edition:'asc'},{gameVersion:'desc'}],select:{id:true,key:true,revision:true,edition:true,gameVersion:true,loader:true,loaderVersion:true,javaVersion:true,capabilities:true,limitations:true,status:true}});}
}
