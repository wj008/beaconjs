/**
 * Created by Administrator on 2017/1/4.
 */
declare var Beacon: any;
import {SessionBase} from "../../core/session_base";

export class MemorySession implements SessionBase {

    public static timeout = null;
    public static nextCheckTime = 0;
    public static checkTime = 300;
    public static store = {};
    private _data = null;
    private _isInit = false;
    private _cookie = null;

    public constructor() {
        if (!MemorySession.timeout) {
            let options = Beacon.getConfig('session:*');
            MemorySession.timeout = options.timeout || 3600;
            MemorySession.checkTime = options.checkTime || 300;
        }
    }

    public async init(cookie: string) {
        this._cookie = cookie;
        let data = MemorySession.store[cookie] || {data: {}, expire: 0};
        this._data = Beacon.clone(data);
        this._isInit = true;
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
        this._data.data[name] = value;
        this._data.expire = Date.now() + MemorySession.timeout * 1000;
    }

    public delete(name?: string) {
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    }

    public async flush() {
        let store = MemorySession.store;
        if (this._data == null) {
            delete store[this._cookie];
            return;
        }
        this._data.expire = Date.now() + MemorySession.timeout * 1000;
        store[this._cookie] = this._data;
    }

    public static gc() {
        let now = Date.now();
        if (MemorySession.nextCheckTime > now) {
            return;
        }
        MemorySession.nextCheckTime = now + MemorySession.checkTime * 1000;
        let store = MemorySession.store;
        for (let key in  store) {
            let item = store[key];
            if (item.expire < now) {
                delete store[key];
            }
        }
    }


}