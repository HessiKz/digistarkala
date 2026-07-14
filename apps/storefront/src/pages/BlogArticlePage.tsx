import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBlogPost } from "@/api/content";
import { ProsePage } from "@/components/ProsePage";
import { PageSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/Button";

export function BlogArticlePage() {
  const { id = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["blog-post", id],
    queryFn: () => getBlogPost(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <PageSkeleton />;
  if (!data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-32 text-center">
        <p className="mb-4 text-mist">مقاله پیدا نشد.</p>
        <Link to="/blog">
          <Button variant="ghost">بازگشت به وبلاگ</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {data.image && (
        <div className="mx-auto max-w-[900px] px-4 pt-6 md:px-6">
          <div className="overflow-hidden rounded-[1.5rem] border border-line">
            <img
              src={data.image}
              alt=""
              className="aspect-[21/9] w-full object-cover"
            />
          </div>
        </div>
      )}
      <ProsePage title={data.title} html={data.body}>
        <div className="mt-10">
          <Link to="/blog">
            <Button variant="ghost">همه مقالات</Button>
          </Link>
        </div>
      </ProsePage>
    </>
  );
}
