import { Suspense } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
} from "@tanstack/react-router";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";
import { useUserControl } from "src/state/user";
import { useConfigControl } from "src/state/config";

import CredentialsPage from "src/pages/credentials";
import Frame from "src/app/frame";
import Snow from "src/pages/snow";
import Online from "src/pages/online";
import Servers from "src/pages/servers";
import Leaderboards from "src/pages/leaderboards";
import Onboard from "src/pages/onboard";

export const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback="Failed, contact @ectrc.">
      <Frame />
    </Suspense>
  ),
  notFoundComponent: () => <Navigate to="/snow" />,
});

export const credentialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/credentials",
  component: () => <CredentialsPage />,
  beforeLoad: () => {
    const token = useUserControl.getState().access_token;
    if (!token) {
      appWindow.setSize(new LogicalSize(400, 530));
      appWindow.setResizable(false);
      return;
    }

    console.log("redirecting to /snow");
    // throw redirect({
    //   to: "/snow",
    // });
  },
});

export const onboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboard",
  component: Onboard,
});

export const snowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/snow",
  component: Snow,
  beforeLoad: () => {
    appWindow.setSize(
      new LogicalSize(
        useConfigControl.getState().size.x < 400
          ? 400
          : useConfigControl.getState().size.x,
        useConfigControl.getState().size.y < 530
          ? 530
          : useConfigControl.getState().size.y
      )
    );
    appWindow.setResizable(true);
    appWindow.setMaximizable(false);
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

export const snowLeaderboardRoute = createRoute({
  getParentRoute: () => snowRoute,
  path: "/stats",
  component: Leaderboards,
});

const tree = rootRoute.addChildren([
  credentialsRoute,
  onboardRoute,
  snowRoute.addChildren([
    snowIndexRoute,
    snowPlayerRoute,
    snowServersRoute,
    snowLeaderboardRoute,
  ]),
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
