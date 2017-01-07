"use strict";
const beacon_1 = require("../../../src/core/beacon");
const redis_1 = require("../../../src/adapter/db/redis");
class Index extends beacon_1.Beacon.Controller {
    async init() {
        await this.initSesion();
        // await this.initDB('mysql');
        this.redis = redis_1.Redis.getRedisInstance();
    }
    async indexAction() {
        let db = this.db;
        console.log(this.getSession('abc'));
        this.assign('title', this.getSession('abc'));
        this.assign('foot_content', 'All rights reserved.');
        this.assign('meetingPlace', 'New York');
        //  throw new Error('数据异常请重试.');
        this.display('index');
        console.log(Date.now() - this.context.startTime);
    }
    async loginAction() {
        console.log(await this.redis.get('abc'));
        console.log(Date.now() - this.context.startTime);
        this.setSession('abc', 'xxxxxx');
        this.end('login');
    }
}
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map