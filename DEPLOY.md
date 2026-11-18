# 🚀 DEPLOY GUIDE — WSET 品酒手帳 (wine-journal)

Step-by-step: put the site on GitHub Pages **and** use a GitHub repo as a shared database so **phone + laptop + tablet all see the same notes**.

Total time: ~10 minutes. No coding, no build tools, no server required.

---

## 0. What you got (the package)

```
wine-journal/
├── index.html                      ← the whole app (open this, or deploy it)
├── README.md                       ← full documentation (Chinese)
├── DEPLOY.md                       ← this file
├── .gitignore
├── .nojekyll                       ← needed for GitHub Pages
├── Dockerfile                      ← optional, only for the SQLite server
├── data/tastings.json              ← ⭐ your cloud "database" file (start: empty)
├── scripts/json-to-csv.js          ← JSON → CSV converter
├── .github/workflows/export-csv.yml← auto-export CSV on every save
└── server/                         ← optional SQLite API (not needed for Pages)
    ├── server.js
    └── package.json
```

> ⚠️ Do **not** upload `server/node_modules` or `server/data` to GitHub (they are generated). The `.gitignore` already excludes them.

---

# PART A — Get the files onto your computer

1. Go to the Arena workspace where you created this project.
2. Download the package **`wine-journal.zip`** (it is in the workspace root, next to the `wine-journal/` folder).
3. Unzip it. You should see the `wine-journal` folder with `index.html` inside.
4. Quick local test: **double-click `index.html`** → the app opens and works immediately (data saved in your browser).

   For best results run a tiny local server instead (some browsers block storage on `file://`):

   ```bash
   cd wine-journal
   python3 -m http.server 8000
   # open http://localhost:8000
   ```

---

# PART B — Put the website on GitHub Pages

> Two options. Use **B1** if you have never used git. Use **B2** if you like the command line.

## B1 — GitHub Desktop (easiest, handles hidden files correctly)

1. Install **GitHub Desktop**: https://desktop.github.com
2. Sign in with your GitHub account.
3. Menu → **File → Add local repository…** → choose your `wine-journal` folder.
   It will say "this directory does not appear to be a Git repository" → click **create a repository**.
4. Click **Publish repository**:
   - Name: `wine-journal`
   - **Uncheck "Keep this code private"** (free GitHub Pages requires a public repo; if you have GitHub Pro you may keep it private)
   - Publish
5. On github.com open your new repo → **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)** → **Save**
6. Wait 1–2 minutes, refresh the page. You'll see:
   `Your site is live at https://<your-username>.github.io/wine-journal/`
7. Open that URL on your phone → Safari/Chrome menu → **Add to Home Screen** → you now have an app icon.

## B2 — Command line

```bash
cd wine-journal
git init
git add .
git commit -m "feat: WSET wine journal"
git branch -M main
git remote add origin https://github.com/<your-username>/wine-journal.git
git push -u origin main
```

> When it asks for a password, paste a **Personal Access Token** (not your account password) — see Part C-2 for how to create one; the same token type works, just give it `Contents: Read and write` on the `wine-journal` repo.

Then do step 5–7 above (Settings → Pages → main / root).

**Checkpoint:** the site loads at `https://<you>.github.io/wine-journal/`. Records you add are now saved in that browser only (still local). Continue to Part C for cross-device sync.

---

# PART C — Create the cloud database (a private GitHub repo)

The "database" is a single JSON file in a private repo. Every time you save a tasting note, the app commits that file — so you also get full version history.

## C-1 Create the data repo

1. GitHub → top-right **+ → New repository**
2. Name: **`wine-journal-data`**
3. Visibility: **Private** ✅
4. Tick **Add a README file** → **Create repository**
5. In the repo: **Add file → Create new file**
6. Filename (type the slash to create the folder):
   ```
   data/tastings.json
   ```
7. Content:
   ```json
   {"records": []}
   ```
8. **Commit changes**

## C-2 Create a fine-grained token (the key to this one repo)

1. GitHub → your avatar (top-right) → **Settings**
2. Left sidebar, bottom → **Developer settings**
3. **Personal access tokens → Fine-grained tokens → Generate new token**
4. Fill in:
   | Field | Value |
   |---|---|
   | Token name | `wine-journal` |
   | Expiration | 90 days / 1 year / No expiration (your choice) |
   | Repository access | **Only select repositories** → `wine-journal-data` |
   | Permissions → Repository permissions → **Contents** | **Read and write** |
   | Everything else | No access |
5. **Generate token** → copy the `github_pat_…` value **immediately** (it is shown only once).

> 🔐 This token can only touch one repo's file contents. It is stored only in your device's browser `localStorage` and is never sent anywhere except `api.github.com`. If it ever leaks: Developer settings → the token → **Delete**, and generate a new one.

---

# PART D — Connect the app to the database (do this on EACH device)

1. Open your site: `https://<you>.github.io/wine-journal/`
2. Tap the **⚙️ 設定** tab (4th tab, bottom bar on mobile).
3. **儲存模式 / Storage backend** → choose
   **⭐ GitHub Repository 做資料庫**
4. Fill in:

   | Field | Value |
   |---|---|
   | Token | `github_pat_…` (paste the token) |
   | Owner | your GitHub username |
   | Repo | `wine-journal-data` |
   | Branch | `main` |
   | Path | `data/tastings.json` |
   | 唔把相片上傳 GitHub | checked ✅ (keeps the repo tiny; photos stay on the device) |

5. Tap **🔌 測試連線** → you should see
   `✅ 連線成功！雲端現有 0 筆記錄`
6. Tap **💾 儲存並重新連線**
7. The pill in the top bar must now read **`GitHub · <you>/wine-journal-data`** → connected 🎉

Repeat Part D on every device (phone, laptop, tablet) with the same 5 values. The token is stored per device.

---

# PART E — Prove that it syncs

**Device 1 (computer)**

1. **記錄** tab → fill a wine name → pick some WSET dropdowns (e.g. Nose intensity `中+ Medium+`) → **💾 儲存這筆記錄**
2. Go to github.com → your `wine-journal-data` repo → you should see a new commit:
   `note: <wine name> (<date>)` and `data/tastings.json` updated.

**Device 2 (phone)**

3. Open the site (on the phone, after Part D is configured) → **🗂️ 酒櫃** tab → the record from step 1 is there. If not: **⚙️ 設定 → ⬇︎ 重新由雲端載入**.

**Already have local notes from before you connected?**

4. **⚙️ 設定 → ⬆︎ 把本機資料合併上雲端**. It merges by record id, newest `updatedAt` wins, and pushes once. All devices then see the full set.

**Bonus — Excel/CSV automatically**

5. Every commit to `data/tastings.json` triggers `.github/workflows/export-csv.yml`, which writes `exports/wine-journal.csv` in the same repo (UTF-8 BOM, opens cleanly in Excel) and uploads it as an Actions artifact you can download on your phone.

---

# PART F — Optional: a "real" SQL database (SQLite)

Only needed if you want SQL queries or many devices writing constantly. GitHub-repo mode is enough for personal use.

```bash
cd wine-journal/server
npm install
npm start          # http://localhost:3000  → same app, backed by SQLite
```

To host it publicly (Render example):

1. Push the repo to GitHub (already done in Part B).
2. Render.com → **New → Web Service** → connect the repo.
3. Root Directory: `server` · Build: `npm install` · Start: `npm start`
4. Add a **Persistent Disk**, mount path `/data`, env var `DB_PATH=/data/wine-journal.db`
   (without a disk, SQLite resets on every redeploy)
5. Open the Render URL → the pill shows `SQLite 後端資料庫`.
   Set **儲存模式 → 自動** so the app auto-detects the backend.

---

# PART G — Troubleshooting

| Symptom | Fix |
|---|---|
| Pill says `本機資料庫 (IndexedDB)` after saving settings | Token/Owner/Repo not all filled, or token lacks **Contents: Read and write**. Tap 測試連線 to read the exact error. |
| `❌ … HTTP 401` | Token wrong, expired, or copied with spaces. Regenerate. |
| `❌ … HTTP 403` | Permissions wrong (needs Contents: R/W) or API rate limit hit. |
| `❌ … HTTP 404` | Repo name/owner typo, branch isn't `main`, or `data/tastings.json` doesn't exist yet. |
| `❌ 資料檔唔係有效 JSON` | The file was hand-edited and broken. Fix the JSON in GitHub, or set the content back to `{"records": []}`. |
| Site shows 404 on GitHub Pages | Settings → Pages → confirm Branch **main** / **(root)**; the first deploy can take 2–3 min. |
| `.github` / `.gitignore` missing after upload | Use GitHub Desktop or `git` — the web drag-drop can skip dotfiles. The CSV workflow is optional, the site still works. |
| Changes don't show up on phone | Hard-refresh (pull down), or Settings → ⬇︎ 重新由雲端載入. |
| Two devices edited the same note | Merge is automatic: newest `updatedAt` wins; write conflicts (HTTP 409) are retried automatically. |
| Browser cleared / new phone | Just re-enter Part D settings — everything is in the repo. Nothing is lost. |

---

# PART H — Daily routine (recommended)

1. Taste wine → open the app → fill the WSET form → **儲存** → 1 commit to GitHub.
2. Once a week: open `wine-journal-data` on GitHub and skim the commit history (that's your tasting log + backup).
3. Monthly: download `exports/wine-journal.csv` for Excel, or use **統計 → 下載全部紀錄 (JSON)** for a full backup.
4. Don't want photos in git? Keep 「唔把相片上傳 GitHub」checked — photos stay in the local cache of that device.

Cheers 🥂
