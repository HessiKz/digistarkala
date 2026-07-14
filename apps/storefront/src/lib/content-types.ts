export interface MenuItem {
  id?: number;
  title: string;
  link: string | null;
  icon?: string | null;
  isMega?: boolean;
  newTab?: boolean;
  children?: MenuItem[];
}

export interface CmsPage {
  slug: string;
  path?: string;
  title: string;
  body: string;
  seo?: unknown;
}

export interface BlogPost {
  id: number;
  title: string;
  description: string;
  body: string;
  image: string | null;
  link: string;
  category: string | null;
  createdAt: string | null;
  slug: string;
}

export interface ContentFile {
  generatedAt: string;
  source: string;
  pages: Record<string, CmsPage>;
  staticPages: Record<
    string,
    CmsPage & {
      contacts?: {
        phone?: string[];
        mobile?: string[];
        email?: string;
        address?: string;
      };
      categories?: unknown[];
    }
  >;
  blog: {
    posts: BlogPost[];
    categories: unknown[];
    top: unknown[];
  };
  menus: {
    top: MenuItem[];
    footer: MenuItem[];
  };
  name?: string;
}
