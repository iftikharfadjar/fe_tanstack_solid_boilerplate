import { ssr, ssrHydrationKey, ssrElement, escape, createComponent, Dynamic, mergeProps, isServer as isServer$1, spread, useAssets, NoHydration, HydrationScript } from "solid-js/web";
import * as Solid from "solid-js";
import { createResource, sharedConfig, createContext, createUniqueId, useContext, createRenderEffect, onCleanup, onMount, For, Suspense } from "solid-js";
import { isDangerousProtocol, exactPathTest, removeTrailingSlash, deepEqual, functionalUpdate, preloadWarning, invariant, replaceEqualDeep, BaseRootRoute, BaseRoute, isModuleNotFoundError, createNonReactiveReadonlyStore, createNonReactiveMutableStore, RouterCore, escapeHtml, isInlinableStylesheet, getAssetCrossOrigin, resolveManifestAssetLink, redirect } from "@tanstack/router-core";
import { mergeRefs } from "@solid-primitives/refs";
import { isServer } from "@tanstack/router-core/isServer";
import { u as useRouter, n as nearestMatchContext, O as Outlet, T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import { v as verifySession, u as userRepository } from "./session-BrZ7W1R2.js";
function useHydrated() {
  const [hydrated, setHydrated] = Solid.createSignal(false);
  Solid.onMount(() => {
    setHydrated(true);
  });
  return hydrated;
}
function useIntersectionObserver(ref, callback, intersectionObserverOptions = {}, options = {}) {
  const isIntersectionObserverAvailable = typeof IntersectionObserver === "function";
  let observerRef = null;
  Solid.createEffect(() => {
    const r = ref();
    if (!r || !isIntersectionObserverAvailable || options.disabled) {
      return;
    }
    observerRef = new IntersectionObserver(([entry]) => {
      callback(entry);
    }, intersectionObserverOptions);
    observerRef.observe(r);
    Solid.onCleanup(() => {
      observerRef?.disconnect();
    });
  });
  return () => observerRef;
}
var _tmpl$$1 = ["<svg", ">", "</svg>"];
const timeoutMap = /* @__PURE__ */ new WeakMap();
function useLinkProps(options) {
  const router2 = useRouter();
  const [isTransitioning, setIsTransitioning] = Solid.createSignal(false);
  const shouldHydrateHash = !isServer && !!router2.options.ssr;
  const hasHydrated = useHydrated();
  let hasRenderFetched = false;
  const [local, rest] = Solid.splitProps(Solid.mergeProps({
    activeProps: STATIC_ACTIVE_PROPS_GET,
    inactiveProps: STATIC_INACTIVE_PROPS_GET
  }, options), ["activeProps", "inactiveProps", "activeOptions", "to", "preload", "preloadDelay", "preloadIntentProximity", "hashScrollIntoView", "replace", "startTransition", "resetScroll", "viewTransition", "target", "disabled", "style", "class", "onClick", "onBlur", "onFocus", "onMouseEnter", "onMouseLeave", "onMouseOver", "onMouseOut", "onTouchStart", "ignoreBlocker"]);
  const [_, propsSafeToSpread] = Solid.splitProps(rest, ["params", "search", "hash", "state", "mask", "reloadDocument", "unsafeRelative", "from"]);
  const currentLocation = Solid.createMemo(() => router2.stores.location.get(), void 0, {
    equals: (prev, next2) => prev.href === next2.href
  });
  const _options = () => options;
  const next = Solid.createMemo(() => {
    const _fromLocation = currentLocation();
    const options2 = {
      _fromLocation,
      ..._options()
    };
    return Solid.untrack(() => router2.buildLocation(options2));
  });
  const hrefOption = Solid.createMemo(() => {
    if (_options().disabled) return void 0;
    const location = next().maskedLocation ?? next();
    const publicHref = location.publicHref;
    const external = location.external;
    if (external) {
      return {
        href: publicHref,
        external: true
      };
    }
    return {
      href: router2.history.createHref(publicHref) || "/",
      external: false
    };
  });
  const externalLink = Solid.createMemo(() => {
    const _href = hrefOption();
    if (_href?.external) {
      if (isDangerousProtocol(_href.href, router2.protocolAllowlist)) {
        return void 0;
      }
      return _href.href;
    }
    const to = _options().to;
    const safeInternal = isSafeInternal(to);
    if (safeInternal) return void 0;
    if (typeof to !== "string" || to.indexOf(":") === -1) return void 0;
    try {
      new URL(to);
      if (isDangerousProtocol(to, router2.protocolAllowlist)) {
        if (false) ;
        return void 0;
      }
      return to;
    } catch {
    }
    return void 0;
  });
  const preload = Solid.createMemo(() => {
    if (_options().reloadDocument || externalLink()) {
      return false;
    }
    return local.preload ?? router2.options.defaultPreload;
  });
  const preloadDelay = () => local.preloadDelay ?? router2.options.defaultPreloadDelay ?? 0;
  const isActive = Solid.createMemo(() => {
    if (externalLink()) return false;
    const activeOptions = local.activeOptions;
    const current = currentLocation();
    const nextLocation = next();
    if (activeOptions?.exact) {
      const testExact = exactPathTest(current.pathname, nextLocation.pathname, router2.basepath);
      if (!testExact) {
        return false;
      }
    } else {
      const currentPath = removeTrailingSlash(current.pathname, router2.basepath);
      const nextPath = removeTrailingSlash(nextLocation.pathname, router2.basepath);
      const pathIsFuzzyEqual = currentPath.startsWith(nextPath) && (currentPath.length === nextPath.length || currentPath[nextPath.length] === "/");
      if (!pathIsFuzzyEqual) {
        return false;
      }
    }
    if (activeOptions?.includeSearch ?? true) {
      const searchTest = deepEqual(current.search, nextLocation.search, {
        partial: !activeOptions?.exact,
        ignoreUndefined: !activeOptions?.explicitUndefined
      });
      if (!searchTest) {
        return false;
      }
    }
    if (activeOptions?.includeHash) {
      const currentHash = shouldHydrateHash && !hasHydrated() ? "" : current.hash;
      return currentHash === nextLocation.hash;
    }
    return true;
  });
  const doPreload = () => router2.preloadRoute({
    ..._options(),
    _builtLocation: next()
  }).catch((err) => {
    console.warn(err);
    console.warn(preloadWarning);
  });
  const preloadViewportIoCallback = (entry) => {
    if (entry?.isIntersecting) {
      doPreload();
    }
  };
  const [ref, setRef] = Solid.createSignal(null);
  useIntersectionObserver(ref, preloadViewportIoCallback, {
    rootMargin: "100px"
  }, {
    disabled: !!local.disabled || !(preload() === "viewport")
  });
  Solid.createEffect(() => {
    if (hasRenderFetched) {
      return;
    }
    if (!local.disabled && preload() === "render") {
      doPreload();
      hasRenderFetched = true;
    }
  });
  if (externalLink()) {
    return Solid.mergeProps(propsSafeToSpread, {
      ref: mergeRefs(setRef, _options().ref),
      href: externalLink()
    }, Solid.splitProps(local, ["target", "disabled", "style", "class", "onClick", "onBlur", "onFocus", "onMouseEnter", "onMouseLeave", "onMouseOut", "onMouseOver", "onTouchStart"])[0]);
  }
  const handleClick = (e) => {
    const elementTarget = e.currentTarget.getAttribute("target");
    const effectiveTarget = local.target !== void 0 ? local.target : elementTarget;
    if (!local.disabled && !isCtrlEvent(e) && !e.defaultPrevented && (!effectiveTarget || effectiveTarget === "_self") && e.button === 0) {
      e.preventDefault();
      setIsTransitioning(true);
      const unsub = router2.subscribe("onResolved", () => {
        unsub();
        setIsTransitioning(false);
      });
      router2.navigate({
        ..._options(),
        replace: local.replace,
        resetScroll: local.resetScroll,
        hashScrollIntoView: local.hashScrollIntoView,
        startTransition: local.startTransition,
        viewTransition: local.viewTransition,
        ignoreBlocker: local.ignoreBlocker
      });
    }
  };
  const enqueueIntentPreload = (e) => {
    if (local.disabled || preload() !== "intent") return;
    if (!preloadDelay()) {
      doPreload();
      return;
    }
    const eventTarget = e.currentTarget || e.target;
    if (!eventTarget || timeoutMap.has(eventTarget)) return;
    timeoutMap.set(eventTarget, setTimeout(() => {
      timeoutMap.delete(eventTarget);
      doPreload();
    }, preloadDelay()));
  };
  const handleTouchStart = (_2) => {
    if (local.disabled || preload() !== "intent") return;
    doPreload();
  };
  const handleLeave = (e) => {
    if (local.disabled) return;
    const eventTarget = e.currentTarget || e.target;
    if (eventTarget) {
      const id = timeoutMap.get(eventTarget);
      clearTimeout(id);
      timeoutMap.delete(eventTarget);
    }
  };
  const simpleStyling = Solid.createMemo(() => local.activeProps === STATIC_ACTIVE_PROPS_GET && local.inactiveProps === STATIC_INACTIVE_PROPS_GET && local.class === void 0 && local.style === void 0);
  const onClick = createComposedHandler(() => local.onClick, handleClick);
  const onBlur = createComposedHandler(() => local.onBlur, handleLeave);
  const onFocus = createComposedHandler(() => local.onFocus, enqueueIntentPreload);
  const onMouseEnter = createComposedHandler(() => local.onMouseEnter, enqueueIntentPreload);
  const onMouseOver = createComposedHandler(() => local.onMouseOver, enqueueIntentPreload);
  const onMouseLeave = createComposedHandler(() => local.onMouseLeave, handleLeave);
  const onMouseOut = createComposedHandler(() => local.onMouseOut, handleLeave);
  const onTouchStart = createComposedHandler(() => local.onTouchStart, handleTouchStart);
  const resolvedProps = Solid.createMemo(() => {
    const active = isActive();
    const base = {
      href: hrefOption()?.href,
      ref: mergeRefs(setRef, _options().ref),
      onClick,
      onBlur,
      onFocus,
      onMouseEnter,
      onMouseOver,
      onMouseLeave,
      onMouseOut,
      onTouchStart,
      disabled: !!local.disabled,
      target: local.target,
      ...local.disabled && STATIC_DISABLED_PROPS,
      ...isTransitioning() && STATIC_TRANSITIONING_ATTRIBUTES
    };
    if (simpleStyling()) {
      return {
        ...base,
        ...active && STATIC_DEFAULT_ACTIVE_ATTRIBUTES
      };
    }
    const activeProps = active ? functionalUpdate(local.activeProps, {}) ?? EMPTY_OBJECT : EMPTY_OBJECT;
    const inactiveProps = active ? EMPTY_OBJECT : functionalUpdate(local.inactiveProps, {});
    const style = {
      ...local.style,
      ...activeProps.style,
      ...inactiveProps.style
    };
    const className = [local.class, activeProps.class, inactiveProps.class].filter(Boolean).join(" ");
    return {
      ...activeProps,
      ...inactiveProps,
      ...base,
      ...Object.keys(style).length ? {
        style
      } : void 0,
      ...className ? {
        class: className
      } : void 0,
      ...active && STATIC_ACTIVE_ATTRIBUTES
    };
  });
  return Solid.mergeProps(propsSafeToSpread, resolvedProps);
}
const STATIC_ACTIVE_PROPS = {
  class: "active"
};
const STATIC_ACTIVE_PROPS_GET = () => STATIC_ACTIVE_PROPS;
const EMPTY_OBJECT = {};
const STATIC_INACTIVE_PROPS_GET = () => EMPTY_OBJECT;
const STATIC_DEFAULT_ACTIVE_ATTRIBUTES = {
  class: "active",
  "data-status": "active",
  "aria-current": "page"
};
const STATIC_DISABLED_PROPS = {
  role: "link",
  "aria-disabled": true
};
const STATIC_ACTIVE_ATTRIBUTES = {
  "data-status": "active",
  "aria-current": "page"
};
const STATIC_TRANSITIONING_ATTRIBUTES = {
  "data-transitioning": "transitioning"
};
function callHandler(event, handler) {
  if (typeof handler === "function") {
    handler(event);
  } else {
    handler[0](handler[1], event);
  }
  return event.defaultPrevented;
}
function createComposedHandler(getHandler, fallback) {
  return (event) => {
    const handler = getHandler();
    if (!handler || !callHandler(event, handler)) fallback(event);
  };
}
const Link$1 = (props) => {
  const [local, rest] = Solid.splitProps(props, ["_asChild", "children"]);
  const [_, linkProps] = Solid.splitProps(useLinkProps(rest), ["type"]);
  const children = Solid.createMemo(() => {
    const ch = local.children;
    if (typeof ch === "function") {
      return ch({
        get isActive() {
          return linkProps["data-status"] === "active";
        },
        get isTransitioning() {
          return linkProps["data-transitioning"] === "transitioning";
        }
      });
    }
    return ch;
  });
  if (local._asChild === "svg") {
    const [_2, svgLinkProps] = Solid.splitProps(linkProps, ["class"]);
    return ssr(_tmpl$$1, ssrHydrationKey(), ssrElement("a", svgLinkProps, () => escape(children()), false));
  }
  if (!local._asChild) {
    return ssrElement("a", linkProps, () => escape(children()), true);
  }
  return createComponent(Dynamic, mergeProps({
    get component() {
      return local._asChild;
    }
  }, linkProps, {
    get children() {
      return children();
    }
  }));
};
function isCtrlEvent(e) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
function isSafeInternal(to) {
  if (typeof to !== "string") return false;
  const zero = to.charCodeAt(0);
  if (zero === 47) return to.charCodeAt(1) !== 47;
  return zero === 46;
}
function useMatch(opts) {
  const router2 = useRouter();
  const nearestMatch = opts.from ? void 0 : Solid.useContext(nearestMatchContext);
  const match = () => {
    if (opts.from) {
      return router2.stores.getRouteMatchStore(opts.from).get();
    }
    return nearestMatch?.match();
  };
  Solid.createEffect(() => {
    if (match() !== void 0) {
      return;
    }
    const hasPendingMatch = opts.from ? Boolean(router2.stores.pendingRouteIds.get()[opts.from]) : nearestMatch?.hasPending() ?? false;
    if (!hasPendingMatch && !router2.stores.isTransitioning.get() && (opts.shouldThrow ?? true)) {
      invariant();
    }
  });
  return Solid.createMemo((prev) => {
    const selectedMatch = match();
    if (selectedMatch === void 0) {
      const hasPendingMatch = opts.from ? Boolean(router2.stores.pendingRouteIds.get()[opts.from]) : nearestMatch?.hasPending() ?? false;
      if (prev !== void 0 && (hasPendingMatch || router2.stores.isTransitioning.get())) {
        return prev;
      }
      return void 0;
    }
    const res = opts.select ? opts.select(selectedMatch) : selectedMatch;
    if (prev === void 0) return res;
    return replaceEqualDeep(prev, res);
  });
}
function useLoaderData(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    select: (s) => {
      return opts.select ? opts.select(s.loaderData) : s.loaderData;
    }
  });
}
function useLoaderDeps(opts) {
  return useMatch({
    ...opts,
    select: (s) => {
      return opts.select ? opts.select(s.loaderDeps) : s.loaderDeps;
    }
  });
}
function useParams(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    shouldThrow: opts.shouldThrow,
    select: (match) => {
      const params = opts.strict === false ? match.params : match._strictParams;
      return opts.select ? opts.select(params) : params;
    }
  });
}
function useSearch(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    shouldThrow: opts.shouldThrow,
    select: (match) => {
      const search = match.search;
      return opts.select ? opts.select(search) : search;
    }
  });
}
function useNavigate(_defaultOpts) {
  const router2 = useRouter();
  return (options) => {
    return router2.navigate({
      ...options,
      from: options.from ?? _defaultOpts?.from
    });
  };
}
function useRouteContext(opts) {
  return useMatch({
    ...opts,
    select: (match) => opts.select ? opts.select(match.context) : match.context
  });
}
let Route$5 = class Route extends BaseRoute {
  /**
   * @deprecated Use the `createRoute` function instead.
   */
  constructor(options) {
    super(options);
    this.useMatch = (opts) => {
      return useMatch({
        select: opts?.select,
        from: this.id
      });
    };
    this.useRouteContext = (opts) => {
      return useRouteContext({
        ...opts,
        from: this.id
      });
    };
    this.useSearch = (opts) => {
      return useSearch({
        select: opts?.select,
        from: this.id
      });
    };
    this.useParams = (opts) => {
      return useParams({
        select: opts?.select,
        from: this.id
      });
    };
    this.useLoaderDeps = (opts) => {
      return useLoaderDeps({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderData = (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    };
    this.useNavigate = () => {
      return useNavigate({
        from: this.fullPath
      });
    };
    this.Link = (props) => {
      const _self$ = this;
      return createComponent(Link$1, mergeProps({
        get from() {
          return _self$.fullPath;
        }
      }, props));
    };
  }
};
function createRoute(options) {
  return new Route$5(options);
}
function createRootRouteWithContext() {
  return (options) => {
    return createRootRoute(options);
  };
}
class RootRoute extends BaseRootRoute {
  /**
   * @deprecated `RootRoute` is now an internal implementation detail. Use `createRootRoute()` instead.
   */
  constructor(options) {
    super(options);
    this.useMatch = (opts) => {
      return useMatch({
        select: opts?.select,
        from: this.id
      });
    };
    this.useRouteContext = (opts) => {
      return useRouteContext({
        ...opts,
        from: this.id
      });
    };
    this.useSearch = (opts) => {
      return useSearch({
        select: opts?.select,
        from: this.id
      });
    };
    this.useParams = (opts) => {
      return useParams({
        select: opts?.select,
        from: this.id
      });
    };
    this.useLoaderDeps = (opts) => {
      return useLoaderDeps({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderData = (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    };
    this.useNavigate = () => {
      return useNavigate({
        from: this.fullPath
      });
    };
    this.Link = (props) => {
      const _self$2 = this;
      return createComponent(Link$1, mergeProps({
        get from() {
          return _self$2.fullPath;
        }
      }, props));
    };
  }
}
function createRootRoute(options) {
  return new RootRoute(options);
}
function createFileRoute(path) {
  return new FileRoute(path, {
    silent: true
  }).createRoute;
}
class FileRoute {
  constructor(path, _opts) {
    this.path = path;
    this.createRoute = (options) => {
      const route = createRoute(options);
      route.isRoot = false;
      return route;
    };
    this.silent = _opts?.silent;
  }
}
function lazyRouteComponent(importer, exportName) {
  let loadPromise;
  let comp;
  let error;
  const load = () => {
    if (!loadPromise) {
      loadPromise = importer().then((res) => {
        loadPromise = void 0;
        comp = res[exportName];
        return comp;
      }).catch((err) => {
        error = err;
      });
    }
    return loadPromise;
  };
  const lazyComp = function Lazy(props) {
    if (error) {
      if (isModuleNotFoundError(error)) {
        if (error instanceof Error && typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
          const storageKey = `tanstack_router_reload:${error.message}`;
          if (!sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, "1");
            window.location.reload();
            return {
              default: () => null
            };
          }
        }
      }
      throw error;
    }
    if (!comp) {
      const [compResource] = createResource(load, {
        initialValue: comp,
        ssrLoadFrom: "initial"
      });
      return createComponent(Dynamic, mergeProps({
        get component() {
          return compResource();
        }
      }, props));
    }
    return createComponent(Dynamic, mergeProps({
      component: comp
    }, props));
  };
  lazyComp.preload = load;
  return lazyComp;
}
function initRouterStores(stores, createReadonlyStore) {
  stores.childMatchIdByRouteId = createReadonlyStore(() => {
    const ids = stores.matchesId.get();
    const obj = {};
    for (let i = 0; i < ids.length - 1; i++) {
      const parentStore = stores.matchStores.get(ids[i]);
      if (parentStore?.routeId) {
        obj[parentStore.routeId] = ids[i + 1];
      }
    }
    return obj;
  });
  stores.pendingRouteIds = createReadonlyStore(() => {
    const ids = stores.pendingIds.get();
    const obj = {};
    for (const id of ids) {
      const store = stores.pendingMatchStores.get(id);
      if (store?.routeId) {
        obj[store.routeId] = true;
      }
    }
    return obj;
  });
}
function createSolidMutableStore(initialValue) {
  const [signal, setSignal] = Solid.createSignal(initialValue);
  return { get: signal, set: setSignal };
}
let finalizationRegistry = null;
if (typeof globalThis !== "undefined" && "FinalizationRegistry" in globalThis) {
  finalizationRegistry = new FinalizationRegistry((cb) => cb());
}
function createSolidReadonlyStore(read) {
  let dispose;
  const memo = Solid.createRoot((d) => {
    dispose = d;
    return Solid.createMemo(read);
  });
  const store = { get: memo };
  finalizationRegistry?.register(store, dispose);
  return store;
}
const getStoreFactory = (opts) => {
  if (isServer ?? opts.isServer) {
    return {
      createMutableStore: createNonReactiveMutableStore,
      createReadonlyStore: createNonReactiveReadonlyStore,
      batch: (fn) => fn(),
      init: (stores) => initRouterStores(stores, createNonReactiveReadonlyStore)
    };
  }
  return {
    createMutableStore: createSolidMutableStore,
    createReadonlyStore: createSolidReadonlyStore,
    batch: Solid.batch,
    init: (stores) => initRouterStores(stores, createSolidReadonlyStore)
  };
};
const createRouter = (options) => {
  return new Router(options);
};
class Router extends RouterCore {
  constructor(options) {
    super(options, getStoreFactory);
  }
}
const MetaContext = createContext();
const cascadingTags = ["title", "meta"];
const titleTagProperties = [];
const metaTagProperties = (
  // https://html.spec.whatwg.org/multipage/semantics.html#the-meta-element
  ["name", "http-equiv", "content", "charset", "media"].concat(["property"])
);
const getTagKey = (tag, properties) => {
  const tagProps = Object.fromEntries(Object.entries(tag.props).filter(([k]) => properties.includes(k)).sort());
  if (Object.hasOwn(tagProps, "name") || Object.hasOwn(tagProps, "property")) {
    tagProps.name = tagProps.name || tagProps.property;
    delete tagProps.property;
  }
  return tag.tag + JSON.stringify(tagProps);
};
function initClientProvider() {
  if (!sharedConfig.context) {
    const ssrTags = document.head.querySelectorAll(`[data-sm]`);
    Array.prototype.forEach.call(ssrTags, (ssrTag) => ssrTag.parentNode.removeChild(ssrTag));
  }
  const cascadedTagInstances = /* @__PURE__ */ new Map();
  function getElement(tag) {
    if (tag.ref) {
      return tag.ref;
    }
    let el = document.querySelector(`[data-sm="${tag.id}"]`);
    if (el) {
      if (el.tagName.toLowerCase() !== tag.tag) {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
        el = document.createElement(tag.tag);
      }
      el.removeAttribute("data-sm");
    } else {
      el = document.createElement(tag.tag);
    }
    return el;
  }
  return {
    addTag(tag) {
      if (cascadingTags.indexOf(tag.tag) !== -1) {
        const properties = tag.tag === "title" ? titleTagProperties : metaTagProperties;
        const tagKey = getTagKey(tag, properties);
        if (!cascadedTagInstances.has(tagKey)) {
          cascadedTagInstances.set(tagKey, []);
        }
        let instances = cascadedTagInstances.get(tagKey);
        let index = instances.length;
        instances = [...instances, tag];
        cascadedTagInstances.set(tagKey, instances);
        let element2 = getElement(tag);
        tag.ref = element2;
        spread(element2, tag.props);
        let lastVisited = null;
        for (var i = index - 1; i >= 0; i--) {
          if (instances[i] != null) {
            lastVisited = instances[i];
            break;
          }
        }
        if (element2.parentNode != document.head) {
          document.head.appendChild(element2);
        }
        if (lastVisited && lastVisited.ref && lastVisited.ref.parentNode) {
          document.head.removeChild(lastVisited.ref);
        }
        return index;
      }
      let element = getElement(tag);
      tag.ref = element;
      spread(element, tag.props);
      if (element.parentNode != document.head) {
        document.head.appendChild(element);
      }
      return -1;
    },
    removeTag(tag, index) {
      const properties = tag.tag === "title" ? titleTagProperties : metaTagProperties;
      const tagKey = getTagKey(tag, properties);
      if (tag.ref) {
        const t = cascadedTagInstances.get(tagKey);
        if (t) {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
            for (let i = index - 1; i >= 0; i--) {
              if (t[i] != null) {
                document.head.appendChild(t[i].ref);
              }
            }
          }
          t[index] = null;
          cascadedTagInstances.set(tagKey, t);
        } else {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
          }
        }
      }
    }
  };
}
function initServerProvider() {
  const tags = [];
  useAssets(() => ssr(renderTags(tags)));
  return {
    addTag(tagDesc) {
      if (cascadingTags.indexOf(tagDesc.tag) !== -1) {
        const properties = tagDesc.tag === "title" ? titleTagProperties : metaTagProperties;
        const tagDescKey = getTagKey(tagDesc, properties);
        const index = tags.findIndex((prev) => prev.tag === tagDesc.tag && getTagKey(prev, properties) === tagDescKey);
        if (index !== -1) {
          tags.splice(index, 1);
        }
      }
      tags.push(tagDesc);
      return tags.length;
    },
    removeTag(tag, index) {
    }
  };
}
const MetaProvider = (props) => {
  const actions = !isServer$1 ? initClientProvider() : initServerProvider();
  return createComponent(MetaContext.Provider, {
    value: actions,
    get children() {
      return props.children;
    }
  });
};
const MetaTag = (tag, props, setting) => {
  useHead({
    tag,
    props,
    setting,
    id: createUniqueId(),
    get name() {
      return props.name || props.property;
    }
  });
  return null;
};
function useHead(tagDesc) {
  const c = useContext(MetaContext);
  if (!c) throw new Error("<MetaProvider /> should be in the tree");
  createRenderEffect(() => {
    const index = c.addTag(tagDesc);
    onCleanup(() => c.removeTag(tagDesc, index));
  });
}
function renderTags(tags) {
  return tags.map((tag) => {
    const keys = Object.keys(tag.props);
    const props = keys.map((k) => k === "children" ? "" : ` ${k}="${// @ts-expect-error
    escape(tag.props[k], true)}"`).join("");
    let children = tag.props.children;
    if (Array.isArray(children)) {
      children = children.join("");
    }
    if (tag.setting?.close) {
      return `<${tag.tag} data-sm="${tag.id}"${props}>${// @ts-expect-error
      tag.setting?.escape ? escape(children) : children || ""}</${tag.tag}>`;
    }
    return `<${tag.tag} data-sm="${tag.id}"${props}/>`;
  }).join("");
}
const Title = (props) => MetaTag("title", props, {
  escape: true,
  close: true
});
const Style = (props) => MetaTag("style", props, {
  close: true
});
const Meta = (props) => MetaTag("meta", props);
const Link = (props) => MetaTag("link", props);
function Asset(asset) {
  const {
    tag,
    attrs,
    children
  } = asset;
  switch (tag) {
    case "title":
      return createComponent(Title, mergeProps(attrs, {
        children
      }));
    case "meta":
      return createComponent(Meta, attrs);
    case "link":
      return createComponent(Link, attrs);
    case "style":
      if (asset.inlineCss && false) ;
      return createComponent(Style, mergeProps(attrs, {
        children
      }));
    case "script":
      return createComponent(Script, {
        attrs,
        children
      });
    default:
      return null;
  }
}
function Script({
  attrs,
  children
}) {
  const router2 = useRouter();
  const dataScript = typeof attrs?.type === "string" && attrs.type !== "" && attrs.type !== "text/javascript" && attrs.type !== "module";
  onMount(() => {
    if (dataScript) return;
    if (attrs?.src) {
      const normSrc = (() => {
        try {
          const base = document.baseURI || window.location.href;
          return new URL(attrs.src, base).href;
        } catch {
          return attrs.src;
        }
      })();
      const existingScript = Array.from(document.querySelectorAll("script[src]")).find((el) => el.src === normSrc);
      if (existingScript) {
        return;
      }
      const script = document.createElement("script");
      for (const [key, value] of Object.entries(attrs)) {
        if (value !== void 0 && value !== false) {
          script.setAttribute(key, typeof value === "boolean" ? "" : String(value));
        }
      }
      document.head.appendChild(script);
      onCleanup(() => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    }
    if (typeof children === "string") {
      const typeAttr = typeof attrs?.type === "string" ? attrs.type : "text/javascript";
      const nonceAttr = typeof attrs?.nonce === "string" ? attrs.nonce : void 0;
      const existingScript = Array.from(document.querySelectorAll("script:not([src])")).find((el) => {
        if (!(el instanceof HTMLScriptElement)) return false;
        const sType = el.getAttribute("type") ?? "text/javascript";
        const sNonce = el.getAttribute("nonce") ?? void 0;
        return el.textContent === children && sType === typeAttr && sNonce === nonceAttr;
      });
      if (existingScript) {
        return;
      }
      const script = document.createElement("script");
      script.textContent = children;
      if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
          if (value !== void 0 && value !== false) {
            script.setAttribute(key, typeof value === "boolean" ? "" : String(value));
          }
        }
      }
      document.head.appendChild(script);
      onCleanup(() => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    }
  });
  if (!(isServer ?? router2.isServer)) {
    if (dataScript && typeof children === "string") {
      return ssrElement("script", mergeProps(attrs, {
        innerHTML: children
      }), void 0, true);
    }
    return null;
  }
  if (attrs?.src && typeof attrs.src === "string") {
    return ssrElement("script", attrs, void 0, true);
  }
  if (typeof children === "string") {
    return ssrElement("script", mergeProps(attrs, {
      innerHTML: children
    }), void 0, true);
  }
  return null;
}
const useTags = (assetCrossOrigin) => {
  const router2 = useRouter();
  const nonce = router2.options.ssr?.nonce;
  const activeMatches = Solid.createMemo(() => router2.stores.matches.get());
  const routeMeta = Solid.createMemo(() => activeMatches().map((match) => match.meta).filter(Boolean));
  const meta = Solid.createMemo(() => {
    const resultMeta = [];
    const metaByAttribute = {};
    let title;
    const routeMetasArray = routeMeta();
    for (let i = routeMetasArray.length - 1; i >= 0; i--) {
      const metas = routeMetasArray[i];
      for (let j = metas.length - 1; j >= 0; j--) {
        const m = metas[j];
        if (!m) continue;
        if (m.title) {
          if (!title) {
            title = {
              tag: "title",
              children: m.title
            };
          }
        } else if ("script:ld+json" in m) {
          try {
            const json = JSON.stringify(m["script:ld+json"]);
            resultMeta.push({
              tag: "script",
              attrs: {
                type: "application/ld+json"
              },
              children: escapeHtml(json)
            });
          } catch {
          }
        } else {
          const attribute = m.name ?? m.property;
          if (attribute) {
            if (metaByAttribute[attribute]) {
              continue;
            } else {
              metaByAttribute[attribute] = true;
            }
          }
          resultMeta.push({
            tag: "meta",
            attrs: {
              ...m,
              nonce
            }
          });
        }
      }
    }
    if (title) {
      resultMeta.push(title);
    }
    if (router2.options.ssr?.nonce) {
      resultMeta.push({
        tag: "meta",
        attrs: {
          property: "csp-nonce",
          content: router2.options.ssr.nonce
        }
      });
    }
    resultMeta.reverse();
    return resultMeta;
  });
  const links = Solid.createMemo(() => {
    const matches = activeMatches();
    const constructed = matches.map((match) => match.links).filter(Boolean).flat(1).map((link) => ({
      tag: "link",
      attrs: {
        ...link,
        nonce
      }
    }));
    const manifest = router2.ssr?.manifest;
    const assets = matches.map((match) => manifest?.routes[match.routeId]?.assets ?? []).filter(Boolean).flat(1).flatMap((asset) => {
      if (asset.tag === "link") {
        if (isInlinableStylesheet(manifest, asset)) {
          return [];
        }
        return [{
          tag: "link",
          attrs: {
            ...asset.attrs,
            crossOrigin: getAssetCrossOrigin(assetCrossOrigin, "stylesheet") ?? asset.attrs?.crossOrigin,
            nonce
          }
        }];
      }
      if (asset.tag === "style") {
        return [{
          tag: "style",
          attrs: {
            ...asset.attrs,
            nonce
          },
          children: asset.children,
          ...asset.inlineCss ? {
            inlineCss: true
          } : {}
        }];
      }
      return [];
    });
    return [...constructed, ...assets];
  });
  const preloadLinks = Solid.createMemo(() => {
    const matches = activeMatches();
    const preloadLinks2 = [];
    matches.map((match) => router2.looseRoutesById[match.routeId]).forEach((route) => router2.ssr?.manifest?.routes[route.id]?.preloads?.filter(Boolean).forEach((preload) => {
      const preloadLink = resolveManifestAssetLink(preload);
      preloadLinks2.push({
        tag: "link",
        attrs: {
          rel: "modulepreload",
          href: preloadLink.href,
          crossOrigin: getAssetCrossOrigin(assetCrossOrigin, "modulepreload") ?? preloadLink.crossOrigin,
          nonce
        }
      });
    }));
    return preloadLinks2;
  });
  const styles = Solid.createMemo(() => activeMatches().map((match) => match.styles).flat(1).filter(Boolean).map(({
    children,
    ...style
  }) => ({
    tag: "style",
    attrs: {
      ...style,
      nonce
    },
    children
  })));
  const headScripts = Solid.createMemo(() => activeMatches().map((match) => match.headScripts).flat(1).filter(Boolean).map(({
    children,
    ...script
  }) => ({
    tag: "script",
    attrs: {
      ...script,
      nonce
    },
    children
  })));
  return Solid.createMemo((prev) => {
    const next = uniqBy([...meta(), ...preloadLinks(), ...links(), ...styles(), ...headScripts()], (d) => {
      return JSON.stringify(d);
    });
    if (prev === void 0) {
      return next;
    }
    return replaceEqualTags(prev, next);
  });
};
function replaceEqualTags(prev, next) {
  const prevByKey = /* @__PURE__ */ new Map();
  for (const tag of prev) {
    prevByKey.set(JSON.stringify(tag), tag);
  }
  let isEqual = prev.length === next.length;
  const result = next.map((tag, index) => {
    const existing = prevByKey.get(JSON.stringify(tag));
    if (existing) {
      if (existing !== prev[index]) {
        isEqual = false;
      }
      return existing;
    }
    isEqual = false;
    return tag;
  });
  return isEqual ? prev : result;
}
function uniqBy(arr, fn) {
  const seen = /* @__PURE__ */ new Set();
  return arr.filter((item) => {
    const key = fn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
function HeadContent(props) {
  const tags = useTags(props.assetCrossOrigin);
  return createComponent(MetaProvider, {
    get children() {
      return createComponent(For, {
        get each() {
          return tags();
        },
        children: (tag) => createComponent(Asset, tag)
      });
    }
  });
}
const Scripts = () => {
  const router2 = useRouter();
  const nonce = router2.options.ssr?.nonce;
  const activeMatches = Solid.createMemo(() => router2.stores.matches.get());
  const assetScripts = Solid.createMemo(() => {
    const assetScripts2 = [];
    const manifest = router2.ssr?.manifest;
    if (!manifest) {
      return [];
    }
    activeMatches().map((match) => router2.looseRoutesById[match.routeId]).forEach((route) => manifest.routes[route.id]?.assets?.filter((d) => d.tag === "script").forEach((asset) => {
      assetScripts2.push({
        tag: "script",
        attrs: {
          ...asset.attrs,
          nonce
        },
        children: asset.children
      });
    }));
    return assetScripts2;
  });
  const scripts = Solid.createMemo(() => activeMatches().map((match) => match.scripts).flat(1).filter(Boolean).map(({
    children,
    ...script
  }) => ({
    tag: "script",
    attrs: {
      ...script,
      nonce
    },
    children
  })));
  let serverBufferedScript = void 0;
  if (router2.serverSsr) {
    serverBufferedScript = router2.serverSsr.takeBufferedScripts();
  }
  const allScripts = [...scripts(), ...assetScripts()];
  if (serverBufferedScript) {
    allScripts.unshift(serverBufferedScript);
  }
  return allScripts.map((asset, i) => createComponent(Asset, asset));
};
const styleCss = "/assets/styles-BeDQBXDm.css";
var _tmpl$ = ["<head>", "", "</head>"], _tmpl$2 = ["<html", ">", "<body><!--$-->", "<!--/--><!--$-->", "<!--/--></body></html>"];
const Route$4 = createRootRouteWithContext()({
  head: () => ({
    links: [{
      rel: "stylesheet",
      href: styleCss
    }]
  }),
  component: RootComponent
});
function RootComponent() {
  return ssr(_tmpl$2, ssrHydrationKey(), createComponent(NoHydration, {
    get children() {
      return ssr(_tmpl$, escape(createComponent(HydrationScript, {})), escape(createComponent(HeadContent, {})));
    }
  }), escape(createComponent(Suspense, {
    get children() {
      return createComponent(Outlet, {});
    }
  })), escape(createComponent(Scripts, {})));
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
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
const signupFn = createServerFn({
  method: "POST"
}).handler(createSsrRpc("252fd4b488f53fdb547474e5fc41e8fa5836a513772ca9ee0e3117a7900e759e"));
const loginFn = createServerFn({
  method: "POST"
}).handler(createSsrRpc("deefcbf24fb4028b68f2deb974f509c98a02b302caa98e8b686b65b4a2728022"));
createServerFn({
  method: "POST"
}).handler(createSsrRpc("b9bccd5829435b2cd4e990053eb45c9ce2bf1513efc4f9effc34e4712565ca9b"));
const getSessionUserFn = createServerFn({
  method: "GET"
}).handler(createSsrRpc("3dd5744e36327c022d9256da0760c404ff0c0512dbf40d0264cc93528fdf153c"));
const $$splitComponentImporter$3 = () => import("./dashboard-CyCek7pq.js");
const Route$3 = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard - Protected"
    }]
  }),
  beforeLoad: async ({
    request
  }) => {
    let user;
    console.log("beforeLoad request exists:", !!request);
    if (request) {
      const cookieHeader = request.headers.get("cookie");
      const token = cookieHeader?.split(";").map((c) => c.trim()).find((c) => c.startsWith("auth_token="))?.split("=")[1];
      console.log("beforeLoad server token:", token);
      user = await getUserFromToken(token);
    } else {
      console.log("beforeLoad client: calling getSessionUserFn");
      user = await getSessionUserFn();
    }
    console.log("beforeLoad user:", user);
    if (!user) {
      throw redirect({
        to: "/auth"
      });
    }
    return {
      user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./auth-DZCuhyzE.js");
const Route$2 = createFileRoute("/auth")({
  head: () => ({
    meta: [{
      title: "Authentication - TanStack Solid Boilerplate"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./about-Gcw6JXoP.js");
const Route$1 = createFileRoute("/about")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-Bk6tf1vg.js");
const Route2 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "TanStack Solid Boilerplate"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const DashboardRoute = Route$3.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$4
});
const AuthRoute = Route$2.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$4
});
const AboutRoute = Route$1.update({
  id: "/about",
  path: "/about",
  getParentRoute: () => Route$4
});
const IndexRoute = Route2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$4
});
const rootRouteChildren = {
  IndexRoute,
  AboutRoute,
  AuthRoute,
  DashboardRoute
};
const routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Link$1 as L,
  Route$3 as R,
  loginFn as l,
  router as r,
  signupFn as s,
  useNavigate as u
};
