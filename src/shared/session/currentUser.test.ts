import { QueryClient } from "@tanstack/react-query";
import { currentUserQueryOptions, homePathFor } from "@/shared/session/currentUser";
import { endSession } from "@/shared/session/sessionStore";
import { mockCurrentUser, signInAs } from "@/test/signedInUser";

describe("currentUser", () => {
  afterEach(() => {
    endSession();
    localStorage.clear();
  });

  it("loads the signed-in user with a known role", async () => {
    signInAs("Technician");

    const user = await new QueryClient().query(currentUserQueryOptions());

    expect(user).toMatchObject({ email: "technician@fixflow.test", role: "Technician" });
  });

  it("rejects a role the panel does not know", async () => {
    signInAs("Dispatcher");
    mockCurrentUser("Auditor");

    await expect(new QueryClient().query(currentUserQueryOptions())).rejects.toMatchObject({
      kind: "unexpected",
    });
  });

  it.each([
    ["Admin", "/"],
    ["Dispatcher", "/"],
    ["Technician", "/my-work-orders"],
  ] as const)("sends %s to %s after signing in", (role, path) => {
    expect(homePathFor(role)).toBe(path);
  });
});
