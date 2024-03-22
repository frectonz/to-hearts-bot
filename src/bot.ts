import { Bot, InlineQueryResultBuilder } from "grammy";
import {
  InlineQueryResultArticle,
} from "https://deno.land/x/grammy_types@v3.5.2/inline.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;
const bot = new Bot(BOT_TOKEN);

const hearts = ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍"];

function toHeart(base8: number): string {
  const el = hearts[base8];
  return el ? el : "x";
}

function fromHeart(heart: string): number {
  const index = hearts.indexOf(heart);
  return index === -1 ? 0 : index;
}

function base8ToDecimal(base8: number[]) {
  base8.reverse();
  return base8.reduce((acc, x, i) => acc + x * Math.pow(8, i));
}

bot.on("inline_query", (ctx) => {
  const query = ctx.inlineQuery.query;

  if (query.length === 0) return;

  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const segmented = Array.from(segmenter.segment(query)).map((data) =>
    data.segment
  );
  const allHearts = segmented.every((x) => hearts.includes(x) || x === " ");

  const result = allHearts ? decode(query) : encode(query);

  ctx.answerInlineQuery([result], {
    cache_time: 0,
  });
});

function decode(query: string): InlineQueryResultArticle {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const segmented = Array.from(segmenter.segment(query)).map((data) =>
    data.segment
  );

  const heartsGrouped: string[][] = [];
  segmented.push(" ");
  segmented.reduce<string[]>((acc, x) => {
    if (x === " ") {
      heartsGrouped.push(acc);
      return [];
    } else {
      acc.push(x);
      return acc;
    }
  }, []);
  heartsGrouped.reverse();

  const utf8 = heartsGrouped.map((group) =>
    group.map((heart) => fromHeart(heart))
  ).map((group) => base8ToDecimal(group));

  const decoder = new TextDecoder();
  const decodedMsg = decoder.decode(new Uint8Array(utf8));

  const decodeResult = InlineQueryResultBuilder.article(
    decodedMsg,
    "decoded message",
    { description: decodedMsg },
  ).text(decodedMsg);

  return decodeResult;
}

function encode(query: string): InlineQueryResultArticle {
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

  return encodeResult;
}

export default bot;
