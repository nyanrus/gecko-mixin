import fs from "fs/promises";

process.chdir(import.meta.dirname);

await fs.mkdir("../gecko-dev/mixin", { recursive: true });
await fs.cp("../src/assets", "../gecko-dev", { recursive: true });
