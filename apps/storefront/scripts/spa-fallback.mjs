import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "..", "dist");
const index = path.join(dist, "index.html");
const fallback = path.join(dist, "404.html");

if (fs.existsSync(index)) {
  fs.copyFileSync(index, fallback);
  console.log("SPA fallback: dist/404.html created");
} else {
  console.warn("spa-fallback: dist/index.html missing");
}
