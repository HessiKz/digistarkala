import { Link } from "react-router-dom";
import { Button } from "@/components/Button";

/** Original /profile/tickets — auth required on origin; demo support landing */
export function SupportPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-14 md:px-6">
      <h1 className="font-display text-3xl font-bold md:text-4xl">پشتیبانی</h1>
      <p className="mt-4 leading-relaxed text-mist">
        تیکت‌های پشتیبانی در سایت اصلی پس از ورود به حساب کاربری در دسترس است.
        در این نسخه دمو می‌توانید از راه‌های تماس زیر استفاده کنید.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/contact">
          <Button icon>تماس با ما</Button>
        </Link>
        <Link to="/faq">
          <Button variant="ghost">سوالات متداول</Button>
        </Link>
      </div>
    </div>
  );
}
