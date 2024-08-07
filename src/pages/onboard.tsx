import { useNavigate } from "@tanstack/react-router";
import { importBuildFromDialog } from "src/lib/import";
import { useLibraryControl } from "src/state/library";
import { useStates } from "src/state/state";

import "src/styles/onboard.css";

const Onboard = () => {
  const libraryControl = useLibraryControl();
  const fortniteEntry = libraryControl.getCurrentEntry();
  const navigate = useNavigate();

  const states = useStates();
  const okay = states.states["importing"] === "ok";

  const handleImportBuild = async () => {
    for (const library of Object.values(libraryControl.entries)) {
      libraryControl.remove(library.binaryHash);
    }
    importBuildFromDialog();
  };

  return (
    <div className="onboardContainer">
      <header>
        <h2>Welcome to Retrac!</h2>
        <p>
          Before we start, there are a few things we need to set up. Please
          follow the buttons below.
        </p>
      </header>

      {!fortniteEntry && (
        <div className="area">
          <button
            disabled={!okay}
            onClick={handleImportBuild}
            className="cube more"
          >
            {!okay ? "Please Wait..." : "Set Build Location"}
          </button>
        </div>
      )}

      {fortniteEntry && (
        <div
          onClick={() =>
            navigate({
              to: "/snow/player",
            })
          }
          className="area"
        >
          <button className="cube more">I'm ready to play Retrac!</button>
        </div>
      )}
    </div>
  );
};

export default Onboard;
