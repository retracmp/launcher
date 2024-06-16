import { invoke } from "@tauri-apps/api";
import { message } from "@tauri-apps/api/dialog";

export const hashFile = async (i: string) => {
  const result = await invoke<string>("hash", { i }).catch((s) => {
    console.error(s);
    // message(s, {
    //   title: "Retrac Error",
    //   type: "error",
    // });
    return s as string;
  });
  return result;
};

export const fileExists = async (i: string) => {
  const result = await invoke<boolean>("exists", { i }).catch((s) => {
    console.error(s);
    message(s, {
      title: "Retrac Error",
      type: "error",
    });
    return false;
  });
  return result;
};

export const experienceSnow = async (
  i: string,
  c: string,
  local: boolean,
  editOnRelease: boolean,
  disablePreEdit: boolean,
  version: int
) => {
  await closeSnow();
  const result = await invoke<boolean>("experience", {
    i,
    c,
    local,
    editOnRelease,
    disablePreEdit,
    version,
  }).catch((s) => {
    console.error(s);
    message(s, {
      title: "Retrac Error",
      type: "error",
    });
    return s as string;
  });
  return result;
};

export const experienceSnowDev = async (i: string, username: string) => {
  const result = await invoke<boolean>("offline", { i, username }).catch(
    (s) => {
      console.error(s);
      message(s, {
        title: "Retrac Error",
        type: "error",
      });
      return s as string;
    }
  );

  return result;
};

export const closeSnow = async () => {
  const result = await invoke<boolean>("kill").catch((s) => {
    console.error(s);
    message(s, {
      title: "Retrac Error",
      type: "error",
    });
    return s as string;
  });
  return result;
};

export const fixSnow = async () => {
  const result = await invoke<boolean>("fix").catch((s) => {
    console.error(s);
    message(s, {
      title: "Retrac Error",
      type: "error",
    });
    return s as string;
  });
  return result;
};

export const getFileSize = async (path: string) => {
  const result = await invoke<int>("size", {
    i: path,
  }).catch((s) => {
    console.error(s);
    message(s, {
      title: "Retrac Error",
      type: "error",
    });
    return 0;
  });
  return result;
};

export const downloadFile = async (
  url: string,
  filename: string,
  outPath: string
) => {
  const result = await invoke<boolean>("download", {
    url,
    file: filename,
    outPath,
  }).catch((s) => {
    console.error(s);
    message(s, {
      title: "Retrac Error",
      type: "error",
    });
    return s as string;
  });
  return result;
};

export const deleteFile = async (path: string) => {
  const result = await invoke<boolean>("delete", { path: path }).catch((s) => {
    console.error(s);
    message(s, {
      title: "Retrac Error",
      type: "error",
    });
    return s as string;
  });
  return result;
};
