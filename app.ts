import http = require('http');
import {Beacon} from "./src/core/beacon";
import {RedisSession} from "./src/adapter/session/redis";
import serveStatic = require('serve-static');

const hostname = '127.0.0.1';
const port = 3001;


Beacon.regSessionType('redis', RedisSession);

Beacon.debug = true;
Beacon.init();



console.log(Beacon.RUNTIME_PATH);
console.log(Beacon.VIEW_PATH);
//ddddoo
Beacon.Route.loadRoute('admin');
Beacon.Route.loadRoute('home');

var serve = serveStatic(Beacon.RUNTIME_PATH+'/public', {'index': ['index.html', 'index.htm']});

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