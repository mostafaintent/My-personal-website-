"use client";

import { useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, FontFamily, FontSize } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Film,
  FileText,
  Music,
  Upload,
} from "lucide-react";
import { uploadArticleImage, uploadArticleFile } from "@/lib/storage";
import Embed from "@/lib/tiptap-embed";
import LineHeight from "@/lib/tiptap-line-height";
import AlignableImage from "@/lib/tiptap-image";

const FONT_FAMILIES = [
  { label: "پیش‌فرض", value: "" },
  { label: "وزیرمتن", value: "var(--font-vazirmatn)" },
  { label: "نسخ (سریف)", value: "var(--font-naskh)" },
  { label: "تجاول", value: "var(--font-tajawal)" },
  { label: "نوتو سنس", value: "var(--font-noto-sans-arabic)" },
  { label: "پلکس عربی", value: "var(--font-ibm-plex-arabic)" },
  { label: "لاله‌زار (تزئینی)", value: "var(--font-lalezar)" },
  { label: "مونو", value: "monospace" },
];

const FONT_SIZES = ["", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];

const LINE_HEIGHTS = ["", "0.5", "0.75", "1", "1.3", "1.5", "1.8", "2", "2.5"];

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleImagePick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await uploadArticleImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      alert("آپلود عکس ناموفق بود. دوباره امتحان کنید.");
    }
  };

  const insertPdfLink = (url: string, defaultTitle: string) => {
    const title = window.prompt(
      "عنوان پی‌دی‌اف را وارد کنید (همین متن به‌صورت لینک قابل‌کلیک در مقاله می‌آید):",
      defaultTitle
    );
    if (!title) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: title,
        marks: [{ type: "link", attrs: { href: url } }],
      })
      .run();
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await uploadArticleFile(file);
      insertPdfLink(url, file.name.replace(/\.pdf$/i, ""));
    } catch {
      alert("آپلود پی‌دی‌اف ناموفق بود. دوباره امتحان کنید.");
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await uploadArticleFile(file);
      editor.chain().focus().setEmbed({ src: url, mediaType: "audio" }).run();
    } catch {
      alert("آپلود فایل صوتی ناموفق بود. دوباره امتحان کنید.");
    }
  };

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("آدرس لینک را وارد کنید:", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertVideo = () => {
    const url = window.prompt(
      "آدرس embed ویدیو را وارد کنید (مثلاً لینک embed یوتیوب یا آپارات):",
      "https://"
    );
    if (!url) return;
    editor.chain().focus().setEmbed({ src: url, mediaType: "video" }).run();
  };

  const insertPdf = () => {
    const url = window.prompt("آدرس پی‌دی‌اف را وارد کنید:", "https://");
    if (!url) return;
    insertPdfLink(url, "دانلود پی‌دی‌اف");
  };

  // اگه یه عکس انتخاب شده باشه، دکمه‌های چینش جای خودِ عکس رو عوض می‌کنن؛
  // وگرنه مثل همیشه چینش پاراگراف/تیتر جاری رو تنظیم می‌کنن.
  const isAligned = (align: "right" | "center" | "left" | "justify") => {
    if (editor.isActive("image")) {
      return align !== "justify" && editor.isActive("image", { align });
    }
    return editor.isActive({ textAlign: align });
  };

  const setAlignment = (align: "right" | "center" | "left" | "justify") => {
    if (editor.isActive("image")) {
      if (align === "justify") return;
      editor.chain().focus().updateAttributes("image", { align }).run();
      return;
    }
    editor.chain().focus().setTextAlign(align).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-border bg-background-soft p-2">
      <select
        className="h-9 rounded-md border border-border bg-card px-2 text-sm"
        value={
          editor.isActive("heading", { level: 1 })
            ? "1"
            : editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
                ? "3"
                : "0"
        }
        onChange={(e) => {
          const level = Number(e.target.value);
          if (level === 0) editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
        }}
      >
        <option value="0">متن معمولی</option>
        <option value="1">تیتر بزرگ</option>
        <option value="2">تیتر متوسط</option>
        <option value="3">تیتر کوچک</option>
      </select>

      <select
        className="h-9 rounded-md border border-border bg-card px-2 text-sm"
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
        className="h-9 rounded-md border border-border bg-card px-2 text-sm"
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
        className="h-9 rounded-md border border-border bg-card px-2 text-sm"
        title="فاصله‌ی خطوط"
        value={
          ((editor.getAttributes("paragraph").lineHeight ??
            editor.getAttributes("heading").lineHeight) as string) ?? ""
        }
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

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        label="ضخیم"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="مورب"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="زیرخط"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="خط‌خورده"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={16} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        label="لیست نقطه‌ای"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="لیست شماره‌دار"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="نقل‌قول"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={16} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton label="راست‌چین" active={isAligned("right")} onClick={() => setAlignment("right")}>
        <AlignRight size={16} />
      </ToolbarButton>
      <ToolbarButton label="وسط‌چین" active={isAligned("center")} onClick={() => setAlignment("center")}>
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton label="چپ‌چین" active={isAligned("left")} onClick={() => setAlignment("left")}>
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="تراز (هم‌ترازی دو طرف)"
        active={isAligned("justify")}
        disabled={editor.isActive("image")}
        onClick={() => setAlignment("justify")}
      >
        <AlignJustify size={16} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton label="لینک" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon size={16} />
      </ToolbarButton>
      <ToolbarButton label="افزودن عکس" onClick={handleImagePick}>
        <ImageIcon size={16} />
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <ToolbarButton label="افزودن ویدیو (با آدرس)" onClick={insertVideo}>
        <Film size={16} />
      </ToolbarButton>
      <ToolbarButton label="افزودن لینک پی‌دی‌اف (با آدرس)" onClick={insertPdf}>
        <FileText size={16} />
      </ToolbarButton>
      <ToolbarButton label="آپلود پی‌دی‌اف از دستگاه (به‌صورت لینک)" onClick={() => pdfInputRef.current?.click()}>
        <Upload size={16} />
      </ToolbarButton>
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePdfUpload}
      />
      <ToolbarButton label="آپلود فایل صوتی" onClick={() => audioInputRef.current?.click()}>
        <Music size={16} />
      </ToolbarButton>
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleAudioUpload}
      />

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        label="واگرد"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo size={16} />
      </ToolbarButton>
      <ToolbarButton
        label="ازنو"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo size={16} />
      </ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      FontSize,
      LineHeight,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      AlignableImage,
      Embed,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "متن مقاله را اینجا بنویسید..." }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        dir: "rtl",
        class: "prose-article tiptap-editable min-h-[60vh] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="rounded-lg border border-border bg-card">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
