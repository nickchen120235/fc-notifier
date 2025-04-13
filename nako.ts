import { parse, HEADER, HttpError, kv, DISCORD_WEBHOOK } from "./common.ts";

const base = "https://account.tonarininako.jp";

interface Post {
  url: string;
  title: string;
  time: string;
  _id: number;
}

async function nako(): Promise<void> {
  const res = await fetch(`${base}/login.php`, { headers: HEADER });
  if (!res.ok)
    throw new HttpError(res);
  const html = await res.text();
  const root = parse(html);
  const news = root.querySelectorAll("section#news > ul > li.news__li");
  console.log(`Found ${news.length} post`);
  const posts: Post[] = [];
  for (const n of news) {
    const href = n.querySelector("a")?.getAttribute("href");
    const title = n.querySelector("div.news__title")?.innerText.trim();
    const time = n.querySelector("time")?.innerText.trim();
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
  const lastPost = (await kv.get<number>(["post", "nako"])).value ?? 0;
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
          username: "となりになこ",
          content: `## ${p.title}\n${p.time}\n${p.url}`,
        }),
      })
    }
  }
  if (posts[0]._id > lastPost) {
    await kv.set(["post", "nako"], posts[0]._id);
  }
}

export default nako;
