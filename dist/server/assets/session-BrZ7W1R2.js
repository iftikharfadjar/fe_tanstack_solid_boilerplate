import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { jwtVerify, SignJWT } from "jose";
const globalForPrisma = globalThis;
const adapter = globalForPrisma.prismaAdapter ?? new PrismaBetterSqlite3({
  url: "file:./dev.db"
});
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
class UserRepository {
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }
  async create(data) {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.passwordHash
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
}
const userRepository = new UserRepository();
const secretKey = process.env.JWT_SECRET || "supersecretjwtkey_please_change_in_production";
const encodedKey = new TextEncoder().encode(secretKey);
async function createSession(userId) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(encodedKey);
  return token;
}
async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"]
    });
    return payload.userId;
  } catch (error) {
    console.error("Failed to verify session");
    return null;
  }
}
function getClearSessionCookie() {
  return `auth_token=; HttpOnly; ${"Secure; "}SameSite=Lax; Path=/; Max-Age=0`;
}
export {
  createSession as c,
  getClearSessionCookie as g,
  userRepository as u,
  verifySession as v
};
