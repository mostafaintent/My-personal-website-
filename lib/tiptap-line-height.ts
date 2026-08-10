import { Extension } from "@tiptap/core";

export interface LineHeightOptions {
  types: string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

// افزونه‌ی رسمی خودِ Tiptap فاصله‌ی خط رو به‌صورت یک مارک روی متنِ انتخاب‌شده
// اعمال می‌کنه (span داخل خط)، که روی ارتفاع کل خط تاثیر قابل‌توجهی نداره و
// بدون انتخاب دقیق کل متن پاراگراف، عملاً هیچ تغییری دیده نمی‌شه. این نسخه
// به‌جای اون، فاصله‌ی خط رو مستقیم روی خودِ گره‌ی پاراگراف/تیتر اعمال می‌کنه —
// دقیقاً مثل قرار دادن مکان‌نما توی یک پاراگراف و زدن دکمه‌ی فاصله‌ی خط در وُرد.
const LineHeight = Extension.create<LineHeightOptions>({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr.setNodeAttribute(pos, "lineHeight", lineHeight);
            }
          });
          if (dispatch) dispatch(tr);
          return true;
        },
      unsetLineHeight:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr.setNodeAttribute(pos, "lineHeight", null);
            }
          });
          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },
});

export default LineHeight;
