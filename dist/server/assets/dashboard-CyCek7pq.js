import { ssr, ssrHydrationKey, ssrAttribute, escape } from "solid-js/web";
import { R as Route, u as useNavigate } from "./router-DxDg68cn.js";
import { createSignal } from "solid-js";
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
var _tmpl$ = ["<main", ' class="min-h-screen bg-gray-100"><nav class="bg-white shadow-sm"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between h-16"><div class="flex items-center"><span class="text-xl font-bold text-primary">Dashboard</span></div><div class="flex items-center"><button', ' class="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">', '</button></div></div></div></nav><div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"><div class="px-4 py-6 sm:px-0"><div class="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8 bg-white flex flex-col justify-center items-center"><h2 class="text-2xl font-semibold text-gray-800">Welcome to your dashboard!</h2><p class="mt-4 text-gray-600">You are logged in as <span class="font-bold">', '</span></p><p class="mt-2 text-sm text-gray-500">This is a protected route. Only authenticated users can see this page.</p></div></div></div></main>'];
function DashboardPage() {
  const context = Route.useRouteContext();
  console.log("DashboardPage context:", context);
  const {
    user
  } = context;
  console.log("DashboardPage user:", user);
  useNavigate();
  const [isLoggingOut, setIsLoggingOut] = createSignal(false);
  return ssr(_tmpl$, ssrHydrationKey(), ssrAttribute("disabled", isLoggingOut(), true), isLoggingOut() ? "Logging out..." : "Logout", escape(user?.email));
}
export {
  DashboardPage as component
};
