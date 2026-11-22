// OviLink – marche sans Internet.
// La page est gardée dans le téléphone. Avec du réseau, on prend toujours la dernière version mise sur GitHub ;
// sans réseau, on ouvre la copie gardée. Les données du troupeau ne passent jamais par ici (elles restent dans le téléphone).
const CACHE='ovilink-v3';
const BASE=['./','./index.html','./rationneur.html','./manifest.webmanifest','./icone-192.png','./icone-512.png','./icone-512-maskable.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  // page de l'appli : réseau d'abord (pour les mises à jour), sinon la copie gardée
  // KEENAN (rationneur.html, ouvert dans OviLink) : pareil, réseau d'abord, gardé sous son propre nom
  if(u.origin===location.origin&&/\/rationneur\.html$/.test(u.pathname)){
    e.respondWith(fetch(r).then(rep=>{const c=rep.clone(); caches.open(CACHE).then(k=>k.put('./rationneur.html',c)); return rep}).catch(()=>caches.match('./rationneur.html')));
    return}
  if(r.mode==='navigate'||(u.origin===location.origin&&/\/(index\.html)?$/.test(u.pathname))){
    e.respondWith(fetch(r).then(rep=>{const c=rep.clone(); caches.open(CACHE).then(k=>k.put('./index.html',c)); return rep}).catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));
    return}
  // icônes, manifeste, polices : la copie gardée d'abord, sinon le réseau (et on garde une copie)
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(rep=>{ if(rep&&(rep.ok||rep.type==='opaque')){const c=rep.clone(); caches.open(CACHE).then(k=>k.put(r,c))} return rep}).catch(()=>m)))});
