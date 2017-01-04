"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._cookie = cookie;
                this._data = MemorySession.store[cookie] || { data: {}, expire: 0 };
                // console.log('init',this._data,cookie);
                this._isInit = true;
                return [2 /*return*/];
            });
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
    MemorySession.prototype.set = function (name, value, timeout) {
        if (timeout === void 0) { timeout = this.timeout; }
        if (!this._isInit) {
            return;
        }
        this._data = this._data || { data: {}, expire: 0 };
        this._data.data[name] = value;
        this._data.expire = Date.now() + timeout * 1000;
    };
    MemorySession.prototype.delete = function (name) {
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    };
    MemorySession.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var store;
            return __generator(this, function (_a) {
                store = MemorySession.store;
                if (this._data == null) {
                    delete store[this._cookie];
                    return [2 /*return*/];
                }
                // console.log('save',this._data,this._cookie);
                store[this._cookie] = this._data;
                return [2 /*return*/];
            });
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
    return MemorySession;
}());
MemorySession.store = {};
exports.MemorySession = MemorySession;
//# sourceMappingURL=memory.js.map