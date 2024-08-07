import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStates } from "src/state/state";
import { useConfigControl } from "src/state/config";
import { useLibraryControl } from "src/state/library";
import { queryPerson, queryStats } from "src/external/query";
import { Outlet } from "@tanstack/react-router";
import { appWindow } from "@tauri-apps/api/window";
import { AnimatePresence } from "framer-motion";
import { hasPakInstalled } from "src/lib/import";

import { HiMinusSm, HiX } from "react-icons/hi";
import "src/styles/frame.css";

import Settings from "src/pages/settings";
import Offline from "src/pages/offline";
import { FaCog } from "react-icons/fa";

const ROLE_TIERS = [
  "booster",
  "fever",
  "pubg",
  "gamer",
  "llama",
  "creator",
  "crystal",
  "ultimate",
];
const ROLES = {
  booster: "Server Booster",
  fever: "Fever Donator",
  pubg: "PUBG Donator",
  gamer: "Gamer Donator",
  llama: "Llama Donator",
  creator: "Content Creator",
  crystal: "Crystal Donator",
  ultimate: "Ultimate Donator",
  "": "Member",
};

const Frame = () => {
  const config = useConfigControl();
  const libraryControl = useLibraryControl();

  const [settingsOpen, setSettingsOpen] = useStates((s) => [
    s.settings_page_active,
    s.set_settings_page_active,
  ]);

  const { data: launcherStats, error } = useQuery<LauncherStats>({
    queryKey: ["launcher"],
    queryFn: queryStats,
    initialData: {
      PlayersOnline: 0,
      CurrentBuild: "0.0",
      CurrentSeason: 0,
    },
    throwOnError: false,
    refetchInterval: 10000,
    enabled: !config.use_passwordless,
  });

  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
    enabled: !config.use_passwordless,
  });

  useEffect(() => {
    (async () => {
      libraryControl.setPakValid(await hasPakInstalled(false));
    })();
  }, [libraryControl.entries]);

  const bestRole = player?.Account.State.Packages.reduce((acc, curr) => {
    if (ROLE_TIERS.indexOf(curr) > ROLE_TIERS.indexOf(acc)) {
      return curr;
    }
    return acc;
  }, "");
  const role = ROLES[bestRole as keyof typeof ROLES];

  return (
    <div className="tauriFrameContainer">
      <nav data-tauri-drag-region className="tauriFrame">
        <div data-tauri-drag-region className="tauriFrameInner">
          <span data-tauri-drag-region className="tauriFrameTitle">
            RETRAC
          </span>
          <s />
          {!config.drawer_open && (
            <button
              data-tauri-drag-region
              onClick={() => setSettingsOpen(true)}
              className="tauriFrameAction"
            >
              <FaCog />
            </button>
          )}
          {config.drawer_open && (
            <button
              data-tauri-drag-region
              onClick={() => appWindow.minimize()}
              className="tauriFrameAction"
            >
              <HiMinusSm />
            </button>
          )}
          <button
            data-tauri-drag-region
            onClick={() => appWindow.close()}
            className="tauriFrameAction close"
          >
            <HiX />
          </button>
        </div>
        {!config.use_passwordless ? (
          <div data-tauri-drag-region className="tauriFrameInformation">
            <span data-tauri-drag-region>
              {!error ? launcherStats.PlayersOnline : 0} Players Online
            </span>
            <s></s>
            <span data-tauri-drag-region>
              <strong className={role} data-tauri-drag-region>
                {role}
              </strong>
            </span>
          </div>
        ) : (
          <div data-tauri-drag-region className="tauriFrameInformationSmol" />
        )}
      </nav>
      <div className="tauriFrameContent">
        <AnimatePresence>{settingsOpen && <Settings />}</AnimatePresence>
        {config.use_passwordless ? <Offline /> : <Outlet />}
      </div>
    </div>
  );
};

export default Frame;
