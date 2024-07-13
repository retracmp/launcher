import axios, { AxiosError } from "axios";
import { axiosClient, endpoints } from "./client";
import { useRetracApi } from "src/state/retrac_api";

export const stats = async (
  t: string
): Promise<SnowResponse<LauncherStats>> => {
  const response = await axiosClient()
    .get<LauncherStats>(endpoints.GET_LAUNCHER_STATS, {
      headers: {
        Authorization: t,
      },
    })
    .catch((e: AxiosError<ErrorResponse>) => {
      return e;
    });

  if (response instanceof AxiosError) {
    return {
      ok: false,
      error: response.message,
    };
  }

  return {
    ok: true,
    data: response.data,
  };
};

export const sizes = async (): Promise<SnowResponse<Record<string, int>>> => {
  const response = await axiosClient()
    .get<Record<string, int>>(endpoints.GET_BUCKET_ASSET_SIZES)
    .catch((e: AxiosError<ErrorResponse>) => {
      return e;
    });

  if (response instanceof AxiosError) {
    return {
      ok: false,
      error: response.message,
    };
  }

  return {
    ok: true,
    data: response.data,
  };
};

export const version = async (): Promise<LauncherVersion> => {
  const response = await axios
    .get<LauncherVersion>(
      "https://raw.githubusercontent.com/ectrc/ectrc/main/launcher.json"
    )
    .catch((e: AxiosError<ErrorResponse>) => {
      return e;
    });

  if (response instanceof AxiosError) {
    return {
      current_version: "0.0.0",
    };
  }

  return { current_version: response.data.current_version };
};

export const servers = async (): Promise<ServersResponse> => {
  const response = await axiosClient()
    .get<ServersResponse>(endpoints.GET_SERVERS)
    .catch((e: AxiosError<ErrorResponse>) => {
      return e;
    });

  if (response instanceof AxiosError) {
    return {
      Buckets: [],
    };
  }

  return response.data;
};

export const leaderboards = async (t: string): Promise<LeaderboardResponse> => {
  const response = await axiosClient()
    .get<LeaderboardResponse>(endpoints.GET_LEADERBOARD, {
      headers: {
        Authorization: t,
      },
    })
    .catch((e: AxiosError<ErrorResponse>) => {
      return e;
    });

  if (response instanceof AxiosError) {
    return {};
  }

  return response.data;
};

export const shop = async (): Promise<Catalog | null> => {
  const response = await axiosClient()
    .get<Catalog>(endpoints.GET_SHOP)
    .catch(() => null);

  if (
    response == null ||
    response.data === null ||
    response.status !== 200 ||
    !response.data
  ) {
    return null;
  }

  return response.data;
};

export const items = async (): Promise<Record<string, FortniteApiResult>> => {
  const response = await axiosClient()
    .get<RetracApiResponse>(endpoints.GET_COSMETICS)
    .catch(() => null);

  if (
    response == null ||
    response.data === null ||
    response.status !== 200 ||
    !response.data
  ) {
    return {};
  }

  return response.data.items;
};

export const get_item = async (id: string): Promise<FortniteApiResult> => {
  const retracApi = useRetracApi.getState();
  const foundRetracItem = retracApi.find(id);

  if (!foundRetracItem) {
    return {
      id: "CID_Nothing",
      name: "Nothing",
      description: "",
      type: {
        value: "",
        displayValue: "",
        backendValue: "",
      },
      rarity: {
        value: "common",
        displayValue: "cegendary",
        backendValue: "EFortRarity::Common",
      },
      set: {
        value: "",
        text: "",
        backendValue: "",
      },
      images: {
        smallIcon: "",
        icon: "",
        featured: "",
        lego: {
          small: "",
          large: "",
          wide: "",
        },
      },
      variants: [],
      gameplayTags: [],
      path: "",
      added: "",
    };
  }

  return foundRetracItem;
};

export const content_pages = async (): Promise<ContentPagesResult> => {
  const response = await axiosClient()
    .get<ContentPagesResult>(endpoints.CONTENT_PAGES)
    .catch(() => null);

  if (
    response == null ||
    response.data === null ||
    response.status !== 200 ||
    !response.data
  ) {
    return {};
  }

  return response.data;
};
