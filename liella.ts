import { parse, HEADER, HttpError, kv, DISCORD_WEBHOOK, type Post } from "./common.ts";

const base = "https://lovelive-liellaclub.jp";

type LiellaPost = Omit<Post, "_id">

async function liella(): Promise<void> {
  const res = await fetch(`${base}/mob/index.php`, { headers: HEADER });
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
      posts.push({
        url: link.href,
        title,
        time,
      })
    }
  }
  console.log(posts);
  for (const p of posts.toReversed()) {
    console.log((await kv.get<string>(["post", "liella", p.time, p.title])).value);
    if ((await kv.get<string>(["post", "liella", p.time, p.title])).value !== null) continue;
    const _ = await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Liella! CLUB",
        content: `## ${p.title}\n${p.time}\n${p.url}`,
      }),
    })
    await kv.set(["post", "liella", p.time, p.title], p.title, { expireIn: 30 * 86400 });
  }
}

// export default liella;
await liella();
