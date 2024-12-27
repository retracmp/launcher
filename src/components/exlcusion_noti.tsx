import { HiCursorClick, HiX } from "react-icons/hi";
import { HiExclamationTriangle } from "react-icons/hi2";
import { useConfigControl } from "src/state/config";

import "src/styles/ExclusionNoti.css";

const ExclusionNoti = () => {
  const config = useConfigControl();

  return (
    <>
      {config.show_defender_popup && (
        <div className="flexy">
          <div className="eclusion">
            <HiExclamationTriangle className="warn" />
            <div className="info">
              <h3>Windows Defender Exclusion.</h3>
              <p>
                It is recommended to add Retrac to the Windows Defender
                exclusion list, this will prevent any issues with the
                application. (this may ask for one-time admin privileges)
              </p>
              {/* <button className="accept">Add to Exclusion</button> */}
            </div>

            <button
              onClick={() => {
                config.set_show_defender_popup(false);
              }}
              className="Cancel"
            >
              <HiX />
            </button>
          </div>
          <div className="eclusion click">
            <HiCursorClick className="warn" />
            <div className="info">
              <p>Add Retrac to the Windows Exclusion List now.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExclusionNoti;
