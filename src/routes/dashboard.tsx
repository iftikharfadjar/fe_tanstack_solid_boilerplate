import { createFileRoute, redirect, useNavigate } from "@tanstack/solid-router";
import {
  getSessionUserFn,
  logoutFn,
  getUserFromToken,
} from "../server/serverFn/auth";
import { createSignal } from "solid-js";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard - Protected" }],
  }),
  beforeLoad: async ({ request }) => {
    let user;
    console.log("beforeLoad request exists:", !!request);

    // Server-side: read cookie directly from request
    if (request) {
      const cookieHeader = request.headers.get("cookie");
      const token = cookieHeader
        ?.split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("auth_token="))
        ?.split("=")[1];
      console.log("beforeLoad server token:", token);
      user = await getUserFromToken(token);
    } else {
      // Client-side: call server function
      console.log("beforeLoad client: calling getSessionUserFn");
      user = await getSessionUserFn();
    }

    console.log("beforeLoad user:", user);
    if (!user) {
      throw redirect({
        to: "/auth",
      });
    }
    return { user };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const context = Route.useRouteContext();
  console.log("DashboardPage context:", context);
  const { user } = context();
  console.log("DashboardPage user:", user);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = createSignal(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutFn();
      navigate({ to: "/" });
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <span class="text-xl font-bold text-primary">Dashboard</span>
            </div>
            <div class="flex items-center">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut()}
                class="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoggingOut() ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8 bg-white flex flex-col justify-center items-center">
            <h2 class="text-2xl font-semibold text-gray-800">
              Welcome to your dashboard!
            </h2>
            <p class="mt-4 text-gray-600">
              You are logged in as <span class="font-bold">{user?.email}</span>
              {/*You are logged in as <span class="font-bold">aa</span>*/}
            </p>
            <p class="mt-2 text-sm text-gray-500">
              This is a protected route. Only authenticated users can see this
              page.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
