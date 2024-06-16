import { useEffect } from "react";
import TauriListener from "src/components/listener";

import { RouterProvider } from "@tanstack/react-router";
import router from "src/app/router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
export const queryClient = new QueryClient();

import "src/styles/app.css";
import "src/styles/defaults.css";
import { useConfigControl } from "src/state/config";

const App = () => {
  const theme = useConfigControl((s) => s.currentTheme);
  const preventDefault = (e: Event) => e.preventDefault();

  useEffect(() => {
    const root = document.getElementById("root");
    root?.classList.remove("theme1");
    root?.classList.remove("theme2");
    root?.classList.remove("theme3");
    root?.classList.remove("theme4");
    root?.classList.remove("theme5");
    root?.classList.add(theme);

    window.addEventListener("contextmenu", preventDefault);
    window.addEventListener("beforeprint", preventDefault);
    return () => {
      window.removeEventListener("contextmenu", preventDefault);
      window.removeEventListener("beforeprint", preventDefault);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TauriListener />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
