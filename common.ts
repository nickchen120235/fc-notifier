export { parse } from "node-html-parser";

export const HEADER = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
}

export class HttpError extends Error {
  res: Response
  constructor(res: Response) {
    super(`Server returned ${res.status} when fetching ${res.url}`)
    this.name = this.constructor.name
    this.res = res
  }
}

export const kv = await Deno.openKv();

export const DISCORD_WEBHOOK = Deno.env.get("DISCORD_WEBHOOK") ?? "";

export interface Post {
  url: string;
  title: string;
  time: string;
  _id: number;
}
