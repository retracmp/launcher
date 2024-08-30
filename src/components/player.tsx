import { useQuery } from "@tanstack/react-query";
import { queryPerson } from "src/external/query";
import { AnimatePresence, motion } from "framer-motion";

import "src/styles/player.css";

const Player_SEASON14 = () => {
  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
  });

  const loadout = player?.Profiles.athena.Loadouts.find(
    (l) => l.ID === player?.Profiles.athena.Attributes["loadouts"][0]
  );
  const character = player?.Profiles.athena.Items[loadout?.CharacterID || ""];
  console.log(loadout, character);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="player"
    >
      {character?.Template ? (
        <div
          className="avatar"
          style={{
            backgroundImage: `url(https://fortnite-api.com/images/cosmetics/br/${character?.Template.replace(
              "_Retrac",
              ""
            )}/icon.png)`,
          }}
        />
      ) : (
        <div
          className="avatar unknown"
          style={{
            backgroundImage: `url(/mark.png)`,
            height: "100%",
            marginBottom: "0rem",
            marginLeft: "0.5rem",
          }}
        />
      )}
      <div className="information">
        <span>Welcome</span>
        <span className="name">{player?.Account.DisplayName || "Player"}</span>
      </div>
    </motion.div>
  );
};

const Choose = () => {
  return <Player_SEASON14 />;
};

export default () => (
  <AnimatePresence>
    <Choose />
  </AnimatePresence>
);
