export default function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const VERIFY_TOKEN = "taxici_token_2025"; // tu token de verificación

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verificado correctamente ✅");
      return res.status(200).send(challenge);
    } else {
      console.log("Error en la verificación ❌");
      return res.sendStatus(403);
    }
  }

  if (req.method === "POST") {
    // Aquí procesamos los mensajes entrantes
    console.log("Mensaje recibido:", JSON.stringify(req.body, null, 2));
    return res.sendStatus(200);
  }

  // Método no permitido
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Método ${req.method} no permitido`);
}
