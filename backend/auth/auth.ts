import { authHandler } from "encore.dev/auth";
import { APIError, Gateway, Header } from "encore.dev/api";

const DEMO_TOKEN = "demo-token-12345";
const DEMO_USER_ID = "demo-user";
const DEMO_EMAIL = "demo@example.com";

interface AuthParams {
  authorization: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  email: string;
}

export const myAuthHandler = authHandler<AuthParams, AuthData>(
  async (params) => {
    const token = params.authorization?.replace(/^Bearer\s+/i, "").trim();
    if (!token || token !== DEMO_TOKEN) {
      throw APIError.unauthenticated("invalid or missing authentication token");
    }
    return { userID: DEMO_USER_ID, email: DEMO_EMAIL };
  }
);

export const gateway = new Gateway({ authHandler: myAuthHandler });
