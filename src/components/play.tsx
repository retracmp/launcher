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
import { getVersion } from "@tauri-apps/api/app";
import client from "src/external/client";

import { FaLock } from "react-icons/fa6";
import { HiExclamationTriangle } from "react-icons/hi2";

const PlaySnow = () => {
  const config = useConfigControl();

  const [currentFortniteProcess, set] = useState<number>(0);
  const [add, remove] = useEvents((s) => [s.subscribe, s.unsubscribe]);
  const [oneSession, username, type, local, eor, dpe, launchargs] =
    useConfigControl((s) => [
      s.one_session,
      s.raw_credentials,
      s.use_passwordless,
      s.use_localhost,
      s.reset_on_release,
      s.disable_pre_edit,
      s.custom_launch_args,
    ]);
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
  const launcherNum = parseInt(launcher?.current_version.split(".")[2] || "0");

  const [version, setVersion] = useState("1.0.19");
  useEffect(() => {
    (async () => {
      const v = await getVersion();
      setVersion(v);
    })();
  }, []);
  const myVersionNum = parseInt(version.split(".")[2] || "0");

  const fortniteEntry = getCurrentEntry();
  const isFortniteRunning = currentFortniteProcess > 0;
  const disableButton =
    (isFortniteRunning && oneSession) ||
    (fortniteEntry?.releaseVersion != 14 && !type) ||
    !fortniteEntry ||
    (!username && type) ||
    (!type && !pakInstalled) ||
    launcherNum > myVersionNum;

  const token = useUserControl((s) => s.access_token);

  useEffect(() => {
    add("fortnite_process_id", set);
    return () => remove("fortnite_process_id", set);
  }, []);

  const handleClick = async () => {
    setPak(await hasPakInstalled(false));

    if (oneSession && currentFortniteProcess) {
      return;
    }

    type ? startLocal() : startPublic();
  };

  const startLocal = async () => {
    const entry = getCurrentEntry();
    entry && experienceSnowDev(entry.path, username, token, launchargs);
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
        token,
        local,
        eor,
        dpe,
        entry.releaseVersion,
        launchargs
      );
  };

  const chooseLabel = (): string => {
    if (!fortniteEntry) return "Invalid Installation";
    if (fortniteEntry.releaseVersion != 14 && !type)
      return "Wrong Game Version";
    if (isFortniteRunning && oneSession) return "Fortnite is running";
    if (!username && type) return "Invalid Credentials";
    if (!type && !pakInstalled) return "DOWNLOAD LATEST UPDATE";
    if (!launcher) return "Checking Version";
    if (launcherNum > myVersionNum) return "Update Retrac Launcher";
    if (type) return "Local Backend";
    return "Launch Retrac";
  };

  return (
    <>
      {!config.is_defender_excluded && (
        <p className="smallwarning">
          <HiExclamationTriangle className="warn" />
          Retrac is not excluded from Windows Defender. You may encounter
          unexpected issues.
        </p>
      )}
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
    </>
  );
};

export default PlaySnow;
