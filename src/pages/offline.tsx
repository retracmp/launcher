import { useConfigControl } from "src/state/config";
import { useLibraryControl } from "src/state/library";
import { importBuildFromDialog } from "src/lib/import";

import PlaySnow from "src/components/play";

const Offline = () => {
  const libraryControl = useLibraryControl();
  const username = useConfigControl((s) => s.raw_credentials);

  const handleImportBuild = async () => {
    for (const library of Object.values(libraryControl.entries)) {
      libraryControl.remove(library.binaryHash);
    }
    importBuildFromDialog();
  };

  return (
    <div className="snowPage">
      <div className="snowOverview">
        <div>
          <header className="snowOverviewHeader">
            <h4>
              RETRAC <strong>UNSECURE MODE</strong>
            </h4>
          </header>
          <section className="snowUpdates">
            {username && (
              <p>
                USING ACCOUNT <strong>{username}</strong>
              </p>
            )}
            {!username && <p>NO DISPLAY NAME PROVIDED</p>}
          </section>
        </div>
      </div>

      <button className="default" onClick={handleImportBuild}>
        Set Fortnite Directory
      </button>
      <PlaySnow />
    </div>
  );
};

export default Offline;
