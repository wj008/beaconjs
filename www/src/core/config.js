"use strict";
const path = require("path");
const Hjson = require("hjson");
const fs = require("fs");
class Config {
    constructor(dirname) {
        this._names = {};
        this._global = {};
        this._dirname = dirname;
    }
    setDir(dirname) {
        this._dirname = dirname;
    }
    getDir() {
        return this._dirname;
    }
    //加载配置文件
    load(name, filepath = null) {
        if (this._names[name] !== void 0) {
            return this._names[name];
        }
        let that = this;
        let _loadFilepath = function (name, filepath) {
            let exists = fs.existsSync(filepath);
            if (!exists) {
                throw new Error("cat not found config file:" + filepath);
            }
            let extname = path.extname(filepath).toLowerCase();
            if (extname == '.json' || extname == '.js') {
                let data = require(filepath);
                that._names[name] = data;
                return data;
            }
            try {
                let htext = fs.readFileSync(filepath, 'utf8');
                let data = Hjson.parse(htext);
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
        let extname = path.extname(name).toLowerCase();
        if (extname == '') {
            let extnames = ['.config.js', '.json', '.hjson'];
            let files = [];
            for (let i = 0; i < extnames.length; i++) {
                let tempext = extnames[i];
                let filepath = path.join(that._dirname, name + tempext);
                try {
                    let data = _loadFilepath(name, filepath);
                    if (data) {
                        return data;
                    }
                }
                catch (e) {
                    files.push(filepath);
                }
            }
            throw new Error('cat not found config files:' + files.join(','));
        }
        let tempname = name;
        filepath = path.join(that._dirname, tempname);
        try {
            let data = _loadFilepath(name, filepath);
            if (data) {
                return data;
            }
        }
        catch (e) {
            throw new Error('cat not found config name:' + name);
        }
        return null;
    }
    gload(name, filepath = null) {
        let data = this.load(name, filepath);
        this._global = Object.assign(this._global, data);
        return this._global;
    }
    //获取值
    get(key, def = null) {
        let name = null;
        let temp = key.split(':');
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
                    let ret = {};
                    for (let nkey in this._names[name]) {
                        ret[nkey] = this._names[name][nkey];
                    }
                    for (let dkey in def) {
                        if (ret[dkey] === void 0) {
                            ret[dkey] = def[dkey];
                        }
                    }
                    return ret;
                }
                return this._names[name];
            }
            if (typeof def === 'object') {
                let ret = {};
                for (let nkey in this._global) {
                    ret[nkey] = this._global[nkey];
                }
                for (let dkey in def) {
                    if (ret[dkey] === void 0) {
                        ret[dkey] = def[dkey];
                    }
                }
                return ret;
            }
            return this._global;
        }
        let keys = key.split('.');
        if (keys.length == 1) {
            if (name) {
                if (!this._names[name]) {
                    return def;
                }
                return this._names[name][key] === void 0 ? def : this._names[name][key];
            }
            return this._global[key] === void 0 ? def : this._global[key];
        }
        let data = null;
        if (name) {
            if (!this._names[name]) {
                return def;
            }
            data = this._names[name];
        }
        else {
            data = this._global;
        }
        for (let i = 0; i < keys.length; i++) {
            let tkey = keys[i];
            if (typeof data !== 'object' || data[tkey] === void 0) {
                return def;
            }
            data = data[tkey];
        }
        return data;
    }
    //设置值
    set(key, val) {
        let name = null;
        let temp = key.split(':');
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
                for (let key in val) {
                    this._names[name][key] = val[key];
                }
                return;
            }
            for (let key in val) {
                this._global[key] = val[key];
            }
            return;
        }
        let keys = key.split('.');
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
        let data = null;
        if (name) {
            if (!this._names[name]) {
                this._names[name] = {};
            }
            data = this._names[name];
        }
        else {
            data = this._global;
        }
        for (let i = 0; i < keys.length - 1; i++) {
            let tkey = keys[i];
            if (typeof data !== 'object') {
                return;
            }
            if (data[tkey] === void 0) {
                data[tkey] = {};
            }
            data = data[tkey];
        }
        data[keys[keys.length - 1]] = val;
    }
    save(filepath, data) {
        let extname = path.extname(filepath).toLowerCase();
        if (typeof data !== "object") {
            throw new Error('data must by object');
        }
        let code = JSON.stringify(data);
        if (!(extname == '.js' || extname == '.json' || extname == '.hjson')) {
            throw new Error('This extension does not support:' + extname);
        }
        if (extname === '.js') {
            code = 'module.exports = ' + code;
        }
        let dirname = path.dirname(filepath);
        if (dirname == '.') {
            dirname = this._dirname;
            filepath = path.join(dirname, filepath);
        }
        let exists = fs.existsSync(dirname);
        if (!exists) {
            throw new Error("cat not found the dirname:" + dirname);
        }
        try {
            fs.writeFileSync(filepath, code, 'utf8');
        }
        catch (err) {
            throw err;
        }
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map