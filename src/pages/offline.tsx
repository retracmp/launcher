import { useConfigControl } from "src/state/config";
import PlaySnow from "src/components/play";
import DrawerContainer from "src/app/drawer";

const Offline = () => {
  const username = useConfigControl((s) => s.raw_credentials);

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
        </div>
        <PlaySnow />
      </div>
    </DrawerContainer>
  );
};

export default Offline;
