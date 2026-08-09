"use client";

import { useState } from "react";
import { Printer, Mail, Link2, Send } from "lucide-react";

export default function ShareBar({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // نادیده گرفته می‌شود؛ مرورگرهای قدیمی‌تر ممکن است clipboard API نداشته باشند
    }
  }

  const items = [
    {
      label: "چاپ",
      icon: Printer,
      onClick: () => window.print(),
    },
    {
      label: "ایمیل",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    },
    {
      label: "تلگرام",
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      label: "واتساپ",
      icon: Send,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      label: "ایکس",
      icon: Send,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
  ];

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-border pt-8">
      {items.map((item) =>
        item.href ? (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            title={item.label}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <item.icon size={14} />
            {item.label}
          </a>
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            title={item.label}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <item.icon size={14} />
            {item.label}
          </button>
        )
      )}
      <button
        type="button"
        onClick={copyLink}
        title="کپی لینک"
        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
      >
        <Link2 size={14} />
        {copied ? "کپی شد" : "کپی لینک"}
      </button>
    </div>
  );
}
