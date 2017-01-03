"use strict";
const http = require("http");
const beacon_1 = require("./src/core/beacon");
const serveStatic = require("serve-static");
const hostname = '127.0.0.1';
const port = 3001;
var serve = serveStatic('public', { 'index': ['index.html', 'index.htm'] });
beacon_1.Beacon.init();
beacon_1.Beacon.Route.loadRoute('admin');
beacon_1.Beacon.Route.loadRoute('home');
const server = http.createServer((req, res) => {
    serve(req, res, function () {
        beacon_1.Beacon.run(req, res).catch(function (err) {
            if (err) {
                beacon_1.Beacon.displayError(res, 500, err);
            }
        });
    });
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
//# sourceMappingURL=app.js.map