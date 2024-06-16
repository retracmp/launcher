import { AxiosError } from "axios";
import { axiosClient, endpoints } from "./client";

export const player = async (
  t: string
): Promise<SnowResponse<PersonResponse>> => {
  const response = await axiosClient()
    .get<PersonResponse>(endpoints.GET_PLAYER_ENDPOINT, {
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

export const okay = async (t: string): Promise<SnowResponse<string>> => {
  const response = await axiosClient()
    .get<string>(endpoints.GET_PLAYER_OKAY_ENDPOINT, {
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

export const code = async (t: string): Promise<SnowResponse<string>> => {
  const response = await axiosClient()
    .post<string>(
      endpoints.POST_PLAYER_CODE_ENDPOINT,
      {},
      {
        headers: {
          Authorization: t,
        },
      }
    )
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
