import { createServerFn } from "@tanstack/solid-start";
import { setResponseHeader } from "@tanstack/solid-start/server";
import * as bcrypt from "bcryptjs";
import { userRepository } from "../../data/repositories/UserRepository";
import { createSession, verifySession, getClearSessionCookie } from "./session";

export async function getUserFromToken(token: string | undefined) {
  const userId = await verifySession(token);
  if (!userId) return null;
  const user = await userRepository.findById(userId);
  if (!user) return null;
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

const getCookieString = (token: string) =>
  `auth_token=${token}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`;

export const signupFn = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    // Basic validation
    if (typeof data !== "object" || data === null)
      throw new Error("Invalid data");
    const { email, password } = data as Record<string, unknown>;
    if (typeof email !== "string" || typeof password !== "string") {
      throw new Error("Invalid email or password");
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ email, passwordHash });

    const token = await createSession(user.id);
    setResponseHeader("Set-Cookie", getCookieString(token));
    return { success: true, user };
  },
);

export const loginFn = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    if (typeof data !== "object" || data === null)
      throw new Error("Invalid data");
    const { email, password } = data as Record<string, unknown>;
    if (typeof email !== "string" || typeof password !== "string") {
      throw new Error("Invalid email or password");
    }

    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const token = await createSession(user.id);
    setResponseHeader("Set-Cookie", getCookieString(token));
    // return without password
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  },
);

export const logoutFn = createServerFn({ method: "POST" }).handler(() => {
  setResponseHeader("Set-Cookie", getClearSessionCookie());
  return { success: true };
});

export const getSessionUserFn = createServerFn({ method: "GET" }).handler(
  async ({ request }) => {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    console.log("getSessionUserFn token:", token);
    const user = await getUserFromToken(token);
    console.log("getSessionUserFn user:", user);
    return user;
  },
);
