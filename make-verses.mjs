import fs from "fs";
import { curatedRefs } from "./src/verses.js";

const verses = [];

for (const ref of curatedRefs) {
await new Promise(resolve => setTimeout(resolve, 2500));
  console.log("Fetching", ref);

  const response = await fetch(
    `https://bible-api.com/${encodeURIComponent(ref)}?translation=web`
  );

  const data = await response.json();

  verses.push({
    ref,
    text: data.text.replace(/\s+/g, " ").trim(),
    translation: "WEB"
  });
}

const output = `export const proverbs = ${JSON.stringify(verses, null, 2)};

export function getDailyVerse(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const day = Math.floor(diff / 86400000);

  return proverbs[(day - 1) % proverbs.length];
}
`;

fs.writeFileSync("./src/verses.js", output);

console.log("Done. All WEB verses stored locally.");