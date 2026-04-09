// SonoBuddy Service Worker
// Handles push notifications and offline image caching

const IMAGE_CACHE = 'sonobuddy-images-v1';

// All pathology images — pre-cached on install so they work offline
const PATHOLOGY_IMAGES = [
  "/pathologies/Acute_cholecystitis.jpg",
  "/pathologies/acute cholecystitis2.png",
  "/pathologies/Acute_cholecystitis2.png",
  "/pathologies/Deep vein thrombosis replace.png",
  "/pathologies/Deep vein thrombosis 2 replace.png",
  "/pathologies/Deep vein thrombosis 3 replace.png",
  "/pathologies/Hepatic steatosis.jpg",
  "/pathologies/Hepatic Steatosis 2.jpg",
  "/pathologies/hepatic steatosis 2.png",
  "/pathologies/Hydronephrosis .jpg",
  "/pathologies/Hydronephrosis 2.jpg",
  "/pathologies/Hydronephrosis 3.jpg",
  "/pathologies/Haemorrhagic_ovarian_cyst_ultrasound.jpg",
  "/pathologies/ovarian cyst 2.png",
  "/pathologies/Papillary_Thyroid_carcinoma_Ultrasound2.jpg",
  "/pathologies/Papillary_Thyroid_carcinoma_Ultrasound_37F_20160005.jpg",
  "/pathologies/Papillary Thyroid Carcinoma.png",
  "/pathologies/Papillary Thryroid carcinoma.png",
  "/pathologies/Abdomincal aortic aneurysm.jpg",
  "/pathologies/abdominal aortic aneurysm.png",
  "/pathologies/acute appendicitis .png",
  "/pathologies/choledocholithiasis.jpg",
  "/pathologies/hepatic_hemangioma.jpg",
  "/pathologies/Renal cyst.jpg",
  "/pathologies/Renal cyst 2.jpg",
  "/pathologies/Renal cyst 3.jpg",
  "/pathologies/Renal cyst 4.jpg",
  "/pathologies/liver_cirrhosis.jpg",
  "/pathologies/portal_hypertension.jpg",
  "/pathologies/testicular_torsion.jpg",
  "/pathologies/testicular_torsion 2.jpg",
  "/pathologies/uterine fibroids .png",
  "/pathologies/UterineFirboid 2.png",
  "/pathologies/adenomyosis.jpg",
  "/pathologies/polycystic_ovaries syndrome.png",
  "/pathologies/Placental abruption.jpg",
  "/pathologies/parathyroid_ademoma.jpg",
  "/pathologies/parathyroid_ademoma 2.jpg",
  "/pathologies/parathyroid_ademoma 3.jpg",
  "/pathologies/Pericardia leffusion .PNG",
  "/pathologies/Hemorragic_effusion 2.jpg",
  "/pathologies/Aortic_stenosis.JPG",
  "/pathologies/Aortic_stenosis_2.JPG",
  "/pathologies/Rotator_cuff_tear.jpg",
  "/pathologies/Rotator_cuff_tear 2.jpg",
  "/pathologies/Baker's_cyst.jpg",
  "/pathologies/Baker's_cyst 2.png",
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
    caches.open(IMAGE_CACHE).then((cache) => {
      // Use individual adds so one 404 doesn't block the rest
      const allAssets = [...PATHOLOGY_IMAGES, ...ICON_ASSETS];
      return Promise.allSettled(
        allAssets.map((path) => cache.add(path).catch(() => {}))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Remove any old cache versions
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== IMAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      ),
    ])
  );
});

// Cache-first strategy for images — serve from cache, fall back to network
// and store new images for next time
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (
    url.pathname.startsWith('/pathologies/') ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          // Store fresh copy in cache for future offline use
          const clone = response.clone();
          caches.open(IMAGE_CACHE).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
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
