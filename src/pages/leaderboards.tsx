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

  useEffect(() => {
    rfn();
  }, []);

  const sortedLeaderboard = Object.entries(leaderboard || {}).sort((a, b) => {
    const totalWinsA = a[1].Top1_1 + a[1].Top1_2 + a[1].Top1_3 + a[1].Top1_4;
    const scoreA = Math.round(a[1].Eliminations + totalWinsA * 10);

    const totalWinsB = b[1].Top1_1 + b[1].Top1_2 + b[1].Top1_3 + b[1].Top1_4;
    const scoreB = Math.round(b[1].Eliminations + totalWinsB * 10);

    return scoreB - scoreA;
  });

  const sortedLeaderboardIds = sortedLeaderboard.map((d) => d[0]);
  const playerIdx = sortedLeaderboardIds.indexOf(player?.snapshot.ID || "");

  const { data: players, refetch } = useQuery({
    queryKey: ["players"],
    queryFn: () =>
      queryPlayerInfos(queryClient, sortedLeaderboardIds.slice(0, visible)),
    enabled: !!leaderboard,
  });

  useEffect(() => {
    if (visible > sortedLeaderboard.length) return;
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
          pos={playerIdx}
          stat={leaderboard[player?.snapshot.ID || ""]}
          playerInfo={{
            id: player?.snapshot.ID || "",
            displayName: player?.snapshot.DisplayName || "Player",
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
          sortedLeaderboard.slice(0, visible).map((d, i) => {
            return (
              <Stat
                key={d[0]}
                pos={i + 1}
                stat={d[1]}
                playerInfo={players[d[0]]}
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
  stat: SeasonStat;
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

  const totalWins =
    props.stat.Top1_1 +
    props.stat.Top1_2 +
    props.stat.Top1_3 +
    props.stat.Top1_4;
  const score = Math.round(props.stat.Eliminations + totalWins * 10);

  if (!props.playerInfo) return null;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.1, type: "spring", stiffness: 100 }}
      className="stat"
      key={props.stat.ID}
    >
      <div className={"pos " + niceTop}>#{props.pos}</div>
      <div className="name">{props.playerInfo.displayName}</div>
      <s></s>
      <div className="iconandvalue">
        <div className="icon">
          <FaSkull />
        </div>
        <div className="value">{props.stat.Eliminations}</div>
      </div>
      <div className="iconandvalue">
        <div className="icon">
          <FaCrown />
        </div>
        <div className="value">
          {props.stat.Top1_1 +
            props.stat.Top1_2 +
            props.stat.Top1_3 +
            props.stat.Top1_4}
        </div>
      </div>
      <div className="iconandvalue">
        <div className="icon">
          <FaFire />
        </div>
        <div className="value">{score}</div>
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
