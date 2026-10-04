import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { createRoutes } from "@/app/routes";
import { ServerWakeGate } from "@/app/server-wake/ServerWakeGate";
import { createQueryClient } from "@/shared/api/queryClient";
import { Toaster } from "@/shared/ui/sonner";

const queryClient = createQueryClient();
const router = createBrowserRouter(createRoutes(queryClient));

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerWakeGate>
        <RouterProvider router={router} />
        <Toaster />
      </ServerWakeGate>
    </QueryClientProvider>
  );
}
