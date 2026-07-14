import type { BlogPost, CmsPage, ContentFile, MenuItem } from "@/lib/content-types";

const base = import.meta.env.BASE_URL || "/";

let contentPromise: Promise<ContentFile> | null = null;

async function loadContent(): Promise<ContentFile> {
  if (!contentPromise) {
    contentPromise = fetch(`${base}data/content.json`).then(async (res) => {
      if (!res.ok) throw new Error(`content.json ${res.status}`);
      return res.json() as Promise<ContentFile>;
    });
  }
  return contentPromise;
}

export async function getContent(): Promise<ContentFile> {
  return loadContent();
}

export async function getMenus(): Promise<{ top: MenuItem[]; footer: MenuItem[] }> {
  const c = await loadContent();
  return c.menus;
}

export async function getCmsPage(slug: string): Promise<CmsPage | null> {
  const c = await loadContent();
  const decoded = decodeURIComponent(slug);
  return (
    c.pages[decoded] ||
    c.pages[slug] ||
    Object.values(c.pages).find((p) => p.slug === decoded || p.slug === slug) ||
    null
  );
}

export async function getStaticPage(
  key: "about" | "faq" | "privacy" | "terms" | "contact"
) {
  const c = await loadContent();
  return c.staticPages[key] || null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const c = await loadContent();
  return c.blog.posts || [];
}

export async function getBlogPost(id: number | string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  const n = Number(id);
  return posts.find((p) => p.id === n || p.slug === String(id)) || null;
}

/** Map external digistarkala URLs to in-app paths */
export function toAppPath(link: string | null | undefined): string {
  if (!link || link === "#") return "#";
  if (link.startsWith("http")) {
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

export function isExternal(link: string | null | undefined): boolean {
  if (!link) return false;
  if (!link.startsWith("http")) return false;
  try {
    const u = new URL(link);
    return !u.hostname.includes("digistarkala");
  } catch {
    return false;
  }
}
