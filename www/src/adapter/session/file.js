"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require("path");
const os = require("os");
const fs = require("fs");
class FileSession {
    constructor() {
        this._data = null;
        this._isInit = false;
        this._cookie = null;
        this._isUpdate = false;
        if (!(FileSession.timeout == null || FileSession._save_path == null)) {
            return;
        }
        let options = Beacon.getConfig('session:*');
        FileSession.timeout = options.timeout || 3600;
        let save_path = Beacon.getConfig('session:save_path') || null;
        if (!save_path) {
            save_path = path.join(os.tmpdir(), 'beacon/session');
        }
        Beacon.mkdir(save_path);
        FileSession._save_path = save_path;
    }
    init(cookie) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!cookie || typeof cookie !== 'string') {
                return;
            }
            this._cookie = cookie;
            this._isUpdate = false;
            let filepath = path.join(FileSession._save_path, this._cookie + '.json');
            let text = yield new Promise(function (resolve, reject) {
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
                this._data = json || { data: {}, expire: 0 };
                this._isInit = true;
            }
            catch (e) {
            }
        });
    }
    get(name) {
        if (!this._isInit || !this._data) {
            return null;
        }
        //console.log(this._data);
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
        this._data.data[name] = value;
        this._data.expire = Date.now() + FileSession.timeout * 1000;
    }
    delete(name) {
        this._isUpdate = true;
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            let filepath = path.join(FileSession._save_path, this._cookie + '.json');
            let that = this;
            //如果为空删除
            if (that._data == null) {
                yield new Promise(function (resolve, reject) {
                    fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
                        if (err) {
                            return resolve(null);
                        }
                        fs.unlink(filepath, (err) => {
                            if (err) {
                                return resolve(null);
                            }
                            // console.log('删除了文件:' , filepath);
                            return resolve(null);
                        });
                    });
                });
                return;
            }
            let now = Date.now() / 1000;
            //如果没有更改仅修改时间即可
            if (!this._isUpdate) {
                yield new Promise(function (resolve, reject) {
                    fs.utimes(filepath, now, now, (err) => {
                        // console.log('更新sesslin[' + that._cookie + ']的时间');
                        return resolve(null);
                    });
                });
                return;
            }
            let text = JSON.stringify(that._data);
            //如果修改了就写入内容
            yield new Promise(function (resolve, reject) {
                fs.writeFile(filepath, text, 'utf8', (err) => {
                    // console.log('写入新的sesslin[' + that._cookie + ']的时间');
                    return resolve(null);
                });
            });
            return;
        });
    }
    static gc() {
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
        };
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
FileSession.timeout = null;
FileSession.store = {};
FileSession._save_path = null;
exports.FileSession = FileSession;
//# sourceMappingURL=file.js.map