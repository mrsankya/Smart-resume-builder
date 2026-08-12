import "dotenv/config";
import { getCanvaAuthorizationUrl } from "./src/services/canva.service.js";

console.log("CANVA_CLIENT_ID:", process.env.CANVA_CLIENT_ID);
console.log("CANVA_CLIENT_SECRET:", process.env.CANVA_CLIENT_SECRET ? "Present (length " + process.env.CANVA_CLIENT_SECRET.length + ")" : "Missing");
console.log("CANVA_REDIRECT_URI:", process.env.CANVA_REDIRECT_URI);

try {
  const auth = getCanvaAuthorizationUrl("test_user_id");
  console.log("Generated Canva Auth URL:\n", auth.url);
} catch (e) {
  console.error("Error:", e.message);
}
