import nako from "./nako.ts";

Deno.cron("nako fanclub", "6 * * * *", async () => {
  try {
    await nako();
  }
  catch (e) {
    if (e instanceof Error) {
      console.error(e);
    }
    else {
      console.error("Unknown error", JSON.stringify(e));
    }
  }
});
