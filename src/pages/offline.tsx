import { useConfigControl } from "src/state/config";
import PlaySnow from "src/components/play";
import DrawerContainer from "src/app/drawer";
import { killEpicGames } from "src/lib/tauri";

const Offline = () => {
  const username = useConfigControl((s) => s.raw_credentials);

  const handleKillGames = () => {
    killEpicGames();
  };

  return (
    <DrawerContainer>
      <div>
        <div className="snowPage">
          <div className="snowOverview">
            <div>
              <header className="snowOverviewHeader">
                <h4>
                  <strong>UNSECURE MODE</strong>
                </h4>
              </header>
              <section className="snowUpdates">
                {username && (
                  <p>
                    USING ACCOUNT <strong>{username}</strong>
                  </p>
                )}
                {!username && <p>NO DISPLAY NAME PROVIDED</p>}
              </section>
            </div>
          </div>
          <PlaySnow />
          <button className="default red" onClick={handleKillGames}>
            Kill fortnite and epic games launcher
          </button>
        </div>
      </div>
    </DrawerContainer>
  );
};

export default Offline;
