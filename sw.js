// Service worker : l'appli s'ouvre même sans réseau. Les échanges avec la base (supabase.co) ne sont jamais mis en cache.
const V = "dgxa-v12";
const CORE = ["./", "index.html", "manifest.webmanifest", "logo.png", "favicon.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png",
  "barlow-latin-400-normal.woff2", "barlow-latin-500-normal.woff2", "barlow-latin-600-normal.woff2", "barlow-condensed-latin-600-normal.woff2", "barlow-condensed-latin-700-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put("index.html", c)); return res; }).catch(() => caches.match("index.html")));
    return;
  }
  if (u.origin === location.origin || u.hostname === "cdn.jsdelivr.net") {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })));
  }
});
