/* Service Worker – מדריד, מידע למטייל */
const VER='madrid-guide-20261116-01';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url);
  // תמונות ומפות – מטמון תוך כדי שימוש (stale-while-revalidate)
  if(/wikimedia\.org|openstreetmap\.org/.test(u.host)){
    e.respondWith(caches.open(VER+'-media').then(async c=>{const hit=await c.match(req);const net=fetch(req).then(r=>{if(r.ok||r.type==='opaque')c.put(req,r.clone());return r}).catch(()=>hit);return hit||net}));return;
  }
  if(u.origin===location.origin){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(VER).then(c=>c.put(req,cp));return r}).catch(()=>caches.match(req).then(h=>h||caches.match('index.html'))));
  }
});
