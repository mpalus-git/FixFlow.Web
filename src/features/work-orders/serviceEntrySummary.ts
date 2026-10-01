import type { components } from "@/shared/api/schema";

type ServiceEntryResponse = components["schemas"]["ServiceEntryResponse"];
type ServiceEntryPartResponse = components["schemas"]["ServiceEntryPartResponse"];

const millisecondsPerMinute = 60_000;

function roundToGrosze(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function workMinutes(entry: ServiceEntryResponse): number | null {
  if (entry.workStartedAt === null || entry.workFinishedAt === null) {
    return null;
  }
  const duration = Date.parse(entry.workFinishedAt) - Date.parse(entry.workStartedAt);
  return Math.round(duration / millisecondsPerMinute);
}

export function signedQuantity(entry: ServiceEntryResponse, part: ServiceEntryPartResponse) {
  return entry.isCorrection ? -part.quantity : part.quantity;
}

export function partValue(entry: ServiceEntryResponse, part: ServiceEntryPartResponse): number {
  return roundToGrosze(signedQuantity(entry, part) * part.unitPrice);
}

export function summarizeServiceEntries(entries: readonly ServiceEntryResponse[]) {
  let totalWorkMinutes = 0;
  let totalPartsValue = 0;
  for (const entry of entries) {
    totalWorkMinutes += workMinutes(entry) ?? 0;
    for (const part of entry.parts) {
      totalPartsValue += partValue(entry, part);
    }
  }
  return { workMinutes: totalWorkMinutes, partsValue: roundToGrosze(totalPartsValue) };
}
