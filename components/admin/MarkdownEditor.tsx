"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div data-color-mode="light" dir="rtl">
      <MDEditor
        value={value}
        onChange={(next) => onChange(next ?? "")}
        height={420}
        preview="live"
        textareaProps={{
          dir: "rtl",
          placeholder: "متن مقاله را اینجا بنویسید...",
        }}
      />
    </div>
  );
}
