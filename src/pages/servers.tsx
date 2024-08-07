import { useQuery } from "@tanstack/react-query";
import { queryServers } from "src/external/query";

import "src/styles/servers.css";
// import { FaLock, FaUnlock } from "react-icons/fa6";
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

  const flatMap = (servers.buckets || []).flatMap(
    (bucket) => Object.values(bucket.servers || []) || []
  );
  const waitingToStart = flatMap.filter((server) => (server.status || 0) === 0);
  const joinable = flatMap.filter((server) => (server.status || 0) === 1);
  const closed = flatMap.filter((server) => (server.status || 0) === 2);

  const totalInGame = flatMap.reduce(
    (acc, server) => acc + (server.partyIdsAssinged || []).length,
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
        {waitingToStart.length === 0 && joinable.length === 0 && (
          <motion.section
            animate="visible"
            initial="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            <motion.div className="server">
              <p className="noServers">No servers are up right now.</p>
            </motion.div>
          </motion.section>
        )}
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
              <Server key={server.id} server={server} />
            ))}
            {joinable.map((server) => (
              <Server key={server.id} server={server} />
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
              <Server key={server.id} server={server} />
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
  // const { data: player } = useQuery({
  //   queryKey: ["player"],
  //   queryFn: queryPerson,
  //   enabled: false,
  // });

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
  })(props.server.status || 0);

  const [_, __, region, playlist] = props.server.bucket_id.split(":");
  const playlistNiceText = ((playlist: string) => {
    switch (playlist) {
      case "playlist_defaultsolo":
        return "Solos";
      case "playlist_defaultduo":
        return "Duos";
      case "playlist_defaulttrio":
        return "Trios";
      case "playlist_vamp_solo":
        return "Lategame Solos";
      case "showdown":
        return "Arena";
      default:
        return "Unknown";
    }
  })(playlist.toLocaleLowerCase());

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
          <b className={(props.server.status || 0) === 1 ? "open" : ""}>
            {stateNiceText.toUpperCase()}
          </b>{" "}
          <p>•</p> {playlistNiceText}
        </h3>
        <s></s>
        <div className="tags">
          {/* {props.server.DonatorOnly && (
            <p className="donateonly">
              {!isDonator ? <FaLock /> : <FaUnlock />}
              <span className="text">Donators Only</span>
            </p>
          )} */}
          <p className="players">
            {(props.server.partyIdsAssinged || []).length}
            <small>/100</small>
          </p>
        </div>
      </div>
      <div className="row">
        <div className="progress">
          <div
            className={
              "progress-bar " +
              ((props.server.status || 0) === 2 ? "closed" : "")
            }
            style={{
              width: `${(props.server.partyIdsAssinged || []).length}%`,
            }}
          />
        </div>
      </div>
      <div className="row">
        <span className="serverId">
          <b></b> {regionNiceText} • {props.server.id}
        </span>
      </div>
    </motion.div>
  );
};

export default Servers;
