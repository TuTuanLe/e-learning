import type { AuthUser } from "@dictation/contracts";
import { ApiError } from "@/server/http-error";

export function assertAdminUser(user: AuthUser): void {
  const adminEmails = new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );

  if (!adminEmails.has(user.email.toLowerCase())) {
    throw new ApiError(403, "Bạn không có quyền admin.");
  }
}
