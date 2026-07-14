/** Minimal cookie jar for Node fetch tests. */
export class CookieJar {
  constructor() {
    this.map = new Map();
  }
  ingest(headers) {
    const list =
      typeof headers.getSetCookie === "function"
        ? headers.getSetCookie()
        : headers.get("set-cookie")
          ? [headers.get("set-cookie")]
          : [];
    for (const raw of list) {
      if (!raw) continue;
      const part = raw.split(";")[0];
      const eq = part.indexOf("=");
      if (eq < 0) continue;
      const name = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      this.map.set(name, value);
    }
  }
  get(name) {
    return this.map.get(name);
  }
  header() {
    return [...this.map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}
