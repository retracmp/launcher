import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { HiCash, HiCheckCircle, HiCog } from "react-icons/hi";
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

  const [skippedAmount, setSkippedAmount] = useState(2);

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

      <div className="area">
        <button
          disabled={!okay || fortniteEntry != null}
          onClick={handleImportBuild}
          className={`cube more ${!fortniteEntry ? "" : "complete"}`}
        >
          {!fortniteEntry ? (
            <HiCog className="onboard_icon" />
          ) : (
            <HiCheckCircle className="onboard_icon" />
          )}
          {!fortniteEntry
            ? !okay
              ? "Please Wait..."
              : "Set Build Location"
            : "Build Location Set"}
        </button>
      </div>

      <div
        onClick={() =>
          navigate({
            to: "/snow/player",
          })
        }
        className="cube more"
      >
        <button className="cube more" disabled={skippedAmount > 1}>
          <HiCash
            className={"onboard_icon" + (skippedAmount > 1 ? "" : " disabled")}
          />
          Claim some free V-Bucks
        </button>
      </div>

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

      <button className="skip">Skip</button>
    </div>
  );
};

export default Onboard;
