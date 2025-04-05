// src/lib/utils/fs.ts
import fs from "fs/promises";
import { constants } from "fs";

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function createDir(path: string): Promise<void> {
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory: ${error.message}`);
  }
}
