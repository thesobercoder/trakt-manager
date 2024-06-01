import { Grid } from "@raycast/api";
import { setMaxListeners } from "events";
import { useEffect, useRef, useState } from "react";
import { View } from "./components/view";

const NewCommand = () => {
  const abortable = useRef<AbortController>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setMaxListeners(20, abortable.current?.signal);
      setIsLoading(true);

      // Write logic here

      setIsLoading(false);
      return () => {
        if (abortable.current) {
          abortable.current.abort();
        }
      };
    })();
  }, []);

  return <Grid isLoading={isLoading} />;
};

export default function Command() {
  return (
    <View>
      <NewCommand />
    </View>
  );
}
