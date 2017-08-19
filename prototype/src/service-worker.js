const OFFLINE_URL = '/pages/offline/';

importScripts('sw-toolbox.js');

self.toolbox.precache([
    'assets/interactive-wall/css/main.css',
    'assets/interactive-wall/js/main.js',
    'assets/interactive-wall/css/fonts/icomoon.woff',
    'manifest.json',
    OFFLINE_URL,
    'index.html',
    '/'
]);

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

