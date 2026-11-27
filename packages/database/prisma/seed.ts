import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.compatibilityProfile.upsert({
    where: { key_revision: { key: 'java-1.21.1-fabric-candidate', revision: 1 } },
    update: {},
    create: {
      key: 'java-1.21.1-fabric-candidate', revision: 1, edition: 'JAVA', gameVersion: '1.21.1',
      releaseChannel: 'STABLE', loader: 'FABRIC', javaVersion: 21,
      capabilities: { items: true, blocks: true, shapedRecipes: true, compilation: false },
      limitations: ['Exact Fabric Loader, Loom, mappings and Gradle versions are awaiting the toolchain smoke test.'],
      status: 'CANDIDATE'
    }
  });
  for (const plan of [
    ['free','Free',0,{activeProjects:2,storageBytes:262144000,monthlyCompilations:5}],
    ['starter','Starter',599,{activeProjects:10,storageBytes:2147483648,monthlyCompilations:50}],
    ['pro','Pro',1299,{activeProjects:50,storageBytes:10737418240,monthlyCompilations:200}],
    ['studio','Studio',2499,{activeProjects:200,storageBytes:53687091200,monthlyCompilations:500}]
  ] as const) await prisma.planVersion.upsert({where:{code_version:{code:plan[0],version:1}},update:{},create:{code:plan[0],version:1,name:plan[1],currency:'USD',monthlyPriceMinor:plan[2],entitlements:plan[3],active:true}});
}
main().finally(()=>prisma.$disconnect());
