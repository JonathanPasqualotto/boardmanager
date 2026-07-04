// Nome do cache (pode mudar a versão quando atualizar o site)
const CACHE_NAME = 'board-manager-cronometro-v1';

// Arquivos que serão salvos no celular da pessoa para funcionar offline
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/scripts.js',
  '/imagens/logo.png',
];

// Instala o Service Worker e salva os arquivos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta as requisições: se tiver sem internet, puxa do cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});