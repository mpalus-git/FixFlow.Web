import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { createRoutes } from "@/app/routes";
import { Toaster } from "@/shared/ui/sonner";

const router = createBrowserRouter(createRoutes());

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
