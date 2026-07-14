/**
 * Scrape CMS pages + blog + full menus from digistarkala.ir into public/data.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "apps", "storefront", "public", "data");
const ORIGIN = "https://digistarkala.ir";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const CMS_SLUGS = [
  "فروش-اقساطی",
  "دیجی-استار-کالا",
  "واردات-عمده-کالا",
  "طرح-ارزش-آفرین",
  "طرح-جایگزینی",
  "طرح-پذیرش-ایده-های-نوین-اقتصادی-و-مشارکت",
  "روش-های-پرداخت",
];

const jar = new Map();

function parseSetCookie(res) {
  const raw = res.headers.getSetCookie?.() || [];
  if (raw.length) return raw;
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}
function mergeCookies(setList) {
  for (const raw of setList) {
    const part = raw.split(";")[0];
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    jar.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
}
function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}
function xsrfFromJar() {
  const t = jar.get("DIGISTARKALA-XSRF-TOKEN");
  return t ? decodeURIComponent(t) : "";
}

async function api(pathName) {
  const headers = {
    "User-Agent": UA,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    lang: "fa",
    Origin: ORIGIN,
    Referer: `${ORIGIN}/`,
    Cookie: cookieHeader(),
  };
  const xsrf = xsrfFromJar();
  if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;
  const res = await fetch(`${ORIGIN}${pathName}`, { headers });
  mergeCookies(parseSetCookie(res));
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }
  return { status: res.status, json };
}

function absUrl(u) {
  if (!u || typeof u !== "string") return null;
  if (u.startsWith("http")) return u;
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("/")) return ORIGIN + u;
  return u;
}

function normalizeLink(link) {
  if (!link || link === "#") return null;
  if (link.startsWith("http://") || link.startsWith("https://")) {
    try {
      const u = new URL(link);
      if (u.hostname.includes("digistarkala")) {
        return u.pathname + u.search;
      }
      return link;
    } catch {
      return link;
    }
  }
  return link;
}

function mapMenuItems(items = []) {
  return items.map((it) => ({
    id: it.id,
    title: it.title,
    link: normalizeLink(it.link || it.url || it.uri),
    icon: absUrl(it.icon),
    isMega: Boolean(it.is_mega_menu),
    newTab: Boolean(it.new_tab),
    children: mapMenuItems(it.items || it.children || []),
  }));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  console.log("csrf…");
  const csrf = await fetch(`${ORIGIN}/shop/api/sanctum/csrf-cookie`, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      lang: "fa",
    },
  });
  mergeCookies(parseSetCookie(csrf));

  const initRes = await api("/shop/api/init");
  if (initRes.status !== 200 || !initRes.json) {
    throw new Error("init failed " + initRes.status);
  }
  const init = initRes.json;
  const add = init.additional || {};

  // CMS pages
  const pages = {};
  for (const slug of CMS_SLUGS) {
    const enc = encodeURIComponent(slug);
    const r = await api(`/shop/api/pages/${enc}`);
    console.log("page", slug, r.status);
    if (r.status === 200 && r.json?.title) {
      pages[slug] = {
        slug,
        title: r.json.title,
        body: r.json.body || "",
        seo: r.json.seo || null,
        path: `/pages/${slug}`,
      };
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  // Blog
  const blogRes = await api("/shop/api/blog");
  const blogPosts = [];
  const items = blogRes.json?.posts?.items || blogRes.json?.posts || [];
  const list = Array.isArray(items) ? items : [];
  for (const p of list) {
    let body = p.body || "";
    let full = p;
    try {
      const det = await api(`/shop/api/blog/articles/${p.id}`);
      if (det.status === 200 && det.json?.article) {
        full = { ...p, ...det.json.article };
        body = full.body || body;
      }
    } catch {
      /* keep list body */
    }
    blogPosts.push({
      id: full.id,
      title: full.title || full.page_title,
      description: full.description || "",
      body,
      image: absUrl(full.image),
      link: normalizeLink(full.link) || `/blog/articles/${full.id}`,
      category: full.category?.title || full.category || null,
      createdAt: full.created_at || null,
      slug: String(full.id),
    });
    await new Promise((r) => setTimeout(r, 200));
  }

  // FAQ (often empty)
  const faqRes = await api("/shop/api/faqs");
  const faqCategories = faqRes.json?.categories || [];

  // Static content pages built from init + known copy
  const aboutBody =
    add.footer?.about?.body ||
    "<p>فروشگاه دیجی استار کالا</p>";

  const staticPages = {
    about: {
      slug: "about",
      path: "/about",
      title: add.footer?.about?.title || "درباره ما",
      body: aboutBody,
    },
    faq: {
      slug: "faq",
      path: "/faq",
      title: "سوالات متداول",
      body:
        faqCategories.length === 0
          ? "<p>در حال حاضر پرسش متداولی ثبت نشده است. برای پشتیبانی با ما تماس بگیرید.</p><ul><li>تلفن: 02188813274</li><li>ایمیل: digistarkala@gmail.com</li></ul>"
          : "",
      categories: faqCategories,
    },
    privacy: {
      slug: "privacy",
      path: "/privacy",
      title: "حریم خصوصی",
      body: `<p>فروشگاه دیجی استار کالا متعهد به حفاظت از اطلاعات شخصی کاربران است. اطلاعات تماس و سفارش تنها برای پردازش خرید و پشتیبانی استفاده می‌شود و بدون رضایت شما در اختیار شخص ثالث قرار نمی‌گیرد، مگر در موارد قانونی.</p>
<p>با استفاده از این وب‌سایت، شما با این سیاست حریم خصوصی موافقت می‌کنید. در صورت به‌روزرسانی، نسخه جدید در همین صفحه منتشر خواهد شد.</p>`,
    },
    terms: {
      slug: "terms",
      path: "/terms",
      title: "شرایط و قوانین استفاده",
      body: `<p>استفاده از فروشگاه دیجی استار کالا به معنای پذیرش شرایط زیر است:</p>
<ul>
<li>قیمت‌ها و موجودی ممکن است تغییر کند.</li>
<li>سفارش پس از تأیید پرداخت قطعی می‌شود.</li>
<li>کاربر مسئول صحت اطلاعات واردشده است.</li>
<li>قوانین بازگشت کالا طبق ضمانت‌های فروشگاه اعمال می‌شود.</li>
</ul>
<p>برای جزئیات بیشتر با پشتیبانی تماس بگیرید.</p>`,
    },
    contact: {
      slug: "contact",
      path: "/contact",
      title: "تماس با ما",
      body: "",
      contacts: init.contacts || {},
    },
  };

  const menus = {
    top: mapMenuItems(init.menu?.top || []),
    footer: mapMenuItems(init.menu?.footer || []),
  };

  const content = {
    generatedAt: new Date().toISOString(),
    source: ORIGIN,
    pages,
    staticPages,
    blog: {
      posts: blogPosts,
      categories: blogRes.json?.categories || [],
      top: blogRes.json?.top || [],
    },
    menus,
    name: init.name,
  };

  fs.writeFileSync(
    path.join(outDir, "content.json"),
    JSON.stringify(content, null, 2)
  );

  // Merge full menus into brand.json if present
  const brandPath = path.join(outDir, "brand.json");
  if (fs.existsSync(brandPath)) {
    const brand = JSON.parse(fs.readFileSync(brandPath, "utf8"));
    brand.menus = menus;
    brand.menuTop = menus.top.map((m) => ({
      id: m.id,
      title: m.title,
      url: m.link || "#",
    }));
    brand.menuFooter = menus.footer;
    fs.writeFileSync(brandPath, JSON.stringify(brand, null, 2));
  }

  console.log(
    `done pages=${Object.keys(pages).length} blog=${blogPosts.length} menuTop=${menus.top.length}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
