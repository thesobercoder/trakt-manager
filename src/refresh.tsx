import { LocalStorage } from "@raycast/api";
import { authorize } from "./lib/oauth";
import { getUpNextShows } from "./services/shows";

export default async function Command() {
  await authorize();
  await LocalStorage.removeItem("upNextShows");
  await getUpNextShows();
}
