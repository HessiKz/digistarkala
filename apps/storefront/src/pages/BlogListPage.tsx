import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBlogPosts } from "@/api/content";
import { PageSkeleton } from "@/components/Skeleton";

export function BlogListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["blog"],
    queryFn: getBlogPosts,
  });

  if (isLoading) return <PageSkeleton />;
  const posts = data || [];

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6 md:py-14">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold md:text-4xl">وبلاگ</h1>
        <p className="mt-2 text-mist">آخرین مقالات دیجی استار کالا</p>
      </header>
      {!posts.length ? (
        <p className="text-mist">مقاله‌ای یافت نشد.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {posts.map((a) => (
            <Link
              key={a.id}
              to={`/blog/articles/${a.id}`}
              className="group double-bezel"
            >
              <div className="double-bezel-inner flex h-full flex-col overflow-hidden">
                {a.image && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={a.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {a.category && (
                    <p className="text-xs text-accent">{a.category}</p>
                  )}
                  <h2 className="text-lg font-semibold leading-snug group-hover:text-accent">
                    {a.title}
                  </h2>
                  {a.description && (
                    <p className="text-sm text-mist line-clamp-3">
                      {a.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
