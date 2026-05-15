// HOC-OES Service Worker — offline cache
const CACHE = 'hoc-oes-v4';
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
];

// Install: cache all shell files
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

// Activate: clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for shell, network-first for others
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => cached || new Response('Offline', { status: 503 }));
    })
  );
});
