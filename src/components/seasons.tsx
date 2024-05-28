import { List } from "@raycast/api";
import { useEffect, useState } from "react";
import { getShowSeasons } from "../lib/data";
import { Season } from "../lib/types";

export const Seasons = ({ id }: { id: number }) => {
  const [seasons, setSeasons] = useState<Season[] | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const seasons = await getShowSeasons(id);
      setSeasons(seasons);
      setIsLoading(false);
    })();
  }, []);

  return (
    <List isLoading={isLoading}>
      {seasons &&
        seasons.map((item) => {
          return <List.Item key={item.ids.trakt} title={`Season ${item.number + 1}`} />;
        })}
    </List>
  );
};
