"use strict";
var http = require("http");
var beacon_1 = require("./src/core/beacon");
var serveStatic = require("serve-static");
var hostname = '127.0.0.1';
var port = 3001;
var serve = serveStatic('public', { 'index': ['index.html', 'index.htm'] });
beacon_1.Beacon.init();
beacon_1.Beacon.Route.loadRoute('admin');
beacon_1.Beacon.Route.loadRoute('home');
var server = http.createServer(function (req, res) {
    serve(req, res, function () {
        beacon_1.Beacon.run(req, res).catch(function (err) {
            if (err) {
                beacon_1.Beacon.displayError(res, 500, err);
            }
        });
    });
});
server.listen(port, hostname, function () {
    console.log("Server running at http://" + hostname + ":" + port + "/");
});
beacon_1.Beacon.gc();
//# sourceMappingURL=app.js.map