import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HiCash, HiCheckCircle, HiCog, HiShieldCheck } from "react-icons/hi";
import { advert_link } from "src/external/advert";
import { queryPerson } from "src/external/query";
import { exclude_retrac } from "src/lib/defender";
import { importBuildFromDialog } from "src/lib/import";
import { useConfigControl } from "src/state/config";
import { useLibraryControl } from "src/state/library";
import { useStates } from "src/state/state";
import { useUserControl } from "src/state/user";

import "src/styles/onboard.css";

const Onboard = () => {
  const libraryControl = useLibraryControl();
  const configControl = useConfigControl();
  const fortniteEntry = libraryControl.getCurrentEntry();
  const navigate = useNavigate();

  const states = useStates();
  const import_okay = states.states["importing"] === "ok";
  const defender_ok = configControl.is_defender_excluded;

  const [clickedClaim, setClickedClaim] = useState(false);
  const [skippedAmount, setSkippedAmount] = useState(0);

  const handleImportBuild = async () => {
    for (const library of Object.values(libraryControl.entries)) {
      libraryControl.remove(library.binaryHash);
    }
    configControl.set_is_defender_excluded(false);
    configControl.set_show_defender_popup(true);
    importBuildFromDialog();
    setSkippedAmount((x) => x + 1);
  };

  const {
    data: playerReal,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
  });

  const condition = isLoading || error;
  const player = condition ? null : playerReal;
  const alreadyClaimed =
    player?.Account.State.ClaimedPackages["lootlabs_1kvbucks"]; // this is a iso date string of when it last claimed
  const parsed = new Date(alreadyClaimed || 0);
  const now = new Date();
  const disableButton = now.getTime() - parsed.getTime() < 24 * 60 * 60 * 1000;

  const account = useUserControl();
  const handleClaimVbucks = async () => {
    const link = await advert_link(account.access_token);
    if (link.ok) {
      open(link.data);
    }
  };

  let defaultTimeToWaitNiceText = "24h 0m 0s";
  const diff = 24 * 60 * 60 * 1000 - (now.getTime() - parsed.getTime());
  if (diff >= 0) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    defaultTimeToWaitNiceText = `${hours}h ${minutes}m ${seconds}s`;
  }
  const [timeToWaitNiceText, setTimeToWaitNiceText] = useState(
    defaultTimeToWaitNiceText
  );

  useEffect(() => {
    const f = () => {
      const diff = 24 * 60 * 60 * 1000 - (now.getTime() - parsed.getTime());
      if (diff < 0) {
        setTimeToWaitNiceText(defaultTimeToWaitNiceText);
        return;
      }

      const hours = Math.floor(diff / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);

      setTimeToWaitNiceText(`${hours}h ${minutes}m ${seconds}s`);
    };
    const interval = setInterval(f, 1000);
    f();

    return () => clearInterval(interval);
  }, [parsed, now]);

  useEffect(() => {
    if (fortniteEntry && skippedAmount < 1) {
      setSkippedAmount(1);
    }

    if (configControl.is_defender_excluded && skippedAmount < 2) {
      setSkippedAmount(2);
    }

    if ((clickedClaim && skippedAmount < 3) || disableButton) {
      setSkippedAmount(3);
    }
  }, [fortniteEntry, disableButton]);

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
          disabled={!import_okay || fortniteEntry != null}
          onClick={handleImportBuild}
          className={`cube more ${!fortniteEntry ? "" : "complete"}`}
        >
          {!fortniteEntry ? (
            <HiCog className="onboard_icon" />
          ) : (
            <HiCheckCircle className="onboard_icon" />
          )}
          {!fortniteEntry
            ? !import_okay
              ? "Please Wait..."
              : "Set Build Location"
            : "Build Location Set"}
        </button>
      </div>

      {fortniteEntry && (
        <div className="area">
          <button
            disabled={defender_ok || skippedAmount > 1}
            onClick={exclude_retrac}
            className={`cube more ${!defender_ok ? "" : "complete"}`}
          >
            {!defender_ok ? (
              <HiShieldCheck className="onboard_icon" />
            ) : (
              <HiCheckCircle className="onboard_icon" />
            )}
            {!defender_ok
              ? "Add Retrac to Exclusions"
              : "Excluded from Windows Defender"}
          </button>
        </div>
      )}

      {fortniteEntry && (defender_ok || skippedAmount > 1) && (
        <div
          onClick={() => {
            setClickedClaim(true);
            handleClaimVbucks();
          }}
          className="cube more"
        >
          <button
            className="cube more"
            disabled={skippedAmount > 2 || disableButton}
          >
            <HiCash
              className={
                "onboard_icon" + (skippedAmount > 2 ? "" : " disabled")
              }
            />
            {disableButton
              ? `Claim V-Bucks in ${timeToWaitNiceText}`
              : "Claim some free V-Bucks"}
          </button>
        </div>
      )}

      {fortniteEntry &&
        (defender_ok || skippedAmount > 1) &&
        (clickedClaim || skippedAmount > 2) && (
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

      {fortniteEntry && skippedAmount < 3 && (
        <button onClick={() => setSkippedAmount((x) => x + 1)} className="skip">
          Skip
        </button>
      )}
    </div>
  );
};

export default Onboard;
