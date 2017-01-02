"use strict";
const beacon_1 = require("../../../src/core/beacon");
class Index extends beacon_1.Beacon.Controller {
    async indexAction() {
        this.end('111');
    }
    async loginAction() {
        this.end('login');
    }
}
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map