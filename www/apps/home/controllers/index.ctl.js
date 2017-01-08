"use strict";
const beacon_1 = require("../../../src/core/beacon");
class Index extends beacon_1.Beacon.Controller {
    async init() {
        await this.initSesion();
        await this.initDB('mysql');
        // this.redis = Redis.getRedisInstance();
    }
    async indexAction() {
        let db = this.db;
        await db.beginTransaction();
        let list = await db.getList('select * from t_product_sku limit 0,1');
        await db.rollback();
        console.log(list);
        console.log(this.getSession('abc'));
        this.assign('title', this.getSession('abc'));
        this.assign('foot_content', 'All rights reserved.');
        this.assign('meetingPlace', 'New York');
        //console.log(Beacon);
        //  throw new Error('数据异常请重试.');
        this.display('index');
        console.log(Date.now() - this.context.startTime);
    }
    async loginAction() {
        console.log(Date.now() - this.context.startTime);
        this.setSession('abc', 'xxxxxx');
        this.end('login');
    }
}
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map