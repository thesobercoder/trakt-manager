import { ReactNode, useMemo, useState } from "react";
import { authorize } from "../lib/oauth";

export const View = ({ children }: { children: ReactNode }) => {
  const [, forceRerender] = useState(0);

  useMemo(() => {
    (async () => {
      await authorize();
      forceRerender((value) => value + 1);
    })();
  }, []);

  return children;
};
