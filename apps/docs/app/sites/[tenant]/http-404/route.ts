import { tenantNotFoundResponse } from "@/lib/tenant-not-found-response";

// Kept for direct/internal hits. Confirmed slug misses are answered from the
// proxy with `tenantNotFoundResponse()` so the status cannot be swallowed by a
// rewrite into a Cache Components page shell.
export const GET = () => tenantNotFoundResponse();
