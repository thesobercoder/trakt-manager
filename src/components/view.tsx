import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { authorize, isAuthorized } from "../lib/oauth";

export const View: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [x, forceRerender] = useState(0);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    (async () => {
      await authorize();
      const authResult = await isAuthorized();
      console.log("IsAuth", authResult);
      setIsAuth(authResult);
      forceRerender(x + 1);
    })();
  }, []);

  return <>{isAuth ? children : null}</>;
};
