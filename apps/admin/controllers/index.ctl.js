"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var beacon_1 = require("../../../src/core/beacon");
var Index = (function (_super) {
    __extends(Index, _super);
    function Index() {
        return _super.apply(this, arguments) || this;
    }
    Index.prototype.indexAction = function () {
        this.end(beacon_1.Beacon.BEACON_LIB_PATH);
        // throw new Error('dddd');
        console.log(Date.now() - this.context.startTime);
    };
    return Index;
}(beacon_1.Beacon.Controller));
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map