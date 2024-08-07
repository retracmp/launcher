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
    const discord = await client.discord();
    if (!discord.ok) return console.error(discord.error);
    await open(discord.data);
  };

  const handleHashChange = async () => {
    const code = window.location.hash.slice(1);
    if (!code.startsWith("auth")) return;
    console.log("hash change", window.location.hash);

    const token = code.split(":")[1];

    const player = await client.player(token);
    if (!player.ok) return console.error(player.error);

    queryClient.setQueryData(["player"], player.data);
    userControl.new_token(token);
    window.location.hash = "";

    if (code.includes("onboard")) {
      console.log("onboard");
      navigate({
        to: "/onboard",
      });
      return;
    }

    console.log("redirecting to /snow");

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
