// Articles are Markdown files in src/content/writing/<slug>.md with frontmatter:
//   title, description, date (YYYY-MM-DD), tags (list), draft (optional)

import type { MarkdownInstance } from "astro";

export interface Frontmatter {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  draft?: boolean;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  date: Date;
  tags: string[];
  minutes: number;
  Content: MarkdownInstance<Frontmatter>["Content"];
}

const files = import.meta.glob<MarkdownInstance<Frontmatter>>("../content/writing/*.md", { eager: true });

function minutes(raw: string): number {
  const words = raw.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function articles(): Article[] {
  return Object.entries(files)
    .map(([path, mod]) => ({
      slug: path.split("/").pop()!.replace(/\.md$/, ""),
      title: mod.frontmatter.title,
      description: mod.frontmatter.description,
      date: new Date(`${mod.frontmatter.date}T00:00:00Z`),
      tags: mod.frontmatter.tags ?? [],
      minutes: minutes(mod.rawContent()),
      draft: mod.frontmatter.draft ?? false,
      Content: mod.Content,
    }))
    .filter((a) => !a.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
