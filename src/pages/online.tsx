import { hasPakInstalled } from "src/lib/import";
import { useLibraryControl } from "src/state/library";
import { deleteFile, downloadFile } from "src/lib/tauri";
import { message } from "@tauri-apps/api/dialog";
// import { useConfigControl } from "src/state/config";

import PlaySnow from "src/components/play";
import Book from "src/components/book";
import DownloaderArea from "src/components/downloader";
import Player from "src/components/player";
import { useStates } from "src/state/state";
import { useQuery } from "@tanstack/react-query";
import { queryPerson } from "src/external/query";
import { motion } from "framer-motion";

const Online = () => {
  const libraryControl = useLibraryControl();
  // const config = useConfigControl();
  const [is_downloading] = useStates((s) => [s.is_downloading]);

  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
  });

  const handleDownloadCustomContent = async () => {
    if (libraryControl.getCurrentEntry() === null)
      return message("Please set the Fortnite directory first!", {
        title: "Retrac Error",
        type: "error",
      });

    await deleteFile(
      `${libraryControl.getCurrentEntry()?.path
      }\\FortniteGame\\Content\\Paks\\pakchunk1001-WindowsClient.pak`
    );
    await deleteFile(
      `${libraryControl.getCurrentEntry()?.path
      }\\FortniteGame\\Content\\Paks\\pakchunk1001-WindowsClient.sig`
    );

    await downloadFile(
      "https://cdn.0xkaede.xyz/data",
      "pakchunkRetrac-WindowsClient_P.pak",
      `${libraryControl.getCurrentEntry()?.path
      }\\FortniteGame\\Content\\Paks\\pakchunkRetrac-WindowsClient_P.pak`
    );
    await downloadFile(
      "https://cdn.0xkaede.xyz/data",
      "pakchunkRetrac-WindowsClient_P.sig",
      `${libraryControl.getCurrentEntry()?.path
      }\\FortniteGame\\Content\\Paks\\pakchunkRetrac-WindowsClient_P.sig`
    );

    // if (config.bubble_builds) {
    //   await downloadFile(
    //     "https://cdn.0xkaede.xyz/data",
    //     "pakchunkRetracBubble-WindowsClient_P.pak",
    //     `${
    //       libraryControl.getCurrentEntry()?.path
    //     }\\FortniteGame\\Content\\Paks\\pakchunkRetracBubble-WindowsClient_P.pak`
    //   );
    //   await downloadFile(
    //     "https://cdn.0xkaede.xyz/data",
    //     "pakchunkRetracBubble-WindowsClient_P.sig",
    //     `${
    //       libraryControl.getCurrentEntry()?.path
    //     }\\FortniteGame\\Content\\Paks\\pakchunkRetracBubble-WindowsClient_P.sig`
    //   );
    // }

    libraryControl.setPakValid(await hasPakInstalled(false));
  };

  if ((player?.snapshot.Discord.HasLlamaDonatorRole || player?.snapshot.Discord.HasCrystalDonatorRole || player?.snapshot.Discord.HasRetracPlusRole || player?.snapshot.Discord.HasRetracUltimateRole || player?.snapshot.Discord.LastBoostedAt != null)) {
    return (
      <>

        <div className="snowOverview">
          <Player />
          <Book />
          <DownloaderArea />
        </div>


        {!libraryControl.pakValid && libraryControl.getCurrentEntry() != null && (
          <button
            className="default custom"
            onClick={handleDownloadCustomContent}
            disabled={is_downloading}
          >
            Update Pak Files
          </button>
        )}

        <PlaySnow />
      </>
    );
  } else {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="player"
      >
        <div className="information">
          <span>Currently available only for donators.</span>
        </div>
      </motion.div>

    )
  }


};

export default Online;
