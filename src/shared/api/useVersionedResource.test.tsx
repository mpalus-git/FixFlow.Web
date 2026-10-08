import { QueryClient, QueryClientProvider, queryOptions } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Versioned } from "@/shared/api/baseClient";
import { useVersionedResource } from "@/shared/api/useVersionedResource";

function renderVersionedResource() {
  let serverVersion = 1;
  const resourceOptions = queryOptions({
    queryKey: ["resource", "detail", "resource-1"] as const,
    queryFn: (): Promise<Versioned<{ name: string }>> =>
      Promise.resolve({
        data: { name: `Version ${String(serverVersion)}` },
        etag: `"${String(serverVersion)}"`,
      }),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const view = renderHook(() => useVersionedResource(resourceOptions), { wrapper });

  return {
    ...view,
    queryClient,
    changeOnServer: () => {
      serverVersion += 1;
    },
  };
}

describe("useVersionedResource", () => {
  it("keeps the version the user opened when the cache refreshes in the background", async () => {
    const { result, queryClient, changeOnServer } = renderVersionedResource();
    await waitFor(() => {
      expect(result.current.editedVersion?.etag).toBe('"1"');
    });

    changeOnServer();
    await act(() => queryClient.refetchQueries({ queryKey: ["resource"] }));

    await waitFor(() => {
      expect(result.current.query.data?.etag).toBe('"2"');
    });
    expect(result.current.editedVersion?.etag).toBe('"1"');
  });

  it("loads the current version from the server after a conflict", async () => {
    const { result, changeOnServer } = renderVersionedResource();
    await waitFor(() => {
      expect(result.current.editedVersion?.etag).toBe('"1"');
    });

    act(() => {
      result.current.openConflict();
    });
    expect(result.current.conflictDialogProps.open).toBe(true);

    changeOnServer();
    act(() => {
      result.current.conflictDialogProps.onReload();
    });

    await waitFor(() => {
      expect(result.current.editedVersion).toEqual({
        data: { name: "Version 2" },
        etag: '"2"',
      });
    });
  });
});
