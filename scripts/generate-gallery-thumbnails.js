import { execFile } from "node:child_process";
import { readdir, readFile, unlink, mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const publicDirectory = path.resolve("public");
const outputDirectory = path.join(publicDirectory, "gallery-thumbnails");
const entityMap = JSON.parse(
  await readFile(path.join(publicDirectory, "entityMap.json"), "utf8"),
);
const generatedFiles = new Set();

await mkdir(outputDirectory, { recursive: true });

for (const [name, { data }] of Object.entries(entityMap)) {
  const cover =
    Object.values(data.Portrait ?? {}).flat()[0] ??
    Object.values(data.Mini ?? {}).flat()[0];

  if (!cover) {
    continue;
  }

  const outputName = `${encodeURIComponent(name)}.webp`;
  const sourcePath = path.join(publicDirectory, cover.replace(/^\/+/, ""));
  const outputPath = path.join(outputDirectory, outputName);

  await execFileAsync("magick", [
    sourcePath,
    "-resize",
    "480x480>",
    "-quality",
    "82",
    outputPath,
  ]);
  generatedFiles.add(outputName);
}

for (const outputName of await readdir(outputDirectory)) {
  if (outputName.endsWith(".webp") && !generatedFiles.has(outputName)) {
    await unlink(path.join(outputDirectory, outputName));
  }
}

console.log(`Generated ${generatedFiles.size} gallery thumbnails.`);
