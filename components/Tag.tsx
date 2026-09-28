import Link from "next/link";
import { tagHref } from "@/lib/tags";

export default function Tag({ label }: { label: string }) {
  return (
    <Link
      href={tagHref(label)}
      className="rounded-full bg-banner-yellow px-3 py-1 text-xs font-medium text-foreground transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {label}
    </Link>
  );
}
