/**
 * 品酒手帳 — 後端 API
 * Express + SQLite (better-sqlite3)
 *
 *   npm install
 *   npm start        → http://localhost:3000
 *
 * 端點：
 *   GET    /api/health          健康檢查（前端用嚟決定要唔要用後端）
 *   GET    /api/tastings        全部記錄（新 → 舊）
 *   GET    /api/tastings/:id    單筆
 *   POST   /api/tastings        Upsert（body = 完整記錄 JSON，需要 id）
 *   DELETE /api/tastings/:id    刪除單筆
 *   DELETE /api/tastings        清空
 *   GET    /api/export.csv      匯出 CSV
 */
"use strict";

const path = require("path");
const fs = require("fs");
const express = require("express");
const Database = require("better-sqlite3");

const ROOT = path.resolve(__dirname, "..");        // repo 根目錄（index.html 所在）
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "wine-journal.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

/* ---------------- Schema ---------------- */
db.exec(`
  CREATE TABLE IF NOT EXISTS tastings (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    producer    TEXT,
    vintage     TEXT,
    category    TEXT,
    country     TEXT,
    region      TEXT,
    grapes      TEXT,
    score       REAL,
    tasted_on   TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    data        TEXT NOT NULL          -- 完整 WSET SAT 記錄（JSON）
  );
  CREATE INDEX IF NOT EXISTS idx_tastings_date  ON tastings(tasted_on DESC);
  CREATE INDEX IF NOT EXISTS idx_tastings_cat   ON tastings(category);
  CREATE INDEX IF NOT EXISTS idx_tastings_country ON tastings(country);
`);

const q = {
  all: db.prepare(`SELECT * FROM tastings ORDER BY COALESCE(tasted_on, created_at) DESC, created_at DESC`),
  one: db.prepare(`SELECT * FROM tastings WHERE id = ?`),
  upsert: db.prepare(`
    INSERT INTO tastings (id, name, producer, vintage, category, country, region, grapes, score, tasted_on, created_at, updated_at, data)
    VALUES (@id, @name, @producer, @vintage, @category, @country, @region, @grapes, @score, @tasted_on, @created_at, @updated_at, @data)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, producer=excluded.producer, vintage=excluded.vintage, category=excluded.category,
      country=excluded.country, region=excluded.region, grapes=excluded.grapes, score=excluded.score,
      tasted_on=excluded.tasted_on, updated_at=excluded.updated_at, data=excluded.data
  `),
  del: db.prepare(`DELETE FROM tastings WHERE id = ?`),
  clear: db.prepare(`DELETE FROM tastings`),
  count: db.prepare(`SELECT COUNT(*) AS n FROM tastings`)
};

const rowToRecord = (row) => {
  let rec = {};
  try { rec = JSON.parse(row.data); } catch (_) { rec = {}; }
  return Object.assign({}, rec, {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
};

/* ---------------- App ---------------- */
const app = express();
app.use(express.json({ limit: "8mb" }));   // 相片以 base64 存放，所以放寬上限

// 寬鬆 CORS：方便用 iframe / 其他 origin 呼叫（個人自用 app；如要公開請自行收窄）
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// 前端：直接 serve repo 根目錄的 index.html（唔會 expose server/）
app.get("/", (req, res) => res.sendFile(path.join(ROOT, "index.html")));
app.get("/index.html", (req, res) => res.sendFile(path.join(ROOT, "index.html")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: "sqlite", file: path.basename(DB_PATH), count: q.count.get().n });
});

app.get("/api/tastings", (req, res) => {
  res.json(q.all.all().map(rowToRecord));
});

app.get("/api/tastings/:id", (req, res) => {
  const row = q.one.get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  res.json(rowToRecord(row));
});

app.post("/api/tastings", (req, res) => {
  const rec = req.body;
  if (!rec || typeof rec !== "object") return res.status(400).json({ error: "invalid body" });
  if (!rec.id) return res.status(400).json({ error: "missing id" });
  if (!rec.name) return res.status(400).json({ error: "missing name" });

  const now = new Date().toISOString();
  const values = {
    id: String(rec.id),
    name: String(rec.name),
    producer: rec.producer || null,
    vintage: rec.vintage || null,
    category: rec.category || null,
    country: rec.country || null,
    region: rec.region || null,
    grapes: rec.grapes || null,
    score: rec.score == null ? null : Number(rec.score),
    tasted_on: rec.date || now.slice(0, 10),
    created_at: rec.createdAt || now,
    updated_at: now,
    data: JSON.stringify(rec)
  };
  try {
    q.upsert.run(values);
    res.json({ ok: true, id: values.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "db error", detail: String(err.message || err) });
  }
});

app.delete("/api/tastings/:id", (req, res) => {
  const info = q.del.run(req.params.id);
  res.json({ ok: true, deleted: info.changes });
});

app.delete("/api/tastings", (req, res) => {
  const info = q.clear.run();
  res.json({ ok: true, deleted: info.changes });
});

/* ---------------- CSV 匯出 ---------------- */
const CSV_COLS = ["id", "tasted_on", "name", "producer", "vintage", "category", "country", "region",
  "grapes", "score", "appearance.clarity", "appearance.intensity", "appearance.colour",
  "nose.condition", "nose.intensity", "nose.development", "nose.aromas", "nose.notes",
  "palate.sweetness", "palate.acidity", "palate.tannin", "palate.alcohol", "palate.body",
  "palate.flavourIntensity", "palate.finish", "palate.balance", "palate.complexity",
  "palate.flavourCharacteristics", "conclusion.quality", "conclusion.readiness",
  "conclusion.agingPotential", "conclusion.priceCategory", "conclusion.foodPairing",
  "conclusion.conclusionNotes", "freeNotes"];

const dig = (o, p) => p.split(".").reduce((x, k) => (x == null ? undefined : x[k]), o);
const cell = (v) => {
  if (v == null) return "";
  const s = Array.isArray(v) ? v.join(" | ") : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

app.get("/api/export.csv", (req, res) => {
  const rows = q.all.all().map((row) => {
    const rec = rowToRecord(row);
    rec.tasted_on = row.tasted_on;
    const flat = {};
    CSV_COLS.forEach((c) => {
      flat[c] = c.indexOf(".") > -1 ? dig(rec, c) : dig(rec, c);
    });
    return CSV_COLS.map((c) => cell(flat[c])).join(",");
  });
  const csv = "\ufeff" + [CSV_COLS.join(",")].concat(rows).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="wine-journal-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

app.listen(PORT, "0.0.0.0", () => {
  const n = q.count.get().n;
  console.log(`🍷 品酒手帳 server running: http://localhost:${PORT}`);
  console.log(`   DB: ${DB_PATH}  (${n} 筆記錄)`);
});
