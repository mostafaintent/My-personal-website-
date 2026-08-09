import { Node, mergeAttributes } from "@tiptap/core";

// نود سفارشی برای جاسازی ویدیو یا پی‌دی‌اف با آدرس (URL) — چون میزبانی
// مستقیم فایل نیاز به زیرساخت جدا داره، فعلاً فقط جاسازی از طریق لینک
// (مثلاً آپارات، یوتیوب، یا لینک embed گوگل‌درایو/درایو دیگر) پشتیبانی می‌شه.
export interface EmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { src: string; mediaType: "video" | "pdf" }) => ReturnType;
    };
  }
}

const Embed = Node.create<EmbedOptions>({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      mediaType: { default: "video" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-embed-type]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const isPdf = node.attrs.mediaType === "pdf";
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-embed-type": node.attrs.mediaType,
        class: isPdf ? "embed-pdf" : "embed-video",
      }),
      [
        "iframe",
        {
          src: node.attrs.src,
          allowfullscreen: "true",
          loading: "lazy",
          referrerpolicy: "no-referrer",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default Embed;
