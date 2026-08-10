export default function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-banner-yellow px-3 py-1 text-xs font-medium text-foreground">
      {label}
    </span>
  );
}
