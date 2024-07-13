import axios from "axios";
import { discord } from "./discord";
import { code, okay, player, playersInfo } from "./person";
import {
  content_pages,
  get_item,
  items,
  leaderboards,
  servers,
  shop,
  sizes,
  stats,
  version,
} from "./launcher";
import { useConfigControl } from "src/state/config";

const localAxiosClient = axios.create({
  baseURL: "http://127.0.0.1:3000",
});

const finalAxiosClient = axios.create({
  baseURL: "https://retrac.0xkaede.xyz/",
});

export const isDevBuildMode = import.meta.env.MODE === "development";

export const axiosClient = () =>
  useConfigControl.getState().use_localhost
    ? localAxiosClient
    : finalAxiosClient;

export const endpoints = {
  GET_DISCORD_ENDPOINT: "/snow/discord",
  GET_PLAYER_ENDPOINT: "/snow/player",
  GET_PLAYER_OKAY_ENDPOINT: "/snow/player/okay",
  POST_PLAYER_CODE_ENDPOINT: "/snow/player/code",
  GET_LAUNCHER_STATS: "/snow/launcher",
  GET_BUCKET_ASSET_SIZES: "/snow/launcher/sizes",
  GET_SERVERS: "/snow/servers",
  GET_LEADERBOARD: "/snow/player/leaderboards",
  GET_ACCOUNTS: "/account/api/public/account",
  GET_SHOP: "/admin/shop/today",
  GET_COSMETICS: "/snow/cosmetics",
  CONTENT_PAGES: "/content/api/pages/fortnite-game",
};

const client = {
  discord,
  player,
  okay,
  code,
  stats,
  sizes,
  version,
  servers,
  playersInfo,
  leaderboards,
  shop,
  retrac_items: items,
  get_item,
  content_pages,
};

export default client;
