import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useEvents } from "src/state/events";

const TauriListener = () => {
  const event_manager = useEvents();

  useEffect(() => {
    const fortniteCloseListener = listen<number>("fortnite_process_id", (s) => {
      event_manager.get("fortnite_process_id")?.forEach((cb) => cb(s.payload));
    });

    const downloadCloseListener = listen<DownloadProgress_rust>(
      "download_progress",
      (s) => {
        event_manager.get("download_progress")?.forEach((cb) => cb(s.payload));
      }
    );

    return () => {
      fortniteCloseListener.then();
      downloadCloseListener.then();
    };
  }, []);

  return null;
};

export default TauriListener;
