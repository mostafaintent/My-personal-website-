import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

export type ArticleType = "article" | "translation" | "book";

export interface ArticleFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  premium: boolean;
  type: ArticleType;
  priceUSD?: number;
  priceIRR?: number;
}

export interface ArticleMeta extends ArticleFrontmatter {
  slug: string;
  readingMinutes: number;
}

export interface Article extends ArticleMeta {
  content: string;
}

function readArticleFile(slug: string) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf8");
  return matter(raw);
}

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getAllArticles(): ArticleMeta[] {
  return getArticleSlugs()
    .map((slug) => {
      const { data, content } = readArticleFile(slug);
      const frontmatter = data as ArticleFrontmatter;
      return {
        ...frontmatter,
        slug,
        readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const { data, content } = readArticleFile(slug);
    const frontmatter = data as ArticleFrontmatter;
    return {
      ...frontmatter,
      slug,
      readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
      content,
    };
  } catch {
    return null;
  }
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllArticles().forEach((article) => article.tags.forEach((t) => tags.add(t)));
  return Array.from(tags);
}
