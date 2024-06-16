import { AxiosError } from "axios";
import { axiosClient, endpoints } from "./client";

export const discord = async (): Promise<SnowResponse<string>> => {
  const response = await axiosClient()
    .get<string>(endpoints.GET_DISCORD_ENDPOINT)
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
