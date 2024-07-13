import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryContentPages } from "src/external/query";

import "src/styles/news.css";
import { AnimatePresence, motion } from "framer-motion";

const News = () => {
  const { data: contentPages } = useQuery({
    queryKey: ["content-pages"],
    queryFn: queryContentPages,
  });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (contentPages?.battleroyalenewsv2?.news.motds.length === 0) return;
    const interval = setInterval(() => {
      setSelected(
        (s) => (s + 1) % contentPages?.battleroyalenewsv2?.news.motds.length!
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [selected, contentPages]);

  return (
    <div className="newsContainer">
      <AnimatePresence>
        {contentPages && contentPages.battleroyalenewsv2 && (
          <NewsItem
            key={contentPages.battleroyalenewsv2.news.motds[selected]?.id}
            news={contentPages.battleroyalenewsv2.news.motds[selected]}
          />
        )}
      </AnimatePresence>
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
