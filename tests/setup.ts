import { config } from "dotenv";

// Load .env.local so TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are available
config({ path: ".env.local" });
