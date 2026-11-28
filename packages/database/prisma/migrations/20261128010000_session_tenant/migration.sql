-- This migration runs before registration/session endpoints are enabled.
-- Existing foundation deployments have no issued sessions.
ALTER TABLE "Session" ADD COLUMN "tenantId" UUID;
UPDATE "Session" s
SET "tenantId" = (
  SELECT m."tenantId" FROM "Membership" m
  WHERE m."userId" = s."userId"
  ORDER BY m."createdAt", m."tenantId"
  LIMIT 1
);
DELETE FROM "Session" WHERE "tenantId" IS NULL;
ALTER TABLE "Session" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX "Session_tenantId_idx" ON "Session"("tenantId");
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
