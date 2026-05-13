import React, { useEffect, useState } from "react";
import { Download, Heart, Menu, Share2, X } from "lucide-react";
import { getDailyVerse } from "./verses";
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
  const shortRef = verse.ref.replace("Proverbs ", "");
  const [first, second] = splitVerse(verse.text);

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
  ctx.fillStyle = theme.ink;

  ctx.font = "700 58px Arial";
  ctx.fillText("DAILY PROVERB", canvas.width / 2, 430);

  ctx.fillRect(canvas.width / 2 - 250, 470, 500, 4);

  ctx.font = "700 46px Arial";
  ctx.fillText(`VERSE ${shortRef}`, canvas.width / 2, 570);

  ctx.font = "italic 88px Georgia";
  drawWrapped(ctx, first, canvas.width / 2, 760, 900, 100);

  ctx.font = "italic 82px Georgia";
  drawWrapped(ctx, second, canvas.width / 2, 1080, 900, 96);

  ctx.font = "700 48px Arial";
  ctx.strokeStyle = theme.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(canvas.width / 2 - 70, 2110, 140, 70);
  ctx.fillText("WEB", canvas.width / 2, 2162);

  const a = document.createElement("a");
  a.download = `daily-proverb-${shortRef.replace(":", "-")}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

function App() {
  const [selected] = useState(() => getDailyVerse());
  const [theme, setTheme] = useState(themes[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );

  const isFav = favorites.includes(selected.ref);
  const [first, second] = splitVerse(selected.text);
  const shortRef = selected.ref.replace("Proverbs ", "");

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  async function copyVerse() {
    const text = `${selected.text} — ${selected.ref} WEB`;

    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.log(err);
    }
  }

  function toggleFavorite() {
    setFavorites(
      isFav
        ? favorites.filter((x) => x !== selected.ref)
        : [...favorites, selected.ref]
    );
  }

  return (
    <main className="app daily-mode">
      <button className="menu-button" onClick={() => setMenuOpen(true)}>
        <Menu size={24} />
      </button>

      <section className="phone solo">
        <article
          className={`card ${theme.texture ? "texture" : ""}`}
          style={{
            "--bg": theme.bg,
            "--ink": theme.ink,
            "--accent": theme.accent,
          }}
        >
          <div className="header-center">
            <div className="top">Daily Proverb</div>
            <div className="underline"></div>
          </div>

          <h3 className="reference">Verse {shortRef}</h3>

          <div className="verse-block">
            <h2>{first}</h2>
          </div>

          <p>{second}</p>

          <div className="bottom">
            <div className="badge">WEB</div>
          </div>
        </article>
      </section>

      {menuOpen && (
        <aside className="drawer">
          <button className="close-button" onClick={() => setMenuOpen(false)}>
            <X size={22} />
          </button>

          <h2>Daily Proverb</h2>
          <p className="drawer-sub">Today’s wisdom card</p>

          <label>Theme</label>

          <div className="themes">
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t)}
                className={theme.name === t.name ? "active" : ""}
              >
                <span style={{ background: t.accent }} />
                {t.name}
              </button>
            ))}
          </div>

          <button className="primary" onClick={() => exportCard(selected, theme)}>
            <Download size={18} /> Export Wallpaper
          </button>

          <button onClick={copyVerse}>
            <Share2 size={18} /> Copy Verse
          </button>

          <button onClick={toggleFavorite}>
            <Heart size={18} fill={isFav ? "currentColor" : "none"} />
            {isFav ? "Favorited" : "Favorite"}
          </button>
        </aside>
      )}
    </main>
  );
}

export default App;