import { useQuery } from "@tanstack/react-query";
import { queryPerson, queryServers } from "src/external/query";

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
  // const waitingToStart = flatMap.filter((server) => (server.status || 0) === 0);
  // const joinable = flatMap.filter((server) => (server.status || 0) === 1);
  // const closed = flatMap.filter((server) => (server.status || 0) === 2);

  const totalInGame = flatMap.reduce(
    (acc, server) =>
      acc +
        (server.parties_assigned || []).reduce(
          (acc, party) => acc + party.party_members.length || 0,
          0
        ) || 0,
    0
  );

  return (
    <div className="serverContainer">
      {!config.drawer_open && (
        <Link className="back" to="/snow/player">
          Go Home
        </Link>
      )}
      <h4>
        SERVERS{" "}
        <p>
          These are currently active servers and serve no use of when to ready
          up.
        </p>
      </h4>
      <div className="stats">
        <span className="stat">{totalInGame} total in-game.</span>
        <span className="stat">{flatMap.length} servers up.</span>
      </div>
      <AnimatePresence>
        <motion.section
          animate="visible"
          initial="hidden"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {flatMap.map((server) => (
            <Server key={server.id} server={server} />
          ))}
          {flatMap.length === 0 && (
            <motion.div className="server">
              <p className="noServers">No servers are up right now.</p>
            </motion.div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

type ServerProps = {
  server: Server;
};

const SWAP = {
  Initialised: "Initialised",
  AssignedParties_WaitingForGameserverSocket: "LOADING",
  GameserverConfirmedParties_WaitingToMatchmake: "MATCHMAKING",
  PlayersMatchmaked_WaitingForBus: "WAITING FOR BUS",
  BusStarted_WaitingToEnd: "INGAME",
};

const getNiceName = (str: string) => {
  const str_low = str.toLowerCase();

  let Playlist = "";
  let Gamemode = "";

  if (str_low.includes("solo")) {
    Playlist = "Solo";
  } else if (str_low.includes("duo")) {
    Playlist = "Duo";
  } else if (str_low.includes("trio")) {
    Playlist = "Trio";
  } else if (str_low.includes("squad")) {
    Playlist = "Squad";
  }

  if (str_low.includes("vamp")) {
    Gamemode = "Lategame";
  } else if (str_low.includes("showdown")) {
    Gamemode = "Arena";
  } else if (str_low.includes("Low")) {
    Gamemode = "One Shot";
  }

  return `${Playlist} ${Gamemode}`;
};

const Server = (props: ServerProps) => {
  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
  });

  const doIExistInGame = (props.server.parties_assigned || []).some((party) =>
    party.party_members.some((member) => member.id === player?.ID)
  );

  const totalPlayers = (props.server.parties_assigned || []).reduce(
    (acc, party) => acc + party.party_members.length || 0,
    0
  );

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.1, type: "spring", stiffness: 100 }}
      className={`server ${doIExistInGame ? "inGame" : ""}`}
    >
      <div className="row">
        <h3>
          <b className={(props.server.status || 0) === 1 ? "open" : ""}>
            {/* {props.server.string_status.toUpperCase()} */}
            {(
              SWAP[props.server.string_status as keyof typeof SWAP] ||
              props.server.string_status
            ).toUpperCase()}
          </b>{" "}
          <p>•</p> {getNiceName(props.server.bucket_id)}
        </h3>
        <s></s>
        <div className="tags">
          {doIExistInGame && (
            <p className="donateonly">
              {/* {!isDonator ? <FaLock /> : <FaUnlock />} */}
              <span className="text">YOU ARE IN THIS GAME</span>
            </p>
          )}
          <p className="players">
            {totalPlayers}
            <small>/{props.server.maxplayercount}</small>
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
              width: `${(totalPlayers / props.server.maxplayercount) * 100}%`,
            }}
          />
        </div>
      </div>
      <div className="row">
        <span className="serverId">
          <b></b> {props.server.region} • {props.server.id}
        </span>
      </div>
    </motion.div>
  );
};

export default Servers;
