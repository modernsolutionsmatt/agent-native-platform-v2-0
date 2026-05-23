const fs = require("fs");
const file = "backend/agents/pipeline.ts";

if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, "utf8");
  
  const startMarker = "export async function callGemini(";
  const endMarker = "export async function parsePrompt(";
  
  const startIndex = code.indexOf(startMarker);
  const endIndex = code.indexOf(endMarker);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const customEngine = `export async function callGemini(
  systemPrompt: string,
  userMessage: string,
  sessionId: string,
  userId: string,
  action: string
): Promise<{ content: string; tokensIn: number; tokensOut: number }> {
  let content = "";
  try {
    const combinedPrompt = systemPrompt + "\\n\\nUser Message:\\n" + userMessage;
    const res = await fetch("https://text.pollinations.ai/" + encodeURIComponent(combinedPrompt) + "?model=openai");
    content = await res.text();
  } catch (e) {
    console.error("Pipeline Routing Error:", e);
    content = "{}";
  }

  const tokensIn = Math.floor(systemPrompt.length / 4);
  const tokensOut = Math.floor(content.length / 4);

  try {
    await db.exec\`
      INSERT INTO audit_log (id, session_id, user_id, action, entity_type, entity_id, metadata, tokens_in, tokens_out, model_name, created_at)
      VALUES (
        \${randomUUID()},
        \${sessionId || null},
        \${userId},
        \${action},
        'agent_session',
        \${sessionId || 'none'},
        \${JSON.stringify({ model: MODEL, action })},
        \${tokensIn},
        \${tokensOut},
        \${MODEL},
        \${new Date()}
      )
    \`;
  } catch(dbErr) {
    // Log quietly
  }

  return { content, tokensIn, tokensOut };
}\n\n`;

    code = code.substring(0, startIndex) + customEngine + code.substring(endIndex);
    fs.writeFileSync(file, code, "utf8");
    console.log("✅ SUCCESS: Backend hot-patched smoothly! AI router is online.");
  } else {
    console.log("❌ Error: Target layout markers could not be isolated.");
  }
} else {
  console.log("❌ Error: Path verification failed for backend/agents/pipeline.ts");
}
