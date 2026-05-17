// HOC-OES Service Worker — network-first for HTML so updates land immediately
// Bump CACHE version any time you redeploy and want browsers to pick up changes.
const CACHE = 'hoc-oes-v5.1-20260517';
const SHELL = [
  './index.html',
  './manifest.json',
  './HOC_Data_Upload_Hub.html',
  './HOC_PreWeigh_Scheduler.html',
  './HOC_Compound_Scheduler_v3.html',
  './HOC_Compound_Coordinator.html',
  './HOC_Quality_Lab.html',
  './HOC_Event_Engine.html',
  './HOC_Production_Coordinator.html',
  './HOC_Production_Schedule.html',
  './HOC_Production_Supervisor.html',
  './HOC_FG_Reconciliation.html',
  './HOC_Warehouse_Movement.html',
  './HOC_Procurement_Dashboard.html',
  './HOC_Demand_Planning_Hub.html',
  './HOC_Schedule_Reforecast.html',
  './HOC_Continuous_Improvement.html',
  './HOC_Leadership_Control_Tower.html',
  './HOC_Maintenance_Dashboard.html',
  './HOC_Gemba_Tracker.html',
  './HOC_Roll_Call.html',
  './HOC_5S_Connected.html',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.allSettled(SHELL.map(url =>
        c.add(url).catch(() => console.log('Cache miss:', url))
      ));
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// NETWORK-FIRST for HTML (updates land immediately), cache-first for other assets
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isHTML = url.pathname.endsWith('.html') ||
                 url.pathname.endsWith('/') ||
                 e.request.mode === 'navigate' ||
                 (e.request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match(e.request).then(cached =>
        cached || new Response('Offline — no cached copy', { status: 503 })
      ))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return response;
        }).catch(() => new Response('Offline', { status: 503 }));
      })
    );
  }
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
