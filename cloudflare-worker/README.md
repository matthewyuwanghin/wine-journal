# ☁️ Cloudflare Worker 代理（零 token 設定 · 最安全）

## 為咩要呢個

| 做法 | Token 會唔會去到瀏覽器 | 每部裝置要設定 | GitHub secret scanning |
|---|---|---|---|
| Token 寫入 `index.html` | 會（公開） | 唔使 | ❌ 會被攔截／撤銷 |
| 每部機自己貼 token | 會（本地 localStorage） | 一次 | ✅ 唔會 |
| **Worker 代理（本資料夾）** | **唔會，只留 Worker** | **零** | ✅ 唔會 |

架構：

```
手機／電腦 ──► https://wine-journal-proxy.<你>.workers.dev ──►（Worker 加 token）──► GitHub API
                    ↑ 前端完全冇 token
```

## 部署（全程瀏覽器，唔需要 CLI）

1. https://dash.cloudflare.com → 註冊（免費、唔需要信用卡）
2. **Workers & Pages** → 右上 **Create application**
3. 揀 **Workers** 分頁 → **Start with Hello World!**
4. 名：`wine-journal-proxy` → **Deploy**
5. 撳 **Edit code** → 全選刪除 → 貼入 `worker.js` 全部內容 → **Deploy**
6. 返 Worker 頁 → **Settings** → **Variables and Secrets** → 逐個加：

   | Name | 類型 | 值 |
   |---|---|---|
   | `GITHUB_TOKEN` | **Secret**（加密） | `github_pat_…`（Contents: Read and write） |
   | `OWNER` | Text | `matthewyuwanghin` |
   | `REPO` | Text | `wine-journal-data` |
   | `BRANCH` | Text | `main` |
   | `PATH` | Text | `data/tastings.json` |
   | `PROXY_KEY` | **Secret**（建議） | 自己作一串亂碼，例如 `wj-2026-9f3a7b` |

   加完撳 **Deploy**（或 Save and deploy）
7. 喺瀏覽器開 `https://wine-journal-proxy.<你>.workers.dev/` → 應見到
   `{"ok":true,"service":"wine-journal-proxy",...}`
8. 開 `…/api/health?key=你的PROXY_KEY` → 應見到 `{"ok":true,"db":"github","count":N}`

## 設定 app

⚙️ 設定 → 儲存模式揀 **☁️ Cloudflare Worker 代理** → 填：
- **代理網址**：`https://wine-journal-proxy.<你>.workers.dev`
- **Proxy Key**：你設定的 `PROXY_KEY`

→ **🔌 測試連線** → **💾 儲存並重新連線** → pill 顯示 `Cloudflare Worker · …（N 筆）`

### 令所有裝置零設定（可選）

用文字編輯器開 `index.html`，搵 `BUILTIN_CONFIG`，填：

```js
proxyUrl: "https://wine-journal-proxy.你.workers.dev",
proxyKey: "你的PROXY_KEY"
```

上載覆蓋 → 之後**任何裝置一開就自動連上，完全唔使設定**。
（Proxy 網址本身唔係秘密；PROXY_KEY 只係防止有人亂用你個代理，洩漏都只影響你嘅筆記，唔會影響 GitHub 帳號。）

## 免費額度（2026）

- 100,000 請求／日（每儲存 = 2 次；每次開頁 = 1 次）
- 10ms CPU／請求（等 GitHub 回應唔計）
- 超額只會報錯，**唔會自動收費**

## API（同 `server/` 一樣，所以 app 通用）

```
GET    /api/health
GET    /api/tastings
POST   /api/tastings            body = 一筆記錄（Upsert）
DELETE /api/tastings/:id
DELETE /api/tastings            清空
```

認證：請求要帶 `X-Proxy-Key: <PROXY_KEY>` 或 `?key=<PROXY_KEY>`（若設了 PROXY_KEY）。
