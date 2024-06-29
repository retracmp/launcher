import { useQuery } from "@tanstack/react-query";
import { queryPerson } from "src/external/query";

import "src/styles/book.css";

const Book = () => {
  const {
    data: playerReal,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
  });

  const condition = isLoading || isFetching || error;
  const player = condition ? null : playerReal;

  return (
    <div
      className={`battleBook ${
        player?.snapshot.CurrentSeasonStats.BookPurchased ? "purchased" : ""
      }`}
    >
      {player?.snapshot.CurrentSeasonStats.BookPurchased ? (
        <img className="battlePassImage" src="/battlepass_premium.png" alt="" />
      ) : (
        <img className="battlePassImage" src="/battlepass_free.png" alt="" />
      )}
      <div className="tierInformation">
        <small>
          {player?.snapshot.CurrentSeasonStats.BookPurchased
            ? "BATTLE "
            : "FREE "}
          PASS
        </small>
        <p>
          TIER <strong>{player ? player.season.bookLevel : "0"} </strong>
        </p>
      </div>
    </div>
  );
};

export default Book;
