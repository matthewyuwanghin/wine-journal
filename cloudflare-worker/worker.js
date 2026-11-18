/**
 * 品酒手帳 — Cloudflare Worker 代理（GitHub 資料庫）
 * =====================================================
 * 作用：前端（瀏覽器）永遠唔會接觸 GitHub token；token 只存喺 Worker 嘅
 *      加密環境變數（Secret）。任何裝置一開網頁就自動連上，零設定。
 *
 * 部署（瀏覽器，唔需要 CLI）：
 *   Cloudflare Dashboard → Workers & Pages → Create application
 *   → Workers 分頁 → Start with Hello World! → 改名 wine-journal-proxy → Deploy
 *   → Edit code → 全選刪除 → 貼入呢個檔案內容 → Deploy
 *   → Settings → Variables and Secrets 加：
 *        GITHUB_TOKEN  (Secret, 加密)  = github_pat_...
 *        OWNER         (Text)          = matthewyuwanghin
 *        REPO          (Text)          = wine-journal-data
 *        BRANCH        (Text)          = main
 *        PATH          (Text)          = data/tastings.json
 *        PROXY_KEY     (Secret)        = 自己作一串亂碼（建議，防止被亂用）
 *
 * 前端（app ⚙️ 設定）填：
 *   儲存模式 = ☁️ Cloudflare Worker 代理
 *   代理網址 = https://wine-journal-proxy.<你>.workers.dev
 *   Proxy Key = 你設定的 PROXY_KEY
 *
 * API（同 server/ 完全一樣 shape，所以 app 唔改都通）：
 *   GET    /api/health
 *   GET    /api/tastings
 *   POST   /api/tastings          （Upsert，body = 一筆記錄）
 *   DELETE /api/tastings/:id
 *   DELETE /api/tastings          （清空）
 */

const GH = "https://api.github.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Accept,X-Proxy-Key",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "no-store",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });

/* ---------- base64（UTF-8 安全） ---------- */
function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
  }
  return btoa(bin);
}
function b64decode(b64) {
  const bin = atob(String(b64).replace(/\s/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    // 簡單驗證（如果設了 PROXY_KEY）
    if (env.PROXY_KEY) {
      const key = request.headers.get("X-Proxy-Key") || url.searchParams.get("key") || "";
      if (key !== env.PROXY_KEY) return json({ error: "unauthorized" }, 401);
    }

    const OWNER = env.OWNER, REPO = env.REPO;
    const BRANCH = env.BRANCH || "main";
    const FILE = (env.PATH || "data/tastings.json").replace(/^\/+/, "");

    if (!env.GITHUB_TOKEN || !OWNER || !REPO) {
      return json({ error: "worker 未設定好：需要 GITHUB_TOKEN / OWNER / REPO" }, 500);
    }

    const contentsUrl = `${GH}/repos/${OWNER}/${REPO}/contents/${FILE.split("/").map(encodeURIComponent).join("/")}`;

    async function gh(u, init = {}) {
      const headers = Object.assign(
        {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          "User-Agent": "wine-journal-worker",
        },
        init.headers || {}
      );
      return fetch(u, { ...init, headers });
    }

    /* 讀取資料檔 → { sha, records } */
    async function readFile() {
      // 只取 metadata（快），再用 blobs API 取內容（支援大檔）
      const r = await gh(`${contentsUrl}?ref=${encodeURIComponent(BRANCH)}`);
      if (r.status === 404) return { sha: null, records: [] };
      if (r.status === 401) throw new Error("GITHUB_TOKEN 無效（401）");
      if (r.status === 403) throw new Error("GITHUB_TOKEN 權限不足或 API 上限（403）");
      if (!r.ok) throw new Error("GitHub 讀取失敗 HTTP " + r.status);
      const j = await r.json();

      let text = "";
      if (j.content && j.encoding === "base64" && j.size && j.size < 900000) {
        text = b64decode(j.content);
      } else if (j.sha) {
        const rb = await gh(`${GH}/repos/${OWNER}/${REPO}/git/blobs/${j.sha}`);
        if (!rb.ok) throw new Error("讀取內容失敗 HTTP " + rb.status);
        const jb = await rb.json();
        text = jb.encoding === "base64" ? b64decode(jb.content) : (jb.content || "");
      }

      let data = { records: [] };
      if (text.trim()) {
        try { data = JSON.parse(text); } catch (e) { throw new Error("資料檔唔係有效 JSON"); }
      }
      if (Array.isArray(data)) data = { records: data };
      if (!Array.isArray(data.records)) data.records = [];
      return { sha: j.sha, records: data.records };
    }

    /* 寫入 → commit */
    async function writeFile(records, sha, message) {
      const body = { records };
      const payload = {
        message: message || `note: ${new Date().toISOString()}`,
        content: b64encode(JSON.stringify(body, null, 2)),
        branch: BRANCH,
      };
      if (sha) payload.sha = sha;
      const r = await gh(contentsUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const t = await r.text();
        const err = new Error("寫入失敗 HTTP " + r.status + " · " + t.slice(0, 200));
        err.status = r.status;
        throw err;
      }
      return true;
    }

    /* 讀 → 改 → 寫（409 衝突自動重試一次） */
    async function mutate(fn, message) {
      let lastErr = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const { sha, records } = await readFile();
        const next = fn(records.slice());
        try {
          await writeFile(next, sha, message);
          return next;
        } catch (e) {
          lastErr = e;
          if (!e.status || (e.status !== 409 && e.status !== 422)) throw e;
        }
      }
      throw lastErr;
    }

    try {
      /* ---------- 路由 ---------- */
      if (path === "/" || path === "/api") {
        return json({ ok: true, service: "wine-journal-proxy", repo: `${OWNER}/${REPO}`, file: FILE });
      }

      if (path === "/api/health" && request.method === "GET") {
        const { records } = await readFile();
        return json({ ok: true, db: "github", repo: `${OWNER}/${REPO}`, count: records.length });
      }

      if (path === "/api/tastings") {
        if (request.method === "GET") {
          const { records } = await readFile();
          return json(records);
        }
        if (request.method === "POST") {
          let rec;
          try { rec = await request.json(); } catch (_) { return json({ error: "invalid json" }, 400); }
          if (!rec || !rec.id) return json({ error: "missing id" }, 400);
          if (!rec.name) return json({ error: "missing name" }, 400);
          const now = new Date().toISOString();
          rec.updatedAt = now;
          if (!rec.createdAt) rec.createdAt = now;
          await mutate((rows) => {
            const i = rows.findIndex((x) => x.id === rec.id);
            if (i > -1) rows[i] = rec; else rows.push(rec);
            return rows;
          }, `note: ${rec.name} (${rec.date || now.slice(0, 10)})`);
          return json({ ok: true, id: rec.id });
        }
        if (request.method === "DELETE") {
          const n = await mutate(() => [], "clear: all tasting notes");
          return json({ ok: true, records: n.length });
        }
      }

      if (path.startsWith("/api/tastings/") && request.method === "DELETE") {
        const id = decodeURIComponent(path.slice("/api/tastings/".length));
        if (!id) return json({ error: "missing id" }, 400);
        await mutate((rows) => rows.filter((x) => x.id !== id), `delete: ${id}`);
        return json({ ok: true, id });
      }

      return json({ error: "not found", path }, 404);
    } catch (err) {
      return json({ error: String(err.message || err) }, 502);
    }
  },
};
