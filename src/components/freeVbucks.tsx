import "src/styles/freeVbucks.css";

const FreeVbucks = () => {
  return (
    <div className="advert">
      <img src="/fortnite-v-bucks.png" alt="" className="vbucks" />
      <div className="header">
        <span>Looking for more?</span>
        <h2>CLAIM YOUR FREE DAILY V-BUCKS</h2>
      </div>
      <div className="body">
        <button>CLAIM NOW</button>
      </div>
    </div>
  );
};

export default FreeVbucks;
