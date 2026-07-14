import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 5173;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/__save") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      fs.writeFileSync(path.join(__dirname, "cors-results.json"), body);
      res.writeHead(200, { "content-type": "application/json" });
      res.end('{"ok":true}');
      console.log("saved cors-results.json");
    });
    return;
  }
  let p = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const file = path.join(__dirname, p);
  if (!file.startsWith(__dirname) || !fs.existsSync(file)) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  const ext = path.extname(file);
  res.writeHead(200, { "content-type": mime[ext] || "application/octet-stream" });
  res.end(fs.readFileSync(file));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`CORS probe server http://127.0.0.1:${PORT}/`);
});
