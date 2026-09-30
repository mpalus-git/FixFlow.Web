import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { routes } from "@/app/routes";
import { Toaster } from "@/shared/ui/sonner";

const router = createBrowserRouter(routes);

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
