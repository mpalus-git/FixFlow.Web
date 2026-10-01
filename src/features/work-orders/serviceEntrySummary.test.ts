import { summarizeServiceEntries, workMinutes } from "@/features/work-orders/serviceEntrySummary";
import { createServiceEntryResponse } from "@/test/workOrderFixtures";

const partId = "8e7d6c5b-4a39-4281-9f0e-1d2c3b4a5f6e";

describe("serviceEntrySummary", () => {
  it("counts the work time of a work entry and none for a correction", () => {
    expect(workMinutes(createServiceEntryResponse())).toBe(90);
    expect(
      workMinutes(
        createServiceEntryResponse({
          isCorrection: true,
          workStartedAt: null,
          workFinishedAt: null,
        }),
      ),
    ).toBeNull();
  });

  it("subtracts parts returned by a correction at the price of their use", () => {
    const summary = summarizeServiceEntries([
      createServiceEntryResponse({ parts: [{ partId, quantity: 3, unitPrice: 148.5 }] }),
      createServiceEntryResponse({
        workStartedAt: "2026-07-15T07:00:00Z",
        workFinishedAt: "2026-07-15T07:45:00Z",
        parts: [{ partId, quantity: 1, unitPrice: 0.1 }],
      }),
      createServiceEntryResponse({
        isCorrection: true,
        workStartedAt: null,
        workFinishedAt: null,
        parts: [{ partId, quantity: 1, unitPrice: 148.5 }],
      }),
    ]);

    expect(summary).toEqual({ workMinutes: 135, partsValue: 297.1 });
  });
});
