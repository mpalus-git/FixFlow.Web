import { authMiddleware } from "@/shared/api/authMiddleware";
import { createApiClient } from "@/shared/api/baseClient";

export const apiClient = createApiClient();
apiClient.use(authMiddleware);
