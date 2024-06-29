import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { DownloadCustomContent, hasPakInstalled } from "src/lib/import";
import { useConfigControl } from "src/state/config";
import { useLibraryControl } from "src/state/library";
import { useStates } from "src/state/state";

import "src/styles/drawer.css";

type DrawerProps = {
  children: React.ReactNode;
};

const DrawerContainer = (props: DrawerProps) => {
  return (
    <div className="drawerContainer">
      <Drawer />
      {props.children}
    </div>
  );
};

const Drawer = () => {
  const config = useConfigControl();
  const libraryControl = useLibraryControl();
  const [setSettingsOpen] = useStates((s) => [s.set_settings_page_active]);
  const [is_downloading] = useStates((s) => [s.is_downloading]);

  const onWindowResize = () => {
    window.innerWidth > 490
      ? config.set_drawer_open(true)
      : config.set_drawer_open(false);
    const size = { x: window.innerWidth, y: window.innerHeight };
    if (window.innerWidth > 1020) size.x = 1020;
    if (window.innerHeight > 730) size.y = 730;
    if (window.innerWidth < 320) size.x = 320;
    if (window.innerHeight < 450) size.y = 450;
    config.set_size(size);
  };

  useEffect(() => {
    window.addEventListener("resize", onWindowResize);
    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return (
    <div className={`drawer ${config.drawer_open ? "" : "closed"}`}>
      <Link className="item" to="/snow/player">
        HOME
      </Link>
      <Link className="item" to="/snow/servers">
        SERVERS
      </Link>
      <button className="item">ITEM SHOP</button>
      <s></s>
      {!hasPakInstalled ||
        (!libraryControl.pakValid &&
          libraryControl.getCurrentEntry() != null && (
            <button
              className="item download"
              onClick={DownloadCustomContent}
              disabled={is_downloading}
            >
              GET UPDATE
            </button>
          )) || <button className="item donate">DONATE</button>}
      <button className="item" onClick={() => setSettingsOpen(true)}>
        SETTINGS
      </button>
    </div>
  );
};

export default DrawerContainer;
