import { ssr, ssrHydrationKey } from "solid-js/web";
var _tmpl$ = ["<main", ' class="page-wrap px-4 py-12"><section class="island-shell rounded-2xl p-6 sm:p-8"><p class="island-kicker mb-2">About</p><h1 class="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">A small starter with room to grow.</h1><p class="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">TanStack Start gives you type-safe routing, server functions, and modern SSR defaults. Use this as a clean foundation, then layer in your own routes, styling, and add-ons.</p></section></main>'];
function About() {
  return ssr(_tmpl$, ssrHydrationKey());
}
export {
  About as component
};
