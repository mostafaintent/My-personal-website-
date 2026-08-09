// این فایل معادل دستی خروجی `supabase gen types typescript` است — چون به یک
// پروژه‌ی زنده‌ی Supabase دسترسی نداریم تا خودکار تولیدش کنیم. اگر بعداً
// Supabase CLI رو نصب کردید، می‌تونید این فایل رو با نسخه‌ی خودکارش جایگزین کنید.
//
// نکته: عمداً همه‌جا از `type` استفاده شده نه `interface` — چون تایپ‌های
// generic کتابخانه‌ی supabase-js با `extends Record<string, unknown>` چک
// می‌شن و interface (بر خلاف type) اون قید رو satisfy نمی‌کنه.

export type ArticleCategory =
  | "یادداشت"
  | "ادبیات"
  | "فلسفه"
  | "روان‌شناسی"
  | "تاریخ"
  | "عرفان"
  | "ترجمه";

export type ArticleStatus = "draft" | "published";
export type PaymentMethodDb = "bank_gateway" | "paypal" | "crypto";
export type PurchaseStatus = "pending" | "completed";
export type SubscriptionPlan = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "expired" | "canceled";

export type ProfileRow = {
  id: string;
  display_name: string;
  role: "reader" | "admin";
  created_at: string;
};

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  tags: string[];
  premium: boolean;
  price_usd: number | null;
  price_irr: number | null;
  cover_image_url: string | null;
  status: ArticleStatus;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CommentRow = {
  id: string;
  article_id: string;
  user_id: string;
  body: string;
  status: "visible" | "hidden";
  created_at: string;
};

export type PurchaseRow = {
  id: string;
  user_id: string;
  article_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethodDb | null;
  status: PurchaseStatus;
  order_id: string;
  created_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string;
  created_at: string;
};

export type FavoriteReadItem = {
  title: string;
  imageUrl: string;
  url: string;
};

export type SiteSettingsRow = {
  id: boolean;
  site_name: string;
  author_name: string;
  bio: string;
  items_per_page: number;
  favorite_reads: string[];
  banner_image_url: string;
  share_links: string[];
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      articles: {
        Row: ArticleRow;
        Insert: Partial<ArticleRow> & { slug: string; title: string };
        Update: Partial<ArticleRow>;
        Relationships: [];
      };
      comments: {
        Row: CommentRow;
        Insert: Partial<CommentRow> & { article_id: string; user_id: string; body: string };
        Update: Partial<CommentRow>;
        Relationships: [];
      };
      purchases: {
        Row: PurchaseRow;
        Insert: Partial<PurchaseRow> & {
          user_id: string;
          article_id: string;
          amount: number;
          currency: string;
        };
        Update: Partial<PurchaseRow>;
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: Partial<SubscriptionRow> & {
          user_id: string;
          plan: SubscriptionPlan;
          current_period_end: string;
        };
        Update: Partial<SubscriptionRow>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettingsRow;
        Insert: Partial<SiteSettingsRow>;
        Update: Partial<SiteSettingsRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
