#!/bin/bash
set -e

echo ""
echo "🐎 Configurando Cimarrón Stock..."
echo ""

# Crear estructura
mkdir -p ~/Desktop/cimarron-stock/src
cd ~/Desktop/cimarron-stock

# ─── index.html ───────────────────────────────────────────────────────────────
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Cimarrón" />
    <title>Cimarrón Stock</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# ─── src/main.jsx ─────────────────────────────────────────────────────────────
cat > src/main.jsx << 'EOF'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# ─── package.json ─────────────────────────────────────────────────────────────
cat > package.json << 'EOF'
{
  "name": "cimarron-stock",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev":   "concurrently \"vite\" \"node server.js\"",
    "build": "vite build",
    "start": "node server.js"
  },
  "dependencies": {
    "express":   "^4.18.2",
    "react":     "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "concurrently":         "^8.2.0",
    "vite":                 "^5.0.0"
  },
  "engines": { "node": ">=18.0.0" }
}
EOF

# ─── vite.config.js ───────────────────────────────────────────────────────────
cat > vite.config.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/notion-proxy": "http://localhost:3001" }
  },
  build: { outDir: "dist", emptyOutDir: true }
});
EOF

# ─── nixpacks.toml ────────────────────────────────────────────────────────────
cat > nixpacks.toml << 'EOF'
[phases.build]
cmds = ["npm install", "npm run build"]

[start]
cmd = "npm start"
EOF

# ─── .gitignore ───────────────────────────────────────────────────────────────
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
EOF

echo ""
echo "✅ Proyecto creado en ~/Desktop/cimarron-stock"
echo ""
echo "⚠️  FALTA: Copia tu App.jsx dentro de src/"
echo "   ~/Desktop/cimarron-stock/src/App.jsx"
echo ""
echo "⚠️  FALTA: Pon tu token en server.js"
echo ""
