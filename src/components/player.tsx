import { useQuery } from "@tanstack/react-query";
import { queryPerson } from "src/external/query";
import { AnimatePresence, motion } from "framer-motion";

import "src/styles/player.css";

const Player_SEASON14 = () => {
  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
  });

  const hasPlayedBefore =
    JSON.parse(
      (
        Object.values(player?.snapshot.AthenaProfile.Attributes || []).find(
          (a) => a.Key == "xp"
        ) || {
          ValueJSON: "",
        }
      ).ValueJSON || '"0"'
    ) != "0";

  const loadoutIds: string[] = JSON.parse(
    (
      Object.values(player?.snapshot.AthenaProfile.Attributes || []).find(
        (a) => a.Key == "loadouts"
      ) || {
        ValueJSON: "[]",
      }
    ).ValueJSON || "[]"
  );

  const loadoutId = loadoutIds[0];

  const loadout = player?.snapshot.AthenaProfile.Loadouts[loadoutId];
  const character = player?.snapshot.AthenaProfile.Items[
    loadout?.CharacterID || ""
  ] || {
    TemplateID: "AthenaCharacter:CID_001_Athena_Commando_F_Default",
  };

  if (!character) return null;
  const pureId =
    character.TemplateID.split(":")[1] || "CID_001_Athena_Commando_F_Default";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="player"
    >
      <div
        className="avatar"
        style={{
          backgroundImage: `url(https://fortnite-api.com/images/cosmetics/br/${pureId.replace(
            "_Retrac",
            ""
          )}/icon.png)`,
        }}
      />
      <div className="information">
        <span>{hasPlayedBefore ? "Welcome back" : "Welcome"}</span>
        <span className="name">{player?.snapshot.DisplayName || "Player"}</span>
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
