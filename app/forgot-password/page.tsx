import Link from "next/link";
import Container from "@/components/Container";
import { requestPasswordReset } from "@/lib/actions/auth";

export const metadata = { title: "فراموشی رمز عبور" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <Container narrow className="py-14">
      <h1 className="mb-4 text-3xl font-bold">بازیابی رمز عبور</h1>
      <p className="mb-8 text-sm leading-7 text-muted">
        ایمیلی که با آن ثبت‌نام کرده‌اید را وارد کنید تا لینک بازیابی رمز عبور
        برایتان ارسال شود.
      </p>

      {message && (
        <p className="mb-6 rounded-lg border border-border bg-background-soft px-4 py-3 text-sm text-muted">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      {!message && (
        <form action={requestPasswordReset} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            ایمیل
            <input
              name="email"
              type="email"
              required
              className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            ارسال لینک بازیابی
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted">
        رمزتان را به‌خاطر آوردید؟{" "}
        <Link href="/login" className="text-accent hover:underline">
          وارد شوید
        </Link>
      </p>
    </Container>
  );
}
