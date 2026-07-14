/**
 * Option A — Cloudflare Worker probe.
 * Forwards to digistarkala.ir shop API and reports status/latency/body preview.
 */
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

function parseSetCookie(headers) {
  // Workers Headers may expose getAll or getSetCookie depending on runtime
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function cookieHeaderFromSet(list) {
  const map = new Map();
  for (const raw of list) {
    const part = raw.split(";")[0];
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    map.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
  return {
    header: [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; "),
    xsrf: map.get("DIGISTARKALA-XSRF-TOKEN")
      ? decodeURIComponent(map.get("DIGISTARKALA-XSRF-TOKEN"))
      : "",
  };
}

function hints(status, ct, body) {
  const b = body.toLowerCase();
  const h = [];
  if (status === 403 || status === 503) h.push(`status_${status}`);
  if (b.includes("cf-browser-verification") || b.includes("challenge-platform"))
    h.push("cloudflare_challenge");
  if (b.includes("just a moment") || b.includes("attention required"))
    h.push("cloudflare_interstitial");
  if (b.includes("<html") && !(ct || "").includes("json")) h.push("html_not_json");
  if ((ct || "").includes("json") && body.trim().startsWith("{")) h.push("json_ok");
  return h;
}

export default {
  async fetch() {
    const results = [];
    let cookie = "";
    let xsrf = "";

    // CSRF bootstrap
    {
      const t0 = Date.now();
      const res = await fetch(`${ORIGIN}/shop/api/sanctum/csrf-cookie`, {
        headers: {
          "User-Agent": UA,
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          lang: "fa",
        },
      });
      const body = await res.text();
      const set = parseSetCookie(res.headers);
      const parsed = cookieHeaderFromSet(set);
      cookie = parsed.header;
      xsrf = parsed.xsrf;
      results.push({
        name: "sanctum/csrf-cookie",
        status: res.status,
        latencyMs: Date.now() - t0,
        contentType: res.headers.get("content-type"),
        bodyPreview: body.slice(0, 500),
        challengeHints: hints(res.status, res.headers.get("content-type"), body),
        cfRay: res.headers.get("cf-ray"),
        server: res.headers.get("server"),
        setCookieCount: set.length,
      });
    }

    for (const ep of ENDPOINTS) {
      const t0 = Date.now();
      const headers = {
        "User-Agent": UA,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        lang: "fa",
        Origin: ORIGIN,
        Referer: `${ORIGIN}/`,
      };
      if (cookie) headers.Cookie = cookie;
      if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

      const res = await fetch(`${ORIGIN}${ep.path}`, {
        method: ep.method,
        headers,
      });
      const body = await res.text();
      const ct = res.headers.get("content-type") || "";
      let jsonOk = false;
      try {
        JSON.parse(body);
        jsonOk = true;
      } catch {}

      // refresh cookies if any
      const set = parseSetCookie(res.headers);
      if (set.length) {
        const parsed = cookieHeaderFromSet(set);
        if (parsed.header) cookie = parsed.header;
        if (parsed.xsrf) xsrf = parsed.xsrf;
      }

      results.push({
        name: ep.name,
        method: ep.method,
        url: `${ORIGIN}${ep.path}`,
        status: res.status,
        latencyMs: Date.now() - t0,
        contentType: ct,
        bodyBytes: body.length,
        bodyPreview: body.slice(0, 500),
        jsonOk,
        challengeHints: hints(res.status, ct, body),
        cfRay: res.headers.get("cf-ray"),
        server: res.headers.get("server"),
        acao: res.headers.get("access-control-allow-origin"),
      });
    }

    return new Response(
      JSON.stringify(
        {
          runner: "cloudflare-worker",
          remote: true,
          capturedAt: new Date().toISOString(),
          results,
        },
        null,
        2
      ),
      { headers: { "content-type": "application/json; charset=utf-8" } }
    );
  },
};
