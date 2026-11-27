import { describe,expect,it,vi } from 'vitest';
import { CompatibilityService } from './compatibility.service';
describe('CompatibilityService',()=>{it('excludes disabled profiles',async()=>{const findMany=vi.fn().mockResolvedValue([]);const service=new CompatibilityService({compatibilityProfile:{findMany}} as never);await service.list();expect(findMany).toHaveBeenCalledWith(expect.objectContaining({where:{status:{not:'DISABLED'}}}));});});
