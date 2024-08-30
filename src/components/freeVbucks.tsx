import { useQuery } from "@tanstack/react-query";
import { open } from "@tauri-apps/api/shell";
import { useEffect, useState } from "react";
import { advert_link } from "src/external/advert";
import { queryPerson } from "src/external/query";
import { useUserControl } from "src/state/user";
import "src/styles/freeVbucks.css";

const FreeVbucks = () => {
  const account = useUserControl();
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

  const handleClaimVbucks = async () => {
    const link = await advert_link(account.access_token);
    if (link.ok) {
      open(link.data);
    }
  };

  const alreadyClaimed =
    player?.Account.State.ClaimedPackages["lootlabs_1kvbucks"]; // this is a iso date string of when it last claimed
  const parsed = new Date(alreadyClaimed || 0);
  const now = new Date();
  const disableButton = now.getTime() - parsed.getTime() < 24 * 60 * 60 * 1000;

  // the nice text is how long until lastClaimTime + 24 hours
  // every second, we update the timeToWaitNiceText
  // it should be in the format of "1h 30m 20s"

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
    const interval = setInterval(() => {
      const diff = 24 * 60 * 60 * 1000 - (now.getTime() - parsed.getTime());
      if (diff < 0) {
        setTimeToWaitNiceText(defaultTimeToWaitNiceText);
        return;
      }

      const hours = Math.floor(diff / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);

      setTimeToWaitNiceText(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    // func();

    return () => clearInterval(interval);
  }, [parsed, now]);

  if (condition) {
    return null;
  }

  return (
    <div className="advert">
      <img src="/fortnite-v-bucks.png" alt="" className="vbucks" />
      <div className="header">
        <span>Looking for more?</span>
        <h2>CLAIM YOUR FREE DAILY V-BUCKS</h2>
      </div>
      <div className="body" onClick={handleClaimVbucks}>
        <button disabled={disableButton}>
          {disableButton ? `Claim in ${timeToWaitNiceText}` : "Claim Now"}
        </button>
      </div>
    </div>
  );
};

export default FreeVbucks;
