import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useUserControl } from "src/state/user";
import { open } from "@tauri-apps/api/shell";
import client from "src/external/client";
import { queryClient } from "src/app/app";

const CredentialsPage = () => {
  const navigate = useNavigate();
  const userControl = useUserControl();

  const handleContinue = async () => {
    console.log("trying to get discord redirect...")
    const discord = await client.discord();
    console.log("got redirect.", discord.ok)
    if (!discord.ok) return console.error(discord.error);
    console.log("trying to open")
    await open(discord.data);
  };

  const handleHashChange = async () => {
    const code = window.location.hash.slice(1);
    if (!code.startsWith("auth:")) return;

    const token = code.split(":")[1];

    const player = await client.player(token);
    if (!player.ok) return console.error(player.error);

    console.log("player.data: ", player.data);

    queryClient.setQueryData(["player"], player.data);
    userControl.new_token(token);
    window.location.hash = "";
    navigate({
      to: "/snow",
    });
  };

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="snowPage">
      <button className="default discord" onClick={handleContinue}>
        Authenticate via Discord
      </button>
    </div>
  );
};

export default CredentialsPage;
