import sanitizeHtml from "sanitize-html";

// برای جاهایی مثل توضیح متا (SEO) که فقط متن ساده لازم دارن، نه HTML خلاصه.
export function stripHtmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim();
}

// خلاصه‌ها معمولاً در ستون‌های باریک (کارت‌های آرشیو) نمایش داده می‌شن، جایی
// که «تراز» (justify) روی متن فارسی چند خطِ کوتاه، به‌خاطر نبود پشتیبانی
// مرورگرها از کشیدگیِ حروف فارسی/عربی، باعث فاصله‌ی بیش‌ازحد بین کلمات
// می‌شه. برای همین موقع نمایش خلاصه، این تراز رو نادیده می‌گیریم.
export function sanitizeExcerptHtml(html: string): string {
  return sanitizeArticleHtml(html).replace(/text-align:\s*justify;?/gi, "");
}

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "hr",
      "span",
      "div",
      "iframe",
      "audio",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "download", "class"],
      img: ["src", "alt", "style", "data-align"],
      span: ["style"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      div: ["data-embed-type", "class"],
      // iframe/audio فقط از سمت مدیر سایت (نویسنده) وارد محتوا می‌شن، نه کاربر
      // عمومی — با این حال src رو به https محدود می‌کنیم تا خطر تزریق لینک
      // ناامن کم بشه.
      iframe: ["src", "allowfullscreen", "loading", "referrerpolicy"],
      audio: ["src", "controls"],
    },
    allowedStyles: {
      "*": {
        "font-size": [/^\d+(?:px|rem|em)$/],
        "font-family": [/^[\w\s,'"()\-]+$/],
        "text-align": [/^(left|right|center|justify)$/],
        "line-height": [/^[\d.]+$/],
      },
      img: {
        display: [/^block$/],
        // مرورگر وقتی Tiptap با editor.getHTML() سریالایز می‌کنه، اگه
        // margin-inline-start/end رو با هم ست کنیم، خودکار به‌صورت
        // shorthand «margin-inline» می‌نویسدشون؛ باید همین حالت رو هم
        // مجاز کنیم وگرنه کل مقدار margin افقی عکس حذف می‌شه.
        "margin-inline-start": [/^(auto|0(?:px)?)$/],
        "margin-inline-end": [/^(auto|0(?:px)?)$/],
        "margin-inline": [/^(auto|0(?:px)?)(\s+(auto|0(?:px)?))?$/],
        "margin-block": [/^[\d.]+em$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      iframe: ["https"],
      audio: ["https"],
    },
    allowedClasses: {
      div: ["embed-video", "embed-pdf", "embed-audio"],
      a: ["embed-download-link"],
    },
  });
}
