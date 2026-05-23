import { api } from "encore.dev/api";
import db from "../db";

export const previewSessionOutput = api.raw(
  { expose: true, method: "GET", path: "/agents/sessions/:id/preview", auth: false },
  async (req, resp) => {
    const urlParts = req.url ? req.url.split("/") : [];
    const id = urlParts[3] || "";

    const row = await db.queryRow`
      SELECT content 
      FROM generated_files 
      WHERE session_id = ${id}
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    let targetCode = row && row.content ? row.content : "";

    // 1. Strip away markdown backticks safely
    targetCode = targetCode.replace(/```[a-zA-Z]*\n/g, "").replace(/```/g, "").trim();

    // 2. Clean out static ES import headers that browsers reject natively
    let browserSafeCode = targetCode
      .replace(/import\s+[^;]+;/g, "")
      .replace(/export\s+default\s+function\s+App/g, "function App")
      .replace(/export\s+default\s+/g, "")
      .trim();

    // 3. Absolute Binding Guard: Guarantee the code exposes an entry hook to the global space
    if (browserSafeCode.includes("function App")) {
      browserSafeCode += "\n\nwindow.RenderedAppTargetInstance = App;";
    } else {
      const functionNameMatch = browserSafeCode.match(/function\s+([A-Z][a-zA-Z0-9_]*)/);
      if (functionNameMatch && functionNameMatch[1]) {
        browserSafeCode += `\n\nwindow.RenderedAppTargetInstance = ${functionNameMatch[1]};`;
      }
    }

    // 4. Construct high-fidelity browser sandbox runtime shell container running React + Babel + Tailwind
    const dynamicHtml = `
      <!DOCTYPE html>
      <html lang="en" class="h-full">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Universal Live Preview Container</title>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      </head>
      <body class="bg-slate-950 text-slate-100 min-h-full antialiased">
        
        <div id="sandbox-root" class="min-h-full"></div>

        <script type="text/babel">
          const { useState, useEffect, useMemo, useRef } = React;

          // Universal Watchdog Scanner
          const mountInterval = setInterval(() => {
            if (window.RenderedAppTargetInstance) {
              clearInterval(mountInterval);
              try {
                const container = document.getElementById('sandbox-root');
                const root = ReactDOM.createRoot(container);
                root.render(React.createElement(window.RenderedAppTargetInstance));
              } catch (err) {
                console.error("Mount Interceptor Error:", err);
              }
            }
          }, 50);

          // Standard safety fallback cancellation timer
          setTimeout(() => {
            clearInterval(mountInterval);
            if (!document.getElementById('sandbox-root').innerHTML) {
              document.getElementById('sandbox-root').innerHTML = \`
                <div class="p-12 text-center text-indigo-400 font-mono flex flex-col items-center justify-center h-screen">
                  <div class="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4"></div>
                  <h2 class="text-sm font-bold">Synchronizing Active Preview Workspace Component...</h2>
                </div>
              \`;
            }
          }, 3000);
        </script>

        <script type="text/babel">
          try {
            const { useState, useEffect, useMemo, useRef } = React;

            // Safely evaluate the generated workspace content
            ${browserSafeCode}
          } catch (runtimeEvalErr) {
            console.warn("Babel bypass note:", runtimeEvalErr);
          }
        </script>
      </body>
      </html>
    `;

    resp.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    resp.end(dynamicHtml);
  }
);
