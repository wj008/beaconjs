"use strict";
const beacon_1 = require("../../../src/core/beacon");
class Index extends beacon_1.Beacon.Controller {
    async indexAction() {
        this.assign('title', 'hello sdopx');
        this.assign('foot_content', 'All rights reserved.');
        this.assign('meetingPlace', 'New York');
        //  throw new Error('数据异常请重试.');
        this.display('index');
        console.log(Date.now() - this.context.startTime);
    }
    async loginAction() {
        this.end('login');
    }
}
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map