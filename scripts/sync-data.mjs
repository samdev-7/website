import { copyFileSync } from "node:fs";
import { join } from "node:path";

const FILES = ["scrub-first.json", "scrub.bin"];
if (process.env.ART) {
  for (const f of FILES)
    copyFileSync(join(process.env.ART, f), join("data", f));
  console.log(`sync-data: data/ refreshed from ${process.env.ART}`);
}
copyFileSync("data/scrub.bin", "public/scrub.bin");
