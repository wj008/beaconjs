"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const beacon_1 = require("../../../src/core/beacon");
class Index extends beacon_1.Beacon.Controller {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initSesion();
            yield this.initDB('mysql');
            // this.redis = Redis.getRedisInstance();
        });
    }
    indexAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.db;
            yield db.beginTransaction();
            let list = yield db.getList('select * from t_product_sku limit 0,1');
            yield db.rollback();
            console.log(list);
            console.log(this.getSession('abc'));
            this.assign('title', this.getSession('abc'));
            this.assign('foot_content', 'All rights reserved.');
            this.assign('meetingPlace', 'New York');
            //console.log(Beacon);
            //  throw new Error('数据异常请重试.');
            this.display('index');
            console.log(Date.now() - this.context.startTime);
        });
    }
    loginAction() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(Date.now() - this.context.startTime);
            this.setSession('abc', 'xxxxxx');
            this.end('login');
        });
    }
}
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map