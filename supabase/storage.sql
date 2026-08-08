-- این فایل رو یک‌بار، بعد از schema.sql، توی SQL Editor اجرا کنید.
-- یه فضای ذخیره‌سازی برای عکس‌های داخل مقاله می‌سازه.

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

create policy "عکس‌های مقاله برای همه قابل دیدنه"
  on storage.objects for select
  using (bucket_id = 'article-images');

create policy "فقط ادمین عکس آپلود می‌کنه"
  on storage.objects for insert
  with check (
    bucket_id = 'article-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "فقط ادمین عکس حذف می‌کنه"
  on storage.objects for delete
  using (
    bucket_id = 'article-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
