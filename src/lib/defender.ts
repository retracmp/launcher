import { add_to_windows_defender_exclusion_list } from "src/lib/tauri";
import { useLibraryControl } from "src/state/library";
import { useConfigControl } from "src/state/config";

export const exclude_retrac = async () => {
  const library = useLibraryControl.getState();
  const config = useConfigControl.getState();

  const entry = library.getCurrentEntry();
  console.log(entry);

  const path = `${entry?.path}\\Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64`;
  const result = await add_to_windows_defender_exclusion_list(path);

  config.set_is_defender_excluded(result);
  if (result) {
    config.set_show_defender_popup(false);
  }
};
