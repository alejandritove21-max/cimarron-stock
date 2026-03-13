// api/notion-proxy/[...path].js — Vercel catch-all serverless function
const https = require("https");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Notion-Version");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  if (!NOTION_TOKEN) {
    return res.status(500).json({ error: "NOTION_TOKEN no configurado" });
  }

  // Extraer el path: /api/notion-proxy/v1/databases/xxx → /v1/databases/xxx
  const notionPath = req.url.replace(/^\/api\/notion-proxy/, "") || "/";

  // Leer body como buffer
  const bodyBuffer = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

  return new Promise((resolve) => {
    const options = {
      hostname: "api.notion.com",
      path: notionPath,
      method: req.method,
      headers: {
        "Authorization":  `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type":   "application/json",
      },
    };

    const proxy = https.request(options, (notionRes) => {
      res.status(notionRes.statusCode);
      notionRes.pipe(res);
      notionRes.on("end", resolve);
    });

    proxy.on("error", (err) => {
      res.status(500).json({ error: err.message });
      resolve();
    });

    if (bodyBuffer.length > 0) proxy.write(bodyBuffer);
    proxy.end();
  });
};
