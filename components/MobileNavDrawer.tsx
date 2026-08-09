"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function MobileNavDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm sm:hidden"
        aria-label="باز کردن منو"
      >
        <Menu size={22} />
      </button>

      <div
        className={`fixed inset-0 z-50 sm:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 flex h-full w-72 max-w-[85%] flex-col overflow-y-auto bg-card p-6 shadow-xl transition-transform ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mb-6 flex h-9 w-9 items-center justify-center self-end text-muted hover:text-accent"
            aria-label="بستن منو"
          >
            <X size={20} />
          </button>
          {children}
        </div>
      </div>
    </>
  );
}
