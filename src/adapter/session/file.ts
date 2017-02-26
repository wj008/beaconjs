/**
 * Created by Administrator on 2017/1/4.
 */
declare var Beacon: any;
import {SessionBase} from "../../core/session_base";
import path=require('path');
import os=require('os');
import fs=require('fs');

export class FileSession implements SessionBase {

    public static timeout = null;
    public static nextCheckTime = 0;
    public static checkTime = 300;
    public static store = {};

    private _data = null;
    private _isInit = false;
    private _cookie = null;
    private _isUpdate = false;
    private _expire = 0;
    private static _save_path = null;

    public constructor() {
        if (!(FileSession.timeout == null || FileSession._save_path == null)) {
            return;
        }
        let options = Beacon.getConfig('session:*');
        FileSession.timeout = options.timeout || 3600;
        FileSession.checkTime = options.checkTime || 300;
        let save_path = Beacon.getConfig('session:save_path') || null;
        if (!save_path) {
            save_path = path.join(os.tmpdir(), 'beacon/session');
        }
        Beacon.mkdir(save_path);
        FileSession._save_path = save_path;
    }

    public async init(cookie: string) {
        if (!cookie || typeof cookie !== 'string') {
            return;
        }
        this._cookie = cookie;
        this._isUpdate = false;
        let filepath = path.join(FileSession._save_path, this._cookie + '.json');
        let fdata: any = await new Promise(function (resolve, reject) {
            //文件是否存在
            fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
                if (err) {
                    return resolve(null);
                }
                //获取状态
                fs.stat(filepath, function (err, stat) {
                    if (err) {
                        return resolve(null);
                    }
                    if (stat == null) {
                        return resolve(null);
                    }
                    let expire = stat.mtime.getTime() + FileSession.timeout * 1000;
                    fs.readFile(filepath, 'utf8', (err, text) => {
                        if (err) {
                            return resolve(null);
                        }
                        return resolve({text: text, expire: expire});
                    });
                });
            });
        });

        try {
            if (fdata) {
                let json = JSON.parse(String(fdata.text));
                this._data = {data: json || {}, expire: fdata.expire || 0};
            } else {
                this._data = {data: {}, expire: 0};
            }
        } catch (e) {
            this._data = {data: {}, expire: 0};
        }
        this._expire = this._data.expire;
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
        this._data.expire = Date.now() + FileSession.timeout * 1000;
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
            return;
        }
        let now = Date.now();
        //如果没有更改仅修改时间即可
        if (!this._isUpdate) {
            if (this._expire + 10000 < now + FileSession.timeout * 1000) {
                await new Promise(function (resolve, reject) {
                    fs.utimes(filepath, now, now, (err) => {
                        return resolve(null);
                    });
                });
            }
            return;
        }

        let text = JSON.stringify(that._data.data);
        await new Promise(function (resolve, reject) {
            fs.writeFile(filepath, text, 'utf8', (err) => {
                return resolve(null);
            });
        });
        return;
    }

    public static gc() {
        let now = Date.now();
        if (FileSession.nextCheckTime > now) {
            return;
        }
        FileSession.nextCheckTime = now + FileSession.checkTime * 1000;
        let removeFile = function (filepath) {
            fs.stat(filepath, function (err, stat) {
                if (err) {
                    return;
                }
                if (stat == null || stat.mtime.getTime() + FileSession.timeout * 1000 > now) {
                    return;
                }
                fs.unlink(filepath, (err) => {
                    //console.log('删除了' + filepath);
                });
            });
        }
        let files = Beacon.getFiles(FileSession._save_path, null, function (file) {
            return /\.json$/.test(file);
        });
        for (let i = 0; i < files.length; i++) {
            let filepath = path.join(FileSession._save_path, files[i]);
            removeFile(filepath);
        }
    }
}