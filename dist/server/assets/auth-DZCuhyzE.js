import { ssr, ssrHydrationKey, escape, ssrAttribute, createComponent } from "solid-js/web";
import { createSignal } from "solid-js";
import { u as useNavigate, l as loginFn, s as signupFn } from "./router-DxDg68cn.js";
import "@tanstack/router-core";
import "@solid-primitives/refs";
import "@tanstack/router-core/isServer";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/router-core/scroll-restoration-script";
import "isbot";
import "./session-BrZ7W1R2.js";
import "dotenv/config";
import "@prisma/client";
import "@prisma/adapter-better-sqlite3";
import "jose";
var _tmpl$$1 = ["<div", ' class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"><div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100"><div><h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">', "</h2></div><!--$-->", '<!--/--><form class="mt-8 space-y-6"><div class="rounded-md shadow-sm space-y-4"><div><label for="email-address" class="sr-only">Email address</label><input id="email-address" name="email" type="email" autocomplete="email" required class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Email address"', '></div><div><label for="password" class="sr-only">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Password"', '></div></div><div><button type="submit"', ' class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors">', '</button></div></form><div class="text-center mt-4"><button type="button" class="font-medium text-primary hover:text-blue-500 text-sm">', "</button></div></div></div>"], _tmpl$2 = ["<div", ' class="bg-red-50 border-l-4 border-red-400 p-4 rounded-md"><p class="text-sm text-red-700">', "</p></div>"];
const AuthForm = (props) => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  return ssr(_tmpl$$1, ssrHydrationKey(), props.mode === "login" ? "Sign in to your account" : "Create a new account", props.error && ssr(_tmpl$2, ssrHydrationKey(), escape(props.error)), ssrAttribute("value", escape(email(), true), false), ssrAttribute("value", escape(password(), true), false), ssrAttribute("disabled", props.isLoading, true), props.isLoading ? "Processing..." : props.mode === "login" ? "Sign In" : "Sign Up", props.mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in");
};
const AuthContainer = () => {
  const [mode, setMode] = createSignal("login");
  const [error, setError] = createSignal();
  const [isLoading, setIsLoading] = createSignal(false);
  const navigate = useNavigate();
  const handleSubmit = async (email, password) => {
    setError(void 0);
    setIsLoading(true);
    try {
      if (mode() === "login") {
        await loginFn({
          data: {
            email,
            password
          }
        });
      } else {
        await signupFn({
          data: {
            email,
            password
          }
        });
      }
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      setError(err.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };
  const handleToggleMode = () => {
    setMode((prev) => prev === "login" ? "signup" : "login");
    setError(void 0);
  };
  return createComponent(AuthForm, {
    get mode() {
      return mode();
    },
    onSubmit: handleSubmit,
    get isLoading() {
      return isLoading();
    },
    get error() {
      return error();
    },
    onToggleMode: handleToggleMode
  });
};
var _tmpl$ = ["<main", ">", "</main>"];
function AuthPage() {
  return ssr(_tmpl$, ssrHydrationKey(), escape(createComponent(AuthContainer, {})));
}
export {
  AuthPage as component
};
