const ORIGIN = "https://digistarkala.ir";
const out = document.getElementById("out");
document.getElementById("origin").textContent = location.origin;

const ENDPOINTS = [
  { name: "init", method: "GET", path: "/shop/api/init", needsPreflight: false },
  {
    name: "home",
    method: "GET",
    path: "/shop/api/home?device=desktop",
    needsPreflight: false,
  },
  {
    name: "search",
    method: "GET",
    path: "/shop/api/products/search?query=%D8%AC%D8%A7%D8%B1%D9%88&device=desktop",
    needsPreflight: false,
  },
  {
    name: "product",
    method: "GET",
    path: "/shop/api/products/22",
    needsPreflight: false,
  },
  { name: "cart_get", method: "GET", path: "/shop/api/cart", needsPreflight: false },
  {
    name: "cart_add",
    method: "POST",
    path: "/shop/api/cart/add",
    needsPreflight: true,
    body: { product_id: 22, quantity: 1 },
  },
];

function headerMap(headers) {
  const o = {};
  for (const [k, v] of headers.entries()) o[k] = v;
  return o;
}

async function probeOne(ep) {
  const url = ORIGIN + ep.path;
  const result = {
    name: ep.name,
    method: ep.method,
    url,
    preflight: null,
    request: null,
  };

  // Explicit OPTIONS preflight for POST endpoints
  if (ep.needsPreflight || ep.method === "POST") {
    try {
      const t0 = performance.now();
      const opt = await fetch(url, {
        method: "OPTIONS",
        mode: "cors",
        headers: {
          Origin: location.origin,
          "Access-Control-Request-Method": ep.method,
          "Access-Control-Request-Headers":
            "content-type,x-requested-with,x-xsrf-token,lang",
        },
      });
      result.preflight = {
        ok: opt.ok,
        status: opt.status,
        latencyMs: Math.round(performance.now() - t0),
        acao: opt.headers.get("access-control-allow-origin"),
        acam: opt.headers.get("access-control-allow-methods"),
        acah: opt.headers.get("access-control-allow-headers"),
        acac: opt.headers.get("access-control-allow-credentials"),
        headers: headerMap(opt.headers),
      };
    } catch (e) {
      result.preflight = { error: String(e), networkBlocked: true };
    }
  }

  try {
    const t0 = performance.now();
    const headers = {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      lang: "fa",
    };
    const init = {
      method: ep.method,
      mode: "cors",
      credentials: "include", // mirrors SPA withCredentials
      headers,
    };
    if (ep.body) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(ep.body);
    }
    const res = await fetch(url, init);
    let text = "";
    try {
      text = await res.text();
    } catch (e) {
      text = `[read error: ${e}]`;
    }
    result.request = {
      ok: res.ok,
      status: res.status,
      latencyMs: Math.round(performance.now() - t0),
      contentType: res.headers.get("content-type"),
      acao: res.headers.get("access-control-allow-origin"),
      acac: res.headers.get("access-control-allow-credentials"),
      bodyPreview: text.slice(0, 500),
      type: res.type, // "cors" | "opaque" | "basic"
      headers: headerMap(res.headers),
    };
  } catch (e) {
    result.request = {
      error: String(e),
      networkOrCorsBlocked: true,
      message: e.message,
    };
  }

  return result;
}

async function main() {
  const results = [];
  for (const ep of ENDPOINTS) {
    out.textContent = `probing ${ep.name}…\n` + out.textContent;
    results.push(await probeOne(ep));
  }
  const report = {
    pageOrigin: location.origin,
    target: ORIGIN,
    capturedAt: new Date().toISOString(),
    results,
    verdict: {
      anyAcaoAllowsForeign: results.some(
        (r) =>
          r.request?.acao &&
          r.request.acao !== "null" &&
          (r.request.acao === "*" || r.request.acao.includes("localhost"))
      ),
      anySuccessRead: results.some(
        (r) => r.request?.status && r.request.status < 400 && r.request.bodyPreview
      ),
      preflightOk: results
        .filter((r) => r.preflight)
        .every((r) => r.preflight && !r.preflight.error && r.preflight.acao),
    },
  };

  // Persist via beacon to our tiny collector if present
  try {
    await fetch("/__save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(report),
    });
  } catch {}

  out.textContent = JSON.stringify(report, null, 2);
  console.log(report);
  window.__CORS_REPORT__ = report;
}

main();
