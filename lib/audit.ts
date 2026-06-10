import { prisma } from "./prisma";

export async function appendAuditLog(
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        metadata: metadata as object,
        ipAddress,
      },
    });
  } catch {
    // Fire-and-forget — never block the caller
  }
}
