import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "traviq-session";
const JWT_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret-key-change-in-production-123456";

// Simple signature generator
function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export interface CustomSession {
  user: {
    id: string;
    email: string;
    name: string;
    image: string;
  };
}

export function createToken(user: { id: string; email: string; name: string; image: string }): string {
  const payloadStr = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  const encodedPayload = Buffer.from(payloadStr).toString("base64url");
  const signature = sign(encodedPayload, JWT_SECRET);
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): any | null {
  const parts = token.split(".");
  if (parts.length !== 2) {
    console.log("verifyToken failed: parts count mismatch:", parts.length);
    return null;
  }
  const [encodedPayload, signature] = parts;
  const expectedSignature = sign(encodedPayload, JWT_SECRET);
  if (signature !== expectedSignature) {
    console.log("verifyToken failed: signature mismatch!", { signature, expectedSignature });
    return null;
  }
  
  try {
    const payloadStr = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);
    if (payload.exp && Date.now() > payload.exp) {
      console.log("verifyToken failed: token expired:", { exp: payload.exp, now: Date.now() });
      return null;
    }
    return payload;
  } catch (err) {
    console.log("verifyToken failed: JSON parse error:", err);
    return null;
  }
}

export async function getCustomSession(): Promise<CustomSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    console.log("getCustomSession: SESSION_COOKIE =", token ? "[FOUND]" : "[NOT FOUND]");
    if (!token) return null;
    
    const payload = verifyToken(token);
    console.log("getCustomSession: VERIFIED PAYLOAD =", payload);
    if (!payload) return null;
    
    return {
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        image: payload.image,
      }
    };
  } catch (err: any) {
    // Rethrow Next.js dynamic routing errors so it handles them correctly in build-time prerendering
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("Dynamic server usage")) {
      throw err;
    }
    console.error("Failed to parse custom session cookie:", err);
    return null;
  }
}

export function setSessionCookie(user: { id: string; email: string; name: string; image: string }) {
  const token = createToken(user);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, // Set to false to allow cookie storage on http://localhost:3000
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export function removeSessionCookie() {
  cookies().delete(SESSION_COOKIE_NAME);
}

// Password hashing helper using native PBKDF2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// Password verification helper
export function verifyPassword(password: string, storedValue: string): boolean {
  const parts = storedValue.split(":");
  if (parts.length !== 2) return false;
  const [salt, storedHash] = parts;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === storedHash;
}
