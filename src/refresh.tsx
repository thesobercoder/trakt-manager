import { getUpNextShows } from "./services/shows";

export default async function Command() {
  await getUpNextShows();
}
