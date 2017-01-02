"use strict";
const http = require('http');
const beacon_1 = require("./src/core/beacon");
const hostname = '127.0.0.1';
const port = 3001;
beacon_1.Beacon.init();
beacon_1.Beacon.Route.loadRoute('admin');
beacon_1.Beacon.Route.loadRoute('home');
const server = http.createServer((req, res) => {
    beacon_1.Beacon.run(req, res).catch(function (err) {
        if (err) {
            console.error(err);
        }
    });
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
//# sourceMappingURL=app.js.map