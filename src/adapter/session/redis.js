"use strict";
const redis_1 = require("../db/redis");
class RedisSession {
    constructor() {
        this._data = null;
        this._isInit = false;
        this._cookie = null;
        this._isUpdate = false;
        this.redis = null;
        this.redis = redis_1.Redis.getRedisInstance();
        if (RedisSession.timeout == null || RedisSession == null) {
            let options = Beacon.getConfig('session:*');
            RedisSession.timeout = options.timeout || 3600;
        }
    }
    async init(cookie) {
        if (!cookie || typeof cookie !== 'string') {
            return;
        }
        this._cookie = cookie;
        this._isUpdate = false;
        this._isInit = true;
        this._data = (await this.redis.get('session_' + cookie)) || { data: {}, expire: 0 };
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
        if (this._isUpdate === false) {
            let oldval = this._data.data[name] === void 0 ? null : this._data.data[name];
            let oldtext = JSON.stringify(oldval);
            let newtext = JSON.stringify(value);
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
    }
    delete(name) {
        this._isUpdate = true;
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    }
    async flush() {
        let name = 'session_' + this._cookie;
        let that = this;
        //如果为空删除
        if (that._data == null) {
            await this.redis.delete(name);
            return;
        }
        //如果没有更改仅修改时间即可
        if (!this._isUpdate) {
            await this.redis.expire(name, RedisSession.timeout);
            return;
        }
        await this.redis.set(name, that._data, RedisSession.timeout);
        return;
    }
}
RedisSession.timeout = null;
exports.RedisSession = RedisSession;
//# sourceMappingURL=redis.js.map