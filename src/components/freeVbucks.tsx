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
    console.log(link);
    if (link.ok) {
      open(link.data);
    }
  };

  const alreadyClaimed =
    player?.Account.State.ClaimedPackages["lootlabs_1kvbucks"]; // this is a iso date string of when it last claimed
  const parsed = new Date(alreadyClaimed || 0);
  const now = new Date();
  const disableButton = now.getTime() - parsed.getTime() < 24 * 60 * 60 * 1000;

  const [timeToWaitNiceText, setTimeToWaitNiceText] = useState<string>(
    new Date(24 * 60 * 60 * 1000 - (now.getTime() - parsed.getTime()))
      .toISOString()
      .slice(11, 19)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const time = new Date(
        24 * 60 * 60 * 1000 - (now.getTime() - parsed.getTime())
      );
      setTimeToWaitNiceText(time.toISOString().slice(11, 19));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
