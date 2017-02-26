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
const request = require("request");
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
            let vals = {};
            vals.code = '023460';
            vals.yzdw = 'ZW01002';
            vals.yzzx = '圆形';
            vals.yzzj = '3.0';
            vals.yzbk = '4.0';
            vals.yzsk = '海南波泰农畜业开发有限公司';
            vals.yzzk = '五角星';
            vals.yzxk1 = '公章,财务章 ';
            vals.yzxk2 = '发票专用章91460105MA5RDHWP60';
            vals.yzxk3 = '';
            vals.yzxk4 = '';
            vals.yzlx = '牛角';
            vals.yzsl = 3;
            let key = 'oinjshxwj008hxyzxh';
            vals.sign = beacon_1.Beacon.md5(vals.code +
                vals.yzdw +
                vals.yzzx +
                vals.yzzj +
                vals.yzbk +
                vals.yzsk +
                vals.yzsl +
                vals.yzlx +
                vals.yzzk +
                vals.yzxk1 +
                vals.yzxk2 +
                vals.yzxk3 +
                vals.yzxk4 + key);
            let body = yield new Promise(function (resolve, reject) {
                request.post({
                    url: 'http://www.hkyzxh.cam/api/add',
                    form: vals
                }, function (err, httpResponse, body) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(body);
                });
            });
            console.log(body);
            this.end(body);
            console.log(Date.now() - this.context.startTime);
        });
    }
    loginAction() {
        return __awaiter(this, void 0, void 0, function* () {
            let vals = {};
            vals.code = '023458';
            let key = 'oinjshxwj008hxyzxh';
            vals.sign = beacon_1.Beacon.md5(vals.code + key);
            let body = yield new Promise(function (resolve, reject) {
                request.post({
                    url: 'http://www.hkyzxh.cam/api/get',
                    form: vals
                }, function (err, httpResponse, body) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(body);
                });
            });
            console.log(body);
            this.end(body);
            console.log(Date.now() - this.context.startTime);
        });
    }
}
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map