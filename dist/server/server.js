import { AsyncLocalStorage } from "node:async_hooks";
import { H3Event, toResponse } from "h3-v2";
import { trimPathRight, getLocationChangeInfo, handleHashScroll, isNotFound, rootRouteId, createControlledPromise, invariant, isRedirect, parseRedirect, defaultSerovalPlugins, makeSerovalPlugin, createRawStreamRPCPlugin, resolveManifestAssetLink, createSerializationAdapter, isResolvedRedirect, executeRewriteInput, makeSsrSerovalPlugin } from "@tanstack/router-core";
import { toCrossJSONStream, fromJSON, toCrossJSONAsync } from "seroval";
import { createMemoryHistory } from "@tanstack/history";
import { mergeHeaders } from "@tanstack/router-core/ssr/client";
import { getNormalizedURL, getOrigin, attachRouterServerSsrUtils, transformReadableStreamWithRouter, defineHandlerCallback } from "@tanstack/router-core/ssr/server";
import * as Solid$1 from "solid-js/web";
import { ssr, ssrHydrationKey, ssrStyleProperty, escape, createComponent, Dynamic, ssrAttribute, mergeProps } from "solid-js/web";
import * as Solid from "solid-js";
import { isServer } from "@tanstack/router-core/isServer";
import { getScrollRestorationScriptForRouter } from "@tanstack/router-core/scroll-restoration-script";
import { isbot } from "isbot";
var _tmpl$$2 = ["<div", ' style="', '"><div style="', '"><strong style="', '">Something went wrong!</strong><button style="', '">', '</button></div><div style="', '"></div><!--$-->', "<!--/--></div>"], _tmpl$2 = ["<div", '><pre style="', '">', "</pre></div>"], _tmpl$3 = ["<code", ">", "</code>"];
function CatchBoundary(props) {
  return createComponent(Solid.ErrorBoundary, {
    fallback: (error, reset) => {
      props.onCatch?.(error);
      Solid.createEffect(Solid.on([props.getResetKey], () => reset(), {
        defer: true
      }));
      return createComponent(Dynamic, {
        get component() {
          return props.errorComponent ?? ErrorComponent;
        },
        error,
        reset
      });
    },
    get children() {
      return props.children;
    }
  });
}
function ErrorComponent({
  error
}) {
  const [show, setShow] = Solid.createSignal(false);
  return ssr(_tmpl$$2, ssrHydrationKey(), ssrStyleProperty("padding:", ".5rem") + ssrStyleProperty(";max-width:", "100%"), ssrStyleProperty("display:", "flex") + ssrStyleProperty(";align-items:", "center") + ssrStyleProperty(";gap:", ".5rem"), ssrStyleProperty("font-size:", "1rem"), ssrStyleProperty("appearance:", "none") + ssrStyleProperty(";font-size:", ".6em") + ssrStyleProperty(";border:", "1px solid currentColor") + ssrStyleProperty(";padding:", ".1rem .2rem") + ssrStyleProperty(";font-weight:", "bold") + ssrStyleProperty(";border-radius:", ".25rem"), show() ? "Hide Error" : "Show Error", ssrStyleProperty("height:", ".25rem"), show() ? ssr(_tmpl$2, ssrHydrationKey(), ssrStyleProperty("font-size:", ".7em") + ssrStyleProperty(";border:", "1px solid red") + ssrStyleProperty(";border-radius:", ".25rem") + ssrStyleProperty(";padding:", ".3rem") + ssrStyleProperty(";color:", "red") + ssrStyleProperty(";overflow:", "auto"), error.message ? ssr(_tmpl$3, ssrHydrationKey(), escape(error.message)) : escape(null)) : escape(null));
}
const routerContext = Solid.createContext(null);
function useRouter(opts) {
  const value = Solid.useContext(routerContext);
  return value;
}
const defaultNearestMatchContext = {
  matchId: () => void 0,
  routeId: () => void 0,
  match: () => void 0,
  hasPending: () => false
};
const nearestMatchContext = Solid.createContext(defaultNearestMatchContext);
function Transitioner() {
  const router = useRouter();
  let mountLoadForRouter = {
    router,
    mounted: false
  };
  const isLoading = Solid.createMemo(() => router.stores.isLoading.get());
  if (isServer ?? router.isServer) {
    return null;
  }
  const [isSolidTransitioning, startSolidTransition] = Solid.useTransition();
  const hasPending = Solid.createMemo(() => router.stores.hasPending.get());
  const isAnyPending = Solid.createMemo(() => isLoading() || isSolidTransitioning() || hasPending());
  const isPagePending = Solid.createMemo(() => isLoading() || hasPending());
  router.startTransition = (fn) => {
    Solid.startTransition(() => {
      startSolidTransition(fn);
    });
  };
  Solid.onMount(() => {
    const unsub = router.history.subscribe(router.load);
    const nextLocation = router.buildLocation({
      to: router.latestLocation.pathname,
      search: true,
      params: true,
      hash: true,
      state: true,
      _includeValidateSearch: true
    });
    if (trimPathRight(router.latestLocation.publicHref) !== trimPathRight(nextLocation.publicHref)) {
      router.commitLocation({
        ...nextLocation,
        replace: true
      });
    }
    Solid.onCleanup(() => {
      unsub();
    });
  });
  Solid.createRenderEffect(() => {
    Solid.untrack(() => {
      if (
        // if we are hydrating from SSR, loading is triggered in ssr-client
        typeof window !== "undefined" && router.ssr || mountLoadForRouter.router === router && mountLoadForRouter.mounted
      ) {
        return;
      }
      mountLoadForRouter = {
        router,
        mounted: true
      };
      const tryLoad = async () => {
        try {
          await router.load();
        } catch (err) {
          console.error(err);
        }
      };
      tryLoad();
    });
  });
  Solid.createRenderEffect((previousIsLoading = false) => {
    const currentIsLoading = isLoading();
    if (previousIsLoading && !currentIsLoading) {
      router.emit({
        type: "onLoad",
        ...getLocationChangeInfo(router.stores.location.get(), router.stores.resolvedLocation.get())
      });
    }
    return currentIsLoading;
  });
  Solid.createComputed((previousIsPagePending = false) => {
    const currentIsPagePending = isPagePending();
    if (previousIsPagePending && !currentIsPagePending) {
      router.emit({
        type: "onBeforeRouteMount",
        ...getLocationChangeInfo(router.stores.location.get(), router.stores.resolvedLocation.get())
      });
    }
    return currentIsPagePending;
  });
  Solid.createRenderEffect((previousIsAnyPending = false) => {
    const currentIsAnyPending = isAnyPending();
    if (previousIsAnyPending && !currentIsAnyPending) {
      const changeInfo = getLocationChangeInfo(router.stores.location.get(), router.stores.resolvedLocation.get());
      router.emit({
        type: "onResolved",
        ...changeInfo
      });
      Solid.batch(() => {
        router.stores.status.set("idle");
        router.stores.resolvedLocation.set(router.stores.location.get());
      });
      if (changeInfo.hrefChanged) {
        handleHashScroll(router);
      }
    }
    return currentIsAnyPending;
  });
  return null;
}
function SafeFragment(props) {
  return props.children;
}
var _tmpl$$1 = ["<p", ">Not Found</p>"];
function getNotFound(error) {
  if (isNotFound(error)) {
    return error;
  }
  if (isNotFound(error?.cause)) {
    return error.cause;
  }
  return void 0;
}
function CatchNotFound(props) {
  const router = useRouter();
  const pathname = Solid.createMemo(() => router.stores.location.get().pathname);
  const status = Solid.createMemo(() => router.stores.status.get());
  return createComponent(CatchBoundary, {
    getResetKey: () => `not-found-${pathname()}-${status()}`,
    onCatch: (error) => {
      const notFoundError = getNotFound(error);
      if (notFoundError) {
        props.onCatch?.(notFoundError);
      } else {
        throw error;
      }
    },
    errorComponent: ({
      error
    }) => {
      const notFoundError = getNotFound(error);
      if (notFoundError) {
        return props.fallback?.(notFoundError);
      } else {
        throw error;
      }
    },
    get children() {
      return props.children;
    }
  });
}
function DefaultGlobalNotFound() {
  return ssr(_tmpl$$1, ssrHydrationKey());
}
function renderRouteNotFound(router, route, data) {
  if (!route.options.notFoundComponent) {
    if (router.options.defaultNotFoundComponent) {
      return createComponent(router.options.defaultNotFoundComponent, data);
    }
    return createComponent(DefaultGlobalNotFound, {});
  }
  return createComponent(route.options.notFoundComponent, data);
}
var _tmpl$ = ["<script", ' class="$tsr">', "<\/script>"];
function ScriptOnce({
  children
}) {
  const router = useRouter();
  if (!(isServer ?? router.isServer)) {
    return null;
  }
  return ssr(_tmpl$, ssrHydrationKey() + ssrAttribute("nonce", escape(router.options.ssr?.nonce, true), false), children + ";document.currentScript.remove()");
}
function ScrollRestoration() {
  const router = useRouter();
  const script = getScrollRestorationScriptForRouter(router);
  if (!script) {
    return null;
  }
  return createComponent(ScriptOnce, {
    children: script
  });
}
const Match = (props) => {
  const router = useRouter();
  const match = Solid.createMemo(() => {
    const id = props.matchId;
    if (!id) return void 0;
    return router.stores.matchStores.get(id)?.get();
  });
  const rawMatchState = Solid.createMemo(() => {
    const currentMatch = match();
    if (!currentMatch) {
      return null;
    }
    const routeId = currentMatch.routeId;
    const parentRouteId = router.routesById[routeId]?.parentRoute?.id;
    return {
      matchId: currentMatch.id,
      routeId,
      ssr: currentMatch.ssr,
      _displayPending: currentMatch._displayPending,
      parentRouteId
    };
  });
  const hasPendingMatch = Solid.createMemo(() => {
    const currentRouteId = rawMatchState()?.routeId;
    return currentRouteId ? Boolean(router.stores.pendingRouteIds.get()[currentRouteId]) : false;
  });
  const nearestMatch = {
    matchId: () => rawMatchState()?.matchId,
    routeId: () => rawMatchState()?.routeId,
    match,
    hasPending: hasPendingMatch
  };
  return createComponent(Solid.Show, {
    get when() {
      return rawMatchState();
    },
    children: (currentMatchState) => {
      const route = () => router.routesById[currentMatchState().routeId];
      const resolvePendingComponent = () => route().options.pendingComponent ?? router.options.defaultPendingComponent;
      const routeErrorComponent = () => route().options.errorComponent ?? router.options.defaultErrorComponent;
      const routeOnCatch = () => route().options.onCatch ?? router.options.defaultOnCatch;
      const routeNotFoundComponent = () => route().isRoot ? (
        // If it's the root route, use the globalNotFound option, with fallback to the notFoundRoute's component
        route().options.notFoundComponent ?? router.options.notFoundRoute?.options.component
      ) : route().options.notFoundComponent;
      const resolvedNoSsr = currentMatchState().ssr === false || currentMatchState().ssr === "data-only";
      const shouldSkipSuspenseFallback = isServer ?? router.isServer ? resolvedNoSsr : currentMatchState().ssr === "data-only";
      const ResolvedSuspenseBoundary = () => Solid.Suspense;
      const ResolvedCatchBoundary = () => routeErrorComponent() ? CatchBoundary : SafeFragment;
      const ResolvedNotFoundBoundary = () => routeNotFoundComponent() ? CatchNotFound : SafeFragment;
      const ShellComponent = route().isRoot ? route().options.shellComponent ?? SafeFragment : SafeFragment;
      return createComponent(ShellComponent, {
        get children() {
          return [createComponent(nearestMatchContext.Provider, {
            value: nearestMatch,
            get children() {
              return createComponent(Dynamic, {
                get component() {
                  return ResolvedSuspenseBoundary();
                },
                get fallback() {
                  return (
                    // Data-only SSR renders the inner fallback on the server, so
                    // avoid adding an extra suspense fallback on the client.
                    shouldSkipSuspenseFallback ? void 0 : createComponent(Dynamic, {
                      get component() {
                        return resolvePendingComponent();
                      }
                    })
                  );
                },
                get children() {
                  return createComponent(Dynamic, {
                    get component() {
                      return ResolvedCatchBoundary();
                    },
                    getResetKey: () => router.stores.loadedAt.get(),
                    get errorComponent() {
                      return routeErrorComponent() || ErrorComponent;
                    },
                    onCatch: (error) => {
                      const notFoundError = getNotFound(error);
                      if (notFoundError) {
                        notFoundError.routeId ?? (notFoundError.routeId = currentMatchState().routeId);
                        throw notFoundError;
                      }
                      routeOnCatch()?.(error);
                    },
                    get children() {
                      return createComponent(Dynamic, {
                        get component() {
                          return ResolvedNotFoundBoundary();
                        },
                        fallback: (error) => {
                          const notFoundError = getNotFound(error) ?? error;
                          notFoundError.routeId ?? (notFoundError.routeId = currentMatchState().routeId);
                          if (!routeNotFoundComponent() || notFoundError.routeId && notFoundError.routeId !== currentMatchState().routeId || !notFoundError.routeId && !route().isRoot) throw notFoundError;
                          return createComponent(Dynamic, mergeProps({
                            get component() {
                              return routeNotFoundComponent();
                            }
                          }, notFoundError));
                        },
                        get children() {
                          return createComponent(Solid.Switch, {
                            get children() {
                              return [createComponent(Solid.Match, {
                                when: resolvedNoSsr,
                                get children() {
                                  return createComponent(Solid.Show, {
                                    get when() {
                                      return !(isServer ?? router.isServer);
                                    },
                                    get fallback() {
                                      return createComponent(Dynamic, {
                                        get component() {
                                          return resolvePendingComponent();
                                        }
                                      });
                                    },
                                    get children() {
                                      return createComponent(MatchInner, {});
                                    }
                                  });
                                }
                              }), createComponent(Solid.Match, {
                                when: !resolvedNoSsr,
                                get children() {
                                  return createComponent(MatchInner, {});
                                }
                              })];
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          }), currentMatchState().parentRouteId === rootRouteId ? [createComponent(OnRendered, {}), router.options.scrollRestoration && (isServer ?? router.isServer) ? createComponent(ScrollRestoration, {}) : null] : null];
        }
      });
    }
  });
};
function OnRendered() {
  const router = useRouter();
  const location = Solid.createMemo(() => router.stores.resolvedLocation.get()?.state.__TSR_key);
  Solid.createEffect(Solid.on([location], () => {
    router.emit({
      type: "onRendered",
      ...getLocationChangeInfo(router.stores.location.get(), router.stores.resolvedLocation.get())
    });
  }));
  return null;
}
const MatchInner = () => {
  const router = useRouter();
  const match = Solid.useContext(nearestMatchContext).match;
  const rawMatchState = Solid.createMemo(() => {
    const currentMatch = match();
    if (!currentMatch) {
      return null;
    }
    const routeId = currentMatch.routeId;
    const remountFn = router.routesById[routeId].options.remountDeps ?? router.options.defaultRemountDeps;
    const remountDeps = remountFn?.({
      routeId,
      loaderDeps: currentMatch.loaderDeps,
      params: currentMatch._strictParams,
      search: currentMatch._strictSearch
    });
    const key = remountDeps ? JSON.stringify(remountDeps) : void 0;
    return {
      key,
      routeId,
      match: {
        id: currentMatch.id,
        status: currentMatch.status,
        error: currentMatch.error,
        _forcePending: currentMatch._forcePending ?? false,
        _displayPending: currentMatch._displayPending ?? false
      }
    };
  });
  return createComponent(Solid.Show, {
    get when() {
      return rawMatchState();
    },
    children: (currentMatchState) => {
      const route = () => router.routesById[currentMatchState().routeId];
      const currentMatch = () => currentMatchState().match;
      const componentKey = () => currentMatchState().key ?? currentMatchState().match.id;
      const out = () => {
        const Comp = route().options.component ?? router.options.defaultComponent;
        if (Comp) {
          return createComponent(Comp, {});
        }
        return createComponent(Outlet, {});
      };
      const getLoadPromise = (matchId, fallbackMatch) => {
        return router.getMatch(matchId)?._nonReactive.loadPromise ?? fallbackMatch?._nonReactive.loadPromise;
      };
      const keyedOut = () => createComponent(Solid.Show, {
        get when() {
          return componentKey();
        },
        keyed: true,
        children: (_key) => out()
      });
      return createComponent(Solid.Switch, {
        get children() {
          return [createComponent(Solid.Match, {
            get when() {
              return currentMatch()._displayPending;
            },
            children: (_) => {
              const [displayPendingResult] = Solid.createResource(() => router.getMatch(currentMatch().id)?._nonReactive.displayPendingPromise);
              return displayPendingResult();
            }
          }), createComponent(Solid.Match, {
            get when() {
              return currentMatch()._forcePending;
            },
            children: (_) => {
              const [minPendingResult] = Solid.createResource(() => router.getMatch(currentMatch().id)?._nonReactive.minPendingPromise);
              return minPendingResult();
            }
          }), createComponent(Solid.Match, {
            get when() {
              return currentMatch().status === "pending";
            },
            children: (_) => {
              const pendingMinMs = route().options.pendingMinMs ?? router.options.defaultPendingMinMs;
              if (pendingMinMs) {
                const routerMatch = router.getMatch(currentMatch().id);
                if (routerMatch && !routerMatch._nonReactive.minPendingPromise) {
                  if (!(isServer ?? router.isServer)) {
                    const minPendingPromise = createControlledPromise();
                    routerMatch._nonReactive.minPendingPromise = minPendingPromise;
                    setTimeout(() => {
                      minPendingPromise.resolve();
                      routerMatch._nonReactive.minPendingPromise = void 0;
                    }, pendingMinMs);
                  }
                }
              }
              const [loaderResult] = Solid.createResource(async () => {
                await new Promise((r) => setTimeout(r, 0));
                return router.getMatch(currentMatch().id)?._nonReactive.loadPromise;
              });
              const FallbackComponent = route().options.pendingComponent ?? router.options.defaultPendingComponent;
              return [FallbackComponent && pendingMinMs > 0 ? createComponent(Dynamic, {
                component: FallbackComponent
              }) : null, loaderResult()];
            }
          }), createComponent(Solid.Match, {
            get when() {
              return currentMatch().status === "notFound";
            },
            children: (_) => {
              if (!isNotFound(currentMatch().error)) {
                invariant();
              }
              return createComponent(Solid.Show, {
                get when() {
                  return currentMatchState().routeId;
                },
                keyed: true,
                children: (_routeId) => renderRouteNotFound(router, route(), currentMatch().error)
              });
            }
          }), createComponent(Solid.Match, {
            get when() {
              return currentMatch().status === "redirected";
            },
            children: (_) => {
              const matchId = currentMatch().id;
              const routerMatch = router.getMatch(matchId);
              if (!isRedirect(currentMatch().error)) {
                invariant();
              }
              const [loaderResult] = Solid.createResource(async () => {
                await new Promise((r) => setTimeout(r, 0));
                return getLoadPromise(matchId, routerMatch);
              });
              return loaderResult();
            }
          }), createComponent(Solid.Match, {
            get when() {
              return currentMatch().status === "error";
            },
            children: (_) => {
              if (isServer ?? router.isServer) {
                const RouteErrorComponent = (route().options.errorComponent ?? router.options.defaultErrorComponent) || ErrorComponent;
                return createComponent(RouteErrorComponent, {
                  get error() {
                    return currentMatch().error;
                  },
                  info: {
                    componentStack: ""
                  }
                });
              }
              throw currentMatch().error;
            }
          }), createComponent(Solid.Match, {
            get when() {
              return currentMatch().status === "success";
            },
            get children() {
              return keyedOut();
            }
          })];
        }
      });
    }
  });
};
const Outlet = () => {
  const router = useRouter();
  const nearestParentMatch = Solid.useContext(nearestMatchContext);
  const parentMatch = nearestParentMatch.match;
  const routeId = nearestParentMatch.routeId;
  const route = Solid.createMemo(() => routeId() ? router.routesById[routeId()] : void 0);
  const parentGlobalNotFound = Solid.createMemo(() => parentMatch()?.globalNotFound ?? false);
  const childMatchId = Solid.createMemo(() => {
    const currentRouteId = routeId();
    return currentRouteId ? router.stores.childMatchIdByRouteId.get()[currentRouteId] : void 0;
  });
  const childMatchStatus = Solid.createMemo(() => {
    const id = childMatchId();
    if (!id) return void 0;
    return router.stores.matchStores.get(id)?.get().status;
  });
  const shouldShowNotFound = () => childMatchStatus() !== "redirected" && parentGlobalNotFound();
  const childRouteKey = Solid.createMemo(() => {
    if (shouldShowNotFound()) return void 0;
    const cid = childMatchId();
    if (!cid) return void 0;
    return router.stores.matchStores.get(cid)?.routeId ?? cid;
  });
  return createComponent(Solid.Show, {
    get when() {
      return childRouteKey();
    },
    keyed: true,
    get fallback() {
      return createComponent(Solid.Show, {
        get when() {
          return shouldShowNotFound() && route();
        },
        children: (resolvedRoute) => renderRouteNotFound(router, resolvedRoute(), void 0)
      });
    },
    children: (_routeKey) => {
      return createComponent(Solid.Show, {
        get when() {
          return routeId() === rootRouteId;
        },
        get fallback() {
          return createComponent(Match, {
            get matchId() {
              return childMatchId();
            }
          });
        },
        get children() {
          return createComponent(Solid.Suspense, {
            get fallback() {
              return createComponent(Dynamic, {
                get component() {
                  return router.options.defaultPendingComponent;
                }
              });
            },
            get children() {
              return createComponent(Match, {
                get matchId() {
                  return childMatchId();
                }
              });
            }
          });
        }
      });
    }
  });
};
function Matches() {
  const router = useRouter();
  const ResolvedSuspense = (isServer ?? router.isServer) || typeof document !== "undefined" && router.ssr ? SafeFragment : Solid.Suspense;
  const rootRoute = () => router.routesById[rootRouteId];
  const PendingComponent = rootRoute().options.pendingComponent ?? router.options.defaultPendingComponent;
  const OptionalWrapper = router.options.InnerWrap || SafeFragment;
  return createComponent(OptionalWrapper, {
    get children() {
      return createComponent(ResolvedSuspense, {
        get fallback() {
          return PendingComponent ? createComponent(PendingComponent, {}) : null;
        },
        get children() {
          return [createComponent(Transitioner, {}), createComponent(MatchesInner, {})];
        }
      });
    }
  });
}
function MatchesInner() {
  const router = useRouter();
  const matchId = () => router.stores.firstId.get();
  const routeId = () => matchId() ? rootRouteId : void 0;
  const match = () => routeId() ? router.stores.getRouteMatchStore(rootRouteId).get() : void 0;
  const hasPendingMatch = () => routeId() ? Boolean(router.stores.pendingRouteIds.get()[rootRouteId]) : false;
  const resetKey = () => router.stores.loadedAt.get();
  const nearestMatch = {
    matchId,
    routeId,
    match,
    hasPending: hasPendingMatch
  };
  const matchComponent = () => {
    return createComponent(Solid.Show, {
      get when() {
        return matchId();
      },
      get children() {
        return createComponent(Match, {
          get matchId() {
            return matchId();
          }
        });
      }
    });
  };
  return createComponent(nearestMatchContext.Provider, {
    value: nearestMatch,
    get children() {
      return router.options.disableGlobalCatchBoundary ? matchComponent() : createComponent(CatchBoundary, {
        getResetKey: () => resetKey(),
        errorComponent: ErrorComponent,
        get onCatch() {
          return void 0;
        },
        get children() {
          return matchComponent();
        }
      });
    }
  });
}
function RouterContextProvider({
  router,
  children,
  ...rest
}) {
  router.update({
    ...router.options,
    ...rest,
    context: {
      ...router.options.context,
      ...rest.context
    }
  });
  const OptionalWrapper = router.options.Wrap || SafeFragment;
  return createComponent(OptionalWrapper, {
    get children() {
      return createComponent(routerContext.Provider, {
        value: router,
        get children() {
          return children();
        }
      });
    }
  });
}
function RouterProvider({
  router,
  ...rest
}) {
  return createComponent(RouterContextProvider, mergeProps({
    router
  }, rest, {
    children: () => createComponent(Matches, {})
  }));
}
function StartServer(props) {
  return createComponent(RouterProvider, { get router() {
    return props.router;
  } });
}
var GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
var globalObj$1 = globalThis;
if (!globalObj$1[GLOBAL_EVENT_STORAGE_KEY]) globalObj$1[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj$1[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") return headersWithSetCookie.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) return;
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) return;
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) response.headers.append("set-cookie", cookie);
  for (const cookie of eventSetCookies) response.headers.append("set-cookie", cookie);
}
function attachResponseHeaders(value, event) {
  if (isPromiseLike(value)) return value.then((resolved) => {
    if (resolved instanceof Response) mergeEventResponseHeaders(resolved, event);
    return resolved;
  });
  if (value instanceof Response) mergeEventResponseHeaders(value, event);
  return value;
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    let h3Event;
    try {
      h3Event = new H3Event(request);
    } catch (error) {
      if (error instanceof URIError) return new Response(null, {
        status: 400,
        statusText: "Bad Request"
      });
      throw error;
    }
    return toResponse(attachResponseHeaders(eventStorage.run({ h3Event }, () => handler(request, requestOpts)), h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return event.h3Event;
}
function setResponseHeader(name, value) {
  const event = getH3Event();
  if (Array.isArray(value)) {
    event.res.headers.delete(name);
    for (const valueItem of value) event.res.headers.append(name, valueItem);
  } else event.res.headers.set(name, value);
}
function getResponse() {
  return getH3Event().res;
}
var HEADERS = { TSS_SHELL: "X-TSS_SHELL" };
async function getStartManifest(matchedRoutes) {
  const { tsrStartManifest } = await import("./assets/_tanstack-start-manifest_v-CkY52tU3.js");
  const startManifest = tsrStartManifest();
  const rootRoute = startManifest.routes[rootRouteId] = startManifest.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  let injectedHeadScripts;
  return {
    manifest: {
      inlineCss: startManifest.inlineCss,
      routes: Object.fromEntries(Object.entries(startManifest.routes).flatMap(([k, v]) => {
        const result = {};
        let hasData = false;
        if (v.preloads && v.preloads.length > 0) {
          result["preloads"] = v.preloads;
          hasData = true;
        }
        if (v.assets && v.assets.length > 0) {
          result["assets"] = v.assets;
          hasData = true;
        }
        if (!hasData) return [];
        return [[k, result]];
      }))
    },
    clientEntry: startManifest.clientEntry,
    injectedHeadScripts
  };
}
const manifest = {
  "252fd4b488f53fdb547474e5fc41e8fa5836a513772ca9ee0e3117a7900e759e": {
    functionName: "signupFn_createServerFn_handler",
    importer: () => import("./assets/auth-CHYyvA0U.js")
  },
  "deefcbf24fb4028b68f2deb974f509c98a02b302caa98e8b686b65b4a2728022": {
    functionName: "loginFn_createServerFn_handler",
    importer: () => import("./assets/auth-CHYyvA0U.js")
  },
  "b9bccd5829435b2cd4e990053eb45c9ce2bf1513efc4f9effc34e4712565ca9b": {
    functionName: "logoutFn_createServerFn_handler",
    importer: () => import("./assets/auth-CHYyvA0U.js")
  },
  "3dd5744e36327c022d9256da0760c404ff0c0512dbf40d0264cc93528fdf153c": {
    functionName: "getSessionUserFn_createServerFn_handler",
    importer: () => import("./assets/auth-CHYyvA0U.js")
  }
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
  if (!fnModule) {
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    throw new Error("Server function module export not resolved for serverFn ID: " + id);
  }
  return action;
}
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
var FrameType = {
  JSON: 0,
  CHUNK: 1,
  END: 2,
  ERROR: 3
};
var FRAME_HEADER_SIZE = 9;
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) if (isSafeKey(key)) result[key] = target[key];
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) if (isSafeKey(key)) result[key] = source[key];
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) if (isSafeKey(key)) obj[key] = source[key];
  return obj;
}
var GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
var globalObj = globalThis;
if (!globalObj[GLOBAL_STORAGE_KEY]) globalObj[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
var startStorage = globalObj[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn) {
  return startStorage.run(context, fn);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return context;
}
var getStartOptions = () => getStartContext().startOptions;
var getStartContextServerOnly = getStartContext;
var createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m) {
          if (m.options.middleware) newMiddleware.push(...m.options.middleware);
        } else newMiddleware.push(m);
      });
      const res2 = createServerFn(void 0, {
        ...resolvedOptions,
        middleware: newMiddleware
      });
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    inputValidator: (inputValidator) => {
      return createServerFn(void 0, {
        ...resolvedOptions,
        inputValidator
      });
    },
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = {
        ...resolvedOptions,
        extractedFn,
        serverFn
      };
      const resolvedMiddleware = [...newOptions.middleware || [], serverFnBaseToMiddleware(newOptions)];
      extractedFn.method = resolvedOptions.method;
      return Object.assign(async (opts) => {
        const result = await executeMiddleware$1(resolvedMiddleware, "client", {
          ...extractedFn,
          ...newOptions,
          data: opts?.data,
          headers: opts?.headers,
          signal: opts?.signal,
          fetch: opts?.fetch,
          context: createNullProtoObject()
        });
        const redirect = parseRedirect(result.error);
        if (redirect) throw redirect;
        if (result.error) throw result.error;
        return result.result;
      }, {
        ...extractedFn,
        method: resolvedOptions.method,
        __executeServer: async (opts) => {
          const startContext = getStartContextServerOnly();
          const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
          return await executeMiddleware$1(resolvedMiddleware, "server", {
            ...extractedFn,
            ...opts,
            serverFnMeta: extractedFn.serverFnMeta,
            context: safeObjectMerge(opts.context, serverContextAfterGlobalMiddlewares),
            request: startContext.request
          }).then((d) => ({
            result: d.result,
            error: d.error,
            context: d.sendContext
          }));
        }
      });
    }
  };
  const fun = (options2) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      ...options2
    });
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env, opts) {
  let flattenedMiddlewares = flattenMiddlewares([...getStartOptions()?.functionMiddleware || [], ...middlewares]);
  if (env === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) flattenedMiddlewares = flattenedMiddlewares.filter((m) => !startContext.executedRequestMiddlewares.has(m));
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) return ctx;
    try {
      if ("inputValidator" in nextMiddleware.options && nextMiddleware.options.inputValidator && env === "server") ctx.data = await execValidator(nextMiddleware.options.inputValidator, ctx.data);
      let middlewareFn = void 0;
      if (env === "client") {
        if ("client" in nextMiddleware.options) middlewareFn = nextMiddleware.options.client;
      } else if ("server" in nextMiddleware.options) middlewareFn = nextMiddleware.options.server;
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const result2 = await callNextMiddleware({
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            _callSiteFetch: ctx._callSiteFetch,
            fetch: ctx._callSiteFetch ?? userCtx.fetch ?? ctx.fetch,
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          });
          if (result2.error) throw result2.error;
          return result2;
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) return {
          ...ctx,
          error: result
        };
        if (result instanceof Response) return {
          ...ctx,
          result
        };
        if (!result) throw new Error("User middleware returned undefined. You must call next() or return a result in your middlewares.");
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error) {
      return {
        ...ctx,
        error
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject(),
    _callSiteFetch: opts.fetch
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) throw new Error(`Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`);
    middleware.forEach((m) => {
      if (m.options.middleware) recurse(m.options.middleware, depth + 1);
      if (!seen.has(m)) {
        seen.add(m);
        flattened.push(m);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) return validator.parse(input);
  if (typeof validator === "function") return validator(input);
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.inputValidator,
      client: async ({ next, sendContext, fetch: fetch2, ...ctx }) => {
        const payload = {
          ...ctx,
          context: sendContext,
          fetch: fetch2
        };
        return next(await options.extractedFn?.(payload));
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
function getDefaultSerovalPlugins() {
  return [...getStartOptions()?.serializationAdapters?.map(makeSerovalPlugin) ?? [], ...defaultSerovalPlugins];
}
var textEncoder = new TextEncoder();
var EMPTY_PAYLOAD = new Uint8Array(0);
function encodeFrame(type, streamId, payload) {
  const frame = new Uint8Array(FRAME_HEADER_SIZE + payload.length);
  frame[0] = type;
  frame[1] = streamId >>> 24 & 255;
  frame[2] = streamId >>> 16 & 255;
  frame[3] = streamId >>> 8 & 255;
  frame[4] = streamId & 255;
  frame[5] = payload.length >>> 24 & 255;
  frame[6] = payload.length >>> 16 & 255;
  frame[7] = payload.length >>> 8 & 255;
  frame[8] = payload.length & 255;
  frame.set(payload, FRAME_HEADER_SIZE);
  return frame;
}
function encodeJSONFrame(json) {
  return encodeFrame(FrameType.JSON, 0, textEncoder.encode(json));
}
function encodeChunkFrame(streamId, chunk) {
  return encodeFrame(FrameType.CHUNK, streamId, chunk);
}
function encodeEndFrame(streamId) {
  return encodeFrame(FrameType.END, streamId, EMPTY_PAYLOAD);
}
function encodeErrorFrame(streamId, error) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return encodeFrame(FrameType.ERROR, streamId, textEncoder.encode(message));
}
function createMultiplexedStream(jsonStream, rawStreams, lateStreamSource) {
  let controller;
  let cancelled = false;
  const readers = [];
  const enqueue = (frame) => {
    if (cancelled) return false;
    try {
      controller.enqueue(frame);
      return true;
    } catch {
      return false;
    }
  };
  const errorOutput = (error) => {
    if (cancelled) return;
    cancelled = true;
    try {
      controller.error(error);
    } catch {
    }
    for (const reader of readers) reader.cancel().catch(() => {
    });
  };
  async function pumpRawStream(streamId, stream) {
    const reader = stream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) {
          enqueue(encodeEndFrame(streamId));
          return;
        }
        if (!enqueue(encodeChunkFrame(streamId, value))) return;
      }
    } catch (error) {
      enqueue(encodeErrorFrame(streamId, error));
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpJSON() {
    const reader = jsonStream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) return;
        if (!enqueue(encodeJSONFrame(value))) return;
      }
    } catch (error) {
      errorOutput(error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpLateStreams() {
    if (!lateStreamSource) return [];
    const lateStreamPumps = [];
    const reader = lateStreamSource.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        lateStreamPumps.push(pumpRawStream(value.id, value.stream));
      }
    } finally {
      reader.releaseLock();
    }
    return lateStreamPumps;
  }
  return new ReadableStream({
    async start(ctrl) {
      controller = ctrl;
      const pumps = [pumpJSON()];
      for (const [streamId, stream] of rawStreams) pumps.push(pumpRawStream(streamId, stream));
      if (lateStreamSource) pumps.push(pumpLateStreams());
      try {
        const latePumps = (await Promise.all(pumps)).find(Array.isArray);
        if (latePumps && latePumps.length > 0) await Promise.all(latePumps);
        if (!cancelled) try {
          controller.close();
        } catch {
        }
      } catch {
      }
    },
    cancel() {
      cancelled = true;
      for (const reader of readers) reader.cancel().catch(() => {
      });
      readers.length = 0;
    }
  });
}
var serovalPlugins = void 0;
var FORM_DATA_CONTENT_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
var MAX_PAYLOAD_SIZE = 1e6;
var handleServerAction = async ({ request, context, serverFnId }) => {
  const methodUpper = request.method.toUpperCase();
  const url = new URL(request.url);
  const action = await getServerFnById(serverFnId);
  if (action.method && methodUpper !== action.method) return new Response(`expected ${action.method} method. Got ${methodUpper}`, {
    status: 405,
    headers: { Allow: action.method }
  });
  const isServerFn = request.headers.get("x-tsr-serverFn") === "true";
  if (!serovalPlugins) serovalPlugins = getDefaultSerovalPlugins();
  const contentType = request.headers.get("Content-Type");
  function parsePayload(payload) {
    return fromJSON(payload, { plugins: serovalPlugins });
  }
  return await (async () => {
    try {
      let serializeResult = function(res2) {
        let nonStreamingBody = void 0;
        const alsResponse = getResponse();
        if (res2 !== void 0) {
          const rawStreams = /* @__PURE__ */ new Map();
          let initialPhase = true;
          let lateStreamWriter;
          let lateStreamReadable = void 0;
          const pendingLateStreams = [];
          const plugins = [createRawStreamRPCPlugin((id, stream) => {
            if (initialPhase) {
              rawStreams.set(id, stream);
              return;
            }
            if (lateStreamWriter) {
              lateStreamWriter.write({
                id,
                stream
              }).catch(() => {
              });
              return;
            }
            pendingLateStreams.push({
              id,
              stream
            });
          }), ...serovalPlugins || []];
          let done = false;
          const callbacks = {
            onParse: (value) => {
              nonStreamingBody = value;
            },
            onDone: () => {
              done = true;
            },
            onError: (error) => {
              throw error;
            }
          };
          toCrossJSONStream(res2, {
            refs: /* @__PURE__ */ new Map(),
            plugins,
            onParse(value) {
              callbacks.onParse(value);
            },
            onDone() {
              callbacks.onDone();
            },
            onError: (error) => {
              callbacks.onError(error);
            }
          });
          initialPhase = false;
          if (done && rawStreams.size === 0) return new Response(nonStreamingBody ? JSON.stringify(nonStreamingBody) : void 0, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": "application/json",
              [X_TSS_SERIALIZED]: "true"
            }
          });
          const { readable, writable } = new TransformStream();
          lateStreamReadable = readable;
          lateStreamWriter = writable.getWriter();
          for (const registration of pendingLateStreams) lateStreamWriter.write(registration).catch(() => {
          });
          pendingLateStreams.length = 0;
          const multiplexedStream = createMultiplexedStream(new ReadableStream({
            start(controller) {
              callbacks.onParse = (value) => {
                controller.enqueue(JSON.stringify(value) + "\n");
              };
              callbacks.onDone = () => {
                try {
                  controller.close();
                } catch {
                }
                lateStreamWriter?.close().catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              callbacks.onError = (error) => {
                controller.error(error);
                lateStreamWriter?.abort(error).catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              if (nonStreamingBody !== void 0) callbacks.onParse(nonStreamingBody);
              if (done) callbacks.onDone();
            },
            cancel() {
              lateStreamWriter?.abort().catch(() => {
              });
              lateStreamWriter = void 0;
            }
          }), rawStreams, lateStreamReadable);
          return new Response(multiplexedStream, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": TSS_CONTENT_TYPE_FRAMED_VERSIONED,
              [X_TSS_SERIALIZED]: "true"
            }
          });
        }
        return new Response(void 0, {
          status: alsResponse.status,
          statusText: alsResponse.statusText
        });
      };
      let res = await (async () => {
        if (FORM_DATA_CONTENT_TYPES.some((type) => contentType && contentType.includes(type))) {
          if (methodUpper === "GET") {
            if (false) ;
            invariant();
          }
          const formData = await request.formData();
          const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
          formData.delete(TSS_FORMDATA_CONTEXT);
          const params = {
            context,
            data: formData,
            method: methodUpper
          };
          if (typeof serializedContext === "string") try {
            const deserializedContext = fromJSON(JSON.parse(serializedContext), { plugins: serovalPlugins });
            if (typeof deserializedContext === "object" && deserializedContext) params.context = safeObjectMerge(deserializedContext, context);
          } catch (e) {
            if (false) ;
          }
          return await action(params);
        }
        if (methodUpper === "GET") {
          const payloadParam = url.searchParams.get("payload");
          if (payloadParam && payloadParam.length > MAX_PAYLOAD_SIZE) throw new Error("Payload too large");
          const payload2 = payloadParam ? parsePayload(JSON.parse(payloadParam)) : {};
          payload2.context = safeObjectMerge(payload2.context, context);
          payload2.method = methodUpper;
          return await action(payload2);
        }
        let jsonPayload;
        if (contentType?.includes("application/json")) jsonPayload = await request.json();
        const payload = jsonPayload ? parsePayload(jsonPayload) : {};
        payload.context = safeObjectMerge(payload.context, context);
        payload.method = methodUpper;
        return await action(payload);
      })();
      const unwrapped = res.result || res.error;
      if (isNotFound(res)) res = isNotFoundResponse(res);
      if (!isServerFn) return unwrapped;
      if (unwrapped instanceof Response) {
        if (isRedirect(unwrapped)) return unwrapped;
        unwrapped.headers.set(X_TSS_RAW_RESPONSE, "true");
        return unwrapped;
      }
      return serializeResult(res);
    } catch (error) {
      if (error instanceof Response) return error;
      if (isNotFound(error)) return isNotFoundResponse(error);
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error);
      console.info();
      const serializedError = JSON.stringify(await Promise.resolve(toCrossJSONAsync(error, {
        refs: /* @__PURE__ */ new Map(),
        plugins: serovalPlugins
      })));
      const response = getResponse();
      return new Response(serializedError, {
        status: response.status ?? 500,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          [X_TSS_SERIALIZED]: "true"
        }
      });
    }
  })();
};
function isNotFoundResponse(error) {
  const { headers, ...rest } = error;
  return new Response(JSON.stringify(rest), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
function normalizeTransformAssetResult(result) {
  if (typeof result === "string") return { href: result };
  return result;
}
function resolveTransformAssetsCrossOrigin(config, kind) {
  if (!config) return void 0;
  if (typeof config === "string") return config;
  return config[kind];
}
function isObjectShorthand(transform) {
  return "prefix" in transform;
}
function resolveTransformAssetsConfig(transform) {
  if (typeof transform === "string") {
    const prefix = transform;
    return {
      type: "transform",
      transformFn: ({ url }) => ({ href: `${prefix}${url}` }),
      cache: true
    };
  }
  if (typeof transform === "function") return {
    type: "transform",
    transformFn: transform,
    cache: true
  };
  if (isObjectShorthand(transform)) {
    const { prefix, crossOrigin } = transform;
    return {
      type: "transform",
      transformFn: ({ url, kind }) => {
        const href = `${prefix}${url}`;
        if (kind === "clientEntry") return { href };
        const co = resolveTransformAssetsCrossOrigin(crossOrigin, kind);
        return co ? {
          href,
          crossOrigin: co
        } : { href };
      },
      cache: true
    };
  }
  if ("createTransform" in transform && transform.createTransform) return {
    type: "createTransform",
    createTransform: transform.createTransform,
    cache: transform.cache !== false
  };
  return {
    type: "transform",
    transformFn: typeof transform.transform === "string" ? (({ url }) => ({ href: `${transform.transform}${url}` })) : transform.transform,
    cache: transform.cache !== false
  };
}
function adaptTransformAssetUrlsToTransformAssets(transformFn) {
  return async ({ url, kind }) => ({ href: await transformFn({
    url,
    type: kind
  }) });
}
function adaptTransformAssetUrlsConfigToTransformAssets(transform) {
  if (typeof transform === "string") return transform;
  if (typeof transform === "function") return adaptTransformAssetUrlsToTransformAssets(transform);
  if ("createTransform" in transform && transform.createTransform) return {
    createTransform: async (ctx) => adaptTransformAssetUrlsToTransformAssets(await transform.createTransform(ctx)),
    cache: transform.cache,
    warmup: transform.warmup
  };
  return {
    transform: typeof transform.transform === "string" ? transform.transform : adaptTransformAssetUrlsToTransformAssets(transform.transform),
    cache: transform.cache,
    warmup: transform.warmup
  };
}
function buildClientEntryScriptTag(clientEntry, injectedHeadScripts) {
  let script = `import(${JSON.stringify(clientEntry)})`;
  if (injectedHeadScripts) script = `${injectedHeadScripts};${script}`;
  return {
    tag: "script",
    attrs: {
      type: "module",
      async: true
    },
    children: script
  };
}
function assignManifestAssetLink(link, next) {
  if (typeof link === "string") return next.crossOrigin ? next : next.href;
  return next.crossOrigin ? next : { href: next.href };
}
async function transformManifestAssets(source, transformFn, _opts) {
  const manifest2 = structuredClone(source.manifest);
  for (const route of Object.values(manifest2.routes)) {
    if (route.preloads) route.preloads = await Promise.all(route.preloads.map(async (link) => {
      const result = normalizeTransformAssetResult(await transformFn({
        url: resolveManifestAssetLink(link).href,
        kind: "modulepreload"
      }));
      return assignManifestAssetLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.assets && !source.manifest.inlineCss) {
      for (const asset of route.assets) if (asset.tag === "link" && asset.attrs?.href) {
        const rel = asset.attrs.rel;
        if (!(typeof rel === "string" ? rel.split(/\s+/) : []).includes("stylesheet")) continue;
        const result = normalizeTransformAssetResult(await transformFn({
          url: asset.attrs.href,
          kind: "stylesheet"
        }));
        asset.attrs.href = result.href;
        if (result.crossOrigin) asset.attrs.crossOrigin = result.crossOrigin;
        else delete asset.attrs.crossOrigin;
      }
    }
  }
  const transformedClientEntry = normalizeTransformAssetResult(await transformFn({
    url: source.clientEntry,
    kind: "clientEntry"
  }));
  const rootRoute = manifest2.routes[rootRouteId] = manifest2.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  rootRoute.assets.push(buildClientEntryScriptTag(transformedClientEntry.href, source.injectedHeadScripts));
  return manifest2;
}
function buildManifestWithClientEntry(source) {
  const scriptTag = buildClientEntryScriptTag(source.clientEntry, source.injectedHeadScripts);
  const baseRootRoute = source.manifest.routes[rootRouteId];
  const routes = {
    ...source.manifest.routes,
    [rootRouteId]: {
      ...baseRootRoute,
      assets: [...baseRootRoute?.assets || [], scriptTag]
    }
  };
  return {
    inlineCss: source.manifest.inlineCss,
    routes
  };
}
var ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v) => {
    if (typeof v !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v)) return false;
    return !!v[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ serverFnMeta }) => ({ functionId: serverFnMeta.id }),
  fromSerializable: ({ functionId }) => {
    const fn = async (opts, signal) => {
      return (await (await getServerFnById(functionId))(opts ?? {}, signal)).result;
    };
    return fn;
  }
});
function getStartResponseHeaders(opts) {
  return mergeHeaders({ "Content-Type": "text/html; charset=utf-8" }, ...opts.router.stores.matches.get().map((match) => {
    return match.headers;
  }));
}
var entriesPromise;
var baseManifestPromise;
var cachedFinalManifestPromise;
async function loadEntries() {
  const [routerEntry, startEntry, pluginAdapters] = await Promise.all([
    import("./assets/router-DxDg68cn.js").then((n) => n.r),
    import("./assets/start-HYkvq4Ni.js"),
    import("./assets/__23tanstack-start-plugin-adapters-Cwee5PKy.js")
  ]);
  return {
    routerEntry,
    startEntry,
    pluginAdapters
  };
}
function getEntries() {
  if (!entriesPromise) entriesPromise = loadEntries();
  return entriesPromise;
}
function getBaseManifest(matchedRoutes) {
  if (!baseManifestPromise) baseManifestPromise = getStartManifest();
  return baseManifestPromise;
}
async function resolveManifest(matchedRoutes, transformFn, cache) {
  const base = await getBaseManifest();
  const computeFinalManifest = async () => {
    return transformFn ? await transformManifestAssets(base, transformFn) : buildManifestWithClientEntry(base);
  };
  if (!transformFn || cache) {
    if (!cachedFinalManifestPromise) cachedFinalManifestPromise = computeFinalManifest();
    return cachedFinalManifestPromise;
  }
  return computeFinalManifest();
}
var ROUTER_BASEPATH = "/";
var SERVER_FN_BASE = "/_serverFn/";
var IS_PRERENDERING = process.env.TSS_PRERENDERING === "true";
var IS_SHELL_ENV = process.env.TSS_SHELL === "true";
var ERR_NO_RESPONSE = "Internal Server Error";
var ERR_NO_DEFER = "Internal Server Error";
function throwRouteHandlerError() {
  throw new Error(ERR_NO_RESPONSE);
}
function throwIfMayNotDefer() {
  throw new Error(ERR_NO_DEFER);
}
function isSpecialResponse(value) {
  return value instanceof Response || isRedirect(value);
}
function handleCtxResult(result) {
  if (isSpecialResponse(result)) return { response: result };
  return result;
}
function executeMiddleware(middlewares, ctx) {
  let index = -1;
  const next = async (nextCtx) => {
    if (nextCtx) {
      if (nextCtx.context) ctx.context = safeObjectMerge(ctx.context, nextCtx.context);
      for (const key of Object.keys(nextCtx)) if (key !== "context") ctx[key] = nextCtx[key];
    }
    index++;
    const middleware = middlewares[index];
    if (!middleware) return ctx;
    let result;
    try {
      result = await middleware({
        ...ctx,
        next
      });
    } catch (err) {
      if (isSpecialResponse(err)) {
        ctx.response = err;
        return ctx;
      }
      throw err;
    }
    const normalized = handleCtxResult(result);
    if (normalized) {
      if (normalized.response !== void 0) ctx.response = normalized.response;
      if (normalized.context) ctx.context = safeObjectMerge(ctx.context, normalized.context);
    }
    return ctx;
  };
  return next();
}
function handlerToMiddleware(handler, mayDefer = false) {
  if (mayDefer) return handler;
  return async (ctx) => {
    const response = await handler({
      ...ctx,
      next: throwIfMayNotDefer
    });
    if (!response) throwRouteHandlerError();
    return response;
  };
}
function createStartHandler(cbOrOptions) {
  const cb = typeof cbOrOptions === "function" ? cbOrOptions : cbOrOptions.handler;
  const transformAssetsOption = typeof cbOrOptions === "function" ? void 0 : cbOrOptions.transformAssets;
  const transformAssetUrlsOption = typeof cbOrOptions === "function" ? void 0 : cbOrOptions.transformAssetUrls;
  const transformOption = transformAssetsOption !== void 0 ? resolveTransformAssetsConfig(transformAssetsOption) : transformAssetUrlsOption !== void 0 ? resolveTransformAssetsConfig(adaptTransformAssetUrlsConfigToTransformAssets(transformAssetUrlsOption)) : void 0;
  const warmupTransformManifest = !!transformAssetsOption && typeof transformAssetsOption === "object" && "warmup" in transformAssetsOption && transformAssetsOption.warmup === true || !!transformAssetUrlsOption && typeof transformAssetUrlsOption === "object" && transformAssetUrlsOption.warmup === true;
  const resolvedTransformConfig = transformOption;
  const cache = resolvedTransformConfig ? resolvedTransformConfig.cache : true;
  const shouldCacheCreateTransform = cache && true;
  let cachedCreateTransformPromise;
  const getTransformFn = async (opts) => {
    if (!resolvedTransformConfig) return void 0;
    if (resolvedTransformConfig.type === "createTransform") {
      if (shouldCacheCreateTransform) {
        if (!cachedCreateTransformPromise) cachedCreateTransformPromise = Promise.resolve(resolvedTransformConfig.createTransform(opts)).catch((error) => {
          cachedCreateTransformPromise = void 0;
          throw error;
        });
        return cachedCreateTransformPromise;
      }
      return resolvedTransformConfig.createTransform(opts);
    }
    return resolvedTransformConfig.transformFn;
  };
  if (warmupTransformManifest && cache && true && !cachedFinalManifestPromise) {
    const warmupPromise = (async () => {
      const base = await getBaseManifest();
      const transformFn = await getTransformFn({ warmup: true });
      return transformFn ? await transformManifestAssets(base, transformFn) : buildManifestWithClientEntry(base);
    })();
    cachedFinalManifestPromise = warmupPromise;
    warmupPromise.catch(() => {
      if (cachedFinalManifestPromise === warmupPromise) cachedFinalManifestPromise = void 0;
      cachedCreateTransformPromise = void 0;
    });
  }
  const startRequestResolver = async (request, requestOpts) => {
    let router = null;
    let cbWillCleanup = false;
    try {
      const { url, handledProtocolRelativeURL } = getNormalizedURL(request.url);
      const href = url.pathname + url.search + url.hash;
      const origin = getOrigin(request);
      if (handledProtocolRelativeURL) return Response.redirect(url, 308);
      const entries = await getEntries();
      const startOptions = await entries.startEntry.startInstance?.getOptions() || {};
      const { hasPluginAdapters, pluginSerializationAdapters } = entries.pluginAdapters;
      const serializationAdapters = [
        ...startOptions.serializationAdapters || [],
        ...hasPluginAdapters ? pluginSerializationAdapters : [],
        ServerFunctionSerializationAdapter
      ];
      const requestStartOptions = {
        ...startOptions,
        serializationAdapters
      };
      const flattenedRequestMiddlewares = startOptions.requestMiddleware ? flattenMiddlewares(startOptions.requestMiddleware) : [];
      const executedRequestMiddlewares = new Set(flattenedRequestMiddlewares);
      const getRouter = async () => {
        if (router) return router;
        router = await entries.routerEntry.getRouter();
        let isShell = IS_SHELL_ENV;
        if (IS_PRERENDERING && !isShell) isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
        const history = createMemoryHistory({ initialEntries: [href] });
        router.update({
          history,
          isShell,
          isPrerendering: IS_PRERENDERING,
          origin: router.options.origin ?? origin,
          defaultSsr: requestStartOptions.defaultSsr,
          serializationAdapters: [...requestStartOptions.serializationAdapters, ...router.options.serializationAdapters || []],
          basepath: ROUTER_BASEPATH
        });
        return router;
      };
      if (SERVER_FN_BASE && url.pathname.startsWith(SERVER_FN_BASE)) {
        const serverFnId = url.pathname.slice(SERVER_FN_BASE.length).split("/")[0];
        if (!serverFnId) throw new Error("Invalid server action param for serverFnId");
        const serverFnHandler = async ({ context }) => {
          return runWithStartContext({
            getRouter,
            startOptions: requestStartOptions,
            contextAfterGlobalMiddlewares: context,
            request,
            executedRequestMiddlewares,
            handlerType: "serverFn"
          }, () => handleServerAction({
            request,
            context: requestOpts?.context,
            serverFnId
          }));
        };
        return handleRedirectResponse((await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), serverFnHandler], {
          request,
          pathname: url.pathname,
          context: createNullProtoObject(requestOpts?.context)
        })).response, request, getRouter);
      }
      const executeRouter = async (serverContext, matchedRoutes) => {
        const acceptParts = (request.headers.get("Accept") || "*/*").split(",");
        if (!["*/*", "text/html"].some((mimeType) => acceptParts.some((part) => part.trim().startsWith(mimeType)))) return Response.json({ error: "Only HTML requests are supported here" }, { status: 500 });
        const manifest2 = await resolveManifest(matchedRoutes, await getTransformFn({
          warmup: false,
          request
        }), cache);
        const routerInstance = await getRouter();
        attachRouterServerSsrUtils({
          router: routerInstance,
          manifest: manifest2,
          getRequestAssets: () => getStartContext({ throwIfNotFound: false })?.requestAssets,
          includeUnmatchedRouteAssets: false
        });
        routerInstance.update({ additionalContext: { serverContext } });
        await routerInstance.load();
        if (routerInstance.state.redirect) return routerInstance.state.redirect;
        const ctx = getStartContext({ throwIfNotFound: false });
        await routerInstance.serverSsr.dehydrate({ requestAssets: ctx?.requestAssets });
        const responseHeaders = getStartResponseHeaders({ router: routerInstance });
        cbWillCleanup = true;
        return cb({
          request,
          router: routerInstance,
          responseHeaders
        });
      };
      const requestHandlerMiddleware = async ({ context }) => {
        return runWithStartContext({
          getRouter,
          startOptions: requestStartOptions,
          contextAfterGlobalMiddlewares: context,
          request,
          executedRequestMiddlewares,
          handlerType: "router"
        }, async () => {
          try {
            return await handleServerRoutes({
              getRouter,
              request,
              url,
              executeRouter,
              context,
              executedRequestMiddlewares
            });
          } catch (err) {
            if (err instanceof Response) return err;
            throw err;
          }
        });
      };
      return handleRedirectResponse((await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), requestHandlerMiddleware], {
        request,
        pathname: url.pathname,
        context: createNullProtoObject(requestOpts?.context)
      })).response, request, getRouter);
    } finally {
      if (router && !cbWillCleanup) router.serverSsr?.cleanup();
      router = null;
    }
  };
  return requestHandler(startRequestResolver);
}
async function handleRedirectResponse(response, request, getRouter) {
  if (!isRedirect(response)) return response;
  if (isResolvedRedirect(response)) {
    if (request.headers.get("x-tsr-serverFn") === "true") return Response.json({
      ...response.options,
      isSerializedRedirect: true
    }, { headers: response.headers });
    return response;
  }
  const opts = response.options;
  if (opts.to && typeof opts.to === "string" && !opts.to.startsWith("/")) throw new Error(`Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(opts)}`);
  if ([
    "params",
    "search",
    "hash"
  ].some((d) => typeof opts[d] === "function")) throw new Error(`Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(opts).filter((d) => typeof opts[d] === "function").map((d) => `"${d}"`).join(", ")}`);
  const redirect = (await getRouter()).resolveRedirect(response);
  if (request.headers.get("x-tsr-serverFn") === "true") return Response.json({
    ...response.options,
    isSerializedRedirect: true
  }, { headers: response.headers });
  return redirect;
}
async function handleServerRoutes({ getRouter, request, url, executeRouter, context, executedRequestMiddlewares }) {
  const router = await getRouter();
  const pathname = executeRewriteInput(router.rewrite, url).pathname;
  const { matchedRoutes, foundRoute, routeParams } = router.getMatchedRoutes(pathname);
  const isExactMatch = foundRoute && routeParams["**"] === void 0;
  const routeMiddlewares = [];
  for (const route of matchedRoutes) {
    const serverMiddleware = route.options.server?.middleware;
    if (serverMiddleware) {
      const flattened = flattenMiddlewares(serverMiddleware);
      for (const m of flattened) if (!executedRequestMiddlewares.has(m)) routeMiddlewares.push(m.options.server);
    }
  }
  const server2 = foundRoute?.options.server;
  if (server2?.handlers && isExactMatch) {
    const handlers = typeof server2.handlers === "function" ? server2.handlers({ createHandlers: (d) => d }) : server2.handlers;
    const handler = handlers[request.method.toUpperCase()] ?? handlers["ANY"];
    if (handler) {
      const mayDefer = !!foundRoute.options.component;
      if (typeof handler === "function") routeMiddlewares.push(handlerToMiddleware(handler, mayDefer));
      else {
        if (handler.middleware?.length) {
          const handlerMiddlewares = flattenMiddlewares(handler.middleware);
          for (const m of handlerMiddlewares) routeMiddlewares.push(m.options.server);
        }
        if (handler.handler) routeMiddlewares.push(handlerToMiddleware(handler.handler, mayDefer));
      }
    }
  }
  routeMiddlewares.push((ctx) => executeRouter(ctx.context, matchedRoutes));
  return (await executeMiddleware(routeMiddlewares, {
    request,
    context,
    params: routeParams,
    pathname
  })).response;
}
const renderRouterToStream = async ({
  request,
  router,
  responseHeaders,
  children
}) => {
  const {
    writable,
    readable
  } = new TransformStream();
  const docType = Solid$1.ssr("<!DOCTYPE html>");
  const serializationAdapters = router.options?.serializationAdapters || router.options.ssr?.serializationAdapters;
  const serovalPlugins2 = serializationAdapters?.map((adapter) => {
    const plugin = makeSsrSerovalPlugin(adapter, {
      didRun: false
    });
    return plugin;
  });
  const stream = Solid$1.renderToStream(() => [docType, children()], {
    nonce: router.options.ssr?.nonce,
    plugins: serovalPlugins2
  });
  if (isbot(request.headers.get("User-Agent"))) {
    await stream;
  }
  stream.pipeTo(writable);
  const responseStream = transformReadableStreamWithRouter(router, readable);
  return new Response(responseStream, {
    status: router.stores.statusCode.get(),
    headers: responseHeaders
  });
};
var defaultStreamHandler = defineHandlerCallback(async ({ request, router, responseHeaders }) => await renderRouterToStream({
  request,
  router,
  responseHeaders,
  children: () => createComponent(StartServer, { router })
}));
const fetch = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
  return {
    async fetch(...args) {
      return await entry.fetch(...args);
    }
  };
}
const server = createServerEntry({ fetch });
export {
  Outlet as O,
  TSS_SERVER_FUNCTION as T,
  createServerFn as c,
  createServerEntry,
  server as default,
  getServerFnById as g,
  nearestMatchContext as n,
  setResponseHeader as s,
  useRouter as u
};
