import { ApiError } from "@/shared/api/apiError";
import { createResourceLoader } from "@/shared/api/resourceLoader";

describe("createResourceLoader", () => {
  it("loads the resource identified by the route parameter", async () => {
    const loadResource = vi.fn(() => Promise.resolve({ id: "client-1" }));
    const loader = createResourceLoader("clientId", loadResource);

    await expect(loader({ params: { clientId: "client-1" } })).resolves.toBeNull();
    expect(loadResource).toHaveBeenCalledWith("client-1");
  });

  it("responds with 404 when the API does not find the resource", async () => {
    const loader = createResourceLoader("clientId", () =>
      Promise.reject(new ApiError({ kind: "notFound", status: 404 })),
    );

    await expect(loader({ params: { clientId: "missing" } })).rejects.toMatchObject({
      init: { status: 404 },
    });
  });

  it("passes other errors on to the route error boundary", async () => {
    const error = new ApiError({ kind: "server", status: 500 });
    const loader = createResourceLoader("clientId", () => Promise.reject(error));

    await expect(loader({ params: { clientId: "client-1" } })).rejects.toBe(error);
  });
});
