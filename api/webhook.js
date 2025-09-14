
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const VERIFY_TOKEN = "taxici_token_2025";

  // --- GET: Verificación del webhook ---
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verificado correctamente ✅");
      return res.status(200).send(challenge);
    } else {
      console.log("Error en la verificación ❌");
      return res.sendStatus(403);
    }
  }

  // --- POST: Mensajes entrantes ---
  if (req.method === "POST") {
    const body = req.body;

    if (body.object) {
      body.entry.forEach(entry => {
        const changes = entry.changes || [];
        changes.forEach(change => {
          const message = change.value.messages && change.value.messages[0];
          if (message) {
            const from = message.from;
            const text = message.text?.body?.toLowerCase() || "";

            console.log(`📩 Mensaje de ${from}: ${text}`);

            // --- Lógica básica de bot ---
            let reply = "Hola 👋, bienvenido a Taxici. Por favor selecciona una opción:\n1️⃣ Taxi\n2️⃣ Mototaxi\n3️⃣ Reparto";

            if (text.includes("taxi")) {
              reply = calcularTarifa("taxi");
            } else if (text.includes("mototaxi")) {
              reply = calcularTarifa("mototaxi");
            } else if (text.includes("reparto")) {
              reply = calcularTarifa("reparto");
            }

            // Por ahora solo hacemos log de la respuesta
            console.log(`💬 Respuesta sugerida a ${from}: ${reply}`);
          }
        });
      });
      return res.status(200).send("EVENT_RECEIVED");
    } else {
      return res.sendStatus(404);
    }
  }

  // --- Método no permitido ---
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Método ${req.method} no permitido`);
}

// --- Función para calcular tarifa ---
function calcularTarifa(servicio) {
  try {
    const tarifasPath = path.join(process.cwd(), "dato", "tarifas.json");
    const tarifasData = fs.readFileSync(tarifasPath, "utf8");
    const tarifas = JSON.parse(tarifasData);

    // Para prueba: usamos siempre zona1 → todas las demás zonas
    const tarifaBase = tarifas["zona1"]?.[servicio];
    if (!tarifaBase) return "Lo siento, no hay tarifa disponible para ese servicio.";

    return `La tarifa aproximada para ${servicio} desde zona1 es: $${tarifaBase} MXN.`;
  } catch (err) {
    console.error("Error leyendo tarifas:", err);
    return "Error al calcular la tarifa, por favor intenta más tarde.";
  }
}
