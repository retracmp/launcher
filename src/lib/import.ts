import { message, open } from "@tauri-apps/api/dialog";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { useLibraryControl } from "src/state/library";
import { deleteFile, downloadFile, fileExists, hashFile } from "src/lib/tauri";
import { LOADING_STATES, useStates } from "src/state/state";
import { fs } from "@tauri-apps/api";
import client from "src/external/client";
import { getFileSize } from "src/lib/tauri";
import { useConfigControl } from "src/state/config";

const versionLookup = new Map<string, string>([
  ["7e9ca42b2f4691fe40ab64ed79cd6ae00a3ac0edd2ed909371b00f0e6048202f", "1.7.1"],
  ["fe4737acc30d9efd6abe03f35b932fc608042ce279b0b887027e5fd29e9f6377", "1.8"],
  ["2ebfc206cef496ff0fe9794bfbc1c89f02e09f7a3c2db89434fad05b32af53f6", "1.8"],
  ["4460a0e82d76eba3e64afa2e128819e02930e96d42736a7434819f6b7e55d28b", "1.9.1"],
  ["9731a6b5e1fab894c089849713c371182e357dcbefa7d8d4e71dc19eeb449102", "2.5"],
  ["6e3d13a50cdeaed90f8176eec31442199d66721018105dec4bc1f2cbcff215ef", "3.5"],
  ["6f99fd29fe898e637aeb506e04fc8bb46c4ee6016714b96f96b92e214f106aca", "3.6"],
  ["97643ca38813d29fc643df70dd2e8dd0ea0445357214416158d8fef02fb3c9d1", "4.5"],
  ["ed3216b00f7ae430e9dafbc38f4ee2e6f189886db28c9c53436ee8dde2d33718", "5.41"],
  ["48bdc9500c16798032ab56279107657ed4b5ce3a83448541034b1e96daa2a86c", "6.31"],
  ["15da21fff1444a2390e345b96bb6bfb095ac655bfe888b89c32cb6d292699a8d", "7.40"],
  ["5d3597ecf685590f997f9631bfebff40550cb3be53312019bedfe418799738f0", "8.51"],
  ["8dbca1d00855e48aa5d70ff12272fb4eaebfda915cb18a8d0ac056bdadd24f33", "9.41"],
  ["cd50eaa63bed9b6f6990cfd33f8f6f8c0b688c2f5d13b8c7e0739fcb306aed8e", "11.31"],
  ["78f00934fa00f0c184e6b0a7219048a17066f6bba6a13d4408735928f295cdfe", "12.41"],
  ["0d5a49a5b7f01ac2d8bdaa76b9beceb53997ed05d8b9d1e936db6470a15714e9", "14.30"],
  ["f0ea139dd7be93da7a36f5f91bcea9f84f914709e9cc3253726736f8d7b21133", "15.30"],
]);

const setLoader = (loading: boolean) =>
  useStates
    .getState()
    .set_state(
      "importing",
      loading ? LOADING_STATES.LOADING : LOADING_STATES.AWAITING_ACTION
    );

export const importBuildFromDialog = async () => {
  setLoader(true);
  const selectedPath = await open({ directory: true, multiple: true });
  if (!selectedPath) return setLoader(false);

  if (Array.isArray(selectedPath)) {
    await importBuild(selectedPath[0]);
    return setLoader(false);
  }

  importBuild(selectedPath).then(() => setLoader(false));
};

const importBuild = async (path: string) => {
  const libraryControl = useLibraryControl.getState();

  const splash = `${path}\\FortniteGame\\Content\\Splash\\Splash.bmp`;
  const binary = `${path}\\FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe`;

  const hash = await hashFile(binary);
  if (!hash)
    return message(
      "Binary hash failed on FortniteClient-Win64-Shipping.exe, invalid build!",
      {
        title: "Retrac Error",
        type: "error",
      }
    );

  const exists = await fileExists(splash);
  if (!exists)
    return message("Splash bmp not found, invalid build!", {
      title: "Retrac Error",
      type: "error",
    });

  const version = versionLookup.get(hash);
  if (!version) {
    return message(
      "Retrac could not determine the version of the build, please message our support team on discord!",
      "Retrac Error"
    );
  }

  const versionInt = parseInt(version.split(".")[0]);

  // if (versionInt != 14) {
  //   return message("Only Fortnite Version 14.30 is supported!", "Retrac Error");
  // }

  libraryControl.add({
    title: "Imported build",
    description: "Imported build",
    posterPath: convertFileSrc(splash),
    binaryPath: binary,
    binaryHash: hash,
    releaseVersion: versionInt,
    path,
  });
  console.log("Imported build", libraryControl.getCurrentEntry());
};

export const hasPakInstalled = async (isPlay: bool) => {
  const libraryControl = useLibraryControl.getState();
  const config = useConfigControl.getState();

  const entry = libraryControl.getCurrentEntry();
  if (!entry) return false;

  const pakSizes = await client.sizes();
  console.log(pakSizes);
  if (!pakSizes.ok) {
    if (isPlay)
      message(
        "Could not contact the file server, some of the cosmetics may not be up to date.",
        "Retrac Custom Data"
      );
    return true;
  }

  const okayFiles = {
    "pakchunkRetrac-WindowsClient_P.pak": false,
    "pakchunkRetrac-WindowsClient_P.sig": false,
  } as Record<string, boolean>;

  if (config.bubble_builds) {
    okayFiles["pakchunkRetracBubble-WindowsClient_P.pak"] = false;
    okayFiles["pakchunkRetracBubble-WindowsClient_P.sig"] = false;
  }

  for (const item in okayFiles) {
    console.log(item, pakSizes.data[item]);
    if (pakSizes.data[item] === undefined) {
      if (isPlay)
        message(
          "Launching without custom cosmetics as the pak file is not on the file server. Some of the cosmetics may not be up to date.",
          "Retrac Custom Data"
        );
      return true;
      continue;
    }

    // pak is in entry/FortniteGame/Content/Paks/pakchunkRetrac-windowsclient_P.pak
    // read the pak file and check if it has the right data

    const fileStat = await fs.exists(
      `${entry.path}\\FortniteGame\\Content\\Paks\\${item}`
    );
    if (!fileStat) continue;

    const localFileSize = await getFileSize(
      `${entry.path}\\FortniteGame\\Content\\Paks\\${item}`
    );
    if (localFileSize !== pakSizes.data[item]) continue;

    okayFiles[item] = true;
  }

  console.log(okayFiles);

  return Object.values(okayFiles).every((item) => item);
};

export const DownloadCustomContent = async () => {
  const libraryControl = useLibraryControl.getState();
  const config = useConfigControl.getState();

  if (libraryControl.getCurrentEntry() === null)
    return message("Please set the Fortnite directory first!", {
      title: "Retrac Error",
      type: "error",
    });

  const to_delete = [
    "pakchunk1001-WindowsClient.pak",
    "pakchunk1001-WindowsClient.sig",
  ];

  for (const file of to_delete) {
    await deleteFile(
      `${
        libraryControl.getCurrentEntry()?.path
      }\\FortniteGame\\Content\\Paks\\${file}`
    );
  }

  const to_download = {
    "pakchunkRetrac-WindowsClient_P.pak": `${
      libraryControl.getCurrentEntry()?.path
    }\\FortniteGame\\Content\\Paks\\pakchunkRetrac-WindowsClient_P.pak`,
    "pakchunkRetrac-WindowsClient_P.sig": `${
      libraryControl.getCurrentEntry()?.path
    }\\FortniteGame\\Content\\Paks\\pakchunkRetrac-WindowsClient_P.sig`,
    ...(config.bubble_builds && {
      "pakchunkRetracBubble-WindowsClient_P.pak": `${
        libraryControl.getCurrentEntry()?.path
      }\\FortniteGame\\Content\\Paks\\pakchunkRetracBubble-WindowsClient_P.pak`,
      "pakchunkRetracBubble-WindowsClient_P.sig": `${
        libraryControl.getCurrentEntry()?.path
      }\\FortniteGame\\Content\\Paks\\pakchunkRetracBubble-WindowsClient_P.sig`,
    }),
  };

  for (const [url, path] of Object.entries(to_download)) {
    await downloadFile("https://cdn.0xkaede.xyz/data", url, path).catch((e) => {
      console.error(e);
      message(
        "An error occured while downloading " + url + ". Please try again.",
        "Retrac Error"
      );
    });
  }

  libraryControl.setPakValid(await hasPakInstalled(false));
};
