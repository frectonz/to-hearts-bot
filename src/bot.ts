import { Bot, InlineQueryResultBuilder } from "grammy";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;
const bot = new Bot(BOT_TOKEN);

const hearts = ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍"];

function toHeart(base8: number) {
  const el = hearts[base8];
  return el ? el : "x";
}

bot.on("inline_query", (ctx) => {
  const query = ctx.inlineQuery.query;

  if (query.length === 0) return;

  const encoder = new TextEncoder();
  const utf8 = encoder.encode(query);

  let base8: number[][] = [];
  utf8.forEach((x) => {
    const num = x.toString(8).split("").map((x) => parseInt(x));
    base8.push(num);
  });
  base8 = base8.reverse();

  const hearts = base8.map((group) => group.map((x) => toHeart(x)));
  const heartsMsg = hearts.map((group) => group.join("")).join(" ");

  const encodeResult = InlineQueryResultBuilder.article(
    query,
    "encoded message",
    { description: heartsMsg },
  ).text(heartsMsg);

  ctx.answerInlineQuery([encodeResult]);
});

export default bot;
