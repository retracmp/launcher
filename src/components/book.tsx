import { useQuery } from "@tanstack/react-query";
import { queryPerson } from "src/external/query";

import "src/styles/book.css";

const Book = () => {
  const {
    data: playerReal,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
  });

  const condition = isLoading || error;
  const player = condition ? null : playerReal;

  return (
    <div
      className={`battleBook ${
        player?.Account.Stats[14]?.Premium ? "purchased" : ""
      }`}
    >
      {player?.Account.Stats[14]?.Premium ? (
        <img className="battlePassImage" src="/battlepass_premium.png" alt="" />
      ) : (
        <img className="battlePassImage" src="/battlepass_free.png" alt="" />
      )}
      <div className="tierInformation">
        <small>
          {player?.Account.Stats[14]?.Premium ? "BATTLE " : "FREE "}
          PASS
        </small>
        <p>
          TIER{" "}
          <strong>
            {player ? player?.Account.Stats[14]?.TierFreeClaimed : "0"}{" "}
          </strong>
        </p>
      </div>
    </div>
  );
};

export default Book;
