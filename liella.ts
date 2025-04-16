import { parse, HEADER, HttpError, kv, DISCORD_WEBHOOK, type Post } from "./common.ts";

const base = "https://lovelive-liellaclub.jp";

type LiellaPost = Omit<Post, "_id">

async function liella(): Promise<void> {
  const res = await fetch(`${base}/mob/index.php?site=LC&ima=5622`, { headers: HEADER });
  if (!res.ok)
    throw new HttpError(res);
  const html = await res.text();
  const root = parse(html);
  const news = root.querySelectorAll("div.entry_list > div.entry_panel");
  console.log(`Found ${news.length} post`);
  const posts: LiellaPost[] = [];
  for (const n of news) {
    const href = n.querySelector("a")?.getAttribute("href");
    const title = n.querySelector("div.entry_text > p")?.innerText.trim();
    const time = n.querySelector("div.entry_label > span.date")?.innerText.trim();
    if (href && title && time) {
      const link = new URL(href, base);
      const id = link.searchParams.get("id");
      if (id) {
        posts.push({
          url: link.href,
          title,
          time,
        })
      }
    }
  }
  console.log(posts);
  const lastPost = (await kv.get<string>(["post", "liella"])).value ?? "";
  // use copy of reversed posts
  for (const p of posts.toReversed()) {
    if (p.url === lastPost) break;
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Liella! CLUB",
        content: `## ${p.title}\n${p.time}\n${p.url}`,
      }),
    })
  }
  if (posts[0].url !== lastPost) {
    await kv.set(["post", "liella"], posts[0].url);
  }
}

export default liella;
