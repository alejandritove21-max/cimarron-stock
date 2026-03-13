// api/notion-proxy.js — Vercel Serverless Function
const https = require("https");

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  if (!NOTION_TOKEN) {
    res.status(500).json({ error: "NOTION_TOKEN no configurado en Vercel" });
    return;
  }

  // /api/notion-proxy/v1/databases/xxx  →  /v1/databases/xxx
  const notionPath = req.url.replace(/^\/api\/notion-proxy/, "");

  const options = {
    hostname: "api.notion.com",
    path:     notionPath,
    method:   req.method,
    headers: {
      "Authorization":  `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type":   "application/json",
    },
  };

  return new Promise((resolve) => {
    const proxy = https.request(options, (notionRes) => {
      res.status(notionRes.statusCode);
      notionRes.pipe(res);
      notionRes.on("end", resolve);
    });

    proxy.on("error", (err) => {
      res.status(500).json({ error: err.message });
      resolve();
    });

    if (req.body) {
      const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      proxy.write(body);
    }
    proxy.end();
  });
};
