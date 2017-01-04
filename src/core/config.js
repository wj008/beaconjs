"use strict";
var path = require('path');
var Hjson = require('hjson');
var fs = require('fs');
var Config = (function () {
    function Config(dirname) {
        this._names = {};
        this._global = {};
        this._dirname = dirname;
    }
    Config.prototype.setDir = function (dirname) {
        this._dirname = dirname;
    };
    Config.prototype.getDir = function () {
        return this._dirname;
    };
    //加载配置文件
    Config.prototype.load = function (name, filepath) {
        if (filepath === void 0) { filepath = null; }
        if (this._names[name] !== void 0) {
            return this._names[name];
        }
        var that = this;
        var _loadFilepath = function (name, filepath) {
            var exists = fs.existsSync(filepath);
            if (!exists) {
                throw new Error("cat not found config file:" + filepath);
            }
            var extname = path.extname(filepath).toLowerCase();
            if (extname == '.json' || extname == '.js') {
                var data = require(filepath);
                that._names[name] = data;
                return data;
            }
            try {
                var htext = fs.readFileSync(filepath, 'utf8');
                var data = Hjson.parse(htext);
                that._names[name] = data;
                return data;
            }
            catch (e) {
                throw e;
            }
        };
        if (filepath && typeof filepath === 'string') {
            return _loadFilepath(name, filepath);
        }
        var extname = path.extname(name).toLowerCase();
        if (extname == '') {
            var extnames = ['.config.js', '.json', '.hjson'];
            var files = [];
            for (var i = 0; i < extnames.length; i++) {
                var tempext = extnames[i];
                var filepath_1 = path.join(that._dirname, name + tempext);
                try {
                    var data = _loadFilepath(name, filepath_1);
                    if (data) {
                        return data;
                    }
                }
                catch (e) {
                    files.push(filepath_1);
                }
            }
            throw new Error('cat not found config files:' + files.join(','));
        }
        var tempname = name;
        filepath = path.join(that._dirname, tempname);
        try {
            var data = _loadFilepath(name, filepath);
            if (data) {
                return data;
            }
        }
        catch (e) {
            throw new Error('cat not found config name:' + name);
        }
        return null;
    };
    Config.prototype.gload = function (name, filepath) {
        if (filepath === void 0) { filepath = null; }
        var data = this.load(name, filepath);
        this._global = Object.assign(this._global, data);
        return this._global;
    };
    //获取值
    Config.prototype.get = function (key, def) {
        if (def === void 0) { def = null; }
        var name = null;
        var temp = key.split(':');
        if (temp.length == 2) {
            name = temp[0];
            key = temp[1];
            if (this._names[name] === void 0) {
                this.load(name);
            }
        }
        if (key == '*') {
            if (name) {
                if (this._names[name] === null) {
                    if (typeof def !== 'object') {
                        return null;
                    }
                    return def;
                }
                if (typeof def === 'object') {
                    var ret = {};
                    for (var nkey in this._names[name]) {
                        ret[nkey] = this._names[name][nkey];
                    }
                    for (var dkey in def) {
                        if (ret[dkey] === void 0) {
                            ret[dkey] = def[dkey];
                        }
                    }
                    return ret;
                }
                return this._names[name];
            }
            if (typeof def === 'object') {
                var ret = {};
                for (var nkey in this._global) {
                    ret[nkey] = this._global[nkey];
                }
                for (var dkey in def) {
                    if (ret[dkey] === void 0) {
                        ret[dkey] = def[dkey];
                    }
                }
                return ret;
            }
            return this._global;
        }
        var keys = key.split('.');
        if (keys.length == 1) {
            if (name) {
                if (!this._names[name]) {
                    return def;
                }
                return this._names[name][key] === void 0 ? def : this._names[name][key];
            }
            return this._global[key] === void 0 ? def : this._global[key];
        }
        var data = null;
        if (name) {
            if (!this._names[name]) {
                return def;
            }
            data = this._names[name];
        }
        else {
            data = this._global;
        }
        for (var i = 0; i < keys.length; i++) {
            var tkey = keys[i];
            if (typeof data !== 'object' || data[tkey] === void 0) {
                return def;
            }
            data = data[tkey];
        }
        return data;
    };
    //设置值
    Config.prototype.set = function (key, val) {
        var name = null;
        var temp = key.split(':');
        if (temp.length == 2) {
            name = temp[0];
            key = temp[1];
        }
        if (key == '*') {
            if (name) {
                if (typeof val != 'object') {
                    return;
                }
                if (!this._names[name]) {
                    this._names[name] = {};
                }
                for (var key_1 in val) {
                    this._names[name][key_1] = val[key_1];
                }
                return;
            }
            for (var key_2 in val) {
                this._global[key_2] = val[key_2];
            }
            return;
        }
        var keys = key.split('.');
        if (keys.length == 1) {
            if (name) {
                if (!this._names[name]) {
                    this._names[name] = {};
                }
                this._names[name][key] = val;
                return;
            }
            this._global[key] = val;
        }
        var data = null;
        if (name) {
            if (!this._names[name]) {
                this._names[name] = {};
            }
            data = this._names[name];
        }
        else {
            data = this._global;
        }
        for (var i = 0; i < keys.length - 1; i++) {
            var tkey = keys[i];
            if (typeof data !== 'object') {
                return;
            }
            if (data[tkey] === void 0) {
                data[tkey] = {};
            }
            data = data[tkey];
        }
        data[keys[keys.length - 1]] = val;
    };
    Config.prototype.save = function (filepath, data) {
        var extname = path.extname(filepath).toLowerCase();
        if (typeof data !== "object") {
            throw new Error('data must by object');
        }
        var code = JSON.stringify(data);
        if (!(extname == '.js' || extname == '.json' || extname == '.hjson')) {
            throw new Error('This extension does not support:' + extname);
        }
        if (extname === '.js') {
            code = 'module.exports = ' + code;
        }
        var dirname = path.dirname(filepath);
        if (dirname == '.') {
            dirname = this._dirname;
            filepath = path.join(dirname, filepath);
        }
        var exists = fs.existsSync(dirname);
        if (!exists) {
            throw new Error("cat not found the dirname:" + dirname);
        }
        try {
            fs.writeFileSync(filepath, code, 'utf8');
        }
        catch (err) {
            throw err;
        }
    };
    return Config;
}());
exports.Config = Config;
//# sourceMappingURL=config.js.map