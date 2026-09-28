// 考公学习离线缓存：首屏壳秒开（题库 defer 外置），首次打开后台预缓存全部资源，之后彻底离线
var CACHE = "xingce-quiz-v3.22.0";
var ASSETS = ["./", "./index.html", "./app.js?v=3.22.0", "./data/knowledge.js?v=3.22.0", "./data/questions-changshi.js?v=3.22.0", "./data/questions-yanyu.js?v=3.22.0", "./data/questions-shuliang.js?v=3.22.0", "./data/questions-panduan.js?v=3.22.0", "./data/questions-figure-2223.js?v=3.22.0", "./data/questions-ziliao.js?v=3.22.0", "./data/questions-2015.js?v=3.22.0", "./data/questions-2016.js?v=3.22.0", "./data/questions-2017.js?v=3.22.0", "./data/questions-2018.js?v=3.22.0", "./data/questions-2019.js?v=3.22.0", "./data/questions-2020.js?v=3.22.0", "./data/questions-2021.js?v=3.22.0", "./data/questions-2025.js?v=3.22.0", "./data/questions-2024b.js?v=3.22.0", "./data/questions-tianjin.js?v=3.22.0", "./data/questions-tj2021.js?v=3.22.0", "./data/questions-tj2022.js?v=3.22.0", "./data/questions-tj2023.js?v=3.22.0", "./data/questions-tj2024.js?v=3.22.0", "./data/questions-tj2025b.js?v=3.22.0", "./data/questions-gk2025b.js?v=3.22.0", "./data/questions-gk2019-2021b.js?v=3.22.0", "./data/questions-gk-ziliao-b.js?v=3.22.0", "./data/questions-shenlun.js?v=3.22.0", "./data/questions-xz-gk-cs.js?v=3.22.0", "./data/questions-xz-tj-cs.js?v=3.22.0", "./data/questions-xz-jl-cs.js?v=3.22.0", "./data/questions-xz-gk-yy.js?v=3.22.0", "./data/questions-xz-tj-yy.js?v=3.22.0", "./data/questions-xz-jl-yy.js?v=3.22.0", "./data/questions-xz-gk-sl.js?v=3.22.0", "./data/questions-xz-tj-sl.js?v=3.22.0", "./data/questions-xz-jl-sl.js?v=3.22.0", "./data/questions-xz-gk-pd.js?v=3.22.0", "./data/questions-xz-tj-pd.js?v=3.22.0", "./data/questions-xz-jl-pd.js?v=3.22.0", "./data/questions-xz-gk-zl.js?v=3.22.0", "./data/questions-xz-tj-zl.js?v=3.22.0", "./data/questions-xz-jl-zl.js?v=3.22.0", "./data/questions-shenlun-gkfs.js?v=3.22.0", "./data/questions-shenlun-gkds.js?v=3.22.0", "./data/questions-shenlun-gkzf.js?v=3.22.0", "./data/questions-shenlun-tj.js?v=3.22.0", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./splash-750x1334.png", "./splash-1125x2436.png", "./splash-1170x2532.png", "./splash-1179x2556.png", "./splash-1284x2778.png", "./splash-1290x2796.png", "./splash-2048x2732.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    // 逐个缓存、单个失败不阻塞（弱网下装一半也保住已下载的，下次继续补）
    return Promise.all(ASSETS.map(function (u) {
      return c.add(new Request(u, { cache: "reload" })).catch(function (err) {
        console.warn("[sw] 缓存失败，稍后重试:", u, err && err.message);
      });
    }));
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
  // 页面导航请求：限时 network-first——4 秒内网络没响应就先用缓存版（秒开，后台继续刷新）；
  // 完全离线/无缓存才白等。修复弱网下 10MB 主文档下载挂起导致白屏「进不去」。
  // 其余静态资源保持 cache-first（单文件版主资源只有 index.html）
  if (e.request.mode === "navigate") {
    e.respondWith(
      Promise.race([
        fetch(e.request).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          return res;
        }).catch(function () { throw new Error("offline"); }),
        new Promise(function (resolve, reject) {
          setTimeout(function () { reject(new Error("timeout")); }, 4000);
        })
      ]).catch(function () {
        return caches.match(e.request).then(function (hit) {
          if (hit) return hit;
          return caches.match("./index.html").then(function (h2) {
            if (h2) return h2;
            // 无缓存（首次访问）：只能等网络，不再限时
            return fetch(e.request).catch(function () { throw new Error("offline-and-no-cache"); });
          });
        });
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
