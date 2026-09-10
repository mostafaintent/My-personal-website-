import Link from "next/link";
import Container from "@/components/Container";
import { signIn } from "@/lib/actions/auth";

export const metadata = { title: "ورود" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <Container narrow className="py-14">
      <h1 className="mb-8 text-3xl font-bold">ورود به حساب</h1>

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

      <form action={signIn} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          ایمیل
          <input
            name="email"
            type="email"
            required
            className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          رمز عبور
          <input
            name="password"
            type="password"
            required
            className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
          />
        </label>
        <Link href="/forgot-password" className="self-start text-sm text-accent hover:underline">
          رمز عبور را فراموش کرده‌اید؟
        </Link>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
        >
          ورود
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        حساب ندارید؟{" "}
        <Link href="/signup" className="text-accent hover:underline">
          ثبت‌نام کنید
        </Link>
      </p>
    </Container>
  );
}
