const OFFLINE_URL = '/pages/offline/';

importScripts('sw-toolbox.js');

const urlsToPrefetch = [
    'assets/interactive-wall/css/main.css',
    'assets/interactive-wall/js/main.js',
    'assets/interactive-wall/css/fonts/icomoon.woff',
    'manifest.json',
    OFFLINE_URL,
    'index.html',
    '/'
];

self.toolbox.router.default = self.toolbox.networkFirst;

self.toolbox.router.get('/(.*)', function (req, vals, opts) {
    return self.toolbox.networkFirst(req, vals, opts)
        .catch(function (error) {
            if (req.method === 'GET' && req.headers.get('accept').includes('text/html')) {
                return self.toolbox.cacheOnly(new Request(OFFLINE_URL), vals, opts);
            }
            throw error;
        });
});

self.addEventListener('install', function (event) {
    // All of these logging statements should be visible via the "Inspect" interface
    // for the relevant SW accessed via chrome://serviceworker-internals
    console.log('Handling install event. Resources to prefetch:', urlsToPrefetch);

    event.waitUntil(
        caches.open(CURRENT_CACHES.prefetch).then(function (cache) {
            var cachePromises = urlsToPrefetch.map(function (urlToPrefetch) {
                // This constructs a new URL object using the service worker's script location as the base
                // for relative URLs.
                var url = new URL(urlToPrefetch, location.href);
                // Append a cache-bust=TIMESTAMP URL parameter to each URL's query string.
                // This is particularly important when precaching resources that are later used in the
                // fetch handler as responses directly, without consulting the network (i.e. cache-first).
                // If we were to get back a response from the HTTP browser cache for this precaching request
                // then that stale response would be used indefinitely, or at least until the next time
                // the service worker script changes triggering the install flow.
                url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;

                // It's very important to use {mode: 'no-cors'} if there is any chance that
                // the resources being fetched are served off of a server that doesn't support
                // CORS (http://en.wikipedia.org/wiki/Cross-origin_resource_sharing).
                // In this example, www.chromium.org doesn't support CORS, and the fetch()
                // would fail if the default mode of 'cors' was used for the fetch() request.
                // The drawback of hardcoding {mode: 'no-cors'} is that the response from all
                // cross-origin hosts will always be opaque
                // (https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#cross-origin-resources)
                // and it is not possible to determine whether an opaque response represents a success or failure
                // (https://github.com/whatwg/fetch/issues/14).
                var request = new Request(url, { mode: 'no-cors' });
                return fetch(request).then(function (response) {
                    if (response.status >= 400) {
                        throw new Error('request for ' + urlToPrefetch +
                            ' failed with status ' + response.statusText);
                    }

                    // Use the original URL without the cache-busting parameter as the key for cache.put().
                    return cache.put(urlToPrefetch, response);
                }).catch(function (error) {
                    console.error('Not caching ' + urlToPrefetch + ' due to ' + error);
                });
            });

            return Promise.all(cachePromises).then(function () {
                console.log('Pre-fetching complete.');
            });
        }).then(function () {
            // `skipWaiting()` forces the waiting ServiceWorker to become the
            // active ServiceWorker, triggering the `onactivate` event.
            // Together with `Clients.claim()` this allows a worker to take effect
            // immediately in the client(s).
            return self.skipWaiting();
        }).catch(function (error) {
            console.error('Pre-fetching failed:', error);
        })
    );
});

self.addEventListener('activate', function (event) {
    // Delete all caches that aren't named in CURRENT_CACHES.
    // While there is only one cache in this example, the same logic will handle the case where
    // there are multiple versioned caches.
    var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function (key) {
        return CURRENT_CACHES[key];
    });

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (expectedCacheNames.indexOf(cacheName) === -1) {
                        // If this cache name isn't present in the array of "expected" cache names, then delete it.
                        console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});