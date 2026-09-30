import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import {
  useArchiveDeviceMutation,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
} from "@/features/devices/api/deviceMutations";
import { deviceKeys } from "@/features/devices/api/deviceQueries";
import { apiBaseUrl } from "@/shared/api/baseClient";
import type { components } from "@/shared/api/schema";
import { createDeviceListItem, createDeviceResponse } from "@/test/deviceFixtures";
import { server } from "@/test/server";

type CreateDeviceRequest = components["schemas"]["CreateDeviceRequest"];
type UpdateDeviceRequest = components["schemas"]["UpdateDeviceRequest"];
type DevicePage = components["schemas"]["PagedResponseOfDeviceListItemResponse"];
type ProblemDetails = components["schemas"]["ProblemDetails"];

const device = createDeviceResponse();
const devicesUrl = `${apiBaseUrl}/api/v1/devices`;
const deviceUrl = `${devicesUrl}/${device.id}`;

function renderWithQueryClient<T>(hook: () => T) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, result: renderHook(hook, { wrapper }).result };
}

describe("useCreateDeviceMutation", () => {
  it("registers the device for the client and keeps its first version", async () => {
    const request: CreateDeviceRequest = {
      clientId: device.clientId,
      serialNumber: device.serialNumber,
      manufacturer: device.manufacturer,
      model: device.model,
      installationDate: device.installationDate,
    };
    const receivedBodies: CreateDeviceRequest[] = [];
    server.use(
      http.post<never, CreateDeviceRequest>(devicesUrl, async ({ request: httpRequest }) => {
        receivedBodies.push(await httpRequest.json());
        return HttpResponse.json(device, { status: 201, headers: { ETag: '"1"' } });
      }),
    );
    const { queryClient, result } = renderWithQueryClient(() => useCreateDeviceMutation());

    await result.current.mutateAsync(request);

    expect(receivedBodies).toEqual([request]);
    expect(queryClient.getQueryData(deviceKeys.detail(device.id))).toEqual({
      data: device,
      etag: '"1"',
    });
  });
});

describe("useUpdateDeviceMutation", () => {
  it("sends the edited version in If-Match and stores the new ETag", async () => {
    const request: UpdateDeviceRequest = {
      serialNumber: "SN-2024-0002",
      manufacturer: device.manufacturer,
      model: device.model,
      installationDate: device.installationDate,
    };
    const receivedIfMatch: (string | null)[] = [];
    server.use(
      http.put(deviceUrl, ({ request: httpRequest }) => {
        receivedIfMatch.push(httpRequest.headers.get("If-Match"));
        return HttpResponse.json({ ...device, ...request }, { headers: { ETag: '"5"' } });
      }),
    );
    const { queryClient, result } = renderWithQueryClient(() => useUpdateDeviceMutation());

    await result.current.mutateAsync({ deviceId: device.id, etag: '"4"', request });

    expect(receivedIfMatch).toEqual(['"4"']);
    expect(queryClient.getQueryData(deviceKeys.detail(device.id))).toEqual({
      data: { ...device, ...request },
      etag: '"5"',
    });
  });
});

describe("useArchiveDeviceMutation", () => {
  const otherDevice = createDeviceListItem({
    id: "8d2f6c3b-4e5a-4b7c-9d0e-1f2a3b4c5d6e",
    serialNumber: "SN-2024-0002",
  });
  const cachedPage: DevicePage = {
    items: [createDeviceListItem(), otherDevice],
    page: 1,
    pageSize: 20,
    totalCount: 2,
  };
  const globalListKey = deviceKeys.list({ page: 1, search: "" });
  const clientListKey = deviceKeys.clientList({ clientId: device.clientId, page: 1 });

  it("removes the device from every cached device list at once", async () => {
    let answerArchive: () => void = () => undefined;
    server.use(
      http.post(
        `${deviceUrl}/archive`,
        () =>
          new Promise<Response>((resolve) => {
            answerArchive = () => {
              resolve(new HttpResponse(null, { status: 204 }));
            };
          }),
      ),
    );
    const { queryClient, result } = renderWithQueryClient(() => useArchiveDeviceMutation());
    queryClient.setQueryData(globalListKey, cachedPage);
    queryClient.setQueryData(clientListKey, cachedPage);

    const archiving = result.current.mutateAsync(device.id);

    const expectedPage = { ...cachedPage, items: [otherDevice], totalCount: 1 };
    await vi.waitFor(() => {
      expect(queryClient.getQueryData(globalListKey)).toEqual(expectedPage);
    });
    expect(queryClient.getQueryData(clientListKey)).toEqual(expectedPage);
    answerArchive();
    await archiving;
  });

  it("restores the lists when the API rejects the archiving", async () => {
    const problem: ProblemDetails = { status: 409, title: "Conflict" };
    server.use(
      http.post(`${deviceUrl}/archive`, () => HttpResponse.json(problem, { status: 409 })),
    );
    const { queryClient, result } = renderWithQueryClient(() => useArchiveDeviceMutation());
    queryClient.setQueryData(globalListKey, cachedPage);

    await expect(result.current.mutateAsync(device.id)).rejects.toMatchObject({
      kind: "conflict",
    });

    expect(queryClient.getQueryData(globalListKey)).toEqual(cachedPage);
  });
});
