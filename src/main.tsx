import "./index.css";
import "pixi-spine";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import ErrorBoundary from "./pages/ErrorBoundary.tsx";
import { Gallery, Scenes } from "./pages/index.tsx";

const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: "/", element: <Scenes /> },
      { path: "/agents", element: <Gallery /> },
      { path: "/gallery", element: <Navigate to="/agents" replace /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Provider>
      <RouterProvider router={router} />
    </Provider>
    ,
  </QueryClientProvider>,
);
