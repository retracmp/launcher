import { useQuery } from "@tanstack/react-query";
import { queryPerson, queryServers } from "src/external/query";

import "src/styles/servers.css";
import { FaLock, FaUnlock } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import { useConfigControl } from "src/state/config";
import { Link } from "@tanstack/react-router";
const Servers = () => {
  const { data: servers, error } = useQuery({
    queryKey: ["servers"],
    queryFn: queryServers,
    throwOnError: false,
    refetchInterval: 1000,
  });

  const config = useConfigControl();

  if (error || !servers) return null;

  const flatMap = servers.Buckets.flatMap((bucket) =>
    Object.values(bucket.Servers)
  );
  const waitingToStart = flatMap.filter((server) => server.Status === 0);
  const joinable = flatMap.filter((server) => server.Status === 1);
  const closed = flatMap.filter((server) => server.Status === 2);

  const totalInGame = flatMap.reduce(
    (acc, server) => acc + server.Parties.length,
    0
  );

  return (
    <div className="serverContainer">
      {!config.drawer_open && (
        <Link className="back" to="/snow/player">
          Go Home
        </Link>
      )}
      <div className="stats">
        <span className="stat">{totalInGame} total in-game.</span>
        <span className="stat">{flatMap.length} servers up.</span>
      </div>
      <AnimatePresence>
        {(waitingToStart.length > 0 || joinable.length > 0) && (
          <motion.section
            animate="visible"
            initial="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {waitingToStart.map((server) => (
              <Server key={server.ID} server={server} />
            ))}
            {joinable.map((server) => (
              <Server key={server.ID} server={server} />
            ))}
          </motion.section>
        )}
        {closed.length > 0 && (
          <motion.section
            animate="visible"
            initial="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {closed.map((server) => (
              <Server key={server.ID} server={server} />
            ))}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

type ServerProps = {
  server: Server;
};

const Server = (props: ServerProps) => {
  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
    enabled: false,
  });

  const stateNiceText = ((state: number) => {
    switch (state) {
      case 0:
        return "LOADING";
      case 1:
        return "Joinable";
      case 2:
        return "In-game";
      default:
        return "Unknown";
    }
  })(props.server.Status);

  const [_, __, region, playlist] = props.server.Constraint.split(":");
  const playlistNiceText = ((playlist: string) => {
    switch (playlist) {
      case "playlist_defaultsolo":
        return "Solos";
      case "playlist_vamp_solo":
        return "Lategame Solos";
      default:
        return "Unknown";
    }
  })(playlist);

  const regionNiceText = ((region: string) => {
    switch (region) {
      case "EU":
        return "EU";
      case "NA":
        return "NA";
      default:
        return "Unknown";
    }
  })(region);

  const isDonator = !((): boolean => {
    if (!player) return true;
    const discord = player.snapshot.Discord;

    if (discord.HasRetracPlusRole) return false;
    if (discord.HasCrystalDonatorRole) return false;
    if (discord.HasGamerDonatorRole) return false;
    if (discord.HasLlamaDonatorRole) return false;
    if (discord.HasFeverDonatorRole) return false;
    if (discord.HasPUBGDonatorRole) return false;
    if (discord.HasContentCreatorRole) return false;
    if (discord.LastBoostedAt != "") return false;
    return true;
  })();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.1, type: "spring", stiffness: 100 }}
      className="server"
    >
      <div className="row">
        <h3>
          <b className={props.server.Status === 1 ? "open" : ""}>
            {stateNiceText.toUpperCase()}
          </b>{" "}
          <p>•</p> {playlistNiceText}
        </h3>
        <s></s>
        <div className="tags">
          {props.server.DonatorOnly && (
            <p className="donateonly">
              {!isDonator ? <FaLock /> : <FaUnlock />}
              <span className="text">Donators Only</span>
            </p>
          )}
          <p className="players">
            {props.server.Parties.length}
            <small>/100</small>
          </p>
        </div>
      </div>
      <div className="row">
        <div className="progress">
          <div
            className={
              "progress-bar " + (props.server.Status === 2 ? "closed" : "")
            }
            style={{ width: `${props.server.Parties.length}%` }}
          />
        </div>
      </div>
      <div className="row">
        <span className="serverId">
          <b></b> {regionNiceText} • {props.server.ID}
        </span>
      </div>
    </motion.div>
  );
};

export default Servers;
