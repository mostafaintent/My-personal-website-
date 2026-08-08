import { Lock } from "lucide-react";

export default function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
      <Lock size={12} />
      ویژه
    </span>
  );
}
