import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStaticPage } from "@/api/content";
import { ProsePage } from "@/components/ProsePage";
import { PageSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/Button";

type Key = "about" | "faq" | "privacy" | "terms" | "contact";

export function StaticInfoPage({ pageKey }: { pageKey: Key }) {
  const { data, isLoading } = useQuery({
    queryKey: ["static", pageKey],
    queryFn: () => getStaticPage(pageKey),
  });

  if (isLoading) return <PageSkeleton />;
  if (!data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-32 text-center text-mist">
        محتوا در دسترس نیست.
      </div>
    );
  }

  if (pageKey === "contact") {
    const c = data.contacts || {};
    return (
      <ProsePage title={data.title}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="double-bezel">
            <div className="double-bezel-inner space-y-4 p-6">
              <h2 className="font-semibold">راه‌های ارتباطی</h2>
              {c.phone?.map((p) => (
                <p key={p} className="text-mist">
                  تلفن:{" "}
                  <a className="text-accent" href={`tel:${p}`} dir="ltr">
                    {p}
                  </a>
                </p>
              ))}
              {c.mobile?.map((p) => (
                <p key={p} className="text-mist">
                  موبایل:{" "}
                  <a className="text-accent" href={`tel:${p}`} dir="ltr">
                    {p}
                  </a>
                </p>
              ))}
              {c.email && (
                <p className="text-mist">
                  ایمیل:{" "}
                  <a className="text-accent" href={`mailto:${c.email}`}>
                    {c.email}
                  </a>
                </p>
              )}
              {c.address && <p className="text-mist">آدرس: {c.address}</p>}
            </div>
          </div>
          <div className="double-bezel">
            <div className="double-bezel-inner space-y-3 p-6">
              <h2 className="font-semibold">پیام (دمو)</h2>
              <p className="text-sm text-mist">
                ارسال پیام در این نسخه استاتیک فعال نیست. از تلفن یا ایمیل
                استفاده کنید.
              </p>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("در نسخه دمو ارسال فرم غیرفعال است.");
                }}
              >
                <input
                  className="w-full rounded-xl border border-line bg-ink/40 px-3 py-2.5 text-sm outline-none focus:border-accent"
                  placeholder="نام"
                  name="name"
                />
                <input
                  className="w-full rounded-xl border border-line bg-ink/40 px-3 py-2.5 text-sm outline-none focus:border-accent"
                  placeholder="ایمیل یا موبایل"
                  name="contact"
                />
                <textarea
                  className="min-h-28 w-full rounded-xl border border-line bg-ink/40 px-3 py-2.5 text-sm outline-none focus:border-accent"
                  placeholder="پیام شما"
                  name="message"
                />
                <Button type="submit" className="w-full justify-center">
                  ارسال
                </Button>
              </form>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Link to="/faq">
            <Button variant="ghost">سوالات متداول</Button>
          </Link>
        </div>
      </ProsePage>
    );
  }

  return <ProsePage title={data.title} html={data.body} />;
}
