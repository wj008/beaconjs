"use strict";
const beacon_1 = require("../../../src/core/beacon");
class Index extends beacon_1.Beacon.Controller {
    indexAction() {
        this.end(beacon_1.Beacon.BEACON_LIB_PATH);
        console.log(Date.now() - this.context.startTime);
    }
}
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map