// yes i used one of my old launchers for the shop. i was too lazy to make a new one but it works fine
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRetracApi } from "src/state/retrac_api";
import { queryShop } from "src/external/query";

import "src/styles/smallShop.css";
import { AnimatePresence, motion } from "framer-motion";
import { FaClock } from "react-icons/fa6";
import moment from "moment";

const Dud = () => {
  return (
    <div className="featured-shop-wrapper right">
      <div className="featured-shop rare"></div>
    </div>
  );
};

const ShopPreview = () => {
  const [load, find] = useRetracApi((s) => [s.load, s.find]);
  useEffect(() => {
    (async () => await load())();
  }, []);

  const [selected, setSelected] = useState(0);
  const [image_failed, setImageFailed] = useState(false);

  const { data: shop } = useSuspenseQuery({
    queryKey: ["shop"],
    queryFn: queryShop,
  });

  const weekly = shop?.Storefronts.find((s) => s.Name === "BRWeeklyStorefront");
  const daily = shop?.Storefronts.find((s) => s.Name === "BRDailyStorefront");
  const offers = [
    ...(weekly?.DBMtxOffers || []),
    ...(daily?.DBMtxOffers || []),
  ];

  useEffect(() => {
    if (offers.length === 0) return;
    const interval = setInterval(() => {
      setSelected((s) => (s + 1) % offers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [selected, offers]);

  useEffect(() => {
    setImageFailed(false);
  }, [selected]);

  if (shop === null) return <Dud />;
  if (offers.length === 0) return <Dud />;

  const entry = offers[selected];
  const item = find((entry.Grants[0]?.Template || "").replace("_Retrac", ""));
  console.log(entry);
  if (!item) return <Dud />;
  return (
    <div className="featured-shop-wrapper right">
      <div
        className={`featured-shop ${item.Cosmetic.rarity.backendValue
          .split("::")[1]
          .toLowerCase()}`}
      >
        <AnimatePresence>
          {offers.length > 0 && entry !== null && (
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
              className="shop-animate-event"
              key={item.Cosmetic.name}
            >
              <div className="typeAndTime">
                <label className="itemType">
                  {item.Cosmetic.rarity.displayValue.toUpperCase()}{" "}
                  {item.Cosmetic.type.displayValue.toUpperCase()}
                </label>
                <label className="itemTime">
                  <FaClock />
                  {/* // add 24 hours */}
                  {moment(shop.Date).add(24, "hours").fromNow()}
                </label>
              </div>
              <motion.div
                initial={{
                  x: 150,
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="cosmetic"
              >
                <h2 className="name">{item.Cosmetic.name}</h2>
                <small className="description">
                  {item.Cosmetic.description}
                </small>
                {!image_failed && (
                  <img
                    src={item.Cosmetic.images.featured}
                    className="image"
                    draggable={false}
                    alt=""
                    onError={() => setImageFailed(true)}
                  />
                )}
                {image_failed && (
                  <img
                    src={item.Cosmetic.images.icon}
                    className="image"
                    draggable={false}
                    alt=""
                  />
                )}
              </motion.div>
              {/* <motion.div
                initial={{
                  x: 150,
                  scale: 0.95,
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.6,
                }}
                className="purchase"
              >
                <img
                  src="https://image.fnbr.co/price/icon_vbucks_50x.png"
                  alt=""
                  className="vbucker"
                  draggable={false}
                />
                <span>
                  <p>0</p>
                  <p>/</p>
                  <strong>{entry.Price.FinalPrice}</strong>
                </span>
              </motion.div> */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="selector">
        {offers.map((_, index) => (
          <button
            className={`selector-item ${index === selected ? "active" : ""}`}
            onClick={() => setSelected(index)}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ShopPreview;
