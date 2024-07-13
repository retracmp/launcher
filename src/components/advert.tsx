import { useQuery } from "@tanstack/react-query";
import { queryPerson } from "src/external/query";
import { open } from "@tauri-apps/api/shell";

import "src/styles/advert.css";
import News from "./news";

const UltimateAdvert = () => {
  return (
    <div className="homepageAdvert ult">
      <span className="sale">SALE!</span>
      <h3>ULTIMATE DONATOR</h3>
      <img className="image" src="/ult.png" alt="" />
      <button
        onClick={() =>
          open("https://donations.retrac.site/product/ultimate-donator")
        }
        className="buy"
      >
        <span>DONATE NOW</span>
      </button>
    </div>
  );
};

const CrystalAdvert = () => {
  return (
    <div className="homepageAdvert crystal">
      <span className="sale">SALE!</span>
      <h3>CRYSTAL DONATOR</h3>
      <img className="image" src="/crystal.webp" alt="" />
      <button
        onClick={() =>
          open("https://donations.retrac.site/product/crystal-donator")
        }
        className="buy"
      >
        <span>DONATE NOW</span>
      </button>
    </div>
  );
};

const ADVERTS = [UltimateAdvert, CrystalAdvert];
const RANDOM_ADVERT = ADVERTS[Math.floor(Math.random() * ADVERTS.length)];

const Advert = () => {
  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
  });

  const enable_advert = ((): boolean => {
    if (!player) return true;
    const discord = player.snapshot.Discord!;
    if (discord.HasCrystalDonatorRole) return false;
    if (discord.HasRetracUltimateRole) return false;
    return true;
  })();

  if (!enable_advert) return <News />;

  return <RANDOM_ADVERT />;
};

export default Advert;
