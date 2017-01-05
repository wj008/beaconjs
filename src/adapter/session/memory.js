"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var MemorySession = (function () {
    function MemorySession() {
        this.timeout = 3600;
        this._data = null;
        this._isInit = false;
        this._cookie = null;
        var options = Beacon.getConfig('session:*');
        this.timeout = options.timeout || 3600;
    }
    MemorySession.prototype.init = function (cookie) {
        return __awaiter(this, void 0, void 0, function* () {
            this._cookie = cookie;
            var data = MemorySession.store[cookie] || { data: {}, expire: 0 };
            this._data = Beacon.clone(data);
            this._isInit = true;
        });
    };
    MemorySession.prototype.get = function (name) {
        if (!this._isInit || !this._data) {
            return null;
        }
        if (this._data.expire < Date.now()) {
            this._data = null;
            return null;
        }
        if (name === void 0) {
            return this._data.data || {};
        }
        return this._data.data[name];
    };
    MemorySession.prototype.set = function (name, value) {
        if (!this._isInit) {
            return;
        }
        this._data = this._data || { data: {}, expire: 0 };
        this._data.data[name] = value;
        this._data.expire = Date.now() + this.timeout * 1000;
    };
    MemorySession.prototype.delete = function (name) {
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    };
    MemorySession.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function* () {
            var store = MemorySession.store;
            if (this._data == null) {
                delete store[this._cookie];
                return;
            }
            store[this._cookie] = this._data;
        });
    };
    MemorySession.gc = function () {
        var now = Date.now();
        var store = MemorySession.store;
        for (var key in store) {
            var item = store[key];
            if (item.expire < now) {
                delete store[key];
            }
        }
    };
    MemorySession.store = {};
    return MemorySession;
}());
exports.MemorySession = MemorySession;
//# sourceMappingURL=memory.js.map