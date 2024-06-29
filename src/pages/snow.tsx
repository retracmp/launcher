import { Suspense, useEffect } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useUserControl } from "src/state/user";

import client from "src/external/client";
import DrawerContainer from "src/app/drawer";

const Snow = () => {
  const navigate = useNavigate();
  const user = useUserControl();

  useEffect(() => {
    const asyncMethod = async () => {
      const response = await client.okay(user.access_token);
      if (response.ok) return;
      user.kill_token();
      navigate({
        to: "/credentials",
      });
    };

    asyncMethod();
  }, []);

  return (
    <DrawerContainer>
      <div className="snowPage">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
    </DrawerContainer>
  );
};

export default Snow;
