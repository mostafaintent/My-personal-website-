-- این فایل رو یک‌بار توی SQL Editor اجرا کنید.
-- فضای ذخیره‌سازی برای عکس بنر و تصاویر مربوط به ظاهر سایت می‌سازه.

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "عکس‌های ظاهر سایت برای همه قابل دیدنه"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "فقط ادمین عکس ظاهر سایت آپلود می‌کنه"
  on storage.objects for insert
  with check (
    bucket_id = 'site-assets'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "فقط ادمین عکس ظاهر سایت حذف می‌کنه"
  on storage.objects for delete
  using (
    bucket_id = 'site-assets'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
