import nako from "./nako.ts";
import chuke from "./chuke.ts";

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

Deno.cron("chuke fanclub", "1 * * * *", async () => {
  try {
    await chuke();
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
