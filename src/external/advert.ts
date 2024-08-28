import { AxiosError } from "axios";
import { axiosClient, endpoints } from "./client";

export const advert_link = async (t: string): Promise<SnowResponse<string>> => {
  const response = await axiosClient()
    .get<string>(endpoints.GET_ADVERT_LINK, {
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
