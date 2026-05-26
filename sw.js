const CACHE_NAME = 'smart-cache-v1';

// تم ضبط المسارات لضمان قبول المتصفح لها في البيئات المختلفة
const INITIAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './page_1.html',
  './page_2.html',
  './page_3.html'
];


// التثبيت المبدئي وحفظ الملفات الأساسية
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(INITIAL_ASSETS);
    }).then(() => self.skipWaiting()) // تفعيل فوري بدون انتظار
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim()); // السيطرة الفورية على الصفحات
});

// إدارة الطلبات وحفظ الملفات الجديدة تلقائياً بالكاش (Dynamic Caching)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; 
      }

      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // لو مفيش نت خالص والملف مش متكاش، افتح الصفحة الرئيسية
        return caches.match('./index.html');
      });
    })
  );
});
