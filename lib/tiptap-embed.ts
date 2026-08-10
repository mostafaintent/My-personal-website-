import { Node, mergeAttributes } from "@tiptap/core";

// نود سفارشی برای جاسازی ویدیو (فقط با آدرس)، یا پی‌دی‌اف/فایل صوتی
// (با آدرس یا آپلود مستقیم از طریق Supabase Storage).
export type EmbedMediaType = "video" | "pdf" | "audio";

export interface EmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { src: string; mediaType: EmbedMediaType }) => ReturnType;
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
    return [{ tag: "div[data-embed-type]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const mediaType = node.attrs.mediaType as EmbedMediaType;
    const src = node.attrs.src as string;
    const wrapperAttrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      "data-embed-type": mediaType,
      class: `embed-${mediaType}`,
    });

    if (mediaType === "audio") {
      return [
        "div",
        wrapperAttrs,
        ["audio", { src, controls: "true" }],
        ["a", { href: src, download: "", class: "embed-download-link" }, "دانلود فایل صوتی"],
      ];
    }

    if (mediaType === "pdf") {
      return [
        "div",
        wrapperAttrs,
        ["iframe", { src, loading: "lazy", referrerpolicy: "no-referrer" }],
        ["a", { href: src, download: "", class: "embed-download-link" }, "دانلود پی‌دی‌اف"],
      ];
    }

    return [
      "div",
      wrapperAttrs,
      [
        "iframe",
        {
          src,
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
