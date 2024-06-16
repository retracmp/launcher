// import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryPerson } from "src/external/query";
import { AnimatePresence, motion } from "framer-motion";

import "src/styles/player.css";

// const Player_SEASON8 = () => {
//   const [fortniteApiImageLoaded, setFortniteApiImageLoaded] = useState(false);
//   const [fortniteApiImageError, setFortniteApiImageError] = useState(false);
//   const [retracImageLoaded, setRetracImageLoaded] = useState(false);

//   const { data: player } = useQuery({
//     queryKey: ["player"],
//     queryFn: queryPerson,
//   });

//   const characterID = JSON.parse(
//     (
//       Object.values(player?.snapshot.AthenaProfile.Attributes || []).find(
//         (a) => a.Key == "favorite_character"
//       ) || {
//         ValueJSON: "",
//       }
//     ).ValueJSON || '""'
//   );
//   const character = player?.snapshot.AthenaProfile.Items[characterID];
//   const hasPlayedBefore =
//     JSON.parse(
//       (
//         Object.values(player?.snapshot.AthenaProfile.Attributes || []).find(
//           (a) => a.Key == "xp"
//         ) || {
//           ValueJSON: "",
//         }
//       ).ValueJSON || '"0"'
//     ) != "0";

//   useEffect(() => {
//     setFortniteApiImageLoaded(false);
//     setFortniteApiImageError(false);
//     setRetracImageLoaded(false);
//   }, [character]);

//   const canRender = fortniteApiImageLoaded || retracImageLoaded;

//   return (
//     <>
//       {canRender && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.95 }}
//           transition={{ duration: 0.2 }}
//           className="player"
//         >
//           {retracImageLoaded && (
//             <div
//               className="avatar"
//               style={{
//                 backgroundImage: `url(https://cdn.0xkaede.xyz/characters/${
//                   character?.TemplateID.split(":")[1]
//                 }.png)`,
//               }}
//             />
//           )}

//           {fortniteApiImageLoaded && (
//             <div
//               className="avatar"
//               style={{
//                 backgroundImage: `url(https://fortnite-api.com/images/cosmetics/br/${
//                   character?.TemplateID.split(":")[1]
//                 }/icon.png)`,
//               }}
//             />
//           )}
//           <div className="information">
//             <span>{hasPlayedBefore ? "Welcome back" : "Welcome"}</span>
//             <span className="name">{player?.snapshot.DisplayName}</span>
//           </div>
//         </motion.div>
//       )}

//       {!fortniteApiImageError && (
//         <img
//           src={`https://fortnite-api.com/images/cosmetics/br/${
//             character?.TemplateID.split(":")[1]
//           }/icon.png`}
//           onLoad={() => setFortniteApiImageLoaded(true)}
//           onError={() => setFortniteApiImageError(true)}
//           style={{ display: "none" }}
//         />
//       )}

//       {fortniteApiImageError && !retracImageLoaded && (
//         <img
//           src={`https://cdn.0xkaede.xyz/characters/${
//             character?.TemplateID.split(":")[1]
//           }.png`}
//           onLoad={() => setRetracImageLoaded(true)}
//           style={{ display: "none" }}
//         />
//       )}
//     </>
//   );
// };

// const Player_SEASON10 = () => {
//   const [fortniteApiImageLoaded, setFortniteApiImageLoaded] = useState(false);
//   const [fortniteApiImageError, setFortniteApiImageError] = useState(false);
//   const [retracImageLoaded, setRetracImageLoaded] = useState(false);

//   const { data: player } = useQuery({
//     queryKey: ["player"],
//     queryFn: queryPerson,
//   });

//   const characterID = JSON.parse(
//     (
//       Object.values(player?.snapshot.AthenaProfile.Attributes || []).find(
//         (a) => a.Key == "favorite_character"
//       ) || {
//         ValueJSON: "",
//       }
//     ).ValueJSON || '""'
//   );
//   const character = player?.snapshot.AthenaProfile.Items[characterID];
//   const hasPlayedBefore =
//     JSON.parse(
//       (
//         Object.values(player?.snapshot.AthenaProfile.Attributes || []).find(
//           (a) => a.Key == "xp"
//         ) || {
//           ValueJSON: "",
//         }
//       ).ValueJSON || '"0"'
//     ) != "0";

//   useEffect(() => {
//     setFortniteApiImageLoaded(false);
//     setFortniteApiImageError(false);
//     setRetracImageLoaded(false);
//   }, [character]);

//   const canRender = fortniteApiImageLoaded || retracImageLoaded;

//   return (
//     <>
//       {canRender && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.95 }}
//           transition={{ duration: 0.2 }}
//           className="player"
//         >
//           {retracImageLoaded && (
//             <div
//               className="avatar"
//               style={{
//                 backgroundImage: `url(https://cdn.0xkaede.xyz/characters/${
//                   character?.TemplateID.split(":")[1]
//                 }.png)`,
//               }}
//             />
//           )}

//           {fortniteApiImageLoaded && (
//             <div
//               className="avatar"
//               style={{
//                 backgroundImage: `url(https://fortnite-api.com/images/cosmetics/br/${
//                   character?.TemplateID.split(":")[1]
//                 }/icon.png)`,
//               }}
//             />
//           )}
//           <div className="information">
//             <span>{hasPlayedBefore ? "Welcome back" : "Welcome"}</span>
//             <span className="name">{player?.snapshot.DisplayName}</span>
//           </div>
//         </motion.div>
//       )}

//       {!fortniteApiImageError && (
//         <img
//           src={`https://fortnite-api.com/images/cosmetics/br/${
//             character?.TemplateID.split(":")[1]
//           }/icon.png`}
//           onLoad={() => setFortniteApiImageLoaded(true)}
//           onError={() => setFortniteApiImageError(true)}
//           style={{ display: "none" }}
//         />
//       )}

//       {fortniteApiImageError && !retracImageLoaded && (
//         <img
//           src={`https://cdn.0xkaede.xyz/characters/${
//             character?.TemplateID.split(":")[1]
//           }.png`}
//           onLoad={() => setRetracImageLoaded(true)}
//           style={{ display: "none" }}
//         />
//       )}
//     </>
//   );
// };

const Player_SEASON14 = () => {
  // const [fortniteApiImageLoaded, setFortniteApiImageLoaded] = useState(false);
  // const [fortniteApiImageError, setFortniteApiImageError] = useState(false);
  // const [retracImageLoaded, setRetracImageLoaded] = useState(false);

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

  const CidToUse = character.TemplateID.split(":")[1];

  console.log(CidToUse)

  console.log(CidToUse.includes("Retrac"))

  // const canRender = fortniteApiImageLoaded || retracImageLoaded;
  if (!character) return null;

  if (CidToUse.includes("Retrac")) {
    return (
      <>

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
              backgroundImage: `url(https://cdn.0xkaede.xyz/characters/${CidToUse}.png)`,
            }}
          />

          <div className="information">
            <span>{hasPlayedBefore ? "Welcome back" : "Welcome"}</span>
            <span className="name">{player?.snapshot.DisplayName}</span>
          </div>
        </motion.div>
      </>
    );
  } else {
    return (
      <>
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
              backgroundImage: `url(https://fortnite-api.com/images/cosmetics/br/${CidToUse}/icon.png)`,
            }}
          />

          <div className="information">
            <span>{hasPlayedBefore ? "Welcome back" : "Welcome"}</span>
            <span className="name">{player?.snapshot.DisplayName}</span>
          </div>
        </motion.div>
      </>
    );
  }


};

const Choose = () => {
  // const {data: launcherStats } = useQuery<LauncherStats>({
  //   queryKey: ["launcher"],
  //   queryFn: queryStats,
  //   initialData: {
  //     PlayersOnline: 0,
  //     CurrentBuild: "0.0",
  //     CurrentSeason: 0,
  //   },
  //   throwOnError: false,
  // });
  // if (launcherStats.CurrentSeason == 8) {
  //   console.log("s8");
  //   return <Player_SEASON8 />;
  // }
  // else if (launcherStats.CurrentSeason == 10) {
  //   console.log("s10");
  //   return <Player_SEASON10 />;
  // }
  // console.log("s14")
  return <Player_SEASON14 />;
};

export default () => (
  <AnimatePresence>
    <Choose />
  </AnimatePresence>
);
