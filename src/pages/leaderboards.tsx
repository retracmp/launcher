import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  queryLeaderboard,
  queryPerson,
  queryPlayerInfos,
} from "src/external/query";
import { useConfigControl } from "src/state/config";
import { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { FaCrown, FaFire, FaSkull } from "react-icons/fa6";
import "src/styles/leaderboards.css";

const Leaderboards = () => {
  const [visible, setVisible] = useState(30);
  const queryClient = useQueryClient();

  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
  });

  const config = useConfigControl();
  const { data: leaderboard, refetch: rfn } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: queryLeaderboard,
  });

  const readLeaderboard = leaderboard || [];
  const lAccountIds = readLeaderboard.map((x) => x.accountId);

  useEffect(() => {
    rfn();
  }, []);

  const playerIdx = lAccountIds.indexOf(player?.ID || "");

  const { data: players, refetch } = useQuery({
    queryKey: ["players"],
    queryFn: () => queryPlayerInfos(queryClient, lAccountIds.slice(0, visible)),
    enabled: !!leaderboard,
  });

  useEffect(() => {
    if (visible > readLeaderboard.length) return;
    refetch();
  }, [visible]);

  if (!leaderboard || !players)
    return (
      <div className="leaderboardContainer">
        {!config.drawer_open && (
          <Link className="back" to="/snow/player">
            Go Home
          </Link>
        )}
        <section>
          <div className="stat">
            <div className="name">Loading...</div>
          </div>
        </section>
      </div>
    );

  return (
    <div className="leaderboardContainer">
      {!config.drawer_open && (
        <Link className="back" to="/snow/player">
          Go Home
        </Link>
      )}
      <section className="nofill">
        <Stat
          pos={playerIdx + 1}
          stat={leaderboard[playerIdx]}
          playerInfo={{
            id: player?.ID || "",
            displayName: player?.Account.DisplayName || "Player",
          }}
        />
      </section>
      <h4>
        LEADERBOARDS{" "}
        <p>
          Ranked by score.{" "}
          <small>(each win is 10 points, each elimination is 1 point)</small>
        </p>
      </h4>
      {/* <AnimatePresence> */}
      <motion.section
        animate="visible"
        initial="hidden"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        transition={{ duration: 0.01 }}
      >
        {!!leaderboard &&
          readLeaderboard.slice(0, visible).map((d, i) => {
            return (
              <Stat
                key={d.accountId}
                pos={i + 1}
                stat={d}
                playerInfo={players[d.accountId]}
              />
            );
          })}
        <OnVisible callback={() => setVisible((x) => x + 30)} />
      </motion.section>
      {/* </AnimatePresence> */}
    </div>
  );
};

type StatProps = {
  pos: number;
  stat: {
    accountId: string;
    eliminations: number;
    wins: number;
    score: number;
  };
  playerInfo: {
    id: string;
    displayName: string;
  };
};

const Stat = (props: StatProps) => {
  const niceTop = ((pos: number) => {
    if (pos === 1) return "top1";
    if (pos === 2) return "top2";
    if (pos === 3) return "top3";
    if (pos <= 10) return "top10";
    return "";
  })(props.pos);

  if (!props.playerInfo || !props.stat) return null;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.1, type: "spring", stiffness: 100 }}
      className="stat"
      key={props.stat.accountId}
    >
      <div className={"pos " + niceTop}>#{props.pos}</div>
      <div className="name">{props.playerInfo.displayName}</div>
      <s></s>
      <div className="iconandvalue">
        <div className="icon">
          <FaSkull />
        </div>
        <div className="value">{props.stat.eliminations}</div>
      </div>
      <div className="iconandvalue">
        <div className="icon">
          <FaCrown />
        </div>
        <div className="value">{props.stat.wins}</div>
      </div>
      <div className="iconandvalue">
        <div className="icon">
          <FaFire />
        </div>
        <div className="value">{props.stat.score}</div>
      </div>
    </motion.div>
  );
};

type OnVisibleProps = {
  callback: () => void;
};

const OnVisible = (props: OnVisibleProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          props.callback();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <button className="opacity0" ref={ref}>
      Load more
    </button>
  );
};

export default Leaderboards;
