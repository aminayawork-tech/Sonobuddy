// SonoBuddy Service Worker
// Handles push notifications, offline app shell caching, and image caching

const CACHE_NAME = 'sonobuddy-shell-v3';
const IMAGE_CACHE = 'sonobuddy-images-v2';

// App shell pages to pre-cache so the app works offline
const APP_SHELL_PAGES = [
  '/home',
  '/measurements',
  '/protocols',
  '/calculators',
  '/pathologies',
];

// All pathology images — exact filenames from public/pathologies/
// (cache-first: served offline after first load)
const PATHOLOGY_IMAGES = [
  "/pathologies/Acute_cholecystitis.jpg",
  "/pathologies/Acute_cholecystitis2.png",
  "/pathologies/Aortic_stenosis.JPG",
  "/pathologies/Aortic_stenosis_2.JPG",
  "/pathologies/Haemorrhagic_ovarian_cyst_ultrasound.jpg",
  "/pathologies/Papillary_Thyroid_carcinoma_Ultrasound2.jpg",
  "/pathologies/Papillary_Thyroid_carcinoma_Ultrasound_37F_20160005.jpg",
  "/pathologies/Rotator_cuff_tear.jpg",
  "/pathologies/abdominal_aortic_aneurysm.jpg",
  "/pathologies/abdominal_aortic_aneurysm_2.png",
  "/pathologies/acute_appendicitis.png",
  "/pathologies/acute_cholecystitis2.png",
  "/pathologies/adenomyosis.jpg",
  "/pathologies/arterial_pseudoaneurysm.png",
  "/pathologies/arterial_pseudoaneurysm_2.png",
  "/pathologies/bakers_cyst.jpg",
  "/pathologies/bakers_cyst_2.png",
  "/pathologies/bakers_cyst_3.png",
  "/pathologies/blue_toe_syndrome.png",
  "/pathologies/choledocholithiasis.jpg",
  "/pathologies/deep_vein_thrombosis.jpg",
  "/pathologies/deep_vein_thrombosis.png",
  "/pathologies/deep_vein_thrombosis2.png",
  "/pathologies/deep_vein_thrombosis_2.png",
  "/pathologies/deep_vein_thrombosis_3.png",
  "/pathologies/hemorrhagic_effusion_2.jpg",
  "/pathologies/hepatic_hemangioma.jpg",
  "/pathologies/hydronephrosis.jpg",
  "/pathologies/hydronephrosis_2.jpg",
  "/pathologies/hydronephrosis_3.jpg",
  "/pathologies/liver_cirrhosis.jpg",
  "/pathologies/ovarian_cyst_2.png",
  "/pathologies/papillary_thyroid_carcinoma.png",
  "/pathologies/papillary_thyroid_carcinoma_2.png",
  "/pathologies/parathyroid_ademoma.jpg",
  "/pathologies/parathyroid_adenoma_2.jpg",
  "/pathologies/parathyroid_adenoma_3.jpg",
  "/pathologies/pericardial_effusion.PNG",
  "/pathologies/placental_abruption.jpg",
  "/pathologies/polycystic_ovaries_syndrome.png",
  "/pathologies/portal_hypertension.jpg",
  "/pathologies/renal_artery_stenosis.png",
  "/pathologies/renal_artery_stenosis_2.png",
  "/pathologies/renal_cyst.jpg",
  "/pathologies/renal_cyst_2.jpg",
  "/pathologies/renal_cyst_3.jpg",
  "/pathologies/renal_cyst_4.jpg",
  "/pathologies/rotator_cuff_tear_2.jpg",
  "/pathologies/splenic_infarct.png",
  "/pathologies/subclavian_steal_syndrome.png",
  "/pathologies/testicular_torsion.jpg",
  "/pathologies/testicular_torsion_2.jpg",
  "/pathologies/uterine_fibroid_2.png",
  "/pathologies/uterine_fibroids.png",
];

// PWA icons to also cache
const ICON_ASSETS = [
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    Promise.all([
      // Cache app shell pages
      caches.open(CACHE_NAME).then((cache) => {
        return Promise.allSettled(
          APP_SHELL_PAGES.map((url) =>
            fetch(url, { credentials: 'same-origin' })
              .then((response) => {
                if (response.ok) return cache.put(url, response);
              })
              .catch(() => {})
          )
        );
      }),
      // Cache images
      caches.open(IMAGE_CACHE).then((cache) => {
        const allAssets = [...PATHOLOGY_IMAGES, ...ICON_ASSETS];
        return Promise.allSettled(
          allAssets.map((path) => cache.add(path).catch(() => {}))
        );
      }),
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Remove outdated cache versions
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== IMAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      ),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const { pathname } = url;

  // Cache-first for images — serve from cache, fall back to network
  if (
    pathname.startsWith('/pathologies/') ||
    pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(IMAGE_CACHE).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Cache-first for Next.js static assets (content-hashed filenames, safe forever)
  if (pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => caches.match(event.request));
      })
    );
    return;
  }

  // Network-first for app pages — update cache on success, serve stale if offline
  if (
    event.request.mode === 'navigate' ||
    (event.request.method === 'GET' && event.request.headers.get('accept')?.includes('text/html'))
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => {
            // Serve cached version of this page, or fall back to /home
            return cached || caches.match('/home');
          })
        )
    );
    return;
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'SonoBuddy', body: event.data.text() };
  }

  const title = data.title || 'SonoBuddy Tip of the Day';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'daily-tip',
    renotify: true,
    data: { url: data.url || '/home' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Open the app when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
