import { useUserControl } from "src/state/user";
import client from "./client";
import { QueryClient } from "@tanstack/react-query";

export const queryPerson = async (): Promise<PersonResponse> => {
  const token = useUserControl.getState().access_token;
  const response = await client.player(token);
  if (response.ok) return response.data;

  throw new Error(response.error);
};

export const queryStats = async (): Promise<LauncherStats> => {
  const token = useUserControl.getState().access_token;
  const response = await client.stats(token);
  if (response.ok) return response.data;

  throw new Error(response.error);
};

export const queryLauncherVersion = async (): Promise<LauncherVersion> => {
  const response = await client.version();
  return response;
};

export const queryServers = async (): Promise<ServersResponse> => {
  const response = await client.servers();
  return response;
};

export const queryPlayerInfos = async (
  queryClient: QueryClient,
  ids: string[]
): Promise<
  Record<
    string,
    {
      id: string;
      displayName: string;
    }
  >
> => {
  let tofetch = ids;
  const cached = queryClient.getQueryData(["players"]) as
    | Record<string, { id: string; displayName: string }>
    | undefined;
  if (cached) {
    tofetch = ids.filter((id) => !cached[id]);
  }

  const response = await client.playersInfo(tofetch);
  const reduced = response.reduce(
    (acc, { id, displayName }) => {
      acc[id] = { id, displayName };
      return acc;
    },
    {} as Record<
      string,
      {
        id: string;
        displayName: string;
      }
    >
  );

  const merged = { ...cached, ...reduced };
  queryClient.setQueryData(["players"], merged);
  return merged;
};

export const queryLeaderboard = async () => {
  const token = useUserControl.getState().access_token;
  const response = await client.leaderboards(token);
  return response;
};

export const queryShop = async () => {
  const response = await client.shop();
  return response;
};

export const queryContentPages = async () => {
  const response = await client.content_pages();
  return response;
};
