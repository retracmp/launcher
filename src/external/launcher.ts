import axios, { AxiosError } from "axios";
import { axiosClient, endpoints } from "./client";

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
      "https://raw.githubusercontent.com/0xkaede/retrac/main/launcher.json"
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
