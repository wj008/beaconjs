"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var beacon_1 = require("../../../src/core/beacon");
var Index = (function (_super) {
    __extends(Index, _super);
    function Index() {
        _super.apply(this, arguments);
    }
    Index.prototype.indexAction = function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initSesion();
            console.log(this.getSession('abc'));
            this.assign('title', this.getSession('abc'));
            this.assign('foot_content', 'All rights reserved.');
            this.assign('meetingPlace', 'New York');
            //  throw new Error('数据异常请重试.');
            this.display('index');
            console.log(Date.now() - this.context.startTime);
        });
    };
    Index.prototype.loginAction = function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initSesion();
            console.log(Date.now() - this.context.startTime);
            this.setSession('abc', 'xxxxxx');
            this.end('login');
        });
    };
    return Index;
}(beacon_1.Beacon.Controller));
exports.Index = Index;
//# sourceMappingURL=index.ctl.js.map