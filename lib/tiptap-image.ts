import TiptapImage from "@tiptap/extension-image";

// عکسِ پیش‌فرض Tiptap راهی برای چینش (راست/وسط/چپ) نداره — چون خودِ
// تگ img به‌صورت پیش‌فرض inline نمایش داده می‌شه و دکمه‌های چینش متن
// (که روی پاراگراف/تیتر کار می‌کنن) روش اثری نداره. این‌جا یه attribute
// مستقل به اسم align به عکس اضافه می‌کنیم و با margin صریح (نه
// text-align) جاش رو کنترل می‌کنیم — تا مستقل از رفتار متن، همیشه کار کنه.
const AlignableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "right",
        parseHTML: (element) => element.getAttribute("data-align") || "right",
        renderHTML: (attributes) => {
          const align = attributes.align || "right";
          const horizontal =
            align === "center"
              ? "margin-inline-start:auto;margin-inline-end:auto;"
              : align === "left"
                ? "margin-inline-start:auto;margin-inline-end:0;"
                : "margin-inline-start:0;margin-inline-end:auto;";
          return {
            "data-align": align,
            style: `display:block;${horizontal}margin-block:1.8em;`,
          };
        },
      },
    };
  },
});

export default AlignableImage;
