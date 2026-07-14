export interface Product {
  id: number;
  title: string;
  slug: string;
  price: string | number | null;
  priceNumber: number | null;
  images: string[];
  category: string | null;
  categorySlug: string | null;
  description: string | null;
  stock: boolean | null;
  code?: string | null;
  features?: string[];
  url?: string;
  source?: string;
}

export interface CategoryNode {
  id: string;
  title: string;
  slug: string;
  parent?: string | null;
  productCount: number;
  image?: string | null;
  children?: CategoryNode[];
}

export interface CatalogFile {
  generatedAt: string;
  source: string;
  count: number;
  products: Array<{
    id: number;
    title: string | null;
    slug: string | null;
    price: string | number | null;
    images: string[];
    category: string | null;
    description: string | null;
    stock: boolean | null;
    code?: string | null;
    features?: string[];
    url?: string;
    source?: string;
  }>;
}

export interface CategoriesFile {
  generatedAt: string;
  count: number;
  categories: CategoryNode[];
  flat: Array<{
    title: string;
    slug: string;
    productIds: number[];
    image?: string | null;
  }>;
}

export interface BannerPalette {
  hue: number;
  accent: string;
  accentSoft: string;
  accentDim: string;
  glow: string;
  meshA: string;
  meshB: string;
  accentLight?: string;
}

export interface SliderSlide {
  id: string;
  title: string;
  url: string;
  image: string | null;
  mobileImage: string | null;
  position: number;
  palette?: BannerPalette;
}

export interface PromoBanner {
  id: number | string;
  title: string;
  url: string;
  image: string | null;
  mobileImage: string | null;
  palette?: BannerPalette;
}

export interface BrandMark {
  id: number;
  name: string;
  enName?: string;
  logo: string | null;
  uri?: string;
}

export interface HomeFile {
  generatedAt: string;
  title: string;
  hero: {
    headline: string;
    subtext: string;
    image: string | null;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  sliders?: SliderSlide[];
  banners?: PromoBanner[];
  brands?: BrandMark[];
  articles?: Array<{
    id: number;
    title: string;
    description?: string;
    image?: string | null;
    uri?: string;
    link?: string;
  }>;
  productSections?: Array<{
    id: number;
    title: string;
    description?: string;
    url?: string;
    productIds: number[];
  }>;
  specialOffers?: Array<{
    id: number;
    title: string;
    description?: string;
    url?: string;
    productIds: number[];
  }>;
  categorySections?: Array<{
    id: number;
    title: string;
    description?: string;
    items: Array<{
      id: number;
      title: string;
      slug: string;
      icon: string | null;
      uri?: string;
      productIds: number[];
    }>;
  }>;
  featuredProductIds: number[];
  categoryHighlights: Array<{
    title: string;
    slug: string;
    image: string | null;
    count: number;
  }>;
  marquee: string[];
  guarantees?: Array<{
    title: string;
    description?: string;
    logo?: string | null;
    link?: string;
  }>;
}

export interface BrandFile {
  generatedAt: string;
  source: string;
  name: string;
  logo: {
    favicon: string | null;
    header: string | null;
    footer: string | null;
  };
  logoPalette?: BannerPalette;
  menuTop: Array<{ id: number; title: string; url: string }>;
  social: Array<{
    id: number;
    title: string;
    link: string;
    logo: string | null;
  }>;
  contacts: {
    phone?: string[];
    mobile?: string[];
    email?: string;
    address?: string;
  };
  namads: Array<{ id: number; name: string; image: string | null }>;
  guarantees: Array<{
    title: string;
    description?: string;
    logo?: string | null;
    link?: string;
  }>;
  footerAbout?: { title?: string; body?: string } | null;
  currency?: string;
}

export interface CartItem {
  productId: number;
  title: string;
  slug: string;
  price: string | number | null;
  priceNumber: number | null;
  image: string | null;
  stock: boolean | null;
  qty: number;
}

export interface SearchParams {
  query?: string;
  category?: string;
  brand?: string;
  incredibleOffers?: boolean;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "title";
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
