import { useStates } from "src/state/state";
import { DownloadCustomContent, hasPakInstalled } from "src/lib/import";
import { useLibraryControl } from "src/state/library";

import PlaySnow from "src/components/play";
import Book from "src/components/book";
import DownloaderArea from "src/components/downloader";
import Player from "src/components/player";
import { useConfigControl } from "src/state/config";
// import MatchStats from "src/components/stats";

const Online = () => {
  const libraryControl = useLibraryControl();
  const config = useConfigControl();
  const [is_downloading] = useStates((s) => [s.is_downloading]);

  return (
    <>
      <div className="snowOverview">
        {/* <div>
          <header className="snowOverviewHeader">
            <h4>
              SEASON <strong>{snowData?.CurrentSeason || "?"} </strong>
            </h4>
          </header>
          <section className="snowUpdates">
            <p>
              {CHOSEN_SUFFIX}
              <strong>{CHOSEN_PLAYLIST}</strong>
            </p>
          </section>
        </div> */}

        <Player />
        <Book />
        {/* <MatchStats /> */}
        <DownloaderArea />
      </div>

      {/* <button className="default" onClick={handleImportBuild}>
        Set Fortnite Directory
      </button> */}

      {!config.drawer_open &&
        (!hasPakInstalled ||
          (!libraryControl.pakValid &&
            libraryControl.getCurrentEntry() != null && (
              <button
                className="default custom"
                onClick={DownloadCustomContent}
                disabled={is_downloading}
              >
                Update Pak Files
              </button>
            )))}

      <PlaySnow />
    </>
  );
};

export default Online;
