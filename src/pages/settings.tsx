import { useNavigate } from "@tanstack/react-router";
import { useStates } from "src/state/state";
import { useUserControl } from "src/state/user";
import { useConfigControl } from "src/state/config";
import { useLibraryControl } from "src/state/library";
import { motion } from "framer-motion";
import { downloadFile } from "src/lib/tauri";
import { hasPakInstalled, importBuildFromDialog } from "src/lib/import";
import { queryPerson } from "src/external/query";
import { useQuery } from "@tanstack/react-query";
import { message } from "@tauri-apps/api/dialog";
import { appWindow } from "@tauri-apps/api/window";

import { FaArrowRightFromBracket, FaCircleChevronDown } from "react-icons/fa6";
import "src/styles/settings.css";
import Toggle from "src/components/toggle";
import Input from "../components/input";
import { useEffect } from "react";
import { isDevBuildMode } from "src/external/client";

const Settings = () => {
  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
    enabled: false,
  });

  const userControl = useUserControl();
  const libraryControl = useLibraryControl();
  const configControl = useConfigControl();
  const stateControl = useStates();
  const navigate = useNavigate();

  const handleDelete = () => {
    userControl.kill_token();
    navigate({
      to: "/credentials",
    });
    stateControl.set_settings_page_active(false);
  };

  const handleImportBuild = async () => {
    for (const library of Object.values(libraryControl.entries)) {
      libraryControl.remove(library.binaryHash);
    }
    importBuildFromDialog();
  };

  const currentEntry = libraryControl.getCurrentEntry();

  const setTheme = (theme: string) => {
    const root = document.getElementById("root");
    root?.classList.remove("theme1");
    root?.classList.remove("theme2");
    root?.classList.remove("theme3");
    root?.classList.remove("theme4");
    root?.classList.remove("theme5");

    root?.classList.add("theme" + theme);
    configControl.setTheme("theme" + theme);
  };

  const disable_themes = player?.Account.State.Packages.length === 0;

  const toggle_party = () => {
    const root = document.getElementById("root");
    root?.classList.toggle("party");
  };

  const handleDownloadCustomContent = async () => {
    if (libraryControl.getCurrentEntry() === null)
      return message("Please set the Fortnite directory first!", {
        title: "Retrac Error",
        type: "error",
      });

    await downloadFile(
      "https://cdn.0xkaede.xyz/data",
      "pakchunkRetrac-WindowsClient_P.pak",
      `${
        libraryControl.getCurrentEntry()?.path
      }\\FortniteGame\\Content\\Paks\\pakchunkRetrac-WindowsClient_P.pak`
    );
    await downloadFile(
      "https://cdn.0xkaede.xyz/data",
      "pakchunkRetrac-WindowsClient_P.sig",
      `${
        libraryControl.getCurrentEntry()?.path
      }\\FortniteGame\\Content\\Paks\\pakchunkRetrac-WindowsClient_P.sig`
    );

    if (configControl.bubble_builds) {
      await downloadFile(
        "https://cdn.0xkaede.xyz/data",
        "pakchunkRetracBubble-WindowsClient_P.pak",
        `${
          libraryControl.getCurrentEntry()?.path
        }\\FortniteGame\\Content\\Paks\\pakchunkRetracBubble-WindowsClient_P.pak`
      );
      await downloadFile(
        "https://cdn.0xkaede.xyz/data",
        "pakchunkRetracBubble-WindowsClient_P.sig",
        `${
          libraryControl.getCurrentEntry()?.path
        }\\FortniteGame\\Content\\Paks\\pakchunkRetracBubble-WindowsClient_P.sig`
      );
    }

    libraryControl.setPakValid(await hasPakInstalled(false));
  };

  useEffect(() => {
    appWindow.setAlwaysOnTop(configControl.always_on_top);
  }, []);

  return (
    <motion.div
      initial={{ top: "100%" }}
      animate={{ top: 0, opacity: 1 }}
      exit={{ top: "100%" }}
      transition={{
        type: "tween",
      }}
      className="settings"
    >
      <div data-tauri-drag-region className="fakeFrame">
        <button
          onClick={() => stateControl.set_settings_page_active(false)}
          className="fakeFrameAction"
        >
          <FaCircleChevronDown />
        </button>
        <h2 className="fakeFrameTitle" data-tauri-drag-region>
          Settings
        </h2>
        <s></s>
        {userControl.access_token && (
          <button onClick={handleDelete} className="fakeFrameAction sml">
            <FaArrowRightFromBracket />
          </button>
        )}
      </div>
      <s />
      <div className="settingsActions">
        {disable_themes && (
          <p className="themeWarning">Donate to unlock themes.</p>
          // SHOUTOUT TO THE REAL ONES WHO CAN BUILD THE LAUNCHER THEMSELVES AND BYPASS THIS!
        )}
        <div className="themes">
          <button
            disabled={disable_themes}
            className="theme one"
            onClick={() => setTheme("1")}
          ></button>
          <button
            disabled={disable_themes}
            className="theme two"
            onClick={() => setTheme("2")}
          ></button>
          <button
            disabled={disable_themes}
            className="theme three"
            onClick={() => setTheme("3")}
          ></button>
          <button
            disabled={disable_themes}
            className="theme four"
            onClick={() => setTheme("4")}
          ></button>
          <button
            disabled={disable_themes}
            className="theme five"
            onClick={() => setTheme("5")}
          ></button>
          {/* <button
            disabled={disable_themes}
            className="theme six"
            onClick={() => setTheme("6")}
          ></button>
          <button
            disabled={disable_themes}
            className="theme seven"
            onClick={() => setTheme("7")}
          ></button>
          <button
            disabled={disable_themes}
            className="theme eight"
            onClick={() => setTheme("8")}
          ></button>
          <button
            disabled={disable_themes}
            className="theme nine"
            onClick={() => setTheme("9")}
          ></button>
          <button
            disabled={disable_themes}
            className="theme ten"
            onClick={() => setTheme("10")}
          ></button>
          <button
            disabled={disable_themes}
            className="theme eleven"
            onClick={() => setTheme("11")}
          ></button> */}
        </div>

        <div className="fortniteLocationContainer">
          <button
            className="default setting"
            onClick={handleDownloadCustomContent}
          >
            Download Custom Content
          </button>
        </div>
        <div className="fortniteLocationContainer">
          <button className="default setting" onClick={handleImportBuild}>
            Set Fortnite Directory
          </button>
          {currentEntry && <p>{currentEntry.path}</p>}
        </div>

        <Toggle
          title="Always On Top"
          description="Keep the launcher on top of other windows."
          active={configControl.always_on_top}
          onToggle={(v) => {
            appWindow.setAlwaysOnTop(v);
            configControl.set_always_on_top(v);
          }}
        />

        {/* <Toggle
          title="Reset on Release"
          description="Use this to reset builds on release."
          active={configControl.reset_on_release}
          onToggle={(v) => configControl.set_reset_on_release(v)}
        />

        <Toggle
          title="Disable Pre-Edits"
          description="Prevent accidental pre-edits when turbo building."
          active={configControl.disable_pre_edit}
          onToggle={(v) => configControl.set_disable_pre_edit(v)}
        /> */}

        {isDevBuildMode && (
          <>
            <Toggle
              title="Only One Session"
              description="Prevent multiple sessions from being active at the same time."
              active={configControl.one_session}
              onToggle={(v) => configControl.set_one_session(v)}
            />

            <Toggle
              title="Use Localhost"
              description="Do not use this unless you know what you are doing."
              active={configControl.use_localhost}
              onToggle={(v) => {
                configControl.set_use_localhost(v);
                if (!v) {
                  configControl.set_use_passwordless(false);
                }
              }}
            />
          </>
        )}

        {configControl.use_localhost && (
          <Toggle
            title="Passwordless Mode"
            description="Use only a display name to play."
            active={configControl.use_passwordless}
            onToggle={(v) => configControl.set_use_passwordless(v)}
          />
        )}

        {configControl.use_passwordless && configControl.use_localhost && (
          <Input
            title="Account Details"
            title_description="Passwordless mode must be enabled in the server configuration file."
            description="Username of the account."
            value={configControl.raw_credentials}
            onChange={(v) => configControl.set_raw_credentials(v)}
          />
        )}

        <div className="fortniteLocationContainer">
          <button className="default setting" onClick={toggle_party}>
            Toggle Party Mode
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
