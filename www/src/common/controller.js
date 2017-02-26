"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const url = require("url");
const sdopx_1 = require("sdopx");
require('../adapter/sdopx/sdopx_ext');
class ControllerError extends Error {
    constructor(msg, code) {
        super(msg);
        this.code = '';
        this.code = code;
    }
}
exports.ControllerError = ControllerError;
class Controller {
    constructor(context) {
        this.context = null;
        this.sdopx = null;
        this.template_dirs = null;
        this.db = null;
        this._info = {};
        this._asset = null;
        this.context = context;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    finish() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    initSdopx() {
        if (this.sdopx === null) {
            this.sdopx = new sdopx_1.Sdopx(this);
            // this.sdopx.compile_check = false;
            let dirs = this.template_dirs || Beacon.VIEW_PATH;
            this.sdopx.setTemplateDir(dirs);
        }
    }
    initDB(type = 'mysql', options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.db == null) {
                if (type == 'mysql') {
                    let Mysql = require("../adapter/db/mysql").Mysql;
                    this.db = new Mysql(options);
                }
            }
        });
    }
    assign(key, value = null) {
        if (typeof key == 'string') {
            this._info[key] = value;
            return;
        }
        if (Beacon.isObject(key)) {
            this._info = Object.assign(this._info, key);
        }
    }
    assignConfig(key, value = null) {
        this.initSdopx();
        this.sdopx.assignConfig(key, value);
    }
    display(tplname) {
        this.initSdopx();
        this.sdopx._book = Object.assign(this.sdopx._book, this._info);
        this.sdopx.display(tplname);
    }
    fetch(tplname) {
        this.initSdopx();
        return this.sdopx.fetch(tplname);
    }
    indexAction() {
        this.end('hello beaconjs.');
    }
    getIP() {
        return this.context.getIP();
    }
    getMethod() {
        return this.context.method.toLowerCase();
    }
    isMethod(method) {
        return this.context.method === method.toUpperCase();
    }
    isGet() {
        return this.context.isGet();
    }
    isPost() {
        return this.context.isPost();
    }
    isAjax() {
        return this.context.isAjax();
    }
    get(name, def) {
        return this.context.get(name, def);
    }
    post(name, def) {
        return this.context.post(name, def);
    }
    param(name, def) {
        return this.context.param(name, def);
    }
    file(name) {
        return this.context.file(name);
    }
    getHeader(name) {
        return this.context.getHeader(name);
    }
    setHeader(name, value) {
        return this.context.setHeader(name, value);
    }
    getUserAgent() {
        return this.context.getUserAgent();
    }
    getReferrer(host) {
        return this.context.getReferrer(host);
    }
    setStatus(status = 200) {
        return this.context.setStatus(status);
    }
    //获取配置项
    getConfig(key, def) {
        return Beacon.getConfig(key, def);
    }
    //获取配置项
    route(name, def) {
        return this.context.route(name, def);
    }
    //获取配置项
    setConfig(key, def) {
        return Beacon.getConfig(key, def);
    }
    getCookie(name) {
        return this.context.getCookie(name);
    }
    setCookie(name, value, options) {
        return this.context.setCookie(name, value, options);
    }
    initSesion(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.context.initSesion(type);
        });
    }
    getSession(name) {
        return this.context.getSession(name);
    }
    setSession(name, value) {
        return this.context.setSession(name, value);
    }
    delSession(name) {
        return this.context.delSession(name);
    }
    redirect(uri, query, app, code) {
        if (typeof query == 'number' && app === void 0 && code === void 0) {
            code = query;
            query = null;
            app = this.route('app');
        }
        else if (typeof query == 'string' && app === void 0 && code === void 0) {
            app = query;
            query = null;
        }
        else if (typeof query == 'string' && typeof app === 'number' && code === void 0) {
            code = app;
            app = query;
            query = null;
        }
        else if (typeof app == 'number' && code === void 0) {
            code = app;
            app = this.route('app');
        }
        if (uri.length == 0) {
            return;
        }
        if (uri[0] == '~') {
            let touri = uri.substring(1);
            let info = url.parse(touri, true, true);
            if (query != null && Beacon.isObject(query)) {
                query = Object.assign(info.query, query);
            }
            touri = this.url(info.pathname, query, app);
            this.context.redirect(touri, code);
            return;
        }
        let appuri = this.route('uri', '');
        uri = uri.replace(/__APPROOT__/g, appuri);
        this.context.redirect(uri, code);
    }
    setExpires(time) {
        this.context.setExpires(time);
        return this;
    }
    write(obj = null, encoding = null) {
        return this.context.write(obj, encoding);
    }
    url(pathname = '', query, app) {
        if (typeof query == 'string' && app === void 0) {
            app = query;
            query = null;
        }
        query = query || {};
        app = app || this.route('app');
        if (pathname.length > 0 && pathname[0] != '/') {
            pathname = '/' + this.route('ctl') + '/' + pathname;
        }
        return Beacon.Route.resolve(app, pathname, query);
    }
    end(obj = null, encoding = null) {
        if (this.db) {
            this.db.release();
            this.db = null;
        }
        this.context.end(obj, encoding);
    }
    exit() {
        throw new ControllerError('exit', 'CONTROLLER_EXIT');
    }
    getContentType() {
        return this.context.getContentType();
    }
    setContentType(ext, encoding) {
        return this.context.setContentType(ext, encoding);
    }
    sendTime(name) {
        return this.context.sendTime(name);
    }
    parsePayload(encoding) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.context.parsePayload(encoding);
        });
    }
    addAsset(name, depend) {
        if (typeof name != 'string') {
            if (Beacon.isArray(name)) {
                for (var i = 0; i < name.length; i++) {
                    if (i == 0) {
                        this.addAsset(name[i], depend);
                    }
                    else {
                        this.addAsset(name[i]);
                    }
                }
            }
            return;
        }
        this._asset = this._asset || {};
        if (this._asset[name]) {
            return;
        }
        let that = this;
        let config = Beacon.getConfig('asset:*');
        let depends = config.depends || {};
        let paths = config.paths || {};
        let url_join = function (item) {
            if (item[1] == '/') {
                return item;
            }
            let items = item.split('/');
            let bases = config.baseUrl.split('/');
            let temps = [];
            for (let xitem of items) {
                if (xitem == '..') {
                    bases.pop();
                    continue;
                }
                temps.push(xitem);
            }
            bases = bases.concat(temps);
            return bases.join('/');
        };
        let add_asset = function (name) {
            if (that._asset[name]) {
                return;
            }
            let data = {};
            let xdepend = depends[name] || [];
            if (depend) {
                let temp = xdepend.slice(0);
                if (depend instanceof Array && depend.length > 0) {
                    temp = temp.concat(depend);
                }
                if (typeof depend == 'string' && depend.length > 0) {
                    temp.push(depend);
                }
                xdepend = temp;
                depend = null;
            }
            if (xdepend.length > 0) {
                xdepend.forEach(function (item) {
                    if (item.length == 0) {
                        return;
                    }
                    if (paths[item]) {
                        add_asset(item);
                        return;
                    }
                    if (/\.js$/i.test(item)) {
                        data.js = data.js || [];
                        if (item[1] == '/') {
                            data.js.push(item);
                            return;
                        }
                        data.js.push(url_join(item));
                        return;
                    }
                    if (/\.css$/i.test(item)) {
                        data.css = data.css || [];
                        if (item[1] == '/') {
                            data.css.push(item);
                            return;
                        }
                        data.css.push(url_join(item));
                        return;
                    }
                });
            }
            data.js = data.js || [];
            if (/\.js$/i.test(name)) {
                data.js.push(name);
                that._asset[name] = data;
                return;
            }
            if (/\.css$/i.test(name)) {
                data.css = data.css || [];
                data.css.push(name);
                that._asset[name] = data;
                return;
            }
            if (!paths[name] || paths[name].length == 0) {
                return;
            }
            let item = paths[name] + '.js';
            if (item[1] == '/') {
                data.js.push(item);
            }
            else {
                data.js.push(url_join(item));
            }
            that._asset[name] = data;
        };
        add_asset(name);
    }
    getAsset(name) {
        let data = { js: [], css: [] };
        let version = Beacon.getConfig('asset:version', '');
        if (name === void 0) {
            for (let name in this._asset) {
                let item = this._asset[name];
                if (version != '') {
                    item.js && item.js.forEach(function (oitem) {
                        data.js.push(oitem + '?v=' + version);
                    });
                    item.css && item.css.forEach(function (oitem) {
                        data.css.push(oitem + '?v=' + version);
                    });
                    continue;
                }
                data.js.concat(item.js);
                data.css.concat(item.css);
            }
            return data;
        }
        let item = this._asset[name] || null;
        if (item) {
            if (version != '') {
                item.js && item.js.forEach(function (oitem) {
                    data.js.push(oitem + '?v=' + version);
                });
                item.css && item.css.forEach(function (oitem) {
                    data.css.push(oitem + '?v=' + version);
                });
                return data;
            }
            data.js.concat(item.js);
            data.css.concat(item.css);
            return data;
        }
        return data;
    }
    fail(message, error, jump, code, timeout = 3) {
        if (!Beacon.isObject(error)) {
            timeout = code;
            code = jump;
            jump = error;
            error = null;
        }
        if (this.isAjax()) {
            let ret = {};
            ret.message = message;
            ret.status = false;
            if (error) {
                ret.error = error;
            }
            if (code !== void 0) {
                ret.code = code;
            }
            this.returnJson(ret);
        }
        if (jump === void 0) {
            jump = this.getReferrer();
        }
        else if (jump == false) {
            jump = 'javascript:history.go(-1);';
        }
        this.assign('message', message);
        this.assign('jump', jump);
        this.assign('timeout', timeout);
        this.assign('code', code);
        this.display(this.getConfig('fail_tplname', 'fail'));
        this.exit();
    }
    success(message, jump, code, timeout = 1) {
        if (jump === void 0) {
            jump = this.param('__BACK__', this.getReferrer()) || null;
        }
        if (this.isAjax()) {
            let ret = {};
            ret.message = message;
            ret.status = true;
            if (code !== void 0) {
                ret.code = code;
            }
            this.returnJson(ret);
        }
        if (jump == false) {
            jump = 'javascript:history.go(-1);';
        }
        this.assign('message', message);
        this.assign('jump', jump);
        this.assign('timeout', timeout);
        this.assign('code', code);
        this.display(this.getConfig('success_tplname', 'success'));
        this.exit();
    }
    returnJson(data) {
        this.setContentType('json');
        this.end(JSON.stringify(data));
        this.exit();
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map