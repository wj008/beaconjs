"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const beacon_1 = require("./src/core/beacon");
const redis_1 = require("./src/adapter/session/redis");
const serveStatic = require("serve-static");
const mysql_1 = require("./src/adapter/session/mysql");
const hostname = '127.0.0.1';
const port = 3001;
beacon_1.Beacon.regSessionType('redis', redis_1.RedisSession);
beacon_1.Beacon.regSessionType('mysql', mysql_1.MysqlSession);
beacon_1.Beacon.debug = true;
beacon_1.Beacon.init();
//console.log(Beacon.RUNTIME_PATH);
//console.log(Beacon.VIEW_PATH);
//ddddoo
beacon_1.Beacon.Route.loadRoute('service');
beacon_1.Beacon.Route.loadRoute('admin');
beacon_1.Beacon.Route.loadRoute('home');
var serve = serveStatic(beacon_1.Beacon.RUNTIME_PATH + '/public', { 'index': ['index.html', 'index.htm'] });
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
beacon_1.Beacon.gc();
//# sourceMappingURL=app.js.map