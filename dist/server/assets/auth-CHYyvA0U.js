import { T as TSS_SERVER_FUNCTION, c as createServerFn, s as setResponseHeader } from "../server.js";
import * as bcrypt from "bcryptjs";
import { u as userRepository, c as createSession, g as getClearSessionCookie, v as verifySession } from "./session-BrZ7W1R2.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "solid-js/web";
import "solid-js";
import "@tanstack/router-core/isServer";
import "@tanstack/router-core/scroll-restoration-script";
import "isbot";
import "dotenv/config";
import "@prisma/client";
import "@prisma/adapter-better-sqlite3";
import "jose";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
async function getUserFromToken(token) {
  const userId = await verifySession(token);
  if (!userId) return null;
  const user = await userRepository.findById(userId);
  if (!user) return null;
  const {
    password: _,
    ...userWithoutPassword
  } = user;
  return userWithoutPassword;
}
const getCookieString = (token) => `auth_token=${token}; HttpOnly; ${"Secure; "}SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
const signupFn_createServerFn_handler = createServerRpc({
  id: "252fd4b488f53fdb547474e5fc41e8fa5836a513772ca9ee0e3117a7900e759e",
  name: "signupFn",
  filename: "src/server/serverFn/auth.ts"
}, (opts) => signupFn.__executeServer(opts));
const signupFn = createServerFn({
  method: "POST"
}).handler(signupFn_createServerFn_handler, async ({
  data
}) => {
  if (typeof data !== "object" || data === null) throw new Error("Invalid data");
  const {
    email,
    password
  } = data;
  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("Invalid email or password");
  }
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({
    email,
    passwordHash
  });
  const token = await createSession(user.id);
  setResponseHeader("Set-Cookie", getCookieString(token));
  return {
    success: true,
    user
  };
});
const loginFn_createServerFn_handler = createServerRpc({
  id: "deefcbf24fb4028b68f2deb974f509c98a02b302caa98e8b686b65b4a2728022",
  name: "loginFn",
  filename: "src/server/serverFn/auth.ts"
}, (opts) => loginFn.__executeServer(opts));
const loginFn = createServerFn({
  method: "POST"
}).handler(loginFn_createServerFn_handler, async ({
  data
}) => {
  if (typeof data !== "object" || data === null) throw new Error("Invalid data");
  const {
    email,
    password
  } = data;
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
  const {
    password: _,
    ...userWithoutPassword
  } = user;
  return {
    success: true,
    user: userWithoutPassword
  };
});
const logoutFn_createServerFn_handler = createServerRpc({
  id: "b9bccd5829435b2cd4e990053eb45c9ce2bf1513efc4f9effc34e4712565ca9b",
  name: "logoutFn",
  filename: "src/server/serverFn/auth.ts"
}, (opts) => logoutFn.__executeServer(opts));
const logoutFn = createServerFn({
  method: "POST"
}).handler(logoutFn_createServerFn_handler, () => {
  setResponseHeader("Set-Cookie", getClearSessionCookie());
  return {
    success: true
  };
});
const getSessionUserFn_createServerFn_handler = createServerRpc({
  id: "3dd5744e36327c022d9256da0760c404ff0c0512dbf40d0264cc93528fdf153c",
  name: "getSessionUserFn",
  filename: "src/server/serverFn/auth.ts"
}, (opts) => getSessionUserFn.__executeServer(opts));
const getSessionUserFn = createServerFn({
  method: "GET"
}).handler(getSessionUserFn_createServerFn_handler, async ({
  request
}) => {
  const cookieHeader = request.headers.get("cookie");
  const token = cookieHeader?.split(";").map((c) => c.trim()).find((c) => c.startsWith("auth_token="))?.split("=")[1];
  console.log("getSessionUserFn token:", token);
  const user = await getUserFromToken(token);
  console.log("getSessionUserFn user:", user);
  return user;
});
export {
  getSessionUserFn_createServerFn_handler,
  loginFn_createServerFn_handler,
  logoutFn_createServerFn_handler,
  signupFn_createServerFn_handler
};
