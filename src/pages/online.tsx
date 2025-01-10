import { useStates } from "src/state/state";
import { DownloadCustomContent, hasPakInstalled } from "src/lib/import";
import { useLibraryControl } from "src/state/library";
import { useConfigControl } from "src/state/config";
import { useLayoutEffect, useState } from "react";

import PlaySnow from "src/components/play";
import Book from "src/components/book";
import DownloaderArea from "src/components/downloader";
import Player from "src/components/player";
import ShopPreview from "src/components/smallShop";
import FreeVbucks from "src/components/freeVbucks";
import ExclusionNoti from "src/components/exlcusion_noti";
import News from "src/components/news";

export const useDomWidth = () => {
  const [size, setSize] = useState(0);

  useLayoutEffect(() => {
    const updateSize = () => {
      setSize(window.innerWidth);
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};

const Online = () => {
  const [is_downloading] = useStates((s) => [s.is_downloading]);
  const libraryControl = useLibraryControl();
  const config = useConfigControl();
  const w = useDomWidth();

  return (
    <>
      {w > 930 && (
        <div className="snowOverview">
          <ExclusionNoti />
          <Player />
          <DownloaderArea />
          <News />
          <div className="duo">
            <div className="colmax">
              <Book />
              <FreeVbucks />
            </div>
            <ShopPreview />
          </div>
        </div>
      )}

      {w <= 930 && w > 675 && (
        <div className="snowOverview">
          <ExclusionNoti />
          <div className="duo">
            <Player />
            <Book />
          </div>
          <DownloaderArea />
          <div className="colmax">
            <News />
            <FreeVbucks />
            <ShopPreview />
          </div>
        </div>
      )}

      {w <= 675 && (
        <div className="snowOverview">
          <ExclusionNoti />
          <Player />
          <News />
          <Book />
          <DownloaderArea />
          <div className="colmax">
            <FreeVbucks />
            <ShopPreview />
          </div>
        </div>
      )}

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
