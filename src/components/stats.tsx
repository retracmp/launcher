import { FaCrown } from "react-icons/fa6";
import "src/styles/stats.css";

const MatchStats = () => {
  return (
    <div className="statsContainer">
      <div className="statBox one">
        <section>
          <FaCrown /> <p>Wins</p>
        </section>
        <main>
          <p>0</p>
        </main>
      </div>
      <div className="statBox two"></div>
      <div className="statBox three"></div>
    </div>
  );
};

export default MatchStats;
