import { showToast, Toast } from "@raycast/api";
import { authorize } from "./lib";

export default async function Command() {
  await authorize();
  showToast({ title: "Authorized", style: Toast.Style.Success });
}
