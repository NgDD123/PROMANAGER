// generate-jwt-secrets.js
import fs from "fs";
import crypto from "crypto";

const accessSecret = crypto.randomBytes(64).toString("hex");
const refreshSecret = crypto.randomBytes(64).toString("hex");

const envPath = ".env";

// Read existing .env if present
let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf-8");
}

// Remove old JWT lines if they exist
envContent = envContent
  .split("\n")
  .filter(
    (line) =>
      !line.startsWith("JWT_ACCESS_SECRET=") &&
      !line.startsWith("JWT_REFRESH_SECRET=")
  )
  .join("\n");

// Add new secrets
envContent += `\nJWT_ACCESS_SECRET=${accessSecret}\nJWT_REFRESH_SECRET=${refreshSecret}\n`;

fs.writeFileSync(envPath, envContent.trim() + "\n");

console.log("✅ New JWT secrets generated and saved to .env");

