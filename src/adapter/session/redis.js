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
var redis_1 = require("../db/redis");
var RedisSession = (function () {
    function RedisSession() {
        this._data = null;
        this._isInit = false;
        this._cookie = null;
        this._isUpdate = false;
        this.redis = null;
        this.redis = redis_1.Redis.getRedisInstance();
        if (RedisSession.timeout == null || RedisSession == null) {
            var options = Beacon.getConfig('session:*');
            RedisSession.timeout = options.timeout || 3600;
        }
    }
    RedisSession.prototype.init = function (cookie) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!cookie || typeof cookie !== 'string') {
                            return [2 /*return*/];
                        }
                        this._cookie = cookie;
                        this._isUpdate = false;
                        this._isInit = true;
                        _a = this;
                        return [4 /*yield*/, this.redis.get('session_' + cookie)];
                    case 1:
                        _a._data = (_b.sent()) || { data: {}, expire: 0 };
                        return [2 /*return*/];
                }
            });
        });
    };
    RedisSession.prototype.get = function (name) {
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
    RedisSession.prototype.set = function (name, value) {
        if (!this._isInit) {
            return;
        }
        if (this._isUpdate === false) {
            var oldval = this._data.data[name] === void 0 ? null : this._data.data[name];
            var oldtext = JSON.stringify(oldval);
            var newtext = JSON.stringify(value);
            if (oldtext.length !== newtext.length) {
                this._isUpdate = true;
            }
            else if (oldtext != newtext) {
                this._isUpdate = true;
            }
        }
        this._data = this._data || { data: {}, expire: 0 };
        this._data.data[name] = value;
        this._data.expire = Date.now() + RedisSession.timeout * 1000;
    };
    RedisSession.prototype.delete = function (name) {
        this._isUpdate = true;
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    };
    RedisSession.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var name, that;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = 'session_' + this._cookie;
                        that = this;
                        if (!(that._data == null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.redis.delete(name)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        if (!!this._isUpdate) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.redis.expire(name, RedisSession.timeout)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, this.redis.set(name, that._data, RedisSession.timeout)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedisSession;
}());
RedisSession.timeout = null;
exports.RedisSession = RedisSession;
//# sourceMappingURL=redis.js.map