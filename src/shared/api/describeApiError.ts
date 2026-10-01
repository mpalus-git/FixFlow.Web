import type { TFunction } from "i18next";
import type { ApiError } from "@/shared/api/apiError";

const errorCodeMessageKeys = {
  "Client.Archived": "apiErrors.clientArchived",
  "Client.NotFound": "apiErrors.clientNotFound",
  "Device.Archived": "apiErrors.deviceArchived",
  "Device.ClientArchived": "apiErrors.deviceClientArchived",
  "Device.DuplicateSerialNumber": "apiErrors.deviceDuplicateSerialNumber",
  "Device.NotFound": "apiErrors.deviceNotFound",
  "Part.Archived": "apiErrors.partArchived",
  "Part.DuplicateCatalogNumber": "apiErrors.partDuplicateCatalogNumber",
  "Part.NotFound": "apiErrors.partNotFound",
  "Persistence.ConcurrentModification": "apiErrors.concurrentModification",
  "User.CannotDeactivateSelf": "apiErrors.userCannotDeactivateSelf",
  "User.DuplicateEmail": "apiErrors.userDuplicateEmail",
  "User.HasOpenWorkOrders": "apiErrors.userHasOpenWorkOrders",
  "User.NotFound": "apiErrors.userNotFound",
  "WorkOrder.Closed": "apiErrors.workOrderClosed",
  "WorkOrder.DeviceArchived": "apiErrors.workOrderDeviceArchived",
  "WorkOrder.InvalidStatusTransition": "apiErrors.workOrderInvalidStatusTransition",
  "WorkOrder.NoServiceEntries": "apiErrors.workOrderNoServiceEntries",
  "WorkOrder.NotCompleted": "apiErrors.workOrderNotCompleted",
  "WorkOrder.NotFound": "apiErrors.workOrderNotFound",
  "WorkOrder.TechnicianNotFound": "apiErrors.workOrderTechnicianNotFound",
} as const;

type KnownErrorCode = keyof typeof errorCodeMessageKeys;

function isKnownErrorCode(errorCode: string): errorCode is KnownErrorCode {
  return Object.keys(errorCodeMessageKeys).includes(errorCode);
}

export function describeApiError(error: ApiError, t: TFunction): string {
  if (error.errorCode !== null && isKnownErrorCode(error.errorCode)) {
    return t(errorCodeMessageKeys[error.errorCode]);
  }
  if (error.kind === "server") {
    return t("errors.server");
  }
  if (error.kind === "network") {
    return t("errors.network");
  }
  return error.detail ?? t("errors.unexpected");
}
