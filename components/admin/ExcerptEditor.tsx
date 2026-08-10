"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, FontFamily, FontSize } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import LineHeight from "@/lib/tiptap-line-height";
import { FONT_FAMILIES, FONT_SIZES, LINE_HEIGHTS } from "@/lib/editor-options";

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-transparent text-foreground hover:bg-background-soft"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-border bg-background-soft p-1.5">
      <select
        className="h-8 rounded-md border border-border bg-card px-2 text-xs"
        value={(editor.getAttributes("textStyle").fontFamily as string) ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) editor.chain().focus().unsetFontFamily().run();
          else editor.chain().focus().setFontFamily(value).run();
        }}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.label} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <select
        className="h-8 rounded-md border border-border bg-card px-2 text-xs"
        value={(editor.getAttributes("textStyle").fontSize as string) ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) editor.chain().focus().unsetFontSize().run();
          else editor.chain().focus().setFontSize(value).run();
        }}
      >
        <option value="">سایز</option>
        {FONT_SIZES.filter(Boolean).map((s) => (
          <option key={s} value={s}>
            {s.replace("px", "")}
          </option>
        ))}
      </select>

      <select
        className="h-8 rounded-md border border-border bg-card px-2 text-xs"
        title="فاصله‌ی خطوط"
        value={(editor.getAttributes("paragraph").lineHeight as string) ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) editor.chain().focus().unsetLineHeight().run();
          else editor.chain().focus().setLineHeight(value).run();
        }}
      >
        <option value="">فاصله‌ی خط</option>
        {LINE_HEIGHTS.filter(Boolean).map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <div className="mx-0.5 h-5 w-px bg-border" />

      <ToolbarButton label="ضخیم" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton label="مورب" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        label="زیرخط"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={14} />
      </ToolbarButton>
      <ToolbarButton label="خط‌خورده" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={14} />
      </ToolbarButton>

      <div className="mx-0.5 h-5 w-px bg-border" />

      <ToolbarButton
        label="راست‌چین"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight size={14} />
      </ToolbarButton>
      <ToolbarButton
        label="وسط‌چین"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter size={14} />
      </ToolbarButton>
      <ToolbarButton
        label="چپ‌چین"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft size={14} />
      </ToolbarButton>
      <ToolbarButton
        label="تراز (هم‌ترازی دو طرف)"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify size={14} />
      </ToolbarButton>
    </div>
  );
}

export default function ExcerptEditor({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TextStyle,
      FontFamily,
      FontSize,
      LineHeight,
      Underline,
      TextAlign.configure({ types: ["paragraph"] }),
      Placeholder.configure({ placeholder: "خلاصه‌ی مقاله را اینجا بنویسید..." }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        dir: "rtl",
        class: "tiptap-editable min-h-[4rem] px-4 py-2.5 text-base outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className="rounded-lg border border-border bg-card">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
