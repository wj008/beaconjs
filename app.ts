
const http = require('http');
import {Beacon} from './src/core/beacon';

const hostname = '127.0.0.1';
const port = 3001;

Beacon.init();

Beacon.Route.loadRoute('admin');
Beacon.Route.loadRoute('home');

const server = http.createServer((req, res) => {
    Beacon.run(req, res).catch(function (err) {
        if (err) {
            console.error(err);
        }
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});