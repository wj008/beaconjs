"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var path = require('path');
var os = require('os');
var fs = require('fs');
var FileSession = (function () {
    function FileSession() {
        this._data = null;
        this._isInit = false;
        this._cookie = null;
        this._isUpdate = false;
        var options = Beacon.getConfig('session:*');
        FileSession.timeout = options.timeout || 3600;
        var save_path = Beacon.getConfig('session:save_path') || null;
        if (!save_path) {
            save_path = path.join(os.tmpdir(), 'beacon/session');
        }
        Beacon.mkdir(save_path);
        FileSession._save_path = save_path;
    }
    FileSession.prototype.init = function (cookie) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!cookie || typeof cookie !== 'string') {
                return;
            }
            this._cookie = cookie;
            this._isUpdate = false;
            var filepath = path.join(FileSession._save_path, this._cookie + '.json');
            var text = yield new Promise(function (resolve, reject) {
                fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, function (err) {
                    if (err) {
                        return resolve(null);
                    }
                    fs.readFile(filepath, 'utf8', function (err, text) {
                        if (err) {
                            return resolve(null);
                        }
                        return resolve(text);
                    });
                });
            });
            try {
                var json = JSON.parse(String(text));
                this._data = json || { data: {}, expire: 0 };
                this._isInit = true;
            }
            catch (e) {
            }
        });
    };
    FileSession.prototype.get = function (name) {
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
    };
    FileSession.prototype.set = function (name, value) {
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
        this._data.expire = Date.now() + FileSession.timeout * 1000;
    };
    FileSession.prototype.delete = function (name) {
        this._isUpdate = true;
        if (name === void 0) {
            this._data = null;
            return;
        }
        delete this._data[name];
    };
    FileSession.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function* () {
            var filepath = path.join(FileSession._save_path, this._cookie + '.json');
            var that = this;
            //如果为空删除
            if (that._data == null) {
                yield new Promise(function (resolve, reject) {
                    fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, function (err) {
                        if (err) {
                            return resolve(null);
                        }
                        fs.unlink(filepath, function (err) {
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
            var now = Date.now() / 1000;
            //如果没有更改仅修改时间即可
            if (!this._isUpdate) {
                yield new Promise(function (resolve, reject) {
                    fs.utimes(filepath, now, now, function (err) {
                        // console.log('更新sesslin[' + that._cookie + ']的时间');
                        return resolve(null);
                    });
                });
                return;
            }
            var text = JSON.stringify(that._data);
            //如果修改了就写入内容
            yield new Promise(function (resolve, reject) {
                fs.writeFile(filepath, text, 'utf8', function (err) {
                    // console.log('写入新的sesslin[' + that._cookie + ']的时间');
                    return resolve(null);
                });
            });
            return;
        });
    };
    FileSession.gc = function () {
        var removeFile = function (filepath) {
            fs.stat(filepath, function (err, stat) {
                if (err) {
                    return;
                }
                //console.log('判断时间', stat);
                if (stat == null || stat.mtime.getTime() + FileSession.timeout * 1000 > now) {
                    return;
                }
                fs.unlink(filepath, function (err) {
                    //console.log('删除了' + filepath);
                });
            });
        };
        var now = Date.now();
        var files = Beacon.getFiles(FileSession._save_path, null, function (file) {
            return /\.json$/.test(file);
        });
        for (var i = 0; i < files.length; i++) {
            var filepath = path.join(FileSession._save_path, files[i]);
            removeFile(filepath);
        }
    };
    FileSession.timeout = 3600;
    FileSession.store = {};
    FileSession._save_path = null;
    return FileSession;
}());
exports.FileSession = FileSession;
//# sourceMappingURL=file.js.map