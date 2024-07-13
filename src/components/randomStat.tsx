import { useQuery } from "@tanstack/react-query";
import { queryPerson } from "src/external/query";

import "src/styles/randomstat.css";

const Locker = () => {
  const { data: player } = useQuery({
    queryKey: ["player"],
    queryFn: queryPerson,
  });

  const loadoutIds: string[] = JSON.parse(
    (
      Object.values(player?.snapshot.AthenaProfile.Attributes || []).find(
        (a) => a.Key == "loadouts"
      ) || {
        ValueJSON: "[]",
      }
    ).ValueJSON || "[]"
  );
  const loadoutId = loadoutIds[0];
  const loadout = player?.snapshot.AthenaProfile.Loadouts[loadoutId];

  const backpack = player?.snapshot.AthenaProfile.Items[loadout?.BackpackID!];
  const backpackId = backpack?.TemplateID;
  const backpackPureId = backpackId?.split(":")[1];

  const pickaxe = player?.snapshot.AthenaProfile.Items[loadout?.PickaxeID!];
  const pickaxeId = pickaxe?.TemplateID;
  const pickaxePureId = pickaxeId?.split(":")[1];

  const glider = player?.snapshot.AthenaProfile.Items[loadout?.GliderID!];
  const gliderId = glider?.TemplateID;
  const gliderPureId = gliderId?.split(":")[1];

  const contrail = player?.snapshot.AthenaProfile.Items[loadout?.ContrailID!];
  const contrailId = contrail?.TemplateID;
  const contrailPureId = contrailId?.split(":")[1];

  return (
    <>
      <div className="locker">
        <ItemSlot id={backpackPureId} />
        <ItemSlot id={pickaxePureId} />
        <ItemSlot id={gliderPureId} />
        <ItemSlot id={contrailPureId} />
      </div>
    </>
  );
};

type ItemSlotProps = {
  id: string | undefined;
};

const ItemSlot = (props: ItemSlotProps) => {
  console.log(props);
  return (
    <div
      className="item"
      style={
        props.id != undefined
          ? {
              backgroundImage: `url(https://fortnite-api.com/images/cosmetics/br/${props.id}/icon.png)`,
            }
          : {
              backgroundImage: "url(/empty.png)",
              backgroundSize: "70%",
              backgroundPosition: "center",
              opacity: 0.7,
            }
      }
    ></div>
  );
};

export default Locker;
