import http = require('http');
import {Beacon} from "./src/core/beacon";
import serveStatic = require('serve-static');

const hostname = '127.0.0.1';
const port = 3001;
var serve = serveStatic('public', {'index': ['index.html', 'index.htm']});

Beacon.init();
Beacon.Route.loadRoute('admin');
Beacon.Route.loadRoute('home');
const server = http.createServer((req, res) => {
    serve(req, res, function () {
        Beacon.run(req, res).catch(function (err) {
            if (err) {
                Beacon.displayError(res, 500, err);
            }
        });
    });
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
Beacon.gc();