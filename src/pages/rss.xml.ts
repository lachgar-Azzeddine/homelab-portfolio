import type { APIRoute } from "astro";
import { articles } from "../lib/writing";

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = ({ site }) => {
  const base = site!.toString().replace(/\/$/, "");
  const items = articles()
    .map((a) => {
      const url = `${base}/writing/${a.slug}/`;
      return `<item><title>${escape(a.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${a.date.toUTCString()}</pubDate><description>${escape(a.description)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Azzeddine Lachgar, writing</title><link>${base}/writing/</link><description>Things that broke, and what they taught me.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
