import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEvents } from "src/state/events";
import { useStates } from "src/state/state";
import "src/styles/downloader.css";

const FILE_MESSAGES = [
  "a crucial file",
  "an important file",
  "a necessary file",
  "a GOATED file",
];

const sessionFileDescription =
  FILE_MESSAGES[Math.floor(Math.random() * FILE_MESSAGES.length)];

const DownloaderArea = () => {
  const event_manager = useEvents();
  const [setDownloading] = useStates((s) => [s.set_downloading]);
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress_rust>({
      file_name: "",
      wanted_file_size: 0,
      downloaded_file_size: 0,
      download_speed: 0,
    });

  const onDownloadProgress = (progress: DownloadProgress_rust) => {
    setDownloading(true);
    setDownloadProgress(progress);
  };

  useEffect(() => {
    event_manager.subscribe("download_progress", onDownloadProgress);
    return () =>
      event_manager.unsubscribe("download_progress", onDownloadProgress);
  }, []);

  useEffect(() => {
    let interval: number;

    if (
      (downloadProgress.downloaded_file_size ===
        downloadProgress.wanted_file_size &&
        downloadProgress.wanted_file_size !== 0) ||
      downloadProgress.downloaded_file_size !== 0
    )
      interval = setTimeout(() => {
        setDownloadProgress({
          file_name: "",
          wanted_file_size: 0,
          downloaded_file_size: 0,
          download_speed: 0,
        });
        setDownloading(false);
      }, 3000);

    return () => clearInterval(interval);
  }, [downloadProgress]);

  return (
    <AnimatePresence>
      {downloadProgress.file_name !== "" && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="downloadContainer"
          id="downloaderArea"
        >
          <div className="header">
            <h3>
              {downloadProgress.downloaded_file_size ===
              downloadProgress.wanted_file_size
                ? "Downloaded"
                : "Downloading"}{" "}
              {sessionFileDescription}
            </h3>
            <small>
              This may take a minute.
              <small className="left">
                {Math.round(
                  (downloadProgress.download_speed / 1000 / 1000) * 10
                ) / 10}{" "}
                MB/s
              </small>
            </small>
          </div>
          <p className="fileName">{downloadProgress.file_name}</p>
          <div className="downloadProgress">
            <div
              className="downloadProgressFill"
              style={{
                width: `${
                  (downloadProgress.downloaded_file_size /
                    downloadProgress.wanted_file_size) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DownloaderArea;
