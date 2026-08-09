import Link from "next/link";
import Container from "@/components/Container";
import { signUp } from "@/lib/actions/auth";

export const metadata = { title: "ثبت‌نام" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Container narrow className="py-14">
      <h1 className="mb-8 text-3xl font-bold">ساخت حساب کاربری</h1>

      {error && (
        <p className="mb-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <form action={signUp} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          نام نمایشی
          <input
            name="displayName"
            type="text"
            className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
          />
        </label>
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
            minLength={6}
            className="rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
        >
          ثبت‌نام
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        حساب دارید؟{" "}
        <Link href="/login" className="text-accent hover:underline">
          وارد شوید
        </Link>
      </p>
    </Container>
  );
}
