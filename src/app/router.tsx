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
import Servers from "src/pages/servers";
import { useConfigControl } from "src/state/config";

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
    if (!token) {
      appWindow.setSize(new LogicalSize(320, 530));
      appWindow.setResizable(false);
      appWindow.setMaxSize(new LogicalSize(320, 530));
      appWindow.setMinSize(new LogicalSize(320, 530));
      return;
    }

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
    appWindow.setSize(
      new LogicalSize(
        useConfigControl.getState().size.x,
        useConfigControl.getState().size.y
      )
    );
    appWindow.setResizable(true);
    appWindow.setMaximizable(false);
    appWindow.setMaxSize(new LogicalSize(1020, 730));
    appWindow.setMinSize(new LogicalSize(320, 450));
  },
});

export const snowIndexRoute = createRoute({
  getParentRoute: () => snowRoute,
  path: "/",
  component: () => <Navigate to="/snow/player" />,
});

export const snowPlayerRoute = createRoute({
  getParentRoute: () => snowRoute,
  path: "/player",
  component: Online,
});

export const snowServersRoute = createRoute({
  getParentRoute: () => snowRoute,
  path: "/servers",
  component: Servers,
});

const tree = rootRoute.addChildren([
  credentialsRoute,
  snowRoute.addChildren([snowIndexRoute, snowPlayerRoute, snowServersRoute]),
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
