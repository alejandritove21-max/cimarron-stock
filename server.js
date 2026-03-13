const express = require("express");
const https   = require("https");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3001;

const NOTION_TOKEN = "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";

app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.all("/notion-proxy/*", (req, res) => {
  const notionPath = req.path.replace("/notion-proxy", "");
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

  const proxy = https.request(options, (notionRes) => {
    res.status(notionRes.statusCode);
    notionRes.pipe(res);
  });

  proxy.on("error", (err) => {
    res.status(500).json({ error: err.message });
  });

  if (req.body && Object.keys(req.body).length > 0) {
    proxy.write(JSON.stringify(req.body));
  }
  proxy.end();
});

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Cimarrón Stock corriendo en puerto ${PORT}`);
});
