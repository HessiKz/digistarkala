import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";
import { ProductsPage } from "@/pages/ProductsPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { ProductPage } from "@/pages/ProductPage";
import { CartPage } from "@/pages/CartPage";
import { CmsPage } from "@/pages/CmsPage";
import { StaticInfoPage } from "@/pages/StaticInfoPage";
import { BlogListPage } from "@/pages/BlogListPage";
import { BlogArticlePage } from "@/pages/BlogArticlePage";
import { SupportPage } from "@/pages/SupportPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename === "/" ? undefined : basename}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route
              path="products/categories/:slug"
              element={<CategoryPage />}
            />
            <Route path="products/:id/:slug?" element={<ProductPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="pages/:slug" element={<CmsPage />} />
            <Route path="about" element={<StaticInfoPage pageKey="about" />} />
            <Route path="faq" element={<StaticInfoPage pageKey="faq" />} />
            <Route
              path="privacy"
              element={<StaticInfoPage pageKey="privacy" />}
            />
            <Route path="terms" element={<StaticInfoPage pageKey="terms" />} />
            <Route
              path="contact"
              element={<StaticInfoPage pageKey="contact" />}
            />
            <Route path="blog" element={<BlogListPage />} />
            <Route path="blog/articles/:id" element={<BlogArticlePage />} />
            <Route path="blog/articles/:id/:slug" element={<BlogArticlePage />} />
            <Route path="profile/tickets" element={<SupportPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
