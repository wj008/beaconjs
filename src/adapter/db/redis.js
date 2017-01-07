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
var redis = require("redis");
var Redis = (function () {
    function Redis(options) {
        if (options === void 0) { options = null; }
        this.client = null;
        this.connected = false;
        this._options = null;
        this._options = options;
    }
    Redis.getRedisInstance = function () {
        if (Redis.instance == null) {
            Redis.instance = new Redis();
        }
        return Redis.instance;
    };
    Redis.prototype.getClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var option, that, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.client) {
                            return [2 /*return*/, this.client];
                        }
                        if (this._options == null) {
                            this._options = Beacon.getConfig('redis:*');
                        }
                        option = Object.assign({ connect_timeout: 5 }, this._options);
                        option.connect_timeout = option.connect_timeout * 1000;
                        that = this;
                        _a = this;
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var client = redis.createClient(option);
                                if (option.password !== void 0) {
                                    client.auth(option.password, function (err) {
                                        if (err) {
                                            return reject(err);
                                        }
                                    });
                                }
                                client.on('connect', function () {
                                    that.connected = true;
                                    resolve(client);
                                });
                                client.on('error', function (err) {
                                    that.connected = false;
                                    that.client = null;
                                    reject(err);
                                });
                                client.on('end', function (err) {
                                    //console.log('redis release....');
                                    that.connected = false;
                                    that.client = null;
                                    reject(err);
                                });
                            })];
                    case 1: return [2 /*return*/, _a.client = _b.sent()];
                }
            });
        });
    };
    Redis.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                client.get(key, function (err, reply) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    resolve(JSON.parse(reply));
                                });
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Redis.prototype.set = function (key, value, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var client, setP;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        setP = [new Promise(function (resolve, reject) {
                                client.set(key, JSON.stringify(value), function (err, reply) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    resolve(reply);
                                });
                            })];
                        if (timeout !== void 0) {
                            setP.push(new Promise(function (resolve, reject) {
                                client.expire(key, timeout, function (err, reply) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    resolve(reply);
                                });
                            }));
                        }
                        return [4 /*yield*/, Promise.all(setP)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Redis.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                client.del(key, function (err, reply) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    resolve(reply);
                                });
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Redis.prototype.expire = function (key, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                client.expire(key, timeout, function (err, reply) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    resolve(reply);
                                });
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Redis.prototype.ttl = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                client.ttl(key, function (err, reply) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    resolve(reply);
                                });
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Redis.prototype.wrap = function (command, name) {
        var data = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            data[_i - 2] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient()];
                    case 1:
                        client = _a.sent();
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                client.wrap.apply(client, [command, name].concat(data, [function (err, reply) {
                                        if (err) {
                                            return reject(err);
                                        }
                                        resolve(reply);
                                    }]));
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Redis.prototype.quit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.client) {
                    this.client.quit();
                    this.client = null;
                }
                return [2 /*return*/];
            });
        });
    };
    Redis.prototype.end = function (flush) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.client) {
                    this.client.end(flush);
                    this.client = null;
                }
                return [2 /*return*/];
            });
        });
    };
    return Redis;
}());
Redis.instance = null;
exports.Redis = Redis;
//# sourceMappingURL=redis.js.map