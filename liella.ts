import { parse, HEADER, HttpError, kv, DISCORD_WEBHOOK, type Post } from "./common.ts";

const base = "https://lovelive-liellaclub.jp";

async function liella(): Promise<void> {
  const res = await fetch(`${base}/mob/index.php?site=LC&ima=5622`, { headers: HEADER });
  if (!res.ok)
    throw new HttpError(res);
  const html = await res.text();
  const root = parse(html);
  const news = root.querySelectorAll("div.entry_list > div.entry_panel");
  console.log(`Found ${news.length} post`);
  const posts: Post[] = [];
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
          _id: parseInt(id),
        })
      }
    }
  }
  console.log(posts);
  const lastPost = (await kv.get<number>(["post", "liella"])).value ?? 0;
  if (lastPost !== 0) {
    // sort posts by _id from small to big
    for (const p of posts.toSorted((a, b) => a._id - b._id)) {
      if (p._id <= lastPost) continue;
      const _ = await fetch(DISCORD_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Liella Fanclub",
          content: `## ${p.title}\n${p.time}\n${p.url}`,
        }),
      })
    }
  }
  if (posts[0]._id > lastPost) {
    await kv.set(["post", "liella"], posts[0]._id);
  }
}

export default liella;
