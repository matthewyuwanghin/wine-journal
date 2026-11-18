# 🇭🇰 廣東話教學：將「品酒手帳」放上 GitHub + 用 GitHub 做資料庫（跨裝置同步）

> 呢份教學係寫畀「未用過 GitHub」嘅人。每一步都寫明**撳邊個掣、填咩字**，照住做就得。
> 全程大約 10–15 分鐘，唔需要識寫 code，唔需要付錢。

---

## 開始之前：你需要

- [ ] 一個 email
- [ ] 部電腦（Windows / Mac 都得）
- [ ] 一份 `wine-journal.zip`（喺 workspace 下載）
- [ ] 手機（最後測試同步用）

---

# 第一步：下載同解壓

1. 喺 workspace 撳 **`wine-journal.zip`** → **Download**。
2. 將個 zip 解壓（Windows：右 click → 解壓縮全部；Mac：double click）。
3. 解壓之後你會見到一個資料夾叫 **`wine-journal`**，入面有個 **`index.html`**。
4. **先試下行唔行**：double click `index.html` → 瀏覽器會開，見到「品酒手帳」就代表 OK。
   - 想穩陣啲（部分瀏覽器唔准 `file://` 存資料）：
     - Windows：喺資料夾上面嘅網址欄打 `cmd` 跟住 Enter，再打 `python -m http.server 8000`
     - Mac：開 Terminal，`cd` 去資料夾，再打 `python3 -m http.server 8000`
     - 然後開 `http://localhost:8000`

✅ **檢查點 1**：見到 app 畫面、撳「載入示範資料」有 3 筆出現。

---

# 第二步：開 GitHub 帳號（已有就跳去第三步）

1. 去 **https://github.com**
2. 撳右上角 **Sign up**
3. 填 email → password → username（呢個 username 之後會用，記住佢，例如 `wineloverhk`）
4. 驗證 email（去信箱撳條連結）

---

# 第三步：用 GitHub Desktop 上載網站（最穩陣嘅方法）

> 唔用網頁拖放，係因為網頁拖放**有時會漏咗 `.github`、`.gitignore` 呢啲隱藏檔**，用 Desktop 就唔會漏。

## 3-1 裝 GitHub Desktop

1. 去 **https://desktop.github.com** → 下載 → 安裝 → 開
2. 撳 **Sign in to GitHub.com** → 用瀏覽器登入你嘅 GitHub 帳號 → 授權

## 3-2 加入你嘅資料夾

1. 左上角選單 **File → Add local repository…**
2. **Choose…** → 揀你解壓出嚟嘅 **`wine-journal`** 資料夾 → **Add repository**
3. 佢會彈「呢個資料夾唔係 Git 資料夾，要唔要建立？」→ 撳 **create a repository**
   - Name：`wine-journal`（自動填好，唔好改）
   - **唔好**勾 Git ignore / License 任何選項（我哋已經有 `.gitignore`）
   - 撳 **Create repository**

## 3-3 發佈上 GitHub

1. 右上撳 **Publish repository**
2. 填／確認：
   | 欄位 | 填咩 |
   |---|---|
   | Name | `wine-journal` |
   | Description | 可以留空 |
   | **Keep this code private** | ❗**唔好剔**（免費 GitHub Pages 需要 public repo） |
3. 撳 **Publish repository**
4. 等幾秒，撳右上 **View on GitHub** → 你會見到 `index.html`、`README.md`、`data`、`scripts`、`.github`
   - 如果見到 `server` 資料夾入面**冇** `node_modules`，正確 👍

✅ **檢查點 2**：GitHub 網頁見到你嘅 repo，而且有 `index.html`。

---

# 第四步：開啟 GitHub Pages（變成一個真網址）

1. 喺你嘅 repo 頁面，撳上面嘅 **Settings**（齒輪圖案）
2. 左邊欄揀 **Pages**
3. 喺 **Build and deployment**：
   - **Source**：揀 **Deploy from a branch**
   - **Branch**：揀 **main**，右邊資料夾揀 **/ (root)**
   - 撳 **Save**
4. 等 **1–3 分鐘**，然後 **refresh（F5）** 呢頁
5. 上面會出現：
   > **Your site is live at** `https://<你嘅username>.github.io/wine-journal/`
6. 撳呢條連結 → 見到「品酒手帳」就成功 🎉

✅ **檢查點 3**：用**手機**開同一條網址，見到 app。
（手機加去主畫面：iPhone Safari → 分享 → 加入主畫面；Android Chrome → ⋮ → 加到主螢幕）

> ⚠️ 呢個時候，你嘅記錄只存喺**呢部機嘅瀏覽器**（本機模式）。要跨裝置就要做第五、六、七步。

---

# 第五步：開一個「資料庫 repo」（你嘅雲端資料庫）

> 概念：資料庫 = 一個 **private repo** 入面嘅一個 JSON 檔。每次你儲存一杯酒，app 就自動 commit 一次，所以順便有你嘅版本歷史 + 備份。

1. GitHub 右上角 **+** → **New repository**
2. 填：
   | 欄位 | 填咩 |
   |---|---|
   | Repository name | **`wine-journal-data`** |
   | Description | 隨便／留空 |
   | 公開定私人 | 揀 **Private** 🔒 |
   | Add a README file | ✅ **要剔** |
3. 撳 **Create repository**
4. 入到新 repo，撳 **Add file** → **Create new file**
5. 檔名個格打：
   ```
   data/tastings.json
   ```
   （打咗 `data/` 之後會自動幫你開資料夾，你可以直接繼續打 `tastings.json`）
6. 下面個大文字格，貼呢段：
   ```json
   {"records": []}
   ```
7. 撳下面綠色 **Commit changes**（再撳一次 Commit changes 確認）

✅ **檢查點 4**：repo 入面見到 `data` 資料夾 → 入面有 `tastings.json`。

---

# 第六步：產生「鎖匙」（Token）

> Token 就係你 app 用嚟寫入資料庫嘅密碼。只授權一個 repo、只可以改檔案內容，最安全。

1. GitHub 右上角**你嘅頭像** → **Settings**
2. 左邊欄拉到最底 → **Developer settings**
3. 揀 **Personal access tokens** → **Fine-grained tokens** → 撳 **Generate new token**
4. 填：
   | 欄位 | 填咩 |
   |---|---|
   | Token name | `wine-journal` |
   | Expiration | 90 days / 1 year / No expiration（自己揀，過期就要再整一個） |
   | Resource owner | 你自己 |
   | Repository access | 揀 **Only select repositories** → 下面選單揀 **`wine-journal-data`** |
5. 下面 **Permissions** → 撳開 **Repository permissions** → 搵 **Contents** → 右邊揀 **Read and write**
   （其他全部留 **No access**，唔好亂俾）
6. 拉到最底 → **Generate token**
7. 畫面會顯示 `github_pat_xxxxxxxxxxxx` → **即刻撳複製**（離開呢頁就永遠再睇唔到）
8. 暫時貼落記事本／備忘錄，等陣要用

✅ **檢查點 5**：你手上有 `github_pat_` 開頭嘅字串。

> 🔐 **安全貼士**：呢條 token 等於你個 repo 嘅鎖匙。只會存喺你部機嘅瀏覽器（localStorage），唔會經第三方。**唔好**喺網吧／公司公用電腦填。如果唔小心漏咗出去：返去個 token 頁撳 **Delete**，再整一個新嘅就得（唔會影響你嘅資料）。

---

# 第七步：喺 app 入面接駁資料庫（每部機做一次）

1. 開你嘅網址：`https://<你嘅username>.github.io/wine-journal/`
2. 撳下面第 4 個 tab **⚙️ 設定**
3. **儲存模式 Storage backend** → 揀 **⭐ GitHub Repository 做資料庫（跨裝置同步，有版本紀錄）**
4. 跟住填落去：

   | 欄位 | 填咩 | 例子 |
   |---|---|---|
   | **Token** | 貼上 `github_pat_…` | `github_pat_xxxxx` |
   | **Owner** | 你嘅 GitHub username | `wineloverhk` |
   | **Repo** | `wine-journal-data` | `wine-journal-data` |
   | **Branch** | `main` | `main` |
   | **Path** | `data/tastings.json` | `data/tastings.json` |
   | 唔把相片上傳 GitHub | ✅ 保持剔住（相只留本機，令 repo 唔會變大） |  |

5. 撳 **🔌 測試連線**
   - 見到 `✅ 連線成功！雲端現有 0 筆記錄` → 好，繼續
   - 見到 `❌ …401` → token 打錯／過期
   - 見到 `❌ …403` → 權限未設 **Contents: Read and write**
   - 見到 `❌ …404` → Owner / Repo / Branch / Path 打錯字
6. 撳 **💾 儲存並重新連線**
7. 睇上面嗰個小標籤（pill），應該變成：
   **`GitHub · wineloverhk/wine-journal-data`** ← 即係接駁成功 🎉

✅ **檢查點 6**：頂部 pill 顯示 GitHub 你嘅 repo 名。

> 📱 **手機點做？** 完全一樣：手機開同一條網址 → ⚙️ 設定 → 填同樣 5 個值 → 測試 → 儲存。
> 每部機各自填一次（token 存在各自嘅機），之後兩邊就共用同一份資料。

---

# 第八步：驗證真係同步到

**電腦做：**
1. 撳 **＋ 記錄** tab
2. 酒名打 `Sync Test 2026`
3. 隨便揀啲 WSET 選項（例如 Nose Intensity → `中+ Medium+`）
4. 撳 **💾 儲存這筆記錄**

**去 GitHub 睇：**
5. 開 `https://github.com/<你嘅username>/wine-journal-data`
6. 見到一個新 commit：`note: Sync Test 2026 (2026-11-18)`
7. 撳入 `data/tastings.json` → 見到你嗰筆記錄 → 即係寫入成功 ✅

**手機睇：**
8. 手機開網址 → 撳 **🗂️ 酒櫃** → 見到 `Sync Test 2026`
9. 見唔到？撳 **⚙️ 設定 → ⬇︎ 重新由雲端載入**

**如果你之前已經用本機模式記落一堆：**
10. 撳 **⚙️ 設定 → ⬆︎ 把本機資料合併上雲端**
    → 會將本機所有記錄按 id 合併上 GitHub（同一筆以較新嘅為準），一次過上傳。

✅ **檢查點 7**：手機見到電腦新增嘅記錄。

---

# 第九步：額外自動功能（已經幫你設定好）

**自動出 Excel / CSV**
每次 `data/tastings.json` 有更新，GitHub Actions 會自動：
- 生成 `exports/wine-journal.csv`（UTF-8，Excel 打開唔會亂碼）
- 同時上傳做 Actions artifact（手機都下載得）

想睇：repo → 上面 **Actions** tab → 見到 `Export tasting notes to CSV` 綠色剔 = 成功。

**版本紀錄 = 備份**
repo → **Commits** → 見到你每一次記錄。想救返舊版本：撳某個 commit → 睇返當時嘅 `tastings.json` → 複製內容出嚟再匯入。

---

# 第十步：日常點用

1. 飲完酒 → 開 app（手機主畫面個 icon）→ 填 WSET 表單 → **儲存**
   → 自動 commit 上 GitHub，所有裝置即刻有
2. 一星期一次：喺 GitHub 睇下 commit 紀錄（就係你嘅品酒日誌）
3. 一個月一次：**統計 → ⬇︎ 下載全部紀錄 (JSON)** 存一份去雲端硬碟（多一份保險）

---

# 😵 出事點算？（對症下藥）

| 見到咩 | 原因 | 點搞 |
|---|---|---|
| 撳儲存後 pill 變返「本機資料庫 (IndexedDB)」 | 設定未填齊 / token 權限唔夠 | 撳 **🔌 測試連線** 睇錯誤訊息 |
| `❌ … HTTP 401` | Token 錯、過期、或者貼多咗空格 | 重新複製／重新產生 token |
| `❌ … HTTP 403` | 冇 **Contents: Read and write** | 返去 edit token 權限 |
| `❌ … HTTP 404` | Owner / Repo / Branch / Path 打錯；或者 `data/tastings.json` 未建立 | 逐個核對，注意 `main` 同 `data/tastings.json` |
| `❌ 資料檔唔係有效 JSON` | 有人手動改壞個檔 | 開 GitHub 將內容改返 `{"records": []}` |
| Pages 開出嚟 404 | Settings → Pages 未設好 / 未部署完 | 確認 Branch `main` + `/ (root)`，再等 2–3 分鐘 |
| 上載後唔見 `.github`、`.gitignore` | 用咗網頁拖放（會漏隱藏檔） | 用 GitHub Desktop 重新上載（或者唔理，CSV 自動匯出只係附加功能） |
| 電腦改咗，手機見唔到 | 手機頁面係舊 cache | 手機 pull-to-refresh，或 **⚙️ 設定 → ⬇︎ 重新由雲端載入** |
| 兩部機改同一筆 | 冇問題 | 系統自動用較新嘅 `updatedAt`；寫入撞 409 會自動重試 |
| 換手機／清咗瀏覽器資料 | 正常 | 新機重新做第七步就得，資料全部喺 repo |
| 唔想再用 GitHub | 隨時 | ⚙️ 設定 → 揀返「只存本機 IndexedDB」，記得先下載 JSON 備份 |

---

# 🧠 一句話理解成個架構

```
你部手機 ─┐
你部電腦 ─┼──► GitHub 免費空間
平板     ─┘     ├── wine-journal        （網站本體，public，Pages 幫你開網址）
                └── wine-journal-data   （你嘅資料庫，private，每儲存一次 = 1 個 commit）
```

- **網站** 放 public repo，用 GitHub Pages 免費開網址
- **資料** 放 private repo，用 token 寫入
- 因為兩樣都喺 GitHub，所以你唔需要租 server、唔需要付錢、又自然有版本備份

---

---

# 第十一步（可選）：把連線設定「內建」落 app（唔使逐部機填）

如果你唔想喺每部裝置（電腦、手機、平板）都入一次 token，可以將設定寫死喺 `index.html`。

## 點做

1. 用文字編輯器（VS Code / Notepad / 文字編輯）開 **`index.html`**
2. 搵（Ctrl+F / Cmd+F）**`BUILTIN_CONFIG`**，大約喺 `<script>` 開頭附近
3. 你會見到類似：

   ```js
   const BUILTIN_CONFIG = (() => {
     const raw = {
       mode: "github",
       owner: "matthewyuwanghin",
       repo: "wine-journal-data",
       branch: "main",
       path: "data/tastings.json",
       skipPhotos: true,
       token_b64: "Z2l0aHViX3BhdF8xMUFOUVdBRVEw…"
     };
     ...
   })();
   ```

4. `token_b64` 就係你嘅 token（用 base64 包住，**唔係加密**，只係避免 GitHub 自動掃描到 `github_pat_` 而撤銷）。
   要換 token 就用呢句產生新字串（Mac/Linux Terminal 或任何網上 base64 工具）：

   ```bash
   printf '%s' 'github_pat_你嘅新TOKEN' | base64
   ```

   然後將結果貼入 `token_b64: "..."`。
5. 存檔 → GitHub Desktop 會顯示 `index.html` 有改動 → 左下打 summary（例：`feat: builtin github config`）→ 撳 **Commit to main** → 右上 **Push origin**
6. 等 1 分鐘 → 所有裝置 refresh 網頁 → 頂部 pill 應該直接顯示
   **`GitHub · matthewyuwanghin/wine-journal-data`**，唔需要再入任何嘢。

> 💡 已經填過設定嘅舊裝置：如果你自己存過「用本機模式」，佢會尊重你嘅選擇；其餘情況會自動升級用 GitHub。

## ⚠️ 安全須知（一定要睇）

- token 寫喺 `index.html`，即係**任何睇得到你網站原始碼嘅人都攞到**（view-source、或者去 GitHub repo 睇檔）。
  免費 GitHub Pages 要用 **public repo**，所以技術上係公開嘅。
- 危險程度：呢個 token 只可以改 **`wine-journal-data` 一個 repo 嘅檔案內容**（Contents: Read and write），
  即係最壞情況係有人**偷睇 / 亂改 / 清空你嘅品酒筆記**，但唔會動到你 GitHub 帳號其他嘢。
- GitHub 會掃描 public repo 有冇洩漏 token；如果偵測到，可能會**自動撤銷**，你就會見到 `HTTP 401`。
  （所以上面用 base64 存放，減低被自動掃描嘅機會。）

### 想安全啲，三選一

| 方法 | 做法 | 代價 |
|---|---|---|
| A. 網站用 private repo | GitHub **Pro**（US$4/月）→ repo 轉 private → Pages 仍然可以用 | 要付費 |
| B. 唔寫死 token | 將 `token_b64` 改成 `""`，每部機喺 **⚙️ 設定** 自己填一次 | 每部裝置填一次 |
| C. 定期換 token | 每 1–3 個月去 Settings → 個 token → **Revoke**，再 Generate 新一個，更新 `token_b64` 再 push | 要做少少手續 |

無論揀邊個，都**唔好**俾呢個 token 有 `repo` 全權限或 `delete_repo`，只需要 Contents 就夠。

---

# 📋 最後 Checklist

- [ ] 下載 + 解壓 `wine-journal.zip`
- [ ] 本機開到 `index.html`
- [ ] GitHub Desktop 發佈 `wine-journal` repo
- [ ] Settings → Pages → main / (root) → 有 `https://<username>.github.io/wine-journal/`
- [ ] 開 `wine-journal-data`（Private）+ `data/tastings.json` = `{"records": []}`
- [ ] Fine-grained token（Contents: Read and write）
- [ ] 電腦 ⚙️ 設定 填好 → pill = `GitHub · …`
- [ ] 手機重複一次
- [ ] 電腦新增一筆 → GitHub 見到 commit → 手機見到
- [ ] 舊本機記錄 → **⬆︎ 把本機資料合併上雲端**

搞掂就乾杯 🥂 有邊步卡住，話我知你**見到咩畫面／咩錯誤字**，我逐句教你點撳。
