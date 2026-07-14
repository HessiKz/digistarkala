/**
 * Option A — plain Node fetch from this machine (datacenter/home egress).
 * Hits the 5 most important endpoints discovered via Playwright capture.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CookieJar } from "./cookie-jar.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORIGIN = "https://digistarkala.ir";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const ENDPOINTS = [
  { name: "init", method: "GET", path: "/shop/api/init" },
  { name: "home", method: "GET", path: "/shop/api/home?device=desktop" },
  {
    name: "search",
    method: "GET",
    path: "/shop/api/products/search?query=%D8%AC%D8%A7%D8%B1%D9%88&device=desktop",
  },
  { name: "product", method: "GET", path: "/shop/api/products/22" },
  { name: "cart", method: "GET", path: "/shop/api/cart" },
];

function looksLikeChallenge(status, ct, body) {
  const b = body.toLowerCase();
  const hints = [];
  if (status === 403 || status === 503) hints.push(`status_${status}`);
  if (b.includes("cf-browser-verification") || b.includes("challenge-platform"))
    hints.push("cloudflare_challenge");
  if (b.includes("just a moment") || b.includes("attention required"))
    hints.push("cloudflare_interstitial");
  if (b.includes("<html") && !ct.includes("json")) hints.push("html_not_json");
  if (ct.includes("json") && body.trim().startsWith("{")) hints.push("json_ok");
  return hints;
}

async function fetchWithTiming(url, opts) {
  const t0 = performance.now();
  const res = await fetch(url, opts);
  const buf = Buffer.from(await res.arrayBuffer());
  const ms = Math.round(performance.now() - t0);
  return { res, buf, ms };
}

async function main() {
  const jar = new CookieJar();
  const results = [];

  // Session bootstrap: sanctum csrf
  {
    const url = `${ORIGIN}/shop/api/sanctum/csrf-cookie`;
    const { res, buf, ms } = await fetchWithTiming(url, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        lang: "fa",
      },
      redirect: "manual",
    });
    jar.ingest(res.headers);
    results.push({
      name: "sanctum/csrf-cookie",
      method: "GET",
      url,
      status: res.status,
      latencyMs: ms,
      contentType: res.headers.get("content-type"),
      bodyPreview: buf.subarray(0, 500).toString("utf8"),
      challengeHints: looksLikeChallenge(
        res.status,
        res.headers.get("content-type") || "",
        buf.toString("utf8")
      ),
      setCookie: res.headers.getSetCookie?.() || [],
    });
  }

  const xsrf = jar.get("DIGISTARKALA-XSRF-TOKEN");
  const xsrfDecoded = xsrf ? decodeURIComponent(xsrf) : "";

  for (const ep of ENDPOINTS) {
    const url = `${ORIGIN}${ep.path}`;
    const headers = {
      "User-Agent": UA,
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      lang: "fa",
      Origin: ORIGIN,
      Referer: `${ORIGIN}/`,
      Cookie: jar.header(),
    };
    if (xsrfDecoded) headers["X-XSRF-TOKEN"] = xsrfDecoded;

    const { res, buf, ms } = await fetchWithTiming(url, {
      method: ep.method,
      headers,
    });
    jar.ingest(res.headers);

    const bodyStr = buf.toString("utf8");
    const ct = res.headers.get("content-type") || "";
    let jsonOk = false;
    try {
      JSON.parse(bodyStr);
      jsonOk = true;
    } catch {}

    results.push({
      name: ep.name,
      method: ep.method,
      url,
      status: res.status,
      latencyMs: ms,
      contentType: ct,
      bodyBytes: buf.length,
      bodyPreview: bodyStr.slice(0, 500),
      jsonOk,
      challengeHints: looksLikeChallenge(res.status, ct, bodyStr),
      responseHeaders: {
        server: res.headers.get("server"),
        "cf-ray": res.headers.get("cf-ray"),
        "access-control-allow-origin": res.headers.get(
          "access-control-allow-origin"
        ),
        "x-powered-by": res.headers.get("x-powered-by"),
      },
    });
    console.log(
      `${ep.name}: ${res.status} ${ms}ms json=${jsonOk} ct=${ct} bytes=${buf.length}`
    );
  }

  const out = {
    runner: "node-fetch",
    host: process.env.HOSTNAME || "local",
    capturedAt: new Date().toISOString(),
    results,
  };
  const outPath = path.join(__dirname, "node-results.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  // also human-readable curl-style log
  const log = results
    .map(
      (r) =>
        `## ${r.name}\n${r.method} ${r.url}\nstatus=${r.status} latencyMs=${r.latencyMs} ct=${r.contentType}\nhints=${(r.challengeHints || []).join(",")}\npreview:\n${r.bodyPreview}\n`
    )
    .join("\n");
  fs.writeFileSync(path.join(__dirname, "node-results.txt"), log);
  console.log("Wrote", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
