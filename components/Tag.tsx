export default function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-background-soft px-3 py-1 text-xs text-muted">
      {label}
    </span>
  );
}
