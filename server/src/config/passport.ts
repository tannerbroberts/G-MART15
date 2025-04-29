import passport from "passport";
import { db } from "../utils/db";
import dotenv from "dotenv";
import path from "path";
import { Strategy } from "passport-strategy";

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Log authentication configuration (redacted for security)
const clientId = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
console.log(
  `OAuth Config - Client ID available: ${clientId.length > 0 ? "Yes" : "NO"}`
);
console.log(
  `OAuth Config - Client Secret available: ${
    clientSecret.length > 0 ? "Yes" : "NO"
  }`
);

// Check if credentials are missing
if (!clientId || !clientSecret) {
  console.warn("⚠️ Missing Google OAuth credentials in environment variables!");
  console.warn(
    "Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env file"
  );
}

// Environment specific callback URL
const isProduction = process.env.NODE_ENV === "production";
const callbackURL = isProduction
  ? `${
      process.env.FRONTEND_URL ||
      "https://gmart15-blackjack-express-1946fea61846.herokuapp.com"
    }/auth/google/callback`
  : "http://localhost:3000/auth/google/callback";

class LocalDevStrategy extends Strategy {
  name = "local-dev";

  async authenticate(req: any, options?: any) {
    try {
      // Create or find a test user
      let user = await db("users")
        .where({ email: "test@example.com" })
        .first();

      if (!user) {
        const [newUser] = await db("users")
          .insert({
            email: "test@example.com",
            username: "Test User",
            balance: 1000,
          })
          .returning("*");
        user = newUser;
      }

      // Use the proper passport strategy methods
      this.success(user);
    } catch (err: any) {
      console.error("Error in local development authentication:", err.message);
      this.fail(err);
    }
  }
}

const configurePassport = () => {
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: any, done) => {
    try {
      const user = await db("users").where({ id }).first();
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Development-only strategy that automatically creates/authenticates a test user
  passport.use(new LocalDevStrategy());
};

export default configurePassport;
