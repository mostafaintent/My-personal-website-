"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logPageView } from "@/lib/actions/analytics";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    logPageView(pathname).catch(() => {});
  }, [pathname]);

  return null;
}
