import Link from "next/link";
import Container from "@/components/Container";
import { getCurrentUser } from "@/lib/auth";
import { updatePassword } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "تعیین رمز عبور جدید" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  // این صفحه فقط بعد از کلیک روی لینک ایمیل بازیابی (که یک نشست موقت
  // می‌سازه) معنا داره؛ اگر نشستی وجود نداشته باشه، فرم نشون داده نمی‌شه.
  const current = await getCurrentUser();

  return (
    <Container narrow className="py-14">
      <h1 className="mb-8 text-3xl font-bold">تعیین رمز عبور جدید</h1>

      {error && (
        <p className="mb-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      {current ? (
        <form action={updatePassword} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            رمز عبور جدید
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            تکرار رمز عبور جدید
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            ذخیره‌ی رمز جدید
          </button>
        </form>
      ) : (
        <div>
          <p className="rounded-lg border border-border bg-background-soft px-4 py-3 text-sm text-muted">
            این لینک نامعتبر یا منقضی شده است.
          </p>
          <p className="mt-6 text-sm text-muted">
            <Link href="/forgot-password" className="text-accent hover:underline">
              درخواست لینک بازیابی جدید
            </Link>
          </p>
        </div>
      )}
    </Container>
  );
}
