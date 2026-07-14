import { Link } from "react-router-dom";
import { Button } from "@/components/Button";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <p className="mb-2 text-sm text-accent">۴۰۴</p>
      <h1 className="font-display text-3xl font-bold">صفحه پیدا نشد</h1>
      <p className="mt-3 text-mist">
        این مسیر در فروشگاه وجود ندارد یا هنوز منتقل نشده است.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button icon>خانه</Button>
        </Link>
        <Link to="/products">
          <Button variant="ghost">محصولات</Button>
        </Link>
      </div>
    </div>
  );
}
