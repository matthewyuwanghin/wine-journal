# 🍷 品酒手帳 · WSET Tasting Journal

用 **WSET Systematic Approach to Tasting (SAT)** 記錄每一次飲酒嘅網站。
Desktop / 平板 / 手機同一個介面自動適應；表單全部用 **dropdown + chip** 揀（例如 Nose Intensity：`淡 Light / 中− Medium− / 中 Medium / 中+ Medium+ / 濃郁 Pronounced`），唔需要背英文亦唔需要打字。

**雲端資料庫有 3 條路，任揀一條：**

| 模式 | 資料放邊 | 幾時用 | 設定難度 |
|---|---|---|---|
| ⭐ **GitHub Repository** | 你 repo 內 `data/tastings.json`，每次儲存＝1 個 commit | **想放 GitHub Pages 又要跨裝置同步**（推薦） | 3 分鐘 |
| **GitHub Gist** | 一個 secret gist 檔 | 最快、唔想開 repo；只適合純文字 | 1 分鐘 |
| **SQLite 後端** | `server/` 內 SQLite 檔 | 自己電腦 / Render / Railway / VPS 跑，真正 SQL 查詢 | 5 分鐘 |
| 本機 IndexedDB | 你部瀏覽器 | 一個人一部機、離線用 | 0 |

> 📦 **想直接部署？** 睇 **[DEPLOY.md](DEPLOY.md)** —— 英文逐步教學（下載 → GitHub Pages → GitHub repo 做資料庫 → 跨裝置驗證）。
>
> 前端啟動時會自動揀：有自己嘅 SQLite 後端 → 用後端；設定咗 GitHub → 用 GitHub；否則用本機 IndexedDB。
> **同一份 `index.html`，三種部署都唔使改 code。** 所有設定喺 app 內「⚙️ 設定」頁填。

---

## 1. 功能一覽

**記錄（WSET SAT 三大部分 + 結論）**
- 外觀 Appearance：清澈度、濃度、顏色（白酒／粉紅／紅酒分組 optgroup）、氣泡 Mousse、其他觀察
- 香氣 Nose：狀態 condition、濃度 intensity、發展 development、**79 個香氣 cluster chips（可多選）**、自由描述
- 口感 Palate：甜度、酸度、單寧（+ 單寧質感）、酒精、酒體、風味濃度、餘韻、平衡度、複雜度、風味特徵
- 結論 Conclusions：品質（Faulty → Outstanding）、適飲狀態、陳年潛力、價格級別、食物配搭、總結
- 個人 1–5★（可半星）、會唔會再買、盲飲、自訂 tags、自由筆記
- 酒款資料：酒名、酒莊、年份、類型、國家（27 個產酒國 datalist）、產區、葡萄、ABV、價錢＋貨幣、日期、地點、酒杯、溫度、醒酒
- 酒標相片（自動壓縮 900px JPEG；GitHub 模式預設只留本機，唔會令 repo 變大）

**酒櫃**：關鍵字搜尋、類型／國家篩選、4 種排序、顏色 swatch、詳情彈窗、🖨 列印 / 存 PDF

**統計**：總數、平均分、國家數、本月數、近 12 個月圖、國家／葡萄 Top 8、WSET 品質分佈、評分分佈

**資料**：JSON 備份／匯入、CSV（Excel 開得）、清空、3 筆示範資料

**⚙️ 設定**：切換儲存模式、測試連線、重新由雲端載入、把本機資料合併上雲端

**介面**：手機底部 tab bar + safe-area；Desktop 頂部 tab + 兩欄統計；深色酒窖主題；零外部依賴、零 build step、單一 HTML

---

## 2. 檔案結構

```
wine-journal/
├── index.html                     ← 整個前端（HTML + CSS + JS）
├── README.md
├── .gitignore  .nojekyll
├── Dockerfile                     ← 想用 Docker 跑後端
├── data/
│   └── tastings.json              ← ⭐ GitHub 模式嘅「資料庫」（app 自動 commit）
├── exports/
│   └── wine-journal.csv           ← GitHub Actions 自動生成
├── scripts/
│   └── json-to-csv.js             ← JSON → CSV（Actions 用，也可手動跑）
├── .github/workflows/
│   └── export-csv.yml             ← 每次資料更新自動出 CSV
└── server/                        ← 可選：SQLite 後端
    ├── server.js  package.json
    └── data/wine-journal.db       ← 自動建立（已 gitignore）
```

---

## 3. 本機即刻試

```bash
cd wine-journal
python3 -m http.server 8000      # 方法 A：純前端（用 IndexedDB）
# 或
cd server && npm install && npm start   # 方法 B：連 SQLite 後端 → http://localhost:3000
```
> 直接雙擊 `index.html`（`file://`）都開得，但部分瀏覽器會限制 `file://` 嘅 IndexedDB，建議用上面嘅本機 server。

### 後端 API（只有用 `server/` 時）
| Method | Path | 用途 |
|---|---|---|
| GET | `/api/health` | 健康檢查（前端靠佢決定用邊個 DB） |
| GET | `/api/tastings` | 全部記錄 |
| POST | `/api/tastings` | Upsert |
| DELETE | `/api/tastings/:id` | 刪除 |
| DELETE | `/api/tastings` | 清空 |
| GET | `/api/export.csv` | 由 DB 直接出 CSV |

---

## 4. 上傳 GitHub + Pages 上線（前端）

1. GitHub → **New repository** → 名 `wine-journal` → Public → 唔好勾 README → Create
2. `Add file → Upload files`，拖入 `index.html`、`README.md`、`.gitignore`、`.nojekyll`、`data/`、`scripts/`、`.github/`
   （`server/` 可上可不上，Pages 跑唔到 Node；**唔好**上 `server/node_modules`、`server/data`）
3. **Settings → Pages** → Source：`Deploy from a branch` → Branch **main** / **(root)** → Save
4. 等 1–2 分鐘 → `https://<帳號>.github.io/wine-journal/`
5. 手機開同一個網址 → 「加入主畫面」即變成 App icon

用 command line 版：
```bash
cd wine-journal
git init && git add . && git commit -m "feat: WSET 品酒手帳"
git branch -M main
git remote add origin https://github.com/<帳號>/wine-journal.git
git push -u origin main
```
> HTTPS 推送時 password 位要貼 **Personal Access Token**（fine-grained，Contents: Read and write）。

---

## 5. ⭐ 用 GitHub Repository 做資料庫（跨裝置同步）

**原理：** repo 內一個 `data/tastings.json` 就係你嘅「table」，透過 GitHub REST Contents API 讀寫。
每次儲存一杯酒 → app 自動 commit 一次；`git log` 就係你嘅版本紀錄；換電話 / 換電腦填同一組設定 → 即刻見到同一份資料。

### 一次性設定（3 分鐘）

**Step 1 — 開資料 repo**
1. GitHub → New repository → 名 `wine-journal-data`（或者同一個 repo 都得）
2. 勾 **Add a README file**；建議揀 **Private**
3. Repo 內 **Add file → Create new file** → 檔名 `data/tastings.json` → 內容：
   ```json
   {"records": []}
   ```
   → Commit

**Step 2 — 產生 Token**
1. GitHub 右上頭像 → **Settings** → 左下 **Developer settings**
2. **Personal access tokens → Fine-grained tokens → Generate new token**
3. 填：
   - Token name：`wine-journal`
   - Expiration：睇你（90 日 / 1 年 / No expiration）
   - **Repository access：Only select repositories → 揀 `wine-journal-data`**
   - **Repository permissions → Contents：Read and write**（其他全部 No access）
4. Generate → 複製 `github_pat_…`（**只顯示一次**）

**Step 3 — 填入 app**
1. 開你嘅網站 → **⚙️ 設定**
2. 儲存模式揀 **⭐ GitHub Repository 做資料庫**
3. 填：
   | 欄位 | 例子 |
   |---|---|
   | Token | `github_pat_xxxxx` |
   | Owner | `your-username` |
   | Repo | `wine-journal-data` |
   | Branch | `main` |
   | Path | `data/tastings.json` |
4. 按 **🔌 測試連線** → 見到「✅ 連線成功」→ 按 **💾 儲存並重新連線**
5. 頂部 pill 變成 `GitHub · your-username/wine-journal-data` 即成功

之後每次記錄都會自動 commit，去 repo 的 **Commits** 就睇到：
```
note: Château Margaux (2026-11-10)
note: Riesling Kabinett (2026-11-15)
```

### 多部裝置
每部裝置（電腦、手機）各自入一次同樣設定即可（token 只存喺該裝置 localStorage）。
同時兩邊改？有 **`updatedAt` 合併**：同一筆記錄用較新嘅為準；寫入遇 GitHub 409 衝突會自動重讀再試一次。

### 「⬆︎ 把本機資料合併上雲端」
如果你之前用本機 IndexedDB 記落一堆，接上 GitHub 後按呢個掣：會讀雲端 → 同本機按 id 合併（較新 updatedAt 勝）→ 一次 commit 上傳。之後資料就以雲端為準。

### 同步 CSV / Excel
`.github/workflows/export-csv.yml` 已經準備好：只要 `data/tastings.json` 有 commit，GitHub Actions 會自動
- 生成 `exports/wine-journal.csv`（UTF-8 BOM，Excel 直接開唔亂碼）
- 同時上傳做 Actions artifact（可以喺手機下載）

### 限制 / 注意
- 每次儲存 = 1 個 commit；GitHub API 免費額度 5,000 req/小時，絕對夠（每次儲存用 2 個 request）
- 資料檔建議 < 50MB；相片預設**唔上傳**（只留本機快取）就永遠唔會爆
- Token 等於鎖匙：**只存喺你部機嘅 localStorage**，唔會經第三方；唔好喺公用電腦用；洩漏就即刻 Revoke
- Private repo + Pages：如果你嘅 Pages 係 public repo 而資料 repo 係 private，完全冇問題（token 有權限就讀得到）

### 更快但較簡陋：GitHub Gist 模式
1. 開 https://gist.github.com → 檔名 `wine-journal.json`，內容 `{"records": []}` → **Create secret gist**
2. Token 只需要 `gist` scope（Classic token 或 fine-grained 的 Gists: Read and write）
3. ⚙️ 設定 → 模式揀 **GitHub Gist** → 填 Token + Gist ID（網址最後一段）+ 檔名
4. 缺點：單檔約 1MB 上限、冇 private、版本紀錄較難睇 → 長遠建議用 repo 模式

---

## 6. 真正雲端 DB：部署 SQLite 後端

前端偵測到 `api/health` 有回應就會用後端（模式揀「自動」或加 GitHub 都可以共存）。

**Render（最簡單）**
1. 推 repo 上 GitHub → Render **New → Web Service** → 連 repo
2. Root Directory：`server`｜Build：`npm install`｜Start：`npm start`
3. 加 **Persistent Disk**（mount `/data`）+ Environment `DB_PATH=/data/wine-journal.db`
   ⚠️ 唔加 disk，重新部署後 SQLite 會清空
4. Deploy → 開 Render 網址，pill 顯示「SQLite 後端資料庫」

**Docker**
```bash
docker build -t wine-journal .
docker run -d -p 3000:3000 -v $(pwd)/data:/app/server/data --name wine-journal wine-journal
```

**VPS**：`DB_PATH=/var/lib/wine-journal.db PORT=3000 npm start` + nginx/Caddy 反向代理 HTTPS

**Schema**
```sql
CREATE TABLE tastings (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, producer TEXT, vintage TEXT,
  category TEXT, country TEXT, region TEXT, grapes TEXT, score REAL,
  tasted_on TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  data TEXT NOT NULL   -- 完整 WSET SAT 記錄 (JSON)
);
-- 例：今年平均分
SELECT AVG(score) FROM tastings WHERE tasted_on >= '2026-01-01';
-- 例：抽 JSON 內某個 WSET 欄位
SELECT name, json_extract(data,'$.nose.intensity') FROM tastings;
```

---

## 7. 備份

- **GitHub 模式**：本身就係備份（每次都 commit，可以 `git log` / 還原舊版）；再加 Actions 自動 CSV。
  想全量下載：⚙️ 設定 → 或「統計 → 下載 JSON」。
- **本機 IndexedDB**：資料只喺該部裝置該個瀏覽器，清 cache / 換機就無。定期「統計 → 下載 JSON」存去雲端。
- **SQLite**：copy `server/data/wine-journal.db`（連 `-wal`）就係完整備份。

---

## 8. 自訂（改 `index.html` 內嘅常數）

| 想改 | 搵邊個 |
|---|---|
| 香氣選項 | `const AROMAS = [...]`（格式 `["分組名", ["項目1","項目2"]]`） |
| 國家 | `const COUNTRIES = [...]` |
| 酒類 | `const CATEGORIES = [...]` |
| WSET 欄位／詞彙 | `const SAT_GROUPS = [...]`（`o` 下拉、`og` 分組、`text`/`area` 文字、`chips` 多選） |
| 基本資料欄位 | `const META_FIELDS = [...]` |
| 預設儲存模式 | `const DEFAULT_CFG = {...}`（`mode: "auto" \| "local" \| "github" \| "gist"`） |
| 配色 | `:root{ --wine / --gold / --bg ... }` |

---

## 9. 常見問題

**Q：Pages 係靜態網站，點會有資料庫？**
A：兩個做法都已經內建 ——（1）用 GitHub 本身做儲存（repo/Gist + REST API，本文件第 5 節）；（2）自己起一個 SQLite 後端（第 6 節）。純 Pages 冇後端時就只會用本機 IndexedDB。

**Q：手機同電腦會同步嗎？**
A：用 GitHub 模式或 SQLite 後端 → 會。用本機 IndexedDB → 唔會。

**Q：會唔會唔安全？**
A：Token 只存喺你部瀏覽器；repo 係 private；app 只會寫你指定嘅一個檔案路徑。風險同「喺瀏覽器存一個 repo 密碼」一樣，所以唔好喺公用電腦／公用 Wi-Fi 填，用完可以 Revoke。

**Q：可以將 token 寫死喺 `index.html` 嗎？**
A：**唔建議，而且實測唔可行。** GitHub secret scanning 會自動 **decode base64** 再比對，就算你將 token 轉成 base64，push 時一樣會被 *Secret scanning found a GitHub Personal Access Token* 攔住（push protection）；撳 "Allow Secret" 之後 GitHub 會標記／撤銷該 token → app 就出 `HTTP 401`。
✅ 本專案嘅做法（已內建）：
1. `index.html` **唔會載入任何 token**（`BUILTIN_CONFIG.token_b64` 故意留空）
2. 每部裝置第一次用：⚙️ 設定 → 貼一次 token → 💾（存 localStorage，網站檔案永遠冇 token）
3. 之後新裝置可用 **⚙️ 設定 → 🔗 產生設定連結**，用手機打開該連結就一鍵設定（連結內含 token，等同鎖匙，唔好公開貼）
想真正做到「零設定 + 安全」：把 token 放在伺服器端（第 6 節嘅 SQLite 後端，或 Cloudflare Worker 代理），前端永遠唔接觸 token。

**Q：多人一齊用？**
A：技術上得（同一個 GitHub repo 或後端），但冇登入機制，任何有 token / 網址嘅人都可以讀寫。要分享唯讀就畀佢睇 repo。

**Q：想用真正的 Postgres？**
A：可用 Supabase（免費層）。開 project → SQL Editor 執行：
```sql
create table tastings (
  id text primary key, name text not null, data jsonb not null,
  updated_at timestamptz default now()
);
alter table tastings enable row level security;
create policy "own data" on tastings for all using (auth.uid() is not null);
```
前端要加一個 adapter（照 `serverAdapter` 嘅樣，用 `supabase-js` 或 REST `https://<proj>.supabase.co/rest/v1/tastings` + anon key），有需要可以再叫我加。

**Q：WSET 詞彙跟邊個版本？**
A：WSET **Level 3 Award in Wines** SAT（外觀／香氣／口感／結論）。Level 4 Diploma 可照樣用第 8 節加欄位。

**Q：清空之後救得返？**
A：GitHub 模式可以（repo 嘅 commit 歷史）；本機模式救唔返 —— 清空前一定先匯出 JSON。

乾杯 🥂
