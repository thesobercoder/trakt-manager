import { ReactNode, useEffect, useState } from "react";
import { authorize } from "../lib/oauth";

export const View = ({ children }: { children: ReactNode }) => {
  const [x, forceRerender] = useState(0);

  useEffect(() => {
    (async () => {
      await authorize();
      forceRerender((value) => value + 1);
    })();
  }, [x]);

  return children;
};
