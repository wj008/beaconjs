"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const redis = require("redis");
class Redis {
    constructor(options = null) {
        this.client = null;
        this.connected = false;
        this._options = null;
        this._options = options;
    }
    static getRedisInstance() {
        if (Redis.instance == null) {
            Redis.instance = new Redis();
        }
        return Redis.instance;
    }
    getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                return this.client;
            }
            if (this._options == null) {
                this._options = Beacon.getConfig('redis:*');
            }
            let option = Object.assign({ connect_timeout: 5 }, this._options);
            option.connect_timeout = option.connect_timeout * 1000;
            let that = this;
            return this.client = yield new Promise(function (resolve, reject) {
                let client = redis.createClient(option);
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
                client.on('fail', function (err) {
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
            });
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = yield this.getClient();
            return yield new Promise(function (resolve, reject) {
                client.get(key, function (err, reply) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(JSON.parse(reply));
                });
            });
        });
    }
    set(key, value, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = yield this.getClient();
            let setP = [new Promise(function (resolve, reject) {
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
            return yield Promise.all(setP);
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = yield this.getClient();
            return yield new Promise(function (resolve, reject) {
                client.del(key, function (err, reply) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(reply);
                });
            });
        });
    }
    expire(key, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = yield this.getClient();
            return yield new Promise(function (resolve, reject) {
                client.expire(key, timeout, function (err, reply) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(reply);
                });
            });
        });
    }
    ttl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = yield this.getClient();
            return yield new Promise(function (resolve, reject) {
                client.ttl(key, function (err, reply) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(reply);
                });
            });
        });
    }
    wrap(command, name, ...data) {
        return __awaiter(this, void 0, void 0, function* () {
            let client = yield this.getClient();
            return yield new Promise(function (resolve, reject) {
                client.wrap(command, name, ...data, function (err, reply) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(reply);
                });
            });
        });
    }
    quit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                this.client.quit();
                this.client = null;
            }
        });
    }
    end(flush) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                this.client.end(flush);
                this.client = null;
            }
        });
    }
}
Redis.instance = null;
exports.Redis = Redis;
//# sourceMappingURL=redis.js.map