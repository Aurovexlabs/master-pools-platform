/**
 * MasterPools service worker.
 *
 * Rule: the app shell must never be served stale. Scripts and styles are
 * network-first so a new deploy can never pair an old cached bundle with a new
 * index.html — that mismatch is what produces a permanently blank page.
 *
 * Bump CACHE_VERSION whenever caching behaviour changes; old caches are dropped
 * on activate.
 */
const CACHE_VERSION = "v2.0.0";
const SHELL_CACHE = `masterpools-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `masterpools-runtime-${CACHE_VERSION}`;

/** Only the offline fallback shell is precached. Never JS/CSS. */
const SHELL_ASSETS = [
  "/favicon.svg",
  "/manifest.webmanifest",
  "/images/logo.jpeg",
  "/images/avatar-placeholder.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("masterpools-shell-") ||
                key.startsWith("masterpools-runtime-"),
            )
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const { request } = event;
  const url = new URL(request.url);

  // Never intercept API or socket traffic.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) {
    return;
  }

  // Navigations: network first, fall back to cache, then to the cached root.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put("/", copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = (await caches.match(request)) || (await caches.match("/"));
          return (
            cached ||
            new Response(
              "<!doctype html><meta charset=utf-8><title>Offline</title><p>You are offline. Reconnect and reload to continue.</p>",
              { headers: { "Content-Type": "text/html; charset=utf-8" } },
            )
          );
        }),
    );
    return;
  }

  // Scripts and styles: network first so a build is never stale, cache as fallback.
  if (request.destination === "script" || request.destination === "style") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, copy))
              .catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return Response.error();
        }),
    );
    return;
  }

  // Images and media: stale-while-revalidate is safe because filenames are stable.
  const isMediaRequest =
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "video" ||
    /\.(?:avif|bmp|gif|ico|jpeg|jpg|png|svg|webp|mp4|mov|webm|woff2?)$/i.test(
      url.pathname,
    );

  if (isMediaRequest) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request, { ignoreSearch: true });

        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              cache.put(request, response.clone()).catch(() => {});
            }
            return response;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(network);
          return cached;
        }

        const response = await network;
        return response || Response.error();
      }),
    );
  }
});
