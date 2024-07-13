import { useEffect, useState } from "react";
import { useConfigControl } from "src/state/config";
import { useLibraryControl } from "src/state/library";
import { useUserControl } from "src/state/user";
import { useEvents } from "src/state/events";
import { useQuery } from "@tanstack/react-query";
import { queryLauncherVersion } from "src/external/query";
import { experienceSnow, experienceSnowDev } from "src/lib/tauri";
import { hasPakInstalled } from "src/lib/import";
import { motion } from "framer-motion";
import client from "src/external/client";

import { FaLock } from "react-icons/fa6";

const PlaySnow = () => {
  const [currentFortniteProcess, set] = useState<number>(0);
  const [add, remove] = useEvents((s) => [s.subscribe, s.unsubscribe]);
  const [oneSession, username, type, local, eor, dpe] = useConfigControl(
    (s) => [
      s.one_session,
      s.raw_credentials,
      s.use_passwordless,
      s.use_localhost,
      s.reset_on_release,
      s.disable_pre_edit,
    ]
  );
  const [getCurrentEntry, pakInstalled, setPak] = useLibraryControl((s) => [
    s.getCurrentEntry,
    s.pakValid,
    s.setPakValid,
  ]);

  const { data: launcher } = useQuery<LauncherVersion>({
    queryKey: ["version"],
    queryFn: queryLauncherVersion,
  });

  // remove . and turn int oa 3 digit number
  const launcherNum = parseInt(
    launcher?.current_version.replace(/\./g, "") || "0"
  );

  const fortniteEntry = getCurrentEntry();
  const isFortniteRunning = currentFortniteProcess > 0;
  const disableButton =
    (isFortniteRunning && oneSession) ||
    !fortniteEntry ||
    (!username && type) ||
    (!type && !pakInstalled) ||
    launcherNum > 109;

  const token = useUserControl((s) => s.access_token);

  useEffect(() => {
    add("fortnite_process_id", set);
    return () => remove("fortnite_process_id", set);
  }, []);

  const handleClick = async () => {
    if (oneSession && currentFortniteProcess) {
      return;
    }

    type ? startLocal() : startPublic();
  };

  const startLocal = async () => {
    const entry = getCurrentEntry();
    entry && experienceSnowDev(entry.path, username);
  };

  const startPublic = async () => {
    const hasPak = hasPakInstalled(true);
    if (!hasPak) return setPak(hasPak);

    const entry = getCurrentEntry();
    const codeResponse = await client.code(token);
    entry &&
      codeResponse.ok &&
      experienceSnow(
        entry.path,
        codeResponse.data,
        local,
        eor,
        dpe,
        entry.releaseVersion
      );
  };

  const chooseLabel = (): string => {
    if (!fortniteEntry) return "Invalid Installation";
    if (isFortniteRunning && oneSession) return "Fortnite is running";
    if (!username && type) return "Invalid Credentials";
    if (!type && !pakInstalled) return "Custom Pak Missing";
    if (!launcher) return "Checking Version";
    if (launcherNum > 109) return "Update Retrac Launcher";
    if (type) return "Local Backend";
    return "Launch Retrac";
  };

  return (
    <button
      className={
        "default " + (isFortniteRunning && oneSession ? "red" : "green")
      }
      onClick={handleClick}
      disabled={disableButton}
    >
      {oneSession && (
        <motion.div
          variants={{
            visible: { opacity: 1 },
            hidden: { opacity: 0 },
          }}
          initial="hidden"
          animate={isFortniteRunning || disableButton ? "visible" : "hidden"}
          className="leftIcon hide"
        >
          <FaLock />
        </motion.div>
      )}
      {chooseLabel()}
    </button>
  );
};

export default PlaySnow;
