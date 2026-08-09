export default function SearchBox({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/articles" method="GET" className="flex flex-col gap-2">
      <label htmlFor="q" className="font-semibold">
        جست‌وجو
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="در نوشته‌ها بگرد..."
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </form>
  );
}
