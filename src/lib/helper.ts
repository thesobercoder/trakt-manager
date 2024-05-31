import { environment } from "@raycast/api";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";

export const setFileCache = async (key: string, content: string) => {
  const filePath = `${environment.supportPath}/${key}.json`;
  if (existsSync(filePath)) {
    await unlink(filePath);
  }
  await writeFile(filePath, content);
};

export const getFileCache = async (key: string) => {
  const filePath = `${environment.supportPath}/${key}.json`;
  if (!existsSync(filePath)) {
    return undefined;
  }
  return await readFile(filePath, "utf-8");
};
