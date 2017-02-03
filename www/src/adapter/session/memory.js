"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class MemorySession {
    constructor() {
        this.timeout = 3600;
        this._data = null;
        this._isInit = false;
        this._cookie = null;
        let options = Beacon.getConfig('session:*');
        this.timeout = options.timeout || 3600;
    }
    init(cookie) {
        return __awaiter(this, void 0, void 0, function* () {
            this._cookie = cookie;
            let data = MemorySession.store[cookie] || { data: {}, expire: 0 };
            this._data = Beacon.clone(data);
            this._isInit = true;
        });
    }
    get(name) {
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
    }
    set(name, value) {
        if (!this._isInit) {
            return;
        }
        this._data = this._data || { data: {}, expire: 0 };
        this._data.data[name] = value;
        this._data.expire = Date.now() + this.timeout * 1000;
    }
    delete(name) {
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            let store = MemorySession.store;
            if (this._data == null) {
                delete store[this._cookie];
                return;
            }
            store[this._cookie] = this._data;
        });
    }
    static gc() {
        let now = Date.now();
        let store = MemorySession.store;
        for (let key in store) {
            let item = store[key];
            if (item.expire < now) {
                delete store[key];
            }
        }
    }
}
MemorySession.store = {};
exports.MemorySession = MemorySession;
//# sourceMappingURL=memory.js.map