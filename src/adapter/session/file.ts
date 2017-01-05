/**
 * Created by Administrator on 2017/1/4.
 */
declare var Beacon: any;
import {SessionBase} from "../../core/session_base";
import path=require('path');
import os=require('os');
import fs=require('fs');

export class FileSession implements SessionBase {

    public static timeout = 3600;
    public static store = {};
    private _data = null;
    private _isInit = false;
    private _hash = null;
    private _cookie = null;
    private static _save_path = null;

    public constructor() {
        let options = Beacon.getConfig('session:*');
        FileSession.timeout = options.timeout || 3600;
        let save_path = Beacon.getConfig('session:save_path') || null;
        if (!save_path) {
            save_path = path.join(os.tmpdir(), 'beacon/session');
        }
        this._hash = null;
        Beacon.mkdir(save_path);
        FileSession._save_path = save_path;
    }

    public async init(cookie: string) {
        if (!cookie || typeof cookie !== 'string') {
            return;
        }
        this._cookie = cookie;
        let filepath = path.join(FileSession._save_path, this._cookie + '.json');
        let text = await new Promise(function (resolve, reject) {
            fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
                if (err) {
                    return resolve(null);
                }
                fs.readFile(filepath, 'utf8', (err, text) => {
                    if (err) {
                        return resolve(null);
                    }
                    return resolve(text);
                });
            });
        });
        try {
            let json = JSON.parse(String(text));
            let hash = Beacon.md5(text);
            this._hash = hash || null;
            this._data = json || {data: {}, expire: 0};
            this._isInit = true;
        } catch (e) {

        }
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
        this._data.expire = Date.now() + FileSession.timeout * 1000;
    }

    public delete(name?: string) {
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    }

    public async flush() {
        let filepath = path.join(FileSession._save_path, this._cookie + '.json');
        let that = this;
        //如果为空删除
        if (that._data == null) {
            await new Promise(function (resolve, reject) {
                fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
                    if (err) {
                        return resolve(null);
                    }
                    fs.unlink(filepath, (err) => {
                        if (err) {
                            return resolve(null);
                        }
                        return resolve(null);
                    });
                });
            });
        }
        let now = Date.now() / 1000;
        let text = JSON.stringify(that._data);
        let hash = Beacon.md5(text);
        //如果没有更改仅修改时间即可
        if (hash === that._hash) {
            await new Promise(function (resolve, reject) {
                fs.utimes(filepath, now, now, (err) => {
                    //console.log('更新sesslin[' + that._cookie + ']的时间');
                    return resolve(null);
                });
            });
            return;
        }
        //如果修改了就写入内容
        await new Promise(function (resolve, reject) {
            fs.writeFile(filepath, text, 'utf8', (err) => {
                //console.log('写入新的sesslin[' + that._cookie + ']的时间');
                return resolve(null);
            });
        });
        return;
    }

    public static gc() {
        let removeFile = function (filepath) {
            fs.stat(filepath, function (err, stat) {
                if (err) {
                    return;
                }
                //console.log('判断时间', stat);
                if (stat == null || stat.mtime.getTime() + FileSession.timeout * 1000 > now) {
                    return;
                }
                fs.unlink(filepath, (err) => {
                    //console.log('删除了' + filepath);
                });
            });
        }
        let now = Date.now();
        let files = Beacon.getFiles(FileSession._save_path, null, function (file) {
            return /\.json$/.test(file);
        });
        for (let i = 0; i < files.length; i++) {
            let filepath = path.join(FileSession._save_path, files[i]);
            removeFile(filepath);
        }
    }
}