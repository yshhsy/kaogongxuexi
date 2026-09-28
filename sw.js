// 考公学习离线缓存：首次打开缓存全部资源，之后无网可用
var CACHE = "xingce-quiz-v3.21.0";
var ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./splash-750x1334.png", "./splash-1125x2436.png", "./splash-1170x2532.png", "./splash-1179x2556.png", "./splash-1284x2778.png", "./splash-1290x2796.png", "./splash-2048x2732.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(ASSETS.map(function (u) { return c.add(new Request(u, { cache: "reload" })); }));
  }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  // 页面导航请求 network-first：有网必拉最新版（重新部署后下次打开即新），离线才回退缓存；
  // 其余静态资源保持 cache-first（单文件版主资源只有 index.html）
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (hit) { return hit || caches.match("./index.html"); });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});
