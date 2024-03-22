import { Bot } from "grammy";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;
const bot = new Bot(BOT_TOKEN);

bot.on("inline_query", (ctx) => {
  const query = ctx.inlineQuery.query;
  console.log(query);
});

export default bot;
