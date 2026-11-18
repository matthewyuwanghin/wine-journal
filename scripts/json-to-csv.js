#!/usr/bin/env node
/**
 * 將 data/tastings.json → exports/wine-journal.csv
 * 用法： node scripts/json-to-csv.js [輸入檔] [輸出檔]
 * GitHub Actions 會定時執行呢個 script，令你嘅雲端資料自動有一份 Excel 可讀嘅 CSV。
 */
"use strict";
const fs = require("fs");
const path = require("path");

const input = process.argv[2] || "data/tastings.json";
const output = process.argv[3] || "exports/wine-journal.csv";

if (!fs.existsSync(input)) {
  console.error(`找唔到 ${input}，跳過。`);
  process.exit(0);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(input, "utf8"));
} catch (err) {
  console.error(`${input} 唔係有效 JSON：${err.message}`);
  process.exit(1);
}
const records = Array.isArray(data) ? data : (data.records || []);

const COLS = [
  "id", "date", "name", "producer", "vintage", "category", "country", "region", "grapes",
  "abv", "price", "currency", "place", "glass", "temp", "decant", "score",
  "appearance.clarity", "appearance.intensity", "appearance.colour", "appearance.mousse", "appearance.notes",
  "nose.condition", "nose.intensity", "nose.development", "nose.aromas", "nose.notes",
  "palate.sweetness", "palate.acidity", "palate.tannin", "palate.tanninNature", "palate.alcohol",
  "palate.body", "palate.flavourIntensity", "palate.finish", "palate.balance", "palate.complexity",
  "palate.flavourCharacteristics",
  "conclusion.quality", "conclusion.readiness", "conclusion.agingPotential", "conclusion.priceCategory",
  "conclusion.foodPairing", "conclusion.conclusionNotes",
  "wouldBuy", "isBlind", "tags", "freeNotes", "createdAt", "updatedAt"
];

const dig = (o, p) => p.split(".").reduce((x, k) => (x == null ? undefined : x[k]), o);
const cell = (v) => {
  if (v == null) return "";
  const s = Array.isArray(v) ? v.join(" | ") : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

const rows = records
  .slice()
  .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
  .map((r) => COLS.map((c) => cell(dig(r, c))).join(","));

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, "\ufeff" + [COLS.join(",")].concat(rows).join("\n"), "utf8");
console.log(`✅ 已匯出 ${records.length} 筆 → ${output}`);
