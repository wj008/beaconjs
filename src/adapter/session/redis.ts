/**
 * Created by Administrator on 2017/1/4.
 */
declare var Beacon: any;
import {SessionBase} from "../../core/session_base";
import {Redis} from "../db/redis";

export class RedisSession implements SessionBase {

    public static timeout = null;
    private _data = null;
    private _isInit = false;
    private _cookie = null;
    private _isUpdate = false;
    private _expire = 0;
    private redis: Redis = null;

    public  constructor() {
        this.redis = Redis.getRedisInstance();
        if (RedisSession.timeout == null || RedisSession == null) {
            let options = Beacon.getConfig('session:*');
            RedisSession.timeout = options.timeout || 3600;
        }
    }

    public async init(cookie: string) {
        if (!cookie || typeof cookie !== 'string') {
            return;
        }
        this._cookie = cookie;
        this._isUpdate = false;
        this._isInit = true;
        this._data = (await this.redis.get('session_' + cookie)) || {data: {}, expire: 0};
        this._expire = this._data.expire;
    }

    public get(name?: string) {
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

    public set(name: string, value: any) {
        if (!this._isInit) {
            return;
        }
        this._data = this._data || {data: {}, expire: 0};
        if (this._isUpdate === false) {
            let oldval = this._data.data[name] === void 0 ? null : this._data.data[name];
            let oldtext = JSON.stringify(oldval);
            let newtext = JSON.stringify(value);
            if (oldtext.length !== newtext.length) {
                this._isUpdate = true;
            } else if (oldtext != newtext) {
                this._isUpdate = true;
            }
        }
        this._data.data[name] = value;
        this._data.expire = Date.now() + RedisSession.timeout * 1000;
    }

    public delete(name?: string) {
        this._isUpdate = true;
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    }

    public async flush() {
        let name = 'session_' + this._cookie;
        let that = this;
        //如果为空删除
        if (that._data == null) {
            await this.redis.delete(name);
            return;
        }
        //如果没有更改仅修改时间即可
        if (!this._isUpdate) {
            let expire = Date.now() + RedisSession.timeout * 1000;
            if (this._expire + 10000 < expire) {
                await this.redis.expire(name, RedisSession.timeout);
            }
            return;
        }
        await this.redis.set(name, that._data, RedisSession.timeout);
        return;
    }

}