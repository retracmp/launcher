import { Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  redirect,
} from "@tanstack/react-router";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";
import { useUserControl } from "src/state/user";

import CredentialsPage from "src/pages/credentials";
import Frame from "src/app/frame";
import Snow from "src/pages/snow";
import Online from "src/pages/online";

export const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback="Failed, contact @ectrc.">
      <Frame />
    </Suspense>
  ),
  notFoundComponent: () => <Navigate to="/credentials" />,
});

export const credentialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/credentials",
  component: () => <CredentialsPage />,
  beforeLoad: () => {
    const token = useUserControl.getState().access_token;
    if (!token) return appWindow.setSize(new LogicalSize(320, 530));

    throw redirect({
      to: "/snow",
    });
  },
});

export const snowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/snow",
  component: Snow,
  beforeLoad: () => {
    appWindow.setSize(new LogicalSize(320, 530));
  },
});

export const snowIndexRoute = createRoute({
  getParentRoute: () => snowRoute,
  path: "/",
  component: Online,
});

const tree = rootRoute.addChildren([
  credentialsRoute,
  snowRoute.addChildren([snowIndexRoute]),
]);

const router = createRouter({
  routeTree: tree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default router;
