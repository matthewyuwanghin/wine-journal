# 📦 品酒手帳 — 更新包（3 步上線）

呢個資料夾只有兩個檔案要處理：

| 檔案 | 去邊 | 大小 |
|---|---|---|
| **index.html** | 上載去 GitHub repo `wine-journal` | 140,956 bytes |
| **worker.js** | 貼入 Cloudflare Worker `wine-journal-proxy` | 19,708 bytes |
| extras/backup-workflow…yml | （可選）放去 `wine-journal-data` repo 做自動備份 | — |

---

## 步驟 1 — 更新 Cloudflare Worker（貼 worker.js）

> 呢步係為咗加「Google 圖片搜尋」同「由網頁抽主圖」功能。之前已部署過就只需要覆蓋代碼。

1. 開 <https://dash.cloudflare.com> → 左邊 **Workers & Pages** → 揀 **wine-journal-proxy**
2. 右上角撳 **Edit code**（新版叫 Quick edit）
3. 入到編輯器：**Ctrl/Cmd + A**（全選）→ **Delete**（清空）
4. 用文字編輯器開 `worker.js` → 全選複製 → 貼入去
5. 右上 **Deploy** → 見到 "Success" 就 OK
6. （可選，想自動搵相先做）**Settings** → **Variables and Secrets** → **Add**
   - Name：`SERPER_KEY`
   - Type：**Secret**
   - Value：你喺 serper.dev 抄落嘅 API key
   - 撳 **Deploy**

**驗證**：瀏覽器開
`https://wine-journal-proxy.matthew-wanghin.workers.dev/api/health`

- 見到 `"ok":true` = Worker 正常
- 見到 `"photo":true` = 有設 Serper key（`false` 就代表只可以用手動貼圖方法，一樣用得）

---

## 步驟 2 — 上載 index.html 去 GitHub

1. 開 <https://github.com/matthewyuwanghin/wine-journal>
2. 撳 **Add file** → **Upload files**
3. 拖 `index.html` 入去（**覆蓋同一個檔名**）
4. 下面 **Commit changes** → 撳綠掣
5. 等 **1–3 分鐘**（GitHub Pages 要重新發佈）

**驗證**：開 <https://matthewyuwanghin.github.io/wine-journal/>（**唔好加 github.com**）

> 新版 ⚙️ 設定 最底會顯示「版本 **v3.4 · 2026-11-18**」+ 「🔄 強制重新載入」掣。
> 撳嗰個掣就唔會再見到舊 cache 畫面。

> ⚠️ 常見錯誤：`https://github.com/matthewyuwanghin.github.io/...` ← 多咗 `github.com` 就會 404

---

## 步驟 3 — 強制重新載入

| 裝置 | 做法 |
|---|---|
| iPhone Safari | 關咗個分頁 → 重新開（或者 設定 → Safari → 清除瀏覽記錄） |
| 電腦 Chrome | `Ctrl/Cmd + Shift + R` |
| 加保險 | 開 `…/wine-journal/?v=2` |

**點知係新版？**
- 頂部 pill 顯示 `Cloudflare Worker（N 筆）`
- 「記錄」頁見到「＋ 酒杯 · 溫度 · 醒酒（選填）」
- 葡萄只顯示 12 個 chips + 「顯示全部 36 個品種 ▾」
- 「酒櫃」撳縮圖 → 見到「🔎 喺 Google 搵圖（開新 tab）」

---

## 更新後你會得到

| 功能 | 說明 |
|---|---|
| 表單全部 dropdown | 只有酒名、酒莊要打字；年份／國家／產區／ABV／酒杯／溫度／醒酒全部揀 |
| 產區跟國家連動 | 揀 France → Bordeaux · Margaux / Burgundy · Chablis… |
| 葡萄 chips | 36 個品種，可多選 + 「其他葡萄」自訂 |
| 手機優化 | WSET 段落自動收起、儲存掣固定底部、16px 字防縮放 |
| 酒標相片 | 有 Serper key = 自動；冇 key = Google 搵圖 → 貼網址 → 套用 |
| **備份與還原** | 回收桶（本機 30 筆）＋ Git 版本紀錄（app 內一鍵還原）＋ JSON/CSV 下載 |
| 由網頁抽主圖 | 貼 Vivino / 酒商產品頁連結 → 自動抽 og:image |
| 圖片代理 | 原網站防盜連都顯示得到（`/api/img`） |

---

## 想確認下載到嘅檔案冇壞

下載後可以對一對檔案大小：

| 檔案 | 位元組 |
|---|---|
| index.html | 140,956 |
| worker.js | 15,761 |

---

## 出錯點算

| 症狀 | 原因 / 解決 |
|---|---|
| 網站 404 | 網址多打咗 `github.com`，用 `matthewyuwanghin.github.io/wine-journal/` |
| 仲係舊樣 | Pages 未發佈完 → 等 2 分鐘；或者分頁快取 → 關分頁再開 |
| pill 顯示「暫存模式」 | Worker 連唔到 → 開 `/api/health` 睇下，或者 ⚙️ 設定 → 測試 |
| 相片搵唔到 | 冇 Serper key（正常）→ 用手動：撳縮圖 → 🔎 Google 搵圖 → 貼網址 |
| 貼網址話「抽唔到主圖」 | 該網頁冇 og:image → 直接右鍵「複製圖片網址」再貼 |
| 儲存失敗 | 開 `/api/health` 睇 `count`；或者 token 過期要換（見 `教學-上載GitHub.md`） |
