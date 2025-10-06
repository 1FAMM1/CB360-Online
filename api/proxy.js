import express from "express";
import fetch from "node-fetch"; // Se estiver Node 18+ pode usar fetch nativo

const app = express();
const PORT = 3000;

app.use(express.json());

// Proxy para o plano diário
app.post("/api/proxy_plandir_emit", async (req, res) => {
  try {
    const response = await fetch("https://cb360-mobile.vercel.app/api/plandir_emit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", contentType);

    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Erro no proxy:", err);
    res.status(500).json({ error: "Erro ao chamar API externa", details: err.message });
  }
});

// OPTIONS handler para CORS
app.options("/api/proxy_plandir_emit", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});
