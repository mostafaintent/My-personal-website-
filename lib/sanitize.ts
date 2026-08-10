import sanitizeHtml from "sanitize-html";

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
      img: ["src", "alt"],
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
