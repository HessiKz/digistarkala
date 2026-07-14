import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCmsPage } from "@/api/content";
import { ProsePage } from "@/components/ProsePage";
import { PageSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/Button";

export function CmsPage() {
  const { slug = "" } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["cms", slug],
    queryFn: () => getCmsPage(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) return <PageSkeleton />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-32 text-center">
        <h1 className="mb-3 text-2xl font-bold">صفحه پیدا نشد</h1>
        <p className="mb-6 text-mist">محتوای این مسیر در کاتالوگ موجود نیست.</p>
        <Link to="/">
          <Button variant="ghost">بازگشت به خانه</Button>
        </Link>
      </div>
    );
  }

  return <ProsePage title={data.title} html={data.body} />;
}
