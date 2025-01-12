import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryContentPages } from "src/external/query";

import "src/styles/news.css";
import { AnimatePresence, motion } from "framer-motion";
import { useNewsState } from "src/state/news";

const News = () => {
  const newsState = useNewsState();

  const { data: contentPages } = useQuery({
    queryKey: ["content-pages"],
    queryFn: queryContentPages,
  });

  const motdsAllowed = (
    contentPages?.battleroyalenewsv2?.news.motds || []
  ).filter((motd) => !motd.hidden);

  useEffect(() => {
    if (motdsAllowed.length === 0) return;
    const interval = setInterval(() => {
      newsState.set_selected((newsState.selected + 1) % motdsAllowed.length!);
    }, 10000);

    return () => clearInterval(interval);
  }, [newsState.selected, contentPages]);

  return (
    <div className="outerOuter">
      <div className="newsContainer">
        <AnimatePresence>
          {contentPages &&
            contentPages.battleroyalenewsv2 &&
            motdsAllowed[newsState.selected] && (
              <NewsItem
                key={motdsAllowed[newsState.selected]?.id}
                news={motdsAllowed[newsState.selected]}
              />
            )}
        </AnimatePresence>
      </div>
      <div className="newsList">
        {motdsAllowed.map((_, i) => (
          <button
            className={newsState.selected === i ? "on" : ""}
            onClick={() => newsState.set_selected(i)}
          ></button>
        ))}
      </div>
    </div>
  );
};

type NewsProps = {
  news: {
    id: string;
    image: string;
    title: string;
    body: string;
  };
};

const NewsItem = (props: NewsProps) => {
  return (
    <motion.div
      initial={{
        x: 150,
        opacity: 0,
      }}
      animate={{
        x: 0,
        opacity: 1,
      }}
      exit={{
        x: -250,
        opacity: 0,
      }}
      transition={{
        type: "spring",
        bounce: 0.4,
      }}
      className="news"
    >
      <img src={props.news.image} alt="" />
      <div className="info">
        <h3>{props.news.title}</h3>
        <p>{props.news.body}</p>
      </div>
    </motion.div>
  );
};

export default News;
