import { Client } from "../client";
import { CLIENT_TARGET } from "../config";

export const DEMO_TOKEN = "demo-token-12345";

export default new Client(CLIENT_TARGET, {
  auth: async () => ({ authorization: `Bearer ${DEMO_TOKEN}` }),
});
