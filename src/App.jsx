import React, { useEffect, useMemo, useState } from "react";
import { Download, Shuffle, Heart, Share2 } from "lucide-react";
import { createRoot } from "react-dom/client";
import { proverbs, getDailyVerse } from "./verses";
import "./style.css";

const themes = [
  { name: "Ivory", bg: "#f2eee8", ink: "#111111", accent: "#9b5a5c", texture: true },
  { name: "Midnight", bg: "#111827", ink: "#f8fafc", accent: "#d4af37", texture: false },
  { name: "Sage", bg: "#dfe8dd", ink: "#1f2a22", accent: "#6b8f71", texture: true },
  { name: "Rose", bg: "#f4dfdf", ink: "#1f1a1a", accent: "#a35b6f", texture: true },
];

function splitVerse(text) {
  const parts = text.replace(/[.;:]$/, "").split(/[;:]/);
  if (parts.length >= 2) return [parts[0].trim(), parts.slice(1).join(";").trim()];
  const words = text.split(" ");
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function drawWrapped(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length * lineHeight;
}

function exportCard(verse, theme) {
  const canvas = document.createElement("canvas");
  canvas.width = 1170;
  canvas.height = 2532;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (theme.texture) {
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#000" : "#fff";
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
  }

  ctx.textAlign = "center";
  ctx.letterSpacing = "18px";

  const [first, second] = splitVerse(verse.text);
  ctx.font = "700 58px Arial";
  drawWrapped(ctx, "DAILY PROVERB", canvas.width / 2, 520, 880, 74);

  ctx.font = "italic 88px Georgia";
  drawWrapped(ctx, first.toLowerCase(), canvas.width / 2, 635, 940, 98);

  ctx.fillStyle = theme.ink;
  ctx.font = "700 56px Arial";
  
  ctx.font = "italic 84px Georgia";
  drawWrapped(ctx, second.toLowerCase(), canvas.width / 2, 1080, 940, 96);

  ctx.font = "700 42px Arial";
  ctx.fillText("KJV", canvas.width / 2, 2050);

  ctx.font = "700 42px Arial";
  ctx.letterSpacing = "12px";
  ctx.fillText("FROM", canvas.width / 2, 2190);

  ctx.font = "700 54px Arial";
  ctx.fillText(verse.ref.toUpperCase(), canvas.width / 2, 2280);

  const a = document.createElement("a");
  a.download = `daily-proverb-${verse.ref.replaceAll(" ", "-").replaceAll(":", "-")}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

function App() {
  const [selected, setSelected] = useState(() => getDailyVerse());
  const [theme, setTheme] = useState(themes[0]);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("favorites") || "[]"));
  
  const isFav = favorites.includes(selected.ref);
  const [first, second] = useMemo(() => splitVerse(selected.text), [selected]);

  useEffect(() => localStorage.setItem("favorites", JSON.stringify(favorites)), [favorites]);

  function randomVerse() {
    setSelected(proverbs[Math.floor(Math.random() * proverbs.length)]);
  }

async function shareVerse() {
  const text = `${selected.text} — ${selected.ref} KJV`;

  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.log(err);
  }
}
  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Daily Proverbs</p>
        <h1>Make beautiful daily Scripture cards.</h1>
        <p className="sub">A working MVP: daily verse, themes, favorites, copy text, and export wallpaper image.</p>
      </section>

      <section className="workspace">
        <aside className="panel">
          <label>Choose verse</label>
          <select value={selected.ref} onChange={(e) => setSelected(proverbs.find(v => v.ref === e.target.value))}>
            {proverbs.map(v => <option key={v.ref}>{v.ref}</option>)}
          </select>

          <label>Theme</label>
          <div className="themes">
            {themes.map(t => (
              <button key={t.name} onClick={() => setTheme(t)} className={theme.name === t.name ? "active" : ""}>
                <span style={{ background: t.accent }} />{t.name}
              </button>
            ))}
          </div>

          <button className="primary" onClick={() => exportCard(selected, theme)}><Download size={18}/> Export wallpaper</button>
          <button onClick={randomVerse}><Shuffle size={18}/> Random proverb</button>
          <button onClick={() => setFavorites(isFav ? favorites.filter(x => x !== selected.ref) : [...favorites, selected.ref])}>
            <Heart size={18} fill={isFav ? "currentColor" : "none"}/> {isFav ? "Favorited" : "Favorite"}
          </button>
          <button onClick={shareVerse}><Share2 size={18}/> Copy text</button>

          <div className="note">
            <strong>Legal note:</strong> this MVP uses KJV text. NKJV usually needs licensing for a public/commercial app.
          </div>
        </aside>

        <div className="phone">
          <div className="status">7:24 <span>100</span></div>
          <article
            className={`card ${theme.texture ? "texture" : ""}`}
            style={{ "--bg": theme.bg, "--ink": theme.ink, "--accent": theme.accent }}
          >
	<div className="header-center">
  	<div className="top">Daily Proverb</div>
  	<div className="underline"></div>
	</div>

	<h3 className="reference">
	  Verse {selected.ref.replace("Proverbs ", "")}
	</h3>

	<div className="verse-block">
  	<span className="tilde left"></span>
  	<h2>{first}</h2>
  	<span className="tilde right"></span>
	</div>

	<p>{second}</p>

	<div className="bottom">
  	<div className="badge">KJV</div>
	</div>
          </article>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
